// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DAORegistry
 * @dev A simple on-chain registry to link a DAO's primary contract address
 * to its metadata stored on IPFS.
 */
contract DAORegistry {
    address public owner;
    mapping(address => string) private _daoMetadataCIDs;

    event DAORegistered(address indexed daoAddress, string cid);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "DAORegistry: caller is not the owner");
        _;
    }

    /**
     * @dev Registers a new DAO or updates an existing one.
     * @param _daoAddress The main contract address of the DAO (e.g., the Governor).
     * @param _cid The IPFS Content Identifier (CID) for the DAO's metadata.
     */
    function registerDAO(address _daoAddress, string memory _cid) public onlyOwner {
        require(_daoAddress != address(0), "DAORegistry: DAO address cannot be zero");
        _daoMetadataCIDs[_daoAddress] = _cid;
        emit DAORegistered(_daoAddress, _cid);
    }

    /**
     * @dev Retrieves the IPFS CID for a given DAO address.
     * @param _daoAddress The main contract address of the DAO.
     * @return The IPFS CID string.
     */
    function getCID(address _daoAddress) public view returns (string memory) {
        return _daoMetadataCIDs[_daoAddress];
    }
}