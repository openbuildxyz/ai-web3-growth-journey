// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SubscriptionNFT.sol";

contract ProFeatures {
    SubscriptionNFT public subscriptionNFT;
    
    // 游戏规则存储
    struct GameRule {
        string name;
        string ruleData;
        address creator;
        bool isPublic;
    }
    
    // 游戏状态存储
    struct GameState {
        string stateData;
        uint256 timestamp;
        string description;
    }
    
    // 统计数据
    struct Statistics {
        uint256 totalGames;
        uint256 totalGenerations;
        uint256 longestGame;
        mapping(string => uint256) patternDiscoveries;
    }
    
    mapping(uint256 => GameRule[]) public userRules;
    mapping(uint256 => GameState[]) public userStates;
    mapping(uint256 => Statistics) public userStats;
    
    constructor(address _subscriptionNFT) {
        subscriptionNFT = SubscriptionNFT(_subscriptionNFT);
    }
    
    modifier onlySubscriber(uint256 tokenId) {
        require(
            subscriptionNFT.ownerOf(tokenId) == msg.sender &&
            subscriptionNFT.isSubscriptionActive(tokenId),
            "Active subscription required"
        );
        _;
    }
    
    // 保存自定义规则
    function saveRule(
        uint256 tokenId,
        string memory name,
        string memory ruleData,
        bool isPublic
    ) public onlySubscriber(tokenId) {
        GameRule memory newRule = GameRule({
            name: name,
            ruleData: ruleData,
            creator: msg.sender,
            isPublic: isPublic
        });
        userRules[tokenId].push(newRule);
    }
    
    // 保存游戏状态
    function saveState(
        uint256 tokenId,
        string memory stateData,
        string memory description
    ) public onlySubscriber(tokenId) {
        GameState memory newState = GameState({
            stateData: stateData,
            timestamp: block.timestamp,
            description: description
        });
        userStates[tokenId].push(newState);
    }
    
    // 更新统计数据
    function updateStatistics(
        uint256 tokenId,
        uint256 generations,
        uint256 gameLength,
        string memory discoveredPattern
    ) public onlySubscriber(tokenId) {
        Statistics storage stats = userStats[tokenId];
        stats.totalGames++;
        stats.totalGenerations += generations;
        if (gameLength > stats.longestGame) {
            stats.longestGame = gameLength;
        }
        stats.patternDiscoveries[discoveredPattern]++;
    }
    
    // 获取用户规则列表
    function getUserRules(uint256 tokenId) 
        public 
        view 
        returns (GameRule[] memory) 
    {
        return userRules[tokenId];
    }
    
    // 获取用户状态列表
    function getUserStates(uint256 tokenId)
        public
        view
        returns (GameState[] memory)
    {
        return userStates[tokenId];
    }
}
