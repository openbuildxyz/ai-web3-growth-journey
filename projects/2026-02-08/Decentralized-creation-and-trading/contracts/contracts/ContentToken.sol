// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContentToken
 * @dev 平台代币合约，用于内容创作平台的分润和激励
 */
contract ContentToken is ERC20, Ownable {
    // 代币精度（18位小数）
    uint8 private constant DECIMALS = 18;
    
    // 初始供应量（1亿代币）
    uint256 private constant INITIAL_SUPPLY = 100_000_000 * 10**DECIMALS;
    
    // 铸币权限地址映射
    mapping(address => bool) public minters;
    
    // 事件
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    /**
     * @dev 构造函数
     * @param initialOwner 初始所有者地址
     */
    constructor(address initialOwner) ERC20("Content Platform Token", "CPT") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
        minters[initialOwner] = true;
    }
    
    /**
     * @dev 添加铸币权限
     * @param minter 被授予铸币权限的地址
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        require(!minters[minter], "Minter already exists");
        
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev 移除铸币权限
     * @param minter 被移除铸币权限的地址
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Minter does not exist");
        
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev 铸造代币（仅铸币者可调用）
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Caller is not a minter");
        require(to != address(0), "Cannot mint to zero address");
        
        _mint(to, amount);
    }
    
    /**
     * @dev 销毁代币
     * @param amount 销毁数量
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
