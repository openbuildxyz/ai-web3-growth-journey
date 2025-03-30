// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./TrisolarisCoin.sol";
import "./CardLibrary.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TrisolarisDraw is VRFConsumerBase, ReentrancyGuard {
    TrisolarisCoin public triToken;
    CardLibrary public cardLibrary;
    
    // Chainlink VRF变量
    bytes32 internal keyHash;
    uint256 internal fee;
    
    // 游戏参数
    uint256 public drawPrice = 5 * 10**18; // 5个代币抽一次
    uint256 public jackpotBalance = 0;
    uint256 public jackpotContribution = 10; // 10%进入奖池
    
    // 用户抽卡记录
    struct UserDrawHistory {
        uint256[] lastThreeCards; // 最近三次抽到的卡牌ID
        uint256 totalDraws;
        uint256 totalRewards;
    }
    
    mapping(address => UserDrawHistory) public userHistory;
    mapping(bytes32 => address) public requestToUser;
    
    // 事件
    event CardDrawn(address indexed user, uint256 cardId, string cardName);
    event TripleMatch(address indexed user, uint256 cardId, uint256 reward);
    event DrawRequested(address indexed user, bytes32 requestId);
    
    constructor(
        address _triToken,
        address _cardLibrary,
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        triToken = TrisolarisCoin(_triToken);
        cardLibrary = CardLibrary(_cardLibrary);
        keyHash = _keyHash;
        fee = 0.1 * 10**18; // 0.1 LINK
    }
    
    // 用户抽卡
    function drawCard() public nonReentrant {
        require(triToken.balanceOf(msg.sender) >= drawPrice, "Insufficient token balance");
        
        // 收取代币
        triToken.transferFrom(msg.sender, address(this), drawPrice);
        
        // 将一部分代币加入奖池
        uint256 toJackpot = (drawPrice * jackpotContribution) / 100;
        jackpotBalance += toJackpot;
        
        // 请求随机数
        bytes32 requestId = requestRandomness(keyHash, fee);
        requestToUser[requestId] = msg.sender;
        
        emit DrawRequested(msg.sender, requestId);
    }
    
    // Chainlink VRF回调
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        address user = requestToUser[requestId];
        
        // 获取随机卡牌
        CardLibrary.Card memory drawnCard = cardLibrary.getRandomCard(randomness);
        
        // 更新用户历史
        UserDrawHistory storage history = userHistory[user];
        
        // 如果用户已经有三张卡，移除最旧的一张
        if (history.lastThreeCards.length >= 3) {
            for (uint i = 0; i < 2; i++) {
                history.lastThreeCards[i] = history.lastThreeCards[i + 1];
            }
            history.lastThreeCards[2] = drawnCard.id;
        } else {
            history.lastThreeCards.push(drawnCard.id);
        }
        
        history.totalDraws += 1;
        
        emit CardDrawn(user, drawnCard.id, drawnCard.name);
        
        // 检查是否三连
        checkTripleMatch(user);
    }
    
    // 检查是否有三连
    function checkTripleMatch(address user) private {
        UserDrawHistory storage history = userHistory[user];
        
        if (history.lastThreeCards.length < 3) {
            return;
        }
        
        // 检查最近三张卡是否相同
        if (history.lastThreeCards[0] == history.lastThreeCards[1] && 
            history.lastThreeCards[1] == history.lastThreeCards[2]) {
            
            // 获取卡牌信息
            CardLibrary.Card memory matchedCard = cardLibrary.getCardById(history.lastThreeCards[0]);
            
            // 计算奖励
            uint256 baseReward = drawPrice * 3; // 返还三次抽卡费用
            uint256 bonusMultiplier = matchedCard.rewardMultiplier;
            uint256 bonus = (baseReward * (bonusMultiplier - 100)) / 100; // 额外奖励
            
            // 如果是传说卡，额外奖励奖池的一部分
            uint256 jackpotReward = 0;
            if (matchedCard.rarity == CardLibrary.Rarity.LEGENDARY) {
                jackpotReward = jackpotBalance / 2;
                jackpotBalance -= jackpotReward;
            }
            
            uint256 totalReward = baseReward + bonus + jackpotReward;
            
            // 发放奖励
            triToken.mint(user, totalReward);
            
            // 更新用户奖励记录
            history.totalRewards += totalReward;
            
            // 清空用户最近三张卡记录，开始新一轮
            delete history.lastThreeCards;
            
            emit TripleMatch(user, matchedCard.id, totalReward);
        }
    }
    
    // 获取用户抽卡历史
    function getUserHistory(address user) public view returns (
        uint256[] memory lastCards,
        uint256 totalDraws,
        uint256 totalRewards
    ) {
        UserDrawHistory storage history = userHistory[user];
        return (
            history.lastThreeCards,
            history.totalDraws,
            history.totalRewards
        );
    }
    
    // 管理员可以调整抽卡价格
    function setDrawPrice(uint256 _newPrice) public {
        // 添加适当的权限控制
        drawPrice = _newPrice;
    }
}