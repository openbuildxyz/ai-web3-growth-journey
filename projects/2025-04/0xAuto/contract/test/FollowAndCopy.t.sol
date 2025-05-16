// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import "forge-std/Test.sol";
import "../src/registry/FollowPermitRegistry.sol";
import "../src/agent/MCPAgent.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

// Target mock contract: returns "done" on success
contract Target {
    function ping() external pure returns (string memory) { return "done"; }
}

contract FollowAndCopy is Test {
    FollowPermitRegistry reg;
    MCPAgent agent;
    Target tgt;

    address leader   = vm.addr(1);
    address follower = vm.addr(2);
    uint256 agentId  = 42;

    function setUp() public {
        reg   = new FollowPermitRegistry();
        agent = new MCPAgent(address(reg));
        tgt   = new Target();
    }

    function testCopyTrade() public {
        /* --- leader signs permit --- */
        uint256 deadline = block.timestamp + 1 days;
        bytes32 hash = keccak256(
            abi.encode(
                reg.PERMIT_TYPEHASH(),
                leader, follower, agentId,
                reg.nonces(leader),
                deadline
            )
        );
        bytes32 digest = MessageHashUtils.toTypedDataHash(reg.DOMAIN_SEPARATOR(), hash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, digest); // sign with leader's key

        bytes memory sig = abi.encodePacked(r, s, v);
        vm.prank(follower);
        reg.submitPermit(leader, follower, agentId, deadline, sig);

        /* --- follower calls copyTrade --- */
        vm.prank(follower);
        agent.copyTrade(
            leader,
            agentId,
            address(tgt),
            abi.encodeCall(Target.ping, ())
        );

        // Test passes if no revert (copyTrade doesn't return any value)
        // Success is implied by the lack of revert
    }
}
