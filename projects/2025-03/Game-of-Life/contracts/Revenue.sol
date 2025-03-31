// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SubscriptionNFT.sol";

contract Revenue is Ownable {
    SubscriptionNFT public subscriptionNFT;
    
    // 收益分配比例（基点：1/10000）
    uint256 public constant PLATFORM_SHARE = 7000;    // 70%
    uint256 public constant COMMUNITY_SHARE = 2000;   // 20%
    uint256 public constant CREATOR_SHARE = 1000;     // 10%
    
    // 收益池
    uint256 public platformPool;
    uint256 public communityPool;
    uint256 public creatorPool;
    
    // 治理投票权重
    mapping(address => uint256) public governanceWeight;
    
    constructor(address _subscriptionNFT) {
        subscriptionNFT = SubscriptionNFT(_subscriptionNFT);
    }
    
    // 接收订阅收益
    receive() external payable {
        distributeRevenue(msg.value);
    }
    
    // 分配收益
    function distributeRevenue(uint256 amount) public payable {
        platformPool += (amount * PLATFORM_SHARE) / 10000;
        communityPool += (amount * COMMUNITY_SHARE) / 10000;
        creatorPool += (amount * CREATOR_SHARE) / 10000;
    }
    
    // Gold NFT持有者可以提取社区收益
    function claimCommunityShare(uint256 tokenId) public {
        require(
            subscriptionNFT.ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        
        (
            SubscriptionNFT.SubscriptionTier tier,
            ,
            ,
            bool active,
        ) = subscriptionNFT.getSubscriptionDetails(tokenId);
        
        require(
            tier == SubscriptionNFT.SubscriptionTier.Gold && active,
            "Gold tier required"
        );
        
        uint256 share = (communityPool * governanceWeight[msg.sender]) / 
                       getTotalGovernanceWeight();
        
        require(share > 0, "No share to claim");
        
        communityPool -= share;
        payable(msg.sender).transfer(share);
    }
    
    // 获取总治理权重
    function getTotalGovernanceWeight() public view returns (uint256) {
        // 实现治理权重计算逻辑
        return 100;
    }
    
    // 平台提取收益
    function withdrawPlatformRevenue() public onlyOwner {
        uint256 amount = platformPool;
        platformPool = 0;
        payable(owner()).transfer(amount);
    }
    
    // 创作者提取收益
    function withdrawCreatorRevenue() public {
        // 实现创作者收益提取逻辑
    }
    
    // 更新治理权重
    function updateGovernanceWeight(address user, uint256 weight) public {
        // 实现治理权重更新逻辑
    }
}
