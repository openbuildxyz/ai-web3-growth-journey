// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleTokenTransfer
 * @dev A simple ERC-20 token contract with basic transfer functionality
 * @author Your Name
 */
contract SimpleTokenTransfer is ERC20 {
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    /**
     * @dev Transfer tokens from sender to recipient
     * @param to Recipient address
     * @param amount Amount to transfer
     * @return bool Success status
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= balanceOf(msg.sender), "Insufficient balance");
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Transfer tokens from one address to another using allowance
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     * @return bool Success status
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= balanceOf(from), "Insufficient balance");
        require(amount <= allowance(from, msg.sender), "Insufficient allowance");
        
        return super.transferFrom(from, to, amount);
    }
}
