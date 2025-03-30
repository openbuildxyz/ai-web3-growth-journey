// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CardLibrary.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 使用ETH作为支付方式的版本
contract TrisolarisDraw_ETH is ReentrancyGuard, Ownable {
    CardLibrary public cardLibrary;
    
    // 游戏参数
    uint256 public drawPrice = 0.01 ether; // 0.01 ETH抽一次
    uint256 public jackpotBalance = 0;
    uint256 public jackpotContribution = 10; // 10%进入奖池
    
    // 用户抽卡记录
    struct UserDrawHistory {
        uint256[] lastCards; // 最近抽到的卡牌ID
        uint256 totalDraws;
        uint256 totalRewards;
    }
    
    mapping(address => UserDrawHistory) public userHistory;
    
    // 事件
    event CardDrawn(address indexed user, uint256 cardId, string cardName);
    event TripleMatch(address indexed user, uint256 cardId, uint256 reward);
    
    constructor(address _cardLibrary) {
        cardLibrary = CardLibrary(_cardLibrary);
    }
    
    // 用户抽卡 - 使用ETH支付
    function drawCard() public payable nonReentrant {
        require(msg.value >= drawPrice, "Insufficient ETH sent");
        
        // 计算奖池贡献
        uint256 jackpotAmount = (msg.value * jackpotContribution) / 100;
        jackpotBalance += jackpotAmount;
        
        // 生成随机卡牌ID (伪随机，仅用于本地测试)
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.difficulty))) % 10 + 1;
        uint256 cardId = randomValue;
        
        // 获取卡牌信息
        CardLibrary.Card memory card = cardLibrary.getCardById(cardId);
        string memory cardName = card.name;
        
        // 更新用户历史
        UserDrawHistory storage history = userHistory[msg.sender];
        history.totalDraws += 1;
        
        // 添加新卡牌到历史记录
        if (history.lastCards.length >= 3) {
            // 如果已经有3张卡，移除最旧的
            for (uint i = 0; i < history.lastCards.length - 1; i++) {
                history.lastCards[i] = history.lastCards[i + 1];
            }
            history.lastCards[history.lastCards.length - 1] = cardId;
        } else {
            // 添加新卡牌
            history.lastCards.push(cardId);
        }
        
        // 检查三连
        checkTripleMatch(msg.sender);
        
        // 触发抽卡事件
        emit CardDrawn(msg.sender, cardId, cardName);
    }
    
    // 检查三连
    function checkTripleMatch(address user) internal {
        UserDrawHistory storage history = userHistory[user];
        
        // 需要至少3张卡才能形成三连
        if (history.lastCards.length < 3) {
            return;
        }
        
        // 检查最后三张卡是否相同
        uint256 cardId = history.lastCards[history.lastCards.length - 1];
        bool isTripleMatch = true;
        
        for (uint i = history.lastCards.length - 3; i < history.lastCards.length; i++) {
            if (history.lastCards[i] != cardId) {
                isTripleMatch = false;
                break;
            }
        }
        
        // 如果形成三连，给予奖励
        if (isTripleMatch) {
            uint256 reward = jackpotBalance;
            jackpotBalance = 0;
            
            // 更新用户奖励历史
            history.totalRewards += reward;
            
            // 转移奖励
            payable(user).transfer(reward);
            
            // 触发三连事件
            emit TripleMatch(user, cardId, reward);
        }
    }
    
    // 查询用户历史
    function getUserHistory(address user) public view returns (
        uint256[] memory lastCards,
        uint256 totalDraws,
        uint256 totalRewards
    ) {
        UserDrawHistory storage history = userHistory[user];
        return (
            history.lastCards,
            history.totalDraws,
            history.totalRewards
        );
    }
    
    // 提取合约余额（仅限所有者）
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance - jackpotBalance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
}
