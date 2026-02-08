// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ContentToken.sol";

/**
 * @title ContentPlatform
 * @dev 内容创作平台主合约，管理内容发布、互动和分润
 */
contract ContentPlatform is Ownable, ReentrancyGuard {
    // 平台代币
    ContentToken public platformToken;
    
    // 内容结构体
    struct Content {
        uint256 id;
        address creator;
        string ipfsHash;
        uint256 timestamp;
        uint256 likes;
        uint256 shares;
        uint256 totalEarnings;
        bool exists;
    }
    
    // 分润配置
    struct RevenueConfig {
        uint256 likeReward;      // 点赞奖励
        uint256 shareReward;     // 分享奖励
        uint256 creatorShare;    // 创作者分成比例（百分比）
        uint256 platformFee;     // 平台手续费比例（百分比）
    }
    
    // 内容ID => 内容信息
    mapping(uint256 => Content) public contents;
    
    // 内容ID计数器
    uint256 public contentCounter;
    
    // 用户地址 => 用户发布的内容ID列表
    mapping(address => uint256[]) public userContents;
    
    // 内容ID => 用户地址 => 是否点赞
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    // 内容ID => 用户地址 => 是否分享
    mapping(uint256 => mapping(address => bool)) public hasShared;
    
    // 分润配置
    RevenueConfig public revenueConfig;
    
    // 事件
    event ContentPublished(uint256 indexed contentId, address indexed creator, string ipfsHash);
    event ContentLiked(uint256 indexed contentId, address indexed user);
    event ContentShared(uint256 indexed contentId, address indexed user);
    event RewardDistributed(uint256 indexed contentId, address indexed recipient, uint256 amount, string rewardType);
    event RevenueConfigUpdated(uint256 likeReward, uint256 shareReward, uint256 creatorShare, uint256 platformFee);
    
    /**
     * @dev 构造函数
     * @param _tokenAddress 平台代币地址
     * @param initialOwner 初始所有者地址
     */
    constructor(address _tokenAddress, address initialOwner) Ownable(initialOwner) {
        require(_tokenAddress != address(0), "Invalid token address");
        
        platformToken = ContentToken(_tokenAddress);
        
        // 初始化分润配置
        revenueConfig = RevenueConfig({
            likeReward: 10 * 10**18,      // 10 CPT
            shareReward: 50 * 10**18,     // 50 CPT
            creatorShare: 80,              // 80%
            platformFee: 20                // 20%
        });
    }
    
    /**
     * @dev 发布内容
     * @param ipfsHash IPFS内容哈希
     */
    function publishContent(string memory ipfsHash) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        contentCounter++;
        uint256 contentId = contentCounter;
        
        contents[contentId] = Content({
            id: contentId,
            creator: msg.sender,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            likes: 0,
            shares: 0,
            totalEarnings: 0,
            exists: true
        });
        
        userContents[msg.sender].push(contentId);
        
        emit ContentPublished(contentId, msg.sender, ipfsHash);
        
        return contentId;
    }
    
    /**
     * @dev 点赞内容
     * @param contentId 内容ID
     */
    function likeContent(uint256 contentId) external nonReentrant {
        Content storage content = contents[contentId];
        require(content.exists, "Content does not exist");
        require(!hasLiked[contentId][msg.sender], "Already liked");
        require(msg.sender != content.creator, "Cannot like own content");
        
        hasLiked[contentId][msg.sender] = true;
        content.likes++;
        
        // 分配点赞奖励
        uint256 creatorReward = (revenueConfig.likeReward * revenueConfig.creatorShare) / 100;
        uint256 platformReward = revenueConfig.likeReward - creatorReward;
        
        platformToken.transfer(content.creator, creatorReward);
        content.totalEarnings += creatorReward;
        
        emit ContentLiked(contentId, msg.sender);
        emit RewardDistributed(contentId, content.creator, creatorReward, "like");
    }
    
    /**
     * @dev 分享内容
     * @param contentId 内容ID
     */
    function shareContent(uint256 contentId) external nonReentrant {
        Content storage content = contents[contentId];
        require(content.exists, "Content does not exist");
        require(!hasShared[contentId][msg.sender], "Already shared");
        require(msg.sender != content.creator, "Cannot share own content");
        
        hasShared[contentId][msg.sender] = true;
        content.shares++;
        
        // 分配分享奖励
        uint256 creatorReward = (revenueConfig.shareReward * revenueConfig.creatorShare) / 100;
        uint256 sharerReward = creatorReward / 10; // 分享者获得10%的创作者奖励
        uint256 actualCreatorReward = creatorReward - sharerReward;
        
        platformToken.transfer(content.creator, actualCreatorReward);
        platformToken.transfer(msg.sender, sharerReward);
        
        content.totalEarnings += actualCreatorReward;
        
        emit ContentShared(contentId, msg.sender);
        emit RewardDistributed(contentId, content.creator, actualCreatorReward, "share_creator");
        emit RewardDistributed(contentId, msg.sender, sharerReward, "share_user");
    }
    
    /**
     * @dev 获取内容信息
     * @param contentId 内容ID
     */
    function getContent(uint256 contentId) external view returns (
        address creator,
        string memory ipfsHash,
        uint256 timestamp,
        uint256 likes,
        uint256 shares,
        uint256 totalEarnings
    ) {
        Content memory content = contents[contentId];
        require(content.exists, "Content does not exist");
        
        return (
            content.creator,
            content.ipfsHash,
            content.timestamp,
            content.likes,
            content.shares,
            content.totalEarnings
        );
    }
    
    /**
     * @dev 获取用户发布的所有内容ID
     * @param user 用户地址
     */
    function getUserContents(address user) external view returns (uint256[] memory) {
        return userContents[user];
    }
    
    /**
     * @dev 更新分润配置（仅所有者）
     * @param likeReward 点赞奖励
     * @param shareReward 分享奖励
     * @param creatorShare 创作者分成比例
     * @param platformFee 平台手续费比例
     */
    function updateRevenueConfig(
        uint256 likeReward,
        uint256 shareReward,
        uint256 creatorShare,
        uint256 platformFee
    ) external onlyOwner {
        require(creatorShare + platformFee == 100, "Shares must sum to 100");
        
        revenueConfig.likeReward = likeReward;
        revenueConfig.shareReward = shareReward;
        revenueConfig.creatorShare = creatorShare;
        revenueConfig.platformFee = platformFee;
        
        emit RevenueConfigUpdated(likeReward, shareReward, creatorShare, platformFee);
    }
    
    /**
     * @dev 存入平台代币用于分润（仅所有者）
     * @param amount 存入数量
     */
    function depositTokens(uint256 amount) external onlyOwner {
        require(platformToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    /**
     * @dev 提取平台代币（仅所有者）
     * @param amount 提取数量
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(platformToken.transfer(msg.sender, amount), "Transfer failed");
    }
    
    /**
     * @dev 获取合约代币余额
     */
    function getContractBalance() external view returns (uint256) {
        return platformToken.balanceOf(address(this));
    }
}
