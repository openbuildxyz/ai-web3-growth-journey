// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Marketplace
 * @dev A simple marketplace contract for listing, buying, and canceling NFT sales.
 */
contract Marketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    uint256 private _listingCounter;
    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 price
    );
    event Sale(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        address nftAddress,
        uint256 tokenId,
        uint256 price
    );
    event Canceled(uint256 indexed listingId);

    modifier isListingOwner(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "Not listing owner");
        _;
    }

    modifier isListingActive(uint256 listingId) {
        require(listings[listingId].active, "Listing not active");
        _;
    }

    /**
     * @notice Lists an NFT on the marketplace.
     * @dev The contract must be approved to transfer the NFT.
     * @param nftAddress The address of the NFT contract.
     * @param tokenId The ID of the token to list.
     * @param price The selling price in Wei.
     */
    function listItem(address nftAddress, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Marketplace not approved");

        _listingCounter++;
        uint256 listingId = _listingCounter;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(listingId, msg.sender, nftAddress, tokenId, price);
    }

    /**
     * @notice Allows a user to buy a listed NFT.
     * @param listingId The ID of the listing to purchase.
     */
    function buyItem(uint256 listingId) external payable nonReentrant isListingActive(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.value >= listing.price, "Insufficient funds to buy");
        require(listing.seller != msg.sender, "Seller cannot be the buyer");

        address seller = listing.seller;
        listing.active = false;

        IERC721(listing.nftAddress).safeTransferFrom(seller, msg.sender, listing.tokenId);
        
        (bool success, ) = seller.call{value: listing.price}("");
        require(success, "Failed to send Ether");

        emit Sale(listingId, seller, msg.sender, listing.nftAddress, listing.tokenId, listing.price);
    }

    /**
     * @notice Allows the seller to cancel their listing.
     * @param listingId The ID of the listing to cancel.
     */
    function cancelListing(uint256 listingId) external nonReentrant isListingActive(listingId) isListingOwner(listingId) {
        listings[listingId].active = false;
        emit Canceled(listingId);
    }
}
