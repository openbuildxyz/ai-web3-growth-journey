// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    struct Deal {
        address buyer;
        address seller;
        uint256 amount;
        bool isActive;
        bool isCompleted;
    }

    mapping(uint256 => Deal) public deals;
    uint256 public dealCount = 0;

    event DealCreated(uint256 dealId, address buyer, address seller, uint256 amount);
    event DealCompleted(uint256 dealId);

    function createDeal(address _seller) external payable returns (uint256) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Cannot trade with yourself");

        uint256 dealId = dealCount;
        deals[dealId] = Deal({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            isActive: true,
            isCompleted: false
        });

        dealCount += 1;

        emit DealCreated(dealId, msg.sender, _seller, msg.value);
        return dealId;
    }

    function release(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        
        require(deal.isActive, "Deal does not exist or is inactive");
        require(!deal.isCompleted, "Deal is already completed");
        require(msg.sender == deal.buyer, "Only buyer can confirm receipt");

        deal.isCompleted = true;
        deal.isActive = false;

        emit DealCompleted(_dealId);
        payable(deal.seller).transfer(deal.amount);
    }

    function getDeal(uint256 _dealId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        bool isActive,
        bool isCompleted
    ) {
        Deal storage deal = deals[_dealId];
        return (
            deal.buyer,
            deal.seller,
            deal.amount,
            deal.isActive,
            deal.isCompleted
        );
    }
} 