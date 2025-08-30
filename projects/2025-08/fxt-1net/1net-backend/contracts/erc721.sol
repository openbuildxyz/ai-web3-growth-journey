// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${contractName}
 * @dev Simple ERC721 NFT Collection with Ownable minting.
 */
contract ${contractName} is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("${name}", "${contractName}") {}

    /**
     * @dev Mint a new NFT to a specified address.
     */
    function mintTo(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}
