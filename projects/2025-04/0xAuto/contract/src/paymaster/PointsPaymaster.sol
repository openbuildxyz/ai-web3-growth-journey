// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl}  from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20}         from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/* ---------- Minimal ERC-4337 interfaces (excerpt) ---------- */
interface IEntryPoint {
    struct UserOperation {
        address sender; uint256 nonce; bytes initCode;
        bytes callData; uint256 callGasLimit; uint256 verificationGasLimit;
        uint256 preVerificationGas; uint256 maxFeePerGas; uint256 maxPriorityFeePerGas;
        bytes paymasterAndData; bytes signature;
    }
    function postOp(bytes calldata context, bool success, uint256 actualGasCost) external;
}

abstract contract BasePaymaster {
    IEntryPoint public immutable entryPoint;
    constructor(IEntryPoint ep) { entryPoint = ep; }
    modifier onlyEntry() { require(msg.sender == address(entryPoint), "ENTRY_ONLY"); _; }

    function validatePaymasterUserOp(
        IEntryPoint.UserOperation calldata op,
        bytes32 userOpHash,
        uint256 maxCost
    ) external virtual returns (bytes memory context, uint256 validationData);
}

/* ---------- Points Paymaster ---------- */

/**
 * @title PointsPaymaster
 * @dev 4337 Verifying Paymaster that charges gas in PointsToken.
 */
contract PointsPaymaster is BasePaymaster, AccessControl {
    bytes32 public constant TOKEN_ADMIN = keccak256("TOKEN_ADMIN");

    IERC20  public points;       // ERC-20 points contract
    uint256 public feeRate = 1e18; // Points per wei (1 point == 1 wei for MVP)

    constructor(IEntryPoint ep) BasePaymaster(ep) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Set the PointsToken address (one-off after deployment).
    function setToken(address token) external onlyRole(TOKEN_ADMIN) {
        points = IERC20(token);
    }

    /* -------- 4337 hooks -------- */

    /**
     * @dev Called by EntryPoint during the verification phase.
     *      Pre-burns the worst-case fee in points.
     */
    function validatePaymasterUserOp(
        IEntryPoint.UserOperation calldata op,
        bytes32 /*userOpHash*/,
        uint256 maxCost
    )
        external
        override
        returns (bytes memory context, uint256 validationData)
    {
        uint256 needed = maxCost / feeRate;
        require(points.balanceOf(op.sender) >= needed, "INSUFFICIENT_POINTS");

        // Burn points immediately (requires PAYMASTER_ROLE in PointsToken).
        PointsToken(address(points)).burnFrom(op.sender, needed);

        // Pass info to postOp via context.
        context = abi.encode(op.sender, needed);
        validationData = 0; // no time window restriction in MVP
    }

    /**
     * @dev Refunds over-burned points after the transaction finishes.
     */
    function postOp(bytes calldata context, bool /*success*/, uint256 actualGasCost)
        external
        onlyEntry
    {
        (address user, uint256 burnt) = abi.decode(context, (address, uint256));
        uint256 actual = actualGasCost / feeRate;

        if (burnt > actual) {
            PointsToken(address(points)).mintTo(user, burnt - actual, "");
        }
    }
}

interface PointsToken {
    function burnFrom(address, uint256) external;
    function mintTo(address, uint256, bytes calldata) external;
    function balanceOf(address) external view returns (uint256);
}
