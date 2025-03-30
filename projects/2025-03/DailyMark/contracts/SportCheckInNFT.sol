// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SportCheckInNFT
 * @dev 运动打卡DAPP智能合约，用户达成里程碑时发放NFT
 */
contract SportCheckInNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIdCounter;
    
    // 里程碑类型
    enum Milestone {
        FIRST_LOGIN,             // 首次登录
        FIRST_CHECK_IN,          // 第一次打卡
        CONSECUTIVE_7_DAYS,      // 连续打卡7天
        CONSECUTIVE_1_MONTH,     // 连续打卡1月
        CONSECUTIVE_3_MONTHS,    // 连续打卡3月
        CONSECUTIVE_1_YEAR,      // 连续打卡1年
        RESUMED_CHECK_IN         // 中断打卡恢复后的第一次打卡
    }
    
    // 用户数据结构
    struct UserData {
        bool hasLoggedIn;                // 是否已登录
        bool hasCheckedIn;               // 是否已打卡
        uint256 lastCheckInTime;         // 上次打卡时间
        uint256 consecutiveCheckIns;     // 连续打卡次数
        bool[] milestonesAchieved;       // 已达成的里程碑
        bool hasInterrupted;             // 是否中断过打卡
        bool hasResumedAfterInterrupt;   // 中断后是否已恢复打卡
        uint256 lastCheckInDay;          // 上次打卡的日期（从1970-01-01开始的天数）
    }
    
    // NFT元数据基础URI
    string private _baseTokenURI;
    
    // 用户数据映射
    mapping(address => UserData) private _userData;
    
    // 里程碑达成事件
    event MilestoneAchieved(address indexed user, Milestone milestone, uint256 tokenId);
    
    // 打卡事件
    event CheckedIn(address indexed user, uint256 timestamp, uint256 consecutiveCount);
    
    // 首次登录事件
    event FirstLogin(address indexed user, uint256 timestamp);
    
    // 每日秒数常量 (24 * 60 * 60)
    uint256 private constant SECONDS_PER_DAY = 86400;
    
    // 防止同一天多次打卡的锁
    mapping(address => bool) private _dailyCheckInLock;
    
    // 合约管理配置
    bool public isPaused = false;          // 紧急暂停开关
    uint256 public checkInWindow = 36;     // 连续打卡窗口（小时）
    uint256 public minCheckInInterval = 20; // 最小打卡间隔（小时）
    
    // 仅在合约未暂停时执行
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }
    
    constructor() ERC721("SportCheckInNFT", "SCIN") Ownable(msg.sender) {
        // 初始化
    }
    
    /**
     * @dev 紧急暂停/恢复合约
     */
    function togglePause() external onlyOwner {
        isPaused = !isPaused;
    }
    
    /**
     * @dev 设置打卡窗口时间（小时）
     */
    function setCheckInWindow(uint256 _hours) external onlyOwner {
        require(_hours > 0, "Window must be positive");
        checkInWindow = _hours;
    }
    
    /**
     * @dev 设置最小打卡间隔（小时）
     */
    function setMinCheckInInterval(uint256 _hours) external onlyOwner {
        require(_hours > 0 && _hours <= 24, "Interval must be between 1-24");
        minCheckInInterval = _hours;
    }
    
    /**
     * @dev 计算时间戳对应的日期（从1970-01-01开始的天数）
     */
    function _getDayNumber(uint256 timestamp) private pure returns (uint256) {
        return timestamp / SECONDS_PER_DAY;
    }
    
    /**
     * @dev 用户首次登录
     */
    function firstLogin() external nonReentrant whenNotPaused {
        UserData storage user = _userData[msg.sender];
        require(!user.hasLoggedIn, "User has already logged in");
        
        // 初始化用户数据
        user.hasLoggedIn = true;
        user.lastCheckInTime = 0;
        user.consecutiveCheckIns = 0;
        user.milestonesAchieved = new bool[](7);
        user.hasInterrupted = false;
        user.hasResumedAfterInterrupt = false;
        user.lastCheckInDay = 0;
        
        // 发放首次登录NFT
        _mintMilestoneNFT(msg.sender, Milestone.FIRST_LOGIN);
        
        emit FirstLogin(msg.sender, block.timestamp);
    }
    
    /**
     * @dev 用户打卡
     */
    function checkIn() external nonReentrant whenNotPaused {
        UserData storage user = _userData[msg.sender];
        require(user.hasLoggedIn, "User must login first");
        require(!_dailyCheckInLock[msg.sender], "Check-in operation in progress");
        
        // 设置处理锁，防止同一区块内重复调用
        _dailyCheckInLock[msg.sender] = true;
        
        uint256 currentTime = block.timestamp;
        uint256 currentDay = _getDayNumber(currentTime);
        
        // 检查是否是第一次打卡
        if (!user.hasCheckedIn) {
            user.hasCheckedIn = true;
            user.consecutiveCheckIns = 1;
            user.lastCheckInTime = currentTime;
            user.lastCheckInDay = currentDay;
            
            // 发放第一次打卡NFT
            _mintMilestoneNFT(msg.sender, Milestone.FIRST_CHECK_IN);
            emit CheckedIn(msg.sender, currentTime, 1);
            
            // 释放锁
            _dailyCheckInLock[msg.sender] = false;
            return;
        }
        
        // 检查今天是否已经打卡
        require(currentDay != user.lastCheckInDay, "Already checked in today");
        
        // 检查是否达到最小打卡间隔
        require(currentTime >= user.lastCheckInTime + (minCheckInInterval * 1 hours), 
            "Please wait for minimum check-in interval");
        
        // 检查是否连续打卡
        bool isConsecutive = (currentDay == user.lastCheckInDay + 1) || 
                             (currentTime <= user.lastCheckInTime + (checkInWindow * 1 hours));
        
        if (isConsecutive) {
            user.consecutiveCheckIns++;
            
            // 检查里程碑
            checkConsecutiveMilestone(msg.sender, user);
        } else {
            // 打卡中断
            user.hasInterrupted = true;
            user.consecutiveCheckIns = 1;
            
            // 如果是中断后第一次打卡，发放恢复打卡NFT
            if (!user.hasResumedAfterInterrupt) {
                user.hasResumedAfterInterrupt = true;
                _mintMilestoneNFT(msg.sender, Milestone.RESUMED_CHECK_IN);
            }
        }
        
        user.lastCheckInTime = currentTime;
        user.lastCheckInDay = currentDay;
        
        emit CheckedIn(msg.sender, currentTime, user.consecutiveCheckIns);
        
        // 释放锁
        _dailyCheckInLock[msg.sender] = false;
    }
    
    /**
     * @dev 检查连续打卡里程碑
     * @param user 用户地址
     * @param userData 用户数据
     */
    function checkConsecutiveMilestone(address user, UserData storage userData) private {
        // 里程碑检查，基于连续打卡次数
        if (userData.consecutiveCheckIns == 7 && !userData.milestonesAchieved[uint(Milestone.CONSECUTIVE_7_DAYS)]) {
            _mintMilestoneNFT(user, Milestone.CONSECUTIVE_7_DAYS);
        } else if (userData.consecutiveCheckIns == 30 && !userData.milestonesAchieved[uint(Milestone.CONSECUTIVE_1_MONTH)]) {
            _mintMilestoneNFT(user, Milestone.CONSECUTIVE_1_MONTH);
        } else if (userData.consecutiveCheckIns == 90 && !userData.milestonesAchieved[uint(Milestone.CONSECUTIVE_3_MONTHS)]) {
            _mintMilestoneNFT(user, Milestone.CONSECUTIVE_3_MONTHS);
        } else if (userData.consecutiveCheckIns == 365 && !userData.milestonesAchieved[uint(Milestone.CONSECUTIVE_1_YEAR)]) {
            _mintMilestoneNFT(user, Milestone.CONSECUTIVE_1_YEAR);
        }
    }
    
    /**
     * @dev 内部函数：铸造里程碑NFT
     */
    function _mintMilestoneNFT(address user, Milestone milestone) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(user, tokenId);
        
        // 标记里程碑为已达成
        _userData[user].milestonesAchieved[uint(milestone)] = true;
        
        emit MilestoneAchieved(user, milestone, tokenId);
    }
    
    /**
     * @dev 获取用户数据
     */
    function getUserData(address user) external view returns (
        bool hasLoggedIn,
        bool hasCheckedIn,
        uint256 lastCheckInTime,
        uint256 consecutiveCheckIns,
        bool[] memory milestonesAchieved,
        bool hasInterrupted,
        bool hasResumedAfterInterrupt,
        uint256 lastCheckInDay
    ) {
        UserData memory data = _userData[user];
        return (
            data.hasLoggedIn,
            data.hasCheckedIn,
            data.lastCheckInTime,
            data.consecutiveCheckIns,
            data.milestonesAchieved,
            data.hasInterrupted,
            data.hasResumedAfterInterrupt,
            data.lastCheckInDay
        );
    }
    
    /**
     * @dev 设置基础Token URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev 检查Token是否存在
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev 获取Token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory baseURI = _baseURI();
        // 检查基础URI是否为空
        if (bytes(baseURI).length == 0) {
            return "";
        }
        
        // 检查baseURI末尾是否有斜杠，如果没有则添加
        bytes memory baseURIBytes = bytes(baseURI);
        bytes1 lastChar = baseURIBytes[baseURIBytes.length - 1];
        
        if (lastChar != bytes1("/")) {
            return string(abi.encodePacked(baseURI, "/", tokenId.toString()));
        } else {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        }
    }
    
    /**
     * @dev 获取基础URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
} 