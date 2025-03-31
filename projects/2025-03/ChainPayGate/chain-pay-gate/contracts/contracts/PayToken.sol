// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PayToken
 * @dev 链智付系统的支付代币
 */
contract PayToken is ERC20, Ownable {
    constructor() ERC20("Chain Pay Token", "CPT") Ownable(msg.sender) {
        // 初始铸造一些代币给合约创建者
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    /**
     * @dev 允许用户获取测试代币(仅限测试环境)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
} 