// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SubscriptionNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    enum SubscriptionTier { Basic, Silver, Gold }
    
    struct Subscription {
        SubscriptionTier tier;
        uint256 startTime;
        uint256 duration;
        bool active;
    }
    
    mapping(uint256 => Subscription) public subscriptions;
    
    // 订阅价格（以wei为单位）
    uint256 public constant BASIC_PRICE = 29.9 ether / 100;   // 29.9元/月
    uint256 public constant SILVER_PRICE = 79.9 ether / 100;  // 79.9元/3月
    uint256 public constant GOLD_PRICE = 299.9 ether / 100;   // 299.9元/年
    
    constructor() ERC721("Game of Life Pro", "GOLP") {}
    
    function subscribe(SubscriptionTier tier) public payable {
        require(msg.value >= getTierPrice(tier), "Insufficient payment");
        
        uint256 duration = getTierDuration(tier);
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        
        subscriptions[newTokenId] = Subscription({
            tier: tier,
            startTime: block.timestamp,
            duration: duration,
            active: true
        });
    }
    
    function getTierPrice(SubscriptionTier tier) public pure returns (uint256) {
        if (tier == SubscriptionTier.Basic) return BASIC_PRICE;
        if (tier == SubscriptionTier.Silver) return SILVER_PRICE;
        if (tier == SubscriptionTier.Gold) return GOLD_PRICE;
        revert("Invalid tier");
    }
    
    function getTierDuration(SubscriptionTier tier) public pure returns (uint256) {
        if (tier == SubscriptionTier.Basic) return 30 days;
        if (tier == SubscriptionTier.Silver) return 90 days;
        if (tier == SubscriptionTier.Gold) return 365 days;
        revert("Invalid tier");
    }
    
    function isSubscriptionActive(uint256 tokenId) public view returns (bool) {
        Subscription memory sub = subscriptions[tokenId];
        return sub.active && 
               (block.timestamp < sub.startTime + sub.duration);
    }
    
    function getSubscriptionDetails(uint256 tokenId) 
        public 
        view 
        returns (
            SubscriptionTier tier,
            uint256 startTime,
            uint256 duration,
            bool active,
            uint256 remainingTime
        ) 
    {
        Subscription memory sub = subscriptions[tokenId];
        uint256 endTime = sub.startTime + sub.duration;
        uint256 remaining = block.timestamp < endTime ? 
                          endTime - block.timestamp : 0;
        
        return (
            sub.tier,
            sub.startTime,
            sub.duration,
            sub.active,
            remaining
        );
    }
}
