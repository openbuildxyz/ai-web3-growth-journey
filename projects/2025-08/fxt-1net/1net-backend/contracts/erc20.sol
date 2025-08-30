// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ${contractName} is ERC20 {
	constructor() ERC20("${name}", "${symbol}") {
		_mint(msg.sender, ${supply} * 10 ** decimals());
	}
}
