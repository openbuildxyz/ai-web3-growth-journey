// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20}         from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PointsToken
 * @dev Non-transferable ERC-20 used as in-app points.
 *      - Only MINTER_ROLE can mint.
 *      - Only PAYMASTER_ROLE can burn (gas settlement).
 *      - Any attempt to transfer between two non-zero addresses reverts.
 */
contract PointsToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE    = keccak256("MINTER_ROLE");
    bytes32 public constant PAYMASTER_ROLE = keccak256("PAYMASTER_ROLE");

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Mint points to a user (backend-signed in production).
    function mintTo(address to, uint256 amount, bytes calldata /*sig*/)
        external
        onlyRole(MINTER_ROLE)
    {
        // MVP: off-chain signature not enforced yet.
        _mint(to, amount);
    }

    /// @notice Burn points from a user. Called by the Paymaster.
    function burnFrom(address from, uint256 amount) external onlyRole(PAYMASTER_ROLE) {
        _burn(from, amount);
    }

    /**
     * @dev Override ERC20 hook.
     *      Only allow minting (from == 0) or burning (to == 0).
     */
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            revert("NON_TRANSFERABLE");
        }
        super._update(from, to, value);
    }
}
