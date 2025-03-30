// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrisolarisCoin is ERC20, Ownable {
    // 游戏代币，用于抽卡和奖励
    
    constructor() ERC20("Trisolaris Coin", "TRI") Ownable(msg.sender) {
        // 初始铸造1,000,000枚代币
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    // 允许游戏合约铸造代币作为奖励
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // 允许用户购买代币
    function buyTokens() public payable {
        require(msg.value > 0, "Must send ETH to buy tokens");
        // 汇率: 1 ETH = 1000 TRI
        uint256 tokenAmount = msg.value * 1000;
        _mint(msg.sender, tokenAmount);
    }
}