// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ForgeToken
 * @dev ERC20 token for the ModelForge ecosystem
 * Features:
 * - 18 decimals (standard)
 * - Initial supply minted to deployer
 * - Mintable by owner for ecosystem rewards
 * - Standard ERC20 functionality
 */
contract ForgeToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18; // 1 million FORGE

    event TokensMinted(address indexed to, uint256 amount);

    /**
     * @dev Constructor that gives msg.sender all of initial supply
     */
    constructor() ERC20("ModelForge Token", "FORGE") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint tokens to specified address
     * Can only be called by the owner
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "ForgeToken: mint to zero address");
        require(amount > 0, "ForgeToken: mint amount must be positive");

        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "ForgeToken: arrays length mismatch");
        require(recipients.length > 0, "ForgeToken: empty arrays");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "ForgeToken: mint to zero address");
            require(amounts[i] > 0, "ForgeToken: mint amount must be positive");

            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Returns the number of decimals used to get its user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
