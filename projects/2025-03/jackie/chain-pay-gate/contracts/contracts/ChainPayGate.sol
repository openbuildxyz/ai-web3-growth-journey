// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./PayToken.sol";

/**
 * @title ChainPayGate
 * @dev 通用MCP支付网关，支持预授权和自动扣费
 */
contract ChainPayGate is Ownable {
    using ECDSA for bytes32;
    
    // 支付代币
    IERC20 public token;
    
    // API服务结构
    struct APIService {
        string name;
        string description;
        address provider;
        uint256 price;
        bool active;
    }
    
    // 用户授权信息
    struct UserAuthorization {
        uint256 amount;         // 授权总金额
        uint256 used;           // 已使用金额
        uint256 validUntil;     // 授权有效期
        bool active;            // 是否有效
    }
    
    // API调用请求结构
    struct APIRequest {
        address requester;
        uint256 serviceId;
        string params;
        uint256 timestamp;
        bool fulfilled;
        uint256 paidAmount;
    }
    
    // API调用结果结构
    struct APIResponse {
        string result;
        uint256 timestamp;
        bytes32 responseHash;
    }
    
    // 存储所有注册的API服务
    mapping(uint256 => APIService) public services;
    uint256 public serviceCount = 0;
    
    // 用户预授权信息
    mapping(address => UserAuthorization) public authorizations;
    
    // 存储所有请求
    mapping(uint256 => APIRequest) public requests;
    
    // 存储所有回答
    mapping(uint256 => APIResponse) public responses;
    
    // 请求计数器
    uint256 public requestCount = 0;
    
    // 事件
    event ServiceRegistered(uint256 serviceId, string name, address provider, uint256 price);
    event ServiceUpdated(uint256 serviceId, string name, uint256 price, bool active);
    event UserAuthorized(address user, uint256 amount, uint256 validUntil);
    event AuthorizationRevoked(address user);
    event NewRequest(uint256 requestId, address requester, uint256 serviceId, string params);
    event NewResponse(uint256 requestId, string result);
    event PaymentProcessed(address from, address to, uint256 amount);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }
    
    /**
     * @dev 用户预授权一定金额的代币
     * @param _amount 授权金额
     * @param _validDays 有效天数
     */
    function authorizePayment(uint256 _amount, uint256 _validDays) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(_validDays > 0, "Valid days must be greater than 0");
        
        // 计算有效期
        uint256 validUntil = block.timestamp + (_validDays * 1 days);
        
        // 获取当前授权
        UserAuthorization storage auth = authorizations[msg.sender];
        
        // 如果已有授权，则更新
        if (auth.active) {
            // 如果有未使用部分，先转回用户
            uint256 unusedAmount = auth.amount - auth.used;
            if (unusedAmount > 0) {
                require(token.transfer(msg.sender, unusedAmount), "Transfer failed");
            }
        }
        
        // 从用户转入代币到合约
        require(token.transferFrom(msg.sender, address(this), _amount), "TransferFrom failed");
        
        // 更新授权信息
        authorizations[msg.sender] = UserAuthorization({
            amount: _amount,
            used: 0,
            validUntil: validUntil,
            active: true
        });
        
        emit UserAuthorized(msg.sender, _amount, validUntil);
    }
    
    /**
     * @dev 撤销授权并返还未使用的代币
     */
    function revokeAuthorization() external {
        UserAuthorization storage auth = authorizations[msg.sender];
        require(auth.active, "No active authorization");
        
        // 计算未使用金额
        uint256 unusedAmount = auth.amount - auth.used;
        
        // 标记授权失效
        auth.active = false;
        
        // 返还未使用代币
        if (unusedAmount > 0) {
            require(token.transfer(msg.sender, unusedAmount), "Transfer failed");
        }
        
        emit AuthorizationRevoked(msg.sender);
    }
    
    /**
     * @dev 注册新的API服务
     */
    function registerService(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public returns (uint256) {
        uint256 serviceId = serviceCount++;
        
        services[serviceId] = APIService({
            name: _name,
            description: _description,
            provider: msg.sender,
            price: _price,
            active: true
        });
        
        emit ServiceRegistered(serviceId, _name, msg.sender, _price);
        
        return serviceId;
    }
    
    /**
     * @dev 更新API服务
     */
    function updateService(
        uint256 _serviceId,
        string memory _name,
        string memory _description,
        uint256 _price,
        bool _active
    ) public {
        APIService storage service = services[_serviceId];
        require(service.provider == msg.sender || owner() == msg.sender, "Not authorized");
        
        service.name = _name;
        service.description = _description;
        service.price = _price;
        service.active = _active;
        
        emit ServiceUpdated(_serviceId, _name, _price, _active);
    }
    
    /**
     * @dev 调用API服务 - 对已预授权用户自动从授权额度中扣款
     */
    function callAPI(uint256 _serviceId, string memory _params) public returns (uint256) {
        APIService storage service = services[_serviceId];
        require(service.active, "Service not active");
        
        // 检查用户授权
        UserAuthorization storage auth = authorizations[msg.sender];
        require(auth.active, "No active authorization");
        require(block.timestamp <= auth.validUntil, "Authorization expired");
        require(auth.amount - auth.used >= service.price, "Insufficient authorized funds");
        
        // 更新已使用金额
        auth.used += service.price;
        
        // 创建新请求
        uint256 requestId = requestCount++;
        
        requests[requestId] = APIRequest({
            requester: msg.sender,
            serviceId: _serviceId,
            params: _params,
            timestamp: block.timestamp,
            fulfilled: false,
            paidAmount: service.price
        });
        
        emit NewRequest(requestId, msg.sender, _serviceId, _params);
        
        return requestId;
    }
    
    /**
     * @dev 由MCP服务提交API响应并支付给服务提供者
     */
    function submitResponse(
        uint256 _requestId,
        string memory _result
    ) public onlyOwner {
        // 确保请求存在且未被回答
        APIRequest storage request = requests[_requestId];
        require(_requestId < requestCount, "Request does not exist");
        require(!request.fulfilled, "Request already fulfilled");
        
        // 获取服务信息
        APIService storage service = services[request.serviceId];
        
        // 计算结果的哈希值
        bytes32 responseHash = keccak256(abi.encodePacked(_result, block.timestamp));
        
        // 存储响应
        responses[_requestId] = APIResponse({
            result: _result,
            timestamp: block.timestamp,
            responseHash: responseHash
        });
        
        // 标记请求已完成
        request.fulfilled = true;
        
        // 转账给服务提供者
        require(token.transfer(service.provider, request.paidAmount), "Transfer to provider failed");
        
        emit PaymentProcessed(request.requester, service.provider, request.paidAmount);
        emit NewResponse(_requestId, _result);
    }
    
    /**
     * @dev 批量提交响应(燃气优化)
     */
    function batchSubmitResponses(
        uint256[] memory _requestIds,
        string[] memory _results
    ) public onlyOwner {
        require(_requestIds.length == _results.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < _requestIds.length; i++) {
            submitResponse(_requestIds[i], _results[i]);
        }
    }
    
    /**
     * @dev 查询用户授权余额
     */
    function getAuthorizationBalance(address _user) public view returns (uint256 remaining, uint256 validUntil) {
        UserAuthorization memory auth = authorizations[_user];
        
        if (auth.active && block.timestamp <= auth.validUntil) {
            return (auth.amount - auth.used, auth.validUntil);
        } else {
            return (0, 0);
        }
    }
    
    /**
     * @dev 获取所有活跃服务
     */
    function getActiveServices() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // 计算活跃服务数量
        for (uint256 i = 0; i < serviceCount; i++) {
            if (services[i].active) {
                activeCount++;
            }
        }
        
        // 创建结果数组
        uint256[] memory activeServiceIds = new uint256[](activeCount);
        
        // 填充结果数组
        uint256 index = 0;
        for (uint256 i = 0; i < serviceCount; i++) {
            if (services[i].active) {
                activeServiceIds[index] = i;
                index++;
            }
        }
        
        return activeServiceIds;
    }
    
    /**
     * @dev 紧急情况：平台所有者撤回所有资金(仅限紧急情况)
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(token.transfer(owner(), balance), "Transfer failed");
    }
} 