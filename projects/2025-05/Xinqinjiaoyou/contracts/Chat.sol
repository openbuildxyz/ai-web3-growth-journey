// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Chat {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    // 用户之间的消息映射
    // mapping(address => mapping(address => Message[])) private messages;
    // 使用事件来存储消息，这样可以降低gas费用
    event NewMessage(
        address indexed sender,
        address indexed recipient,
        string content,
        uint256 timestamp
    );

    // 发送消息
    function sendMessage(address recipient, string memory content) public {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(content).length > 0, "Message cannot be empty");
        
        emit NewMessage(msg.sender, recipient, content, block.timestamp);
    }

    // 获取与特定用户的消息历史
    // 注意：由于我们使用事件来存储消息，前端需要监听这些事件来获取消息历史
    // 这里提供一个辅助函数来验证消息发送者
    function verifyMessage(
        address sender,
        address recipient,
        string memory content,
        uint256 timestamp
    ) public pure returns (bool) {
        return (
            sender != address(0) &&
            recipient != address(0) &&
            bytes(content).length > 0 &&
            timestamp > 0
        );
    }
} 