// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @dev Simple executor that allows a follower to copy a leader's trade
 *      if authorised in the FollowPermitRegistry.
 */
interface IFollowRegistry {
    function isFollowing(address leader, address follower, uint256 agentId) external view returns (bool);
}

contract MCPAgent {
    IFollowRegistry public registry;

    constructor(address registry_) {
        registry = IFollowRegistry(registry_);
    }

    /**
     * @notice Execute the same call that the leader performed.
     * @param leader   The leader whose strategy is being copied
     * @param agentId  ID of the strategy / agent
     * @param target   External contract address
     * @param data     Calldata to forward
     */
    function copyTrade(
        address leader,
        uint256 agentId,
        address target,
        bytes calldata data
    ) external {
        require(registry.isFollowing(leader, msg.sender, agentId), "NOT_AUTHORISED");

        (bool ok, bytes memory ret) = target.call(data);
        require(ok, string(ret)); // propagate failure reason
    }
}
