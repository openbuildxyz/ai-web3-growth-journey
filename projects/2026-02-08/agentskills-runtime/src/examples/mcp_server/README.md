# MCP 客户端与服务端 (MCP Client & Server)

## 📖 项目名称

`mcp_client` & `mcp_server`

## 🚀 功能简介

这是一对核心示例，完整地演示了 Cangjie Magic 的模型上下文协议 (MCP)。`mcp_server` 将一个 `Calculator` Agent 的能力通过标准输入输出（stdio）暴露出来。`mcp_client` 则连接到这个服务，将远程 Agent 的工具当作自己的工具来使用，从而解决问题。

## ✨ 核心特性

- **`StdioMCPServer`**: 在 `mcp_server` 中，启动一个 MCP 服务，将本地 Agent 和工具暴露给外部调用。
- **`stdioMCP`**: 在 `mcp_client` 中，通过命令行启动并连接到一个 MCP 服务。
- **`httpMCP`**: (在代码中作为示例展示) 连接到一个通过 HTTP/SSE 协议提供服务的 MCP 服务器。
- **分布式工具调用**: Agent 可以无缝使用远程工具，就像使用本地工具一样。

#### 🔧 如何运行

你需要打开两个终端窗口：

1.  **启动服务端**: 在第一个终端中，运行以下命令启动 MCP 服务。
    ```bash
    cjpm run --name magic.examples.mcp_server
    ```
2.  **启动客户端**: 在第二个终端中，运行以下命令启动客户端并与之交互。
    ```bash
    cjpm run --name magic.examples.mcp_client
    ```