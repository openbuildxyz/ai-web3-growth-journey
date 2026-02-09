// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPlatformToken {
    function mint(address to, uint256 amount) external;
}

/// @notice Simple ETH -> Token exchange with configurable rate.
/// @dev `tokensPerEth` uses 18 decimals: tokenAmount = msg.value * tokensPerEth / 1e18.
contract TokenExchange is Ownable, ReentrancyGuard {
    IPlatformToken public token;
    uint256 public tokensPerEth;
    address public treasury;

    event TokensPurchased(address indexed buyer, uint256 ethIn, uint256 tokensOut);
    event RateUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address token_, uint256 tokensPerEth_, address treasury_) Ownable(msg.sender) {
        require(token_ != address(0), "TokenExchange: token=0");
        require(tokensPerEth_ > 0, "TokenExchange: rate=0");
        require(treasury_ != address(0), "TokenExchange: treasury=0");
        token = IPlatformToken(token_);
        tokensPerEth = tokensPerEth_;
        treasury = treasury_;
    }

    receive() external payable {
        buy();
    }

    function setRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "TokenExchange: rate=0");
        uint256 oldRate = tokensPerEth;
        tokensPerEth = newRate;
        emit RateUpdated(oldRate, newRate);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "TokenExchange: treasury=0");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function buy() public payable nonReentrant {
        require(msg.value > 0, "TokenExchange: eth=0");
        uint256 tokenAmount = (msg.value * tokensPerEth) / 1e18;
        require(tokenAmount > 0, "TokenExchange: token=0");

        token.mint(msg.sender, tokenAmount);

        (bool ok, ) = payable(treasury).call{ value: msg.value }("");
        require(ok, "TokenExchange: eth transfer failed");

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
}
