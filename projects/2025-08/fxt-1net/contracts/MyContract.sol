// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PrimoCoin is ERC20 {
    constructor() ERC20("PrimoCoin", "PrimoCoin") {
        _mint(msg.sender, 1000);
    }
}