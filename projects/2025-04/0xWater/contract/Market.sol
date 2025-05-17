// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFT.sol";
import "./Battle.sol";
import "./interfaces/IERC20.sol";

contract Market is Ownable, ReentrancyGuard {
    // NFT合约地址
    NFT public nftContract;
    
    // Battle合约地址
    Battle public battleContract;
    
    // USDT合约地址
    IERC20 public usdtToken;
    
    // 平台手续费比例（2%）
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 200;
    uint256 public constant BASIS_POINTS = 10000;
    
    // 最低挂单价格（USDT）
    uint256 public constant MIN_LISTING_PRICE_USDT = 0.1 * 10**6; // 0.1 USDT
    
    // 挂单结构
    struct Listing {
        address seller;
        uint256 price;
        uint256 timestamp;
        bool isActive;
    }
    
    // tokenId => Listing
    mapping(uint256 => Listing) public listings;
    
    // 周活跃用户数统计
    struct WeeklyStats {
        uint256 totalUsers;
        uint256 dailyUsers;
        uint256 lastUpdateDay;
        mapping(address => bool) activeUsers;
    }
    
    WeeklyStats public weeklyStats;
    
    // 是否开启自由交易
    bool public isFreeTradingEnabled;
    
    // 事件
    event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTListingCancelled(address indexed seller, uint256 indexed tokenId);
    event FreeTradingStatusChanged(bool enabled);
    event USDTTokenUpdated(address indexed newToken);
    
    constructor(address _nftContract, address _battleContract, address _usdtToken) {
        nftContract = NFT(_nftContract);
        battleContract = Battle(_battleContract);
        usdtToken = IERC20(_usdtToken);
        weeklyStats.lastUpdateDay = block.timestamp / 1 days;
    }
    
    // 更新每日活跃用户
    function updateDailyActiveUsers(address user) external {
        require(msg.sender == address(battleContract), "Only battle contract can update");
        
        uint256 currentDay = block.timestamp / 1 days;
        
        // 如果是新的一天，重置每日统计
        if (currentDay > weeklyStats.lastUpdateDay) {
            weeklyStats.dailyUsers = 0;
            weeklyStats.lastUpdateDay = currentDay;
            
            // 如果是新的一周，重置周统计
            if (currentDay % 7 == 0) {
                weeklyStats.totalUsers = 0;
            }
        }
        
        // 更新用户活跃状态
        if (!weeklyStats.activeUsers[user]) {
            weeklyStats.activeUsers[user] = true;
            weeklyStats.dailyUsers++;
            weeklyStats.totalUsers++;
        }
        
        // 检查是否需要开启自由交易
        if (!isFreeTradingEnabled && weeklyStats.totalUsers >= 5000) {
            isFreeTradingEnabled = true;
            emit FreeTradingStatusChanged(true);
        }
    }
    
    // 挂单NFT（使用USDT）
    function listNFT(uint256 tokenId, uint256 price) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price >= MIN_LISTING_PRICE_USDT, "Price too low");
        require(!listings[tokenId].isActive, "Already listed");
        
        // 检查NFT等级和价值
        (Battle.NFTLevel level, , , bool isFused) = nftContract.getNFTData(tokenId);
        require(!isFused, "NFT is fused");
        
        // 如果是T1 NFT，检查是否开启自由交易
        if (level == Battle.NFTLevel.T1) {
            require(isFreeTradingEnabled, "Free trading not enabled");
        } else {
            // T2和T3 NFT的固定价格
            if (level == Battle.NFTLevel.T2) {
                require(price == 10 * 10**6, "Invalid T2 price"); // 10 USDT
            } else {
                require(price == 5 * 10**6, "Invalid T3 price"); // 5 USDT
            }
        }
        
        // 转移NFT到市场合约
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        
        // 创建挂单
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit NFTListed(msg.sender, tokenId, price);
    }
    
    // 购买NFT（使用USDT）
    function buyNFT(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        
        // 检查USDT余额和授权
        require(usdtToken.balanceOf(msg.sender) >= listing.price, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= listing.price, "Insufficient USDT allowance");
        
        // 计算平台手续费
        uint256 platformFee = (listing.price * PLATFORM_FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 sellerAmount = listing.price - platformFee;
        
        // 转移USDT
        require(usdtToken.transferFrom(msg.sender, address(this), listing.price), "USDT transfer failed");
        
        // 转移NFT给买家
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        
        // 转移USDT给卖家
        require(usdtToken.transfer(listing.seller, sellerAmount), "USDT transfer to seller failed");
        
        // 更新挂单状态
        listing.isActive = false;
        
        emit NFTSold(listing.seller, msg.sender, tokenId, listing.price);
    }
    
    // 取消挂单
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        
        // 返还NFT给卖家
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        
        // 更新挂单状态
        listing.isActive = false;
        
        emit NFTListingCancelled(msg.sender, tokenId);
    }
    
    // 更新NFT合约地址（仅管理员）
    function updateNFTContract(address _nftContract) external onlyOwner {
        nftContract = NFT(_nftContract);
    }
    
    // 更新Battle合约地址（仅管理员）
    function updateBattleContract(address _battleContract) external onlyOwner {
        battleContract = Battle(_battleContract);
    }
    
    // 更新USDT合约地址（仅管理员）
    function updateUSDTToken(address _usdtToken) external onlyOwner {
        usdtToken = IERC20(_usdtToken);
        emit USDTTokenUpdated(_usdtToken);
    }
    
    // 手动开启/关闭自由交易（仅管理员）
    function setFreeTradingStatus(bool enabled) external onlyOwner {
        isFreeTradingEnabled = enabled;
        emit FreeTradingStatusChanged(enabled);
    }
    
    // 提取USDT余额（仅管理员）
    function withdrawUSDT() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT to withdraw");
        require(usdtToken.transfer(owner(), balance), "USDT transfer failed");
    }
} 