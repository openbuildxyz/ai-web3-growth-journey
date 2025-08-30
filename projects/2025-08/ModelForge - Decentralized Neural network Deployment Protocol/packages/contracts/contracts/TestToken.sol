// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev Simple test contract to verify OpenZeppelin 4.x syntax
 */
contract TestToken is ERC20, Ownable {
    constructor() ERC20("Test", "TEST") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
