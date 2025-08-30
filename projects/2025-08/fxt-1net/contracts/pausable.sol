// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${contractName}
 * @dev ERC20 Token with pause functionality.
 */
contract ${contractName} is ERC20, Pausable, Ownable {
    constructor(uint256 ${supply}) ERC20("${name}", "${contractName}") {
        _mint(msg.sender, ${supply} * 10 ** decimals());
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256 amount) internal override(ERC20) {
        require(!paused(), "Token is paused");
        super._update(from, to, amount);
    }
}
