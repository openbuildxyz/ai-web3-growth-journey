// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 
import "@openzeppelin/contracts/access/AccessControl.sol"; 
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"; 
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol"; 

/// @notice ERC20 platform token (burnable + capped) with role-based minting.
contract PlatformToken is ERC20, ERC20Burnable, ERC20Capped, AccessControl { 
    /// @notice Role allowed to mint new tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_,
        address admin_
    )
        ERC20(name_, symbol_)
        ERC20Capped(cap_)
    {
        require(admin_ != address(0), "PlatformToken: admin=0");

        bool adminGranted = _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        require(adminGranted, "PlatformToken: admin role not granted");
        bool minterGranted = _grantRole(MINTER_ROLE, admin_);
        require(minterGranted, "PlatformToken: minter role not granted");
    } 

    /// @notice Mint tokens (MINTER_ROLE only).
    /// @dev Supply is capped by ERC20Capped.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) { 
        require(to != address(0), "PlatformToken: to=0"); 
        require(amount > 0, "PlatformToken: amount=0"); 
        _mint(to, amount);
    } 

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) { 
        super._update(from, to, value);
    } 
} 