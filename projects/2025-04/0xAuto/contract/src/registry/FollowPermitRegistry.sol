// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title FollowPermitRegistry
 * @dev Stores off-chain EIP-712 signatures allowing a follower to copy a leader's agent.
 */
contract FollowPermitRegistry {
    /* ---------- EIP-712 domain & typehash ---------- */
    bytes32 public constant PERMIT_TYPEHASH =
        keccak256("FollowPermit(address leader,address follower,uint256 agentId,uint256 nonce,uint256 deadline)");
    bytes32 public DOMAIN_SEPARATOR;

    /* ---------- State ---------- */
    mapping(address => uint256) public nonces; // leader => current nonce
    //  leader  => follower => agentId => permission
    mapping(address => mapping(address => mapping(uint256 => bool))) public isFollowing;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("FollowPermitRegistry"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    /* ---------- Actions ---------- */

    /**
     * @notice Submit a permit signed by the leader.
     */
    function submitPermit(
        address leader,
        address follower,
        uint256 agentId,
        uint256 deadline,
        bytes calldata sig
    ) external {
        require(block.timestamp <= deadline, "PERMIT_EXPIRED");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, leader, follower, agentId, nonces[leader]++, deadline)
        );
        bytes32 digest = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, structHash);
        address signer = ECDSA.recover(digest, sig);
        require(signer == leader, "BAD_SIGNATURE");

        isFollowing[leader][follower][agentId] = true;
    }

    /// @notice Leader can revoke a permit at any time.
    function revoke(address follower, uint256 agentId) external {
        isFollowing[msg.sender][follower][agentId] = false;
    }
}
