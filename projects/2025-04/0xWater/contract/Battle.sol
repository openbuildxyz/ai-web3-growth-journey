// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";
import "./Market.sol";
import "./interfaces/IERC20.sol";

contract Battle is Ownable {
    // NFT等级
    enum NFTLevel { T1, T2, T3 }
    
    // 属性类型
    enum Element { GOLD, WOOD, WATER, FIRE, EARTH }
    
    // 对战费用（USDT）
    uint256 public constant BATTLE_FEE_USDT = 0.1 * 10**6; // 0.1 USDT
    
    // 合成费用（USDT）
    uint256 public constant FUSION_FEE_USDT = 0.5 * 10**6; // 0.5 USDT
    
    // NFT合约地址
    IERC721 public nftContract;
    
    // 市场合约地址
    Market public marketContract;
    
    // USDT合约地址
    IERC20 public usdtToken;
    
    // 玩家每日对战次数
    mapping(address => uint256) public dailyBattles;
    
    // 玩家每日合成次数
    mapping(address => uint256) public dailyFusions;
    
    // 每日最大对战次数
    uint256 public constant MAX_DAILY_BATTLES = 20;
    
    // 每日最大合成次数
    uint256 public constant MAX_DAILY_FUSIONS = 5;
    
    // 事件
    event BattleStarted(address indexed player1, address indexed player2, uint256 tokenId1, uint256 tokenId2);
    event BattleEnded(address indexed winner, address indexed loser, uint256 winnerTokenId, uint256 loserTokenId);
    event FusionStarted(address indexed player, uint256 tokenId1, uint256 tokenId2);
    event FusionCompleted(address indexed player, uint256 newTokenId);
    event MarketContractUpdated(address indexed newMarketContract);
    event USDTTokenUpdated(address indexed newToken);
    
    constructor(address _nftContract, address _marketContract, address _usdtToken) {
        nftContract = IERC721(_nftContract);
        marketContract = Market(_marketContract);
        usdtToken = IERC20(_usdtToken);
    }
    
    // 检查是否相克
    function isElementCounter(Element attacker, Element defender) public pure returns (bool) {
        if (attacker == Element.GOLD && defender == Element.WOOD) return true;
        if (attacker == Element.WOOD && defender == Element.EARTH) return true;
        if (attacker == Element.EARTH && defender == Element.WATER) return true;
        if (attacker == Element.WATER && defender == Element.FIRE) return true;
        if (attacker == Element.FIRE && defender == Element.GOLD) return true;
        return false;
    }
    
    // 计算对战胜率
    function calculateWinRate(
        NFTLevel attackerLevel,
        NFTLevel defenderLevel,
        bool isCounter
    ) public pure returns (uint256) {
        if (attackerLevel == defenderLevel) {
            return isCounter ? 65 : 50;
        }
        
        if (attackerLevel == NFTLevel.T3 && defenderLevel == NFTLevel.T2) {
            return isCounter ? 40 : 33;
        }
        
        if (attackerLevel == NFTLevel.T2 && defenderLevel == NFTLevel.T1) {
            return isCounter ? 30 : 25;
        }
        
        if (attackerLevel == NFTLevel.T3 && defenderLevel == NFTLevel.T1) {
            return isCounter ? 20 : 15;
        }
        
        return 0;
    }
    
    // 开始对战（使用USDT）
    function startBattle(uint256 tokenId1, uint256 tokenId2) external {
        // 检查USDT余额和授权
        require(usdtToken.balanceOf(msg.sender) >= BATTLE_FEE_USDT, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= BATTLE_FEE_USDT, "Insufficient USDT allowance");
        require(dailyBattles[msg.sender] < MAX_DAILY_BATTLES, "Daily battle limit reached");
        
        // 转移USDT
        require(usdtToken.transferFrom(msg.sender, address(this), BATTLE_FEE_USDT), "USDT transfer failed");
        
        // 获取NFT数据
        (NFTLevel level1, Element element1, uint256 power1, bool isFused1) = NFT(nftContract).getNFTData(tokenId1);
        (NFTLevel level2, Element element2, uint256 power2, bool isFused2) = NFT(nftContract).getNFTData(tokenId2);
        
        require(!isFused1 && !isFused2, "NFT already fused");
        require(nftContract.ownerOf(tokenId1) == msg.sender, "Not owner of token1");
        
        // 检查是否相克
        bool isCounter = isElementCounter(element1, element2);
        
        // 计算胜率
        uint256 winRate = calculateWinRate(level1, level2, isCounter);
        require(winRate > 0, "Invalid battle combination");
        
        // 生成随机数决定胜负
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            tokenId1,
            tokenId2
        ))) % 100;
        
        bool isWinner = random < winRate;
        
        // 转移NFT所有权
        if (isWinner) {
            nftContract.transferFrom(nftContract.ownerOf(tokenId2), msg.sender, tokenId2);
        } else {
            nftContract.transferFrom(msg.sender, nftContract.ownerOf(tokenId2), tokenId1);
        }
        
        // 更新对战次数
        dailyBattles[msg.sender]++;
        
        // 更新市场合约中的用户活跃状态
        marketContract.updateDailyActiveUsers(msg.sender);
        marketContract.updateDailyActiveUsers(nftContract.ownerOf(tokenId2));
        
        emit BattleEnded(
            isWinner ? msg.sender : nftContract.ownerOf(tokenId2),
            isWinner ? nftContract.ownerOf(tokenId2) : msg.sender,
            isWinner ? tokenId1 : tokenId2,
            isWinner ? tokenId2 : tokenId1
        );
    }
    
    // 开始合成（使用USDT）
    function startFusion(uint256 tokenId1, uint256 tokenId2) external {
        // 检查USDT余额和授权
        require(usdtToken.balanceOf(msg.sender) >= FUSION_FEE_USDT, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= FUSION_FEE_USDT, "Insufficient USDT allowance");
        require(dailyFusions[msg.sender] < MAX_DAILY_FUSIONS, "Daily fusion limit reached");
        
        // 转移USDT
        require(usdtToken.transferFrom(msg.sender, address(this), FUSION_FEE_USDT), "USDT transfer failed");
        
        // 调用NFT合约的合成函数
        NFT(nftContract).fuse(tokenId1, tokenId2);
        
        // 更新合成次数
        dailyFusions[msg.sender]++;
        
        emit FusionCompleted(msg.sender, tokenId1);
    }
    
    // 重置每日次数限制（仅管理员可调用）
    function resetDailyLimits(address user) external onlyOwner {
        dailyBattles[user] = 0;
        dailyFusions[user] = 0;
    }
    
    // 更新市场合约地址（仅管理员）
    function updateMarketContract(address _marketContract) external onlyOwner {
        marketContract = Market(_marketContract);
        emit MarketContractUpdated(_marketContract);
    }
    
    // 更新USDT合约地址（仅管理员）
    function updateUSDTToken(address _usdtToken) external onlyOwner {
        usdtToken = IERC20(_usdtToken);
        emit USDTTokenUpdated(_usdtToken);
    }
    
    // 提取USDT余额（仅管理员）
    function withdrawUSDT() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT to withdraw");
        require(usdtToken.transfer(owner(), balance), "USDT transfer failed");
    }
} 