
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AcademicReviewPlatform {
    string public name = "Academic Attention Token";
    string public symbol = "AAT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;

    struct Paper {
        address author;
        string ipfsHash;
        uint256 timestamp;
    }

    struct Review {
        address reviewer;
        string content;
        uint256 timestamp;
    }

    mapping(address => uint256) public balanceOf;
    mapping(uint256 => Paper) public papers;
    mapping(uint256 => Review[]) public paperReviews;
    uint256 public paperCount;

    event PaperSubmitted(uint256 paperId, address indexed author, string ipfsHash);
    event PaperReviewed(uint256 paperId, address indexed reviewer, string content);
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        owner = msg.sender;
    }

    function submitPaper(string memory ipfsHash) public {
        paperCount++;
        papers[paperCount] = Paper(msg.sender, ipfsHash, block.timestamp);
        emit PaperSubmitted(paperCount, msg.sender, ipfsHash);
    }

    function reviewPaper(uint256 paperId, string memory content) public {
        require(paperId > 0 && paperId <= paperCount, "Invalid paper ID");
        paperReviews[paperId].push(Review(msg.sender, content, block.timestamp));
        _mint(msg.sender, 10 * (10 ** uint256(decimals))); // Reward reviewer with 10 tokens
        emit PaperReviewed(paperId, msg.sender, content);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function getReviews(uint256 paperId) public view returns (Review[] memory) {
        return paperReviews[paperId];
    }
}
