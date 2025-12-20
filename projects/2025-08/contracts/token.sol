// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MockTagger is ERC20 {
    constructor() ERC20("Dexpert", "DET") {}

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(uint256 amount_) external {
        _mint(msg.sender, amount_);
    }

    function burn(uint256 amount_) external {
        _burn(msg.sender, amount_);
    }
}
