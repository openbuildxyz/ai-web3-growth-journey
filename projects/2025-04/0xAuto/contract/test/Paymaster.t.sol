// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {PointsToken} from "../src/token/PointsToken.sol";
import {PointsPaymaster, IEntryPoint} from "../src/paymaster/PointsPaymaster.sol";

/* ---------- minimal EP mock ---------- */
contract MockEP {
    function postOp(bytes calldata ctx, bool, uint256 _gas) external {
        PointsPaymaster(payable(msg.sender)).postOp(ctx, true, _gas);
    }
}

contract PaymasterTest is Test {
    PointsToken token;
    PointsPaymaster paymaster;
    MockEP ep;

    address alice = vm.addr(1);

    function setUp() public {
        ep        = new MockEP();
        token     = new PointsToken("Points","PTS");
        paymaster = new PointsPaymaster(IEntryPoint(address(ep)));

        token.grantRole(token.PAYMASTER_ROLE(), address(paymaster));
        paymaster.setToken(address(token));

        token.grantRole(token.MINTER_ROLE(), address(this));
        token.mintTo(alice, 100 ether, "");
    }

    function testBurnAndRefund() public {
        // Estimated gas 100 wei => need = 100
        uint256 maxCost   = 100;
        uint256 gasRefund = 60;   // Actually used only 60 wei

        // craft dummy UserOperation
        IEntryPoint.UserOperation memory op;
        op.sender = alice;

        vm.prank(address(ep)); // entrypoint caller
        (bytes memory ctx,) = paymaster.validatePaymasterUserOp(op, bytes32(0), maxCost);

        // balance should drop by 100
        assertEq(token.balanceOf(alice), 0);

        // simulate postOp
        vm.prank(address(ep));
        paymaster.postOp(ctx, true, gasRefund);

        // refund: 100-60 = 40
        assertEq(token.balanceOf(alice), 40);
    }
}
