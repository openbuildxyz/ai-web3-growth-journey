// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DAORegistryV2
 * @dev A registry for DAOs, associating each DAO with the address that registered it.
 * This version allows fetching all DAOs registered by a specific user.
 */
contract DAORegistryV2 {
    event DAORegistered(
        address indexed registrar,
        address indexed daoAddress,
        string cid
    );

    // Mapping from a user's address to an array of their registered DAO contract addresses
    mapping(address => address[]) private userDAOAddresses;
    // Mapping from a user's address to an array of their registered IPFS CIDs
    mapping(address => string[]) private userCIDs;

    /**
     * @dev Registers a new DAO, linking it to the caller's address.
     * @param _daoAddress The contract address of the DAO being registered.
     * @param _cid The IPFS Content ID (CID) for the DAO's metadata.
     */
    function registerDAO(address _daoAddress, string calldata _cid) public {
        require(_daoAddress != address(0), "Invalid DAO address");
        require(bytes(_cid).length > 0, "CID cannot be empty");

        userDAOAddresses[msg.sender].push(_daoAddress);
        userCIDs[msg.sender].push(_cid);

        emit DAORegistered(msg.sender, _daoAddress, _cid);
    }

    /**
     * @dev Retrieves all DAO addresses and CIDs registered by a specific user.
     * @param _user The address of the user to query.
     * @return addresses An array of DAO contract addresses.
     * @return cids An array of corresponding IPFS CIDs.
     */
    function getDAOsByUser(
        address _user
    ) public view returns (address[] memory addresses, string[] memory cids) {
        return (userDAOAddresses[_user], userCIDs[_user]);
    }
}