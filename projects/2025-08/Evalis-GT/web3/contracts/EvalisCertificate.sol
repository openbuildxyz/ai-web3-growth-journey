// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EvalisCertificate is ERC721URIStorage, Ownable {
    uint256 private _nextId;

    constructor() ERC721("Evalis Certificate", "EVLC") {}

    function mintTo(address to, string memory tokenUri) external onlyOwner returns (uint256) {
        uint256 tokenId = ++_nextId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        return tokenId;
    }
}
