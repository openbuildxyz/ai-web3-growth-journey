// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract CarbonCredit {
    using SafeERC20 for IERC20;
    using Address for address;

    // Oracle integration
    address public oracle;

    // Set oracle address
    function setOracle(address _oracle) external {
        require(oracle == address(0), "Oracle already set");
        oracle = _oracle;
    }
    // Carbon credit token properties
    struct Credit {
        uint256 id;
        string projectId;
        string verificationStandard;
        uint256 amount;
        uint256 vintageYear;
        address issuer;
        address owner;
        bool retired;
    }

    // Get owner of carbon credit
    function ownerOf(uint256 _id) external view returns (address) {
        require(credits[_id].id != 0, "Credit does not exist");
        return credits[_id].owner;
    }

    // Set owner of carbon credit
    function _setOwner(uint256 _id, address _owner) internal {
        credits[_id].owner = _owner;
    }

    // Mapping from credit ID to Credit struct
    mapping(uint256 => Credit) public credits;

    // Total supply of carbon credits
    uint256 public totalSupply;

    // Events
    event CreditMinted(
        uint256 indexed id,
        address indexed issuer,
        uint256 amount
    );
    event CreditTransferred(
        uint256 indexed id,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event CreditRetired(
        uint256 indexed id,
        address indexed owner,
        uint256 amount
    );
    event CreditBurned(
        uint256 indexed id,
        address indexed owner,
        uint256 amount
    );
    event CreditTraded(
        uint256 indexed id,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );

    event OraclePriceUpdated(
        uint256 indexed id,
        int256 price,
        uint256 timestamp
    );
    event CrossChainTransferInitiated(
        uint256 indexed id,
        uint256 indexed chainId,
        address indexed sender,
        address receiver
    );
    event CrossChainTransferCompleted(
        uint256 indexed id,
        uint256 indexed chainId,
        address indexed receiver
    );

    // Mint new carbon credits
    function mint(
        string memory _projectId,
        string memory _verificationStandard,
        uint256 _amount,
        uint256 _vintageYear
    ) external returns (uint256) {
        uint256 newId = totalSupply + 1;
        credits[newId] = Credit({
            id: newId,
            projectId: _projectId,
            verificationStandard: _verificationStandard,
            amount: _amount,
            vintageYear: _vintageYear,
            issuer: msg.sender,
            owner: msg.sender,
            retired: false
        });

        totalSupply++;
        emit CreditMinted(newId, msg.sender, _amount);
        return newId;
    }

    // Transfer carbon credits
    function transfer(uint256 _id, address _to) external {
        require(credits[_id].owner == msg.sender, "Not credit owner");
        require(!credits[_id].retired, "Credit already retired");

        _setOwner(_id, _to);
        emit CreditTransferred(_id, msg.sender, _to, credits[_id].amount);
    }

    // Retire carbon credits
    function retire(uint256 _id) external {
        require(credits[_id].owner == msg.sender, "Not credit owner");
        require(!credits[_id].retired, "Credit already retired");

        credits[_id].retired = true;
        emit CreditRetired(_id, msg.sender, credits[_id].amount);
    }

    // Burn carbon credits (permanent removal)
    function burn(uint256 _id) external {
        require(credits[_id].owner == msg.sender, "Not credit owner");
        require(!credits[_id].retired, "Credit already retired");

        uint256 amount = credits[_id].amount;
        delete credits[_id];
        totalSupply--;
        emit CreditBurned(_id, msg.sender, amount);
    }

    // Trade carbon credits with price
    function trade(
        uint256 _id,
        address _buyer,
        uint256 _price
    ) external payable {
        require(credits[_id].owner == msg.sender, "Not credit owner");
        require(!credits[_id].retired, "Credit already retired");
        require(msg.value >= _price, "Insufficient payment");

        // Transfer payment to seller
        payable(msg.sender).transfer(_price);

        // Transfer credit ownership
        credits[_id].owner = _buyer;
        emit CreditTraded(_id, msg.sender, _buyer, _price, block.timestamp);
    }
}
