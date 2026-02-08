# 快速入门 (Quick Start)

## 📖 项目名称

`quick_start`

## 🚀 功能简介

这是 Cangjie Magic 最基础的 "Hello, World!" 示例。它展示了如何用最少的代码定义一个具备基本对话能力的 Agent，并与之进行交互。这个例子是理解 Agent 构建基础的绝佳起点。

## ✨ 核心特性

- **`@agent`**: 使用 `@agent` 宏快速定义一个 Agent 类。
- **`@prompt`**: 为 Agent 设置系统提示词（System Prompt），定义其角色和行为。
- **基本交互**: 调用 Agent 的 `.chat()` 方法进行单轮对话。

## 🔧 如何运行

1.  **配置 API Key**: 在 `main.cj` 文件中，将 `<your api key>` 替换为你的 DeepSeek API Key。
    ```cangjie
    Config.env["DEEPSEEK_API_KEY"] = "sk-xxxxxxxxxx";
    ```
2.  **运行项目**: 在终端中执行以下命令：
    ```bash
    cjpm run --name magic.examples.quick_start
    ```