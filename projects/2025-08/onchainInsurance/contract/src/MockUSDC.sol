// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        // Mint 1 million USDC to deployer for testing
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    // Allow anyone to mint USDC for testing purposes
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    // Override decimals to match real USDC (6 decimals)
    function decimals() public pure override returns (uint8) {
        return 6;
    }
} 