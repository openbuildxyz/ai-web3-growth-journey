# Markdown 文档问答 (Markdown Q&A)

## 📖 项目名称

`markdown_qa`

## 🚀 功能简介

此示例演示了如何利用 Magic 提供的 RAG (Retrieval-Augmented Generation) 功能，构建一个能够基于本地 Markdown 文档内容回答问题的问答机器人。Agent 会首先从指定的文档中检索相关信息，然后结合这些信息生成答案。

## ✨ 核心特性

- **RAG**: 在 `@agent` 中通过 `rag` 属性配置知识源。
  - **`source`**: 指定本地 Markdown 文件作为知识库。
  - **`mode: "static"`**: 在生成回答前，静态地从知识库中检索信息。
- **异步交互**: 使用 `.asyncChat()` 方法进行流式对话，并展示如何获取 RAG 检索到的源文档信息。
- **`@prompt[pattern: ERA]`**: 使用 `ERA` 提示词模式来结构化地定义 Agent 的行为。

## 🔧 如何运行

1.  **配置 API Key**: 在 `main.cj` 文件中，将 `<your api key>` 替换为你的 DeepSeek API Key。
    ```cangjie
    Config.env["DEEPSEEK_API_KEY"] = "sk-xxxxxxxxxx";
    ```
2.  **运行项目**: 在终端中执行以下命令：
    ```bash
    cjpm run --name magic.examples.markdown_qa
    ```
