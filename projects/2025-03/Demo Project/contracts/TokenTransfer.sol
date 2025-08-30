// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenTransfer
 * @dev A comprehensive token transfer contract with ERC-20 functionality
 * @author Your Name
 */
contract TokenTransfer is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Events
    event TokensTransferred(address indexed from, address indexed to, uint256 amount, string reason);
    event BatchTransferCompleted(address indexed sender, address[] recipients, uint256[] amounts);
    event TransferFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // State variables
    uint256 public transferFee; // Fee in basis points (1 = 0.01%)
    uint256 public maxTransferAmount;
    mapping(address => bool) public isBlacklisted;
    mapping(address => uint256) public dailyTransferLimit;
    mapping(address => uint256) public dailyTransferCount;
    
    // Constants
    uint256 public constant MAX_FEE = 500; // 5% maximum fee
    uint256 public constant BASIS_POINTS = 10000;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _transferFee,
        uint256 _maxTransferAmount
    ) ERC20(name, symbol) {
        require(_transferFee <= MAX_FEE, "Fee too high");
        require(_maxTransferAmount > 0, "Invalid max transfer amount");
        
        transferFee = _transferFee;
        maxTransferAmount = _maxTransferAmount;
        
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
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(!isBlacklisted[msg.sender], "Sender is blacklisted");
        require(!isBlacklisted[to], "Recipient is blacklisted");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        require(amount <= balanceOf(msg.sender), "Insufficient balance");
        
        // Check daily transfer limit
        require(
            dailyTransferCount[msg.sender] + amount <= dailyTransferLimit[msg.sender] || 
            dailyTransferLimit[msg.sender] == 0,
            "Daily transfer limit exceeded"
        );
        
        uint256 fee = (amount * transferFee) / BASIS_POINTS;
        uint256 transferAmount = amount - fee;
        
        // Update daily transfer count
        dailyTransferCount[msg.sender] += amount;
        
        // Transfer tokens
        _transfer(msg.sender, to, transferAmount);
        
        // Burn fee if applicable
        if (fee > 0) {
            _burn(msg.sender, fee);
        }
        
        emit TokensTransferred(msg.sender, to, transferAmount, "Standard transfer");
        return true;
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
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(!isBlacklisted[from], "Sender is blacklisted");
        require(!isBlacklisted[to], "Recipient is blacklisted");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        require(amount <= balanceOf(from), "Insufficient balance");
        require(amount <= allowance(from, msg.sender), "Insufficient allowance");
        
        // Check daily transfer limit
        require(
            dailyTransferCount[from] + amount <= dailyTransferLimit[from] || 
            dailyTransferLimit[from] == 0,
            "Daily transfer limit exceeded"
        );
        
        uint256 fee = (amount * transferFee) / BASIS_POINTS;
        uint256 transferAmount = amount - fee;
        
        // Update daily transfer count
        dailyTransferCount[from] += amount;
        
        // Transfer tokens
        _transfer(from, to, transferAmount);
        
        // Burn fee if applicable
        if (fee > 0) {
            _burn(from, fee);
        }
        
        // Decrease allowance
        _spendAllowance(from, msg.sender, amount);
        
        emit TokensTransferred(from, to, transferAmount, "Transfer from");
        return true;
    }
    
    /**
     * @dev Batch transfer to multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer
     */
    function batchTransfer(address[] memory recipients, uint256[] memory amounts) 
        public 
        whenNotPaused 
        nonReentrant 
    {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        require(recipients.length <= 100, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalAmount <= balanceOf(msg.sender), "Insufficient balance");
        require(totalAmount <= maxTransferAmount, "Total amount exceeds max transfer limit");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(!isBlacklisted[recipients[i]], "Recipient is blacklisted");
            require(amounts[i] > 0, "Invalid amount");
            
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
        
        emit BatchTransferCompleted(msg.sender, recipients, amounts);
    }
    
    /**
     * @dev Transfer with custom reason
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param reason Reason for transfer
     */
    function transferWithReason(address to, uint256 amount, string memory reason) 
        public 
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        bool success = transfer(to, amount);
        if (success) {
            emit TokensTransferred(msg.sender, to, amount, reason);
        }
        return success;
    }
    
    // Admin functions
    
    /**
     * @dev Set transfer fee (only owner)
     * @param newFee New fee in basis points
     */
    function setTransferFee(uint256 newFee) public onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = transferFee;
        transferFee = newFee;
        emit TransferFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Set maximum transfer amount (only owner)
     * @param newMax New maximum transfer amount
     */
    function setMaxTransferAmount(uint256 newMax) public onlyOwner {
        require(newMax > 0, "Invalid amount");
        maxTransferAmount = newMax;
    }
    
    /**
     * @dev Set daily transfer limit for an address (only owner)
     * @param user User address
     * @param limit Daily transfer limit
     */
    function setDailyTransferLimit(address user, uint256 limit) public onlyOwner {
        dailyTransferLimit[user] = limit;
    }
    
    /**
     * @dev Blacklist/unblacklist an address (only owner)
     * @param user User address
     * @param blacklisted Blacklist status
     */
    function setBlacklist(address user, bool blacklisted) public onlyOwner {
        isBlacklisted[user] = blacklisted;
    }
    
    /**
     * @dev Pause/unpause transfers (only owner)
     * @param paused Pause status
     */
    function setPaused(bool paused) public onlyOwner {
        if (paused) {
            _pause();
        } else {
            _unpause();
        }
    }
    
    /**
     * @dev Reset daily transfer count for an address (only owner)
     * @param user User address
     */
    function resetDailyTransferCount(address user) public onlyOwner {
        dailyTransferCount[user] = 0;
    }
    
    /**
     * @dev Get daily transfer info for an address
     * @param user User address
     * @return current Current daily transfer amount
     * @return limit Daily transfer limit
     * @return remaining Remaining daily transfer amount
     */
    function getDailyTransferInfo(address user) 
        public 
        view 
        returns (uint256 current, uint256 limit, uint256 remaining) 
    {
        current = dailyTransferCount[user];
        limit = dailyTransferLimit[user];
        remaining = limit > current ? limit - current : 0;
    }
    
    /**
     * @dev Calculate transfer fee for a given amount
     * @param amount Amount to transfer
     * @return fee Fee amount
     * @return netAmount Net amount after fee
     */
    function calculateTransferFee(uint256 amount) 
        public 
        view 
        returns (uint256 fee, uint256 netAmount) 
    {
        fee = (amount * transferFee) / BASIS_POINTS;
        netAmount = amount - fee;
    }
    
    // Override functions
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        require(!isBlacklisted[from], "Sender is blacklisted");
        require(!isBlacklisted[to], "Recipient is blacklisted");
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}
