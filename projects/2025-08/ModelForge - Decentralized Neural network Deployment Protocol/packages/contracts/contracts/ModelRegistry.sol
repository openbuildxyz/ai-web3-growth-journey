// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ModelRegistry
 * @dev Smart contract for registering and managing AI models on-chain
 */
contract ModelRegistry is Ownable, Pausable, ReentrancyGuard {
    struct Model {
        string name;
        string description;
        string ipfsHash;
        string modelType;
        address owner;
        uint256 timestamp;
        bool isActive;
        string version;
        uint256 downloads;
    }

    mapping(bytes32 => Model) public models;
    mapping(address => bytes32[]) public userModels;
    mapping(string => bool) public ipfsHashExists;

    bytes32[] public allModelIds;

    event ModelRegistered(bytes32 indexed modelId, address indexed owner, string name, string ipfsHash, string version);

    event ModelUpdated(bytes32 indexed modelId, string name, string description, string version);

    event ModelDeactivated(bytes32 indexed modelId);
    event ModelDownloaded(bytes32 indexed modelId);

    constructor() {}

    /**
     * @dev Register a new AI model
     * @param _name Model name
     * @param _description Model description
     * @param _ipfsHash IPFS hash of the model
     * @param _modelType Type of the model (e.g., "text-generation", "image-classification")
     * @param _version Model version
     */
    function registerModel(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        string memory _modelType,
        string memory _version
    ) external whenNotPaused nonReentrant {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!ipfsHashExists[_ipfsHash], "Model with this IPFS hash already exists");

        bytes32 modelId = keccak256(abi.encodePacked(_ipfsHash, msg.sender, block.timestamp));

        models[modelId] = Model({
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            modelType: _modelType,
            owner: msg.sender,
            timestamp: block.timestamp,
            isActive: true,
            version: _version,
            downloads: 0
        });

        userModels[msg.sender].push(modelId);
        allModelIds.push(modelId);
        ipfsHashExists[_ipfsHash] = true;

        emit ModelRegistered(modelId, msg.sender, _name, _ipfsHash, _version);
    }

    /**
     * @dev Update an existing model
     * @param _modelId Model ID to update
     * @param _name New model name
     * @param _description New model description
     * @param _version New model version
     */
    function updateModel(
        bytes32 _modelId,
        string memory _name,
        string memory _description,
        string memory _version
    ) external whenNotPaused {
        require(models[_modelId].owner == msg.sender, "Only owner can update model");
        require(models[_modelId].isActive, "Model is not active");
        require(bytes(_name).length > 0, "Name cannot be empty");

        models[_modelId].name = _name;
        models[_modelId].description = _description;
        models[_modelId].version = _version;

        emit ModelUpdated(_modelId, _name, _description, _version);
    }

    /**
     * @dev Deactivate a model
     * @param _modelId Model ID to deactivate
     */
    function deactivateModel(bytes32 _modelId) external {
        require(
            models[_modelId].owner == msg.sender || msg.sender == owner(),
            "Only owner or contract owner can deactivate model"
        );
        require(models[_modelId].isActive, "Model is already inactive");

        models[_modelId].isActive = false;
        emit ModelDeactivated(_modelId);
    }

    /**
     * @dev Record a model download
     * @param _modelId Model ID that was downloaded
     */
    function recordDownload(bytes32 _modelId) external whenNotPaused {
        require(models[_modelId].isActive, "Model is not active");

        models[_modelId].downloads++;
        emit ModelDownloaded(_modelId);
    }

    /**
     * @dev Get model information
     * @param _modelId Model ID to query
     */
    function getModel(bytes32 _modelId) external view returns (Model memory) {
        return models[_modelId];
    }

    /**
     * @dev Get all models for a user
     * @param _user User address
     */
    function getUserModels(address _user) external view returns (bytes32[] memory) {
        return userModels[_user];
    }

    /**
     * @dev Get total number of models
     */
    function getTotalModels() external view returns (uint256) {
        return allModelIds.length;
    }

    /**
     * @dev Get all model IDs (paginated)
     * @param _offset Starting index
     * @param _limit Number of models to return
     */
    function getModelsPaginated(uint256 _offset, uint256 _limit) external view returns (bytes32[] memory) {
        require(_offset < allModelIds.length, "Offset out of bounds");

        uint256 end = _offset + _limit;
        if (end > allModelIds.length) {
            end = allModelIds.length;
        }

        bytes32[] memory result = new bytes32[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allModelIds[i];
        }

        return result;
    }

    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
