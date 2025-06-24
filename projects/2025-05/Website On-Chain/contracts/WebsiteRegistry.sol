// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WebsiteRegistry
 * @dev 存储企业官网URL的智能合约
 */
contract WebsiteRegistry {
    // 网站信息结构
    struct Website {
        string id;        // 网站ID
        string name;      // 网站名称
        string url;       // 网站URL
        address owner;    // 所有者地址
        uint256 timestamp; // 上链时间戳
    }

    // 网站ID到网站信息的映射
    mapping(string => Website) public websites;
    
    // 所有网站ID的数组
    string[] public websiteIds;
    
    // 用户拥有的网站ID数组
    mapping(address => string[]) public userWebsites;

    // 事件定义
    event WebsiteRegistered(string id, string name, string url, address owner, uint256 timestamp);
    event WebsiteUpdated(string id, string name, string url, uint256 timestamp);

    /**
     * @dev 注册新网站
     * @param _id 网站ID
     * @param _name 网站名称
     * @param _url 网站URL
     */
    function registerWebsite(string memory _id, string memory _name, string memory _url) public {
        // 确保网站ID不为空
        require(bytes(_id).length > 0, "Website ID cannot be empty");
        
        // 检查网站ID是否已存在
        require(bytes(websites[_id].id).length == 0, "Website ID already exists");
        
        // 创建新的网站记录
        Website memory newWebsite = Website({
            id: _id,
            name: _name,
            url: _url,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        
        // 存储网站信息
        websites[_id] = newWebsite;
        
        // 添加到网站ID数组
        websiteIds.push(_id);
        
        // 添加到用户的网站列表
        userWebsites[msg.sender].push(_id);
        
        // 触发事件
        emit WebsiteRegistered(_id, _name, _url, msg.sender, block.timestamp);
    }

    /**
     * @dev 更新网站信息
     * @param _id 网站ID
     * @param _name 新的网站名称
     * @param _url 新的网站URL
     */
    function updateWebsite(string memory _id, string memory _name, string memory _url) public {
        // 确保网站存在
        require(bytes(websites[_id].id).length > 0, "Website does not exist");
        
        // 确保调用者是网站所有者
        require(websites[_id].owner == msg.sender, "Only owner can update website");
        
        // 更新网站信息
        websites[_id].name = _name;
        websites[_id].url = _url;
        websites[_id].timestamp = block.timestamp;
        
        // 触发事件
        emit WebsiteUpdated(_id, _name, _url, block.timestamp);
    }

    /**
     * @dev 获取网站总数
     * @return 网站总数
     */
    function getWebsiteCount() public view returns (uint256) {
        return websiteIds.length;
    }

    /**
     * @dev 获取用户拥有的网站数量
     * @param _owner 用户地址
     * @return 用户拥有的网站数量
     */
    function getUserWebsiteCount(address _owner) public view returns (uint256) {
        return userWebsites[_owner].length;
    }

    /**
     * @dev 获取网站信息
     * @param _id 网站ID
     * @return 网站信息
     */
    function getWebsite(string memory _id) public view returns (Website memory) {
        return websites[_id];
    }
}
