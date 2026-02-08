# API 文档生成器 (API Document Generator)

## 📖 项目名称

`doc_generator`

## 🚀 功能简介

这是一个高级应用示例，展示了如何利用 Cangjie Magic 和仓颉语言的 AST (Abstract Syntax Tree) 解析能力来自动为 `.cj` 源代码生成 API 文档。它会读取代码文件，提取公开的 API 定义，然后让 LLM 为其生成描述，并最终格式化为 Markdown 文档。

## ✨ 核心特性

- **与语言工具集成**: 结合了仓颉的 `std.ast` 库来解析源代码。
- **`@jsonable` 复杂结构输出**: 定义了 `Doc`, `TypeDef` 等多个嵌套的 `jsonable` 类，用于规范和解析 LLM 生成的结构化数据。
- **高级提示词工程**: `DocAgent` 的提示词中包含了详细的背景知识（Cangjie 语言规范）和指令，以确保生成高质量的文档。
- **文件操作**: 示例中包含了对文件系统的读写操作，将最终结果保存为 Markdown 文件。

## 🔧 如何运行

1.  **配置 API Key**: 确保你的大模型 API Key 已设置。
2.  **运行项目**: 在终端中执行以下命令。脚本会自动处理 `src` 目录下的代码文件。
    ```bash
    cjpm run --name magic.examples.doc_generator
    ```
    生成的文档将位于 `temp-docs` 目录下。
