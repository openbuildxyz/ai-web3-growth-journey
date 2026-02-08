# UCToo API MCP 客户端

## 概述
该项目是用于测试UCToo API MCP服务器的客户端。它演示了如何使用模型上下文协议(MCP)通过自然语言查询与uctoo后端API进行通信。

## 使用方法

要运行客户端，请从CangjieMagic目录执行以下命令：

```bash
cjpm run --name magic.examples.uctoo_api_mcp_client
```

客户端将连接到uctoo_api_mcp_server，并对entity资源执行各种API操作：

1. 获取单个entity实体
2. 获取多个entity实体
3. 添加新的entity实体
4. 编辑entity实体
5. 删除entity实体

## 工作原理

客户端使用Magic Framework的@agent注解创建一个AI代理，该代理可以与MCP服务器通信。代理配置为使用stdioMCP连接到uctoo_api_mcp_server。

代理被提示作为uctoo后端API的测试器，专门用于entity实体操作。它可以处理自然语言查询并将其转换为适当的API调用。