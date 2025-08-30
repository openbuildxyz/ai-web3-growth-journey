// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AI_NFT
 * @dev An ERC721 contract for minting NFTs with AI-generated art.
 * The token URI is expected to be a data URL (e.g., base64 encoded image).
 */
contract AI_NFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    event Minted(address indexed owner, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("AI Generated NFT", "AINFT") {}

    /**
     * @dev Mints a new NFT and assigns it to `recipient`.
     * This function can only be called by the contract owner.
     * @param recipient The address that will receive the minted NFT.
     * @param tokenURI The URI for the token's metadata (e.g., base64 data URL).
     * @return The ID of the newly minted token.
     */
    function mint(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit Minted(recipient, newItemId, tokenURI);

        return newItemId;
    }
}
