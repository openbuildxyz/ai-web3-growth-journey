// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDC is ERC20, Ownable {
    constructor() ERC20("USDC", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    //function mint(address to, uint256 amount) public onlyOwner {
    function mint(address to, uint256) public {
        require(
            balanceOf(to) < (5000 * 10 ** decimals()),
            "Sufficient balance!"
        );
        // require(amount <= (10000 * 10 ** decimals()), "Sufficient balance!");
        _mint(to, 10000 * 10 ** decimals());
    }
}
