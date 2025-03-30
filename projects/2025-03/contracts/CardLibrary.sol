// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CardLibrary is Ownable {
    // 卡牌稀有度
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    struct Card {
        uint256 id;
        string name;
        Rarity rarity;
        uint256 probability; // 基于10000的概率
        uint256 rewardMultiplier; // 奖励倍数 (x100)
    }
    
    Card[] public cards;
    uint256 public totalProbability;
    
    constructor() Ownable(msg.sender) {
        // 初始化卡牌库
        addCard("Common Crystal", Rarity.COMMON, 6000, 110); // 60%, 奖励1.1倍
        addCard("Rare Gem", Rarity.RARE, 3000, 150); // 30%, 奖励1.5倍
        addCard("Epic Jewel", Rarity.EPIC, 900, 200); // 9%, 奖励2倍
        addCard("Legendary Artifact", Rarity.LEGENDARY, 100, 400); // 1%, 奖励4倍
    }
    
    function addCard(string memory name, Rarity rarity, uint256 probability, uint256 rewardMultiplier) public onlyOwner {
        uint256 id = cards.length;
        cards.push(Card(id, name, rarity, probability, rewardMultiplier));
        totalProbability += probability;
    }
    
    function getCardCount() public view returns (uint256) {
        return cards.length;
    }
    
    function getCardById(uint256 id) public view returns (Card memory) {
        require(id < cards.length, "Card does not exist");
        return cards[id];
    }
    
    // 根据随机数获取卡牌
    function getRandomCard(uint256 randomValue) public view returns (Card memory) {
        uint256 probabilitySum = 0;
        uint256 randomNum = randomValue % totalProbability;
        
        for (uint256 i = 0; i < cards.length; i++) {
            probabilitySum += cards[i].probability;
            if (randomNum < probabilitySum) {
                return cards[i];
            }
        }
        
        // 默认返回第一张卡
        return cards[0];
    }
}