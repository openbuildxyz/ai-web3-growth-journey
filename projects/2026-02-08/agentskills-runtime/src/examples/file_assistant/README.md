# 文件助手 (File Assistant)

## 📖 项目名称

`file_assistant`

## 🚀 功能简介

此示例展示了 Cangjie Magic 如何通过 MCP (Model Context Protocol) 协议与用其他语言编写的外部工具（如 Node.js 脚本、Docker 容器）进行集成。`FileAssistant` Agent 可以调用这些外部进程来操作本地文件，例如将 PDF 转换为 Markdown。

## ✨ 核心特性

- **MCP (Model Context Protocol)**: 在 `@agent` 的 `tools` 属性中使用 `stdioMCP` 语法来配置和启动外部工具进程。
- **跨语言集成**: 演示了与 Node.js 脚本和 Docker 容器的无缝集成。
- **`react` 执行器**: Agent 使用 `react` 模式，通过思考和行动的循环来完成复杂的文件操作任务。
- **异步与日志打印**: 使用 `.asyncChat()` 和 `ConsolePrinter` 来观察 Agent 的内部执行步骤。

## 🔧 如何运行

1.  **配置路径**: 在 `main.cj` 文件中，修改以下常量为你本地的实际路径：
    - `MARKDOWNIFY_DIR`: 指向 `markdownify-mcp` 项目的路径。
    - `MOUNT_DIR`: 你希望挂载给 Docker 文件系统工具的本地目录路径。
2.  **配置 API Key**: 确保你的 `DEEPSEEK_API_KEY` 已设置。
3.  **准备外部工具**: 需要安装 MCP Server：
    - [filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
    - [markdownify-mcp](https://github.com/zcaceres/markdownify-mcp)
4.  **运行项目**: 在终端中执行以下命令：
    ```bash
    cjpm run --name magic.examples.file_assistant
    ```

**⚠️ 注意**：在 Windows 上运行时，markdownify 工具[可能会出错](https://github.com/zcaceres/markdownify-mcp/issues/5)。