// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DelayedStake {
    uint256 constant UNSTAKE_DELAY = 7 days;

    struct UnstakeRequest {
        uint256 amount;
        uint256 releaseTime;
    }

    // user => id => amount
    mapping(address => mapping(uint256 => uint256)) public stakes;

    // id => total staked
    mapping(uint256 => uint256) public totalStakedById;

    // user => id => unstake request
    mapping(address => mapping(uint256 => UnstakeRequest)) public unstakeRequests;

    event Staked(address indexed user, uint256 indexed id, uint256 amount);
    event UnstakeRequested(address indexed user, uint256 indexed id, uint256 amount, uint256 releaseTime);
    event Unstaked(address indexed user, uint256 indexed id, uint256 amount);

    // Stake ETH with a target ID
    function stake(uint256 id) external payable {
        require(msg.value > 0, "Must send ETH to stake");

        stakes[msg.sender][id] += msg.value;
        totalStakedById[id] += msg.value;

        emit Staked(msg.sender, id, msg.value);
    }

    // Request unstake (delayed withdrawal)
    function requestUnstake(uint256 id, uint256 amount) external {
        require(stakes[msg.sender][id] >= amount, "Not enough staked");

        stakes[msg.sender][id] -= amount;
        totalStakedById[id] -= amount;
        unstakeRequests[msg.sender][id] = UnstakeRequest({
            amount: amount,
            releaseTime: block.timestamp + UNSTAKE_DELAY
        });

        emit UnstakeRequested(msg.sender, id, amount, block.timestamp + UNSTAKE_DELAY);
    }

    // Complete unstake after delay
    function withdraw(uint256 id) external {
        UnstakeRequest memory request = unstakeRequests[msg.sender][id];
        require(request.amount > 0, "No unstake request");
        require(block.timestamp >= request.releaseTime, "Unstake not ready");

        delete unstakeRequests[msg.sender][id];
        payable(msg.sender).transfer(request.amount);

        emit Unstaked(msg.sender, id, request.amount);
    }

    // Query total stake for a given ID
    function getTotalStaked(uint256 id) external view returns (uint256) {
        return totalStakedById[id];
    }
}
