# MiniRAG 知识图谱 (MiniRAG Knowledge Graph)

## 📖 项目名称

`mini_rag`

## 🚀 功能简介

此示例演示了如何使用内置的 MiniRAG 模块来构建和查询知识图谱。它首先会读取文本文件，通过 LLM 提取实体和关系来构建图谱，然后将这个图谱作为 Agent 的 RAG 知识源，用于回答复杂的问题。

## ✨ 核心特性

- **知识图谱构建**: 使用 `MiniRagBuilder` 和 `MiniRag` 类来从非结构化文本中提取信息并构建知识图谱。
- **复合式 RAG**: 将构建好的知识图谱作为 `Retriever` 实例，配置给 Agent 的 `rag` 属性。
- **多阶段处理**: 演示了知识图谱构建（ingestion）和检索（query）两个分离的阶段。

## 🔧 如何运行

1.  **配置 API Keys**: 确保你的 DeepSeek API Key 配置正确。
2.  **构建知识图谱**:
    - 在 `main.cj` 中，确保 `build` 变量为 `true`。
    - 运行命令，此时程序会读取 `resource/mini_rag/data` 目录下的文件来构建图谱，数据会存储在 `.storage` 目录中。
      ```bash
      cjpm run --name magic.examples.mini_rag
      ```
3.  **查询知识图谱**:
    - 图谱构建完成后，将 `build` 变量改为 `false`。
    - 再次运行相同的命令，程序现在会使用已构建的图谱来回答问题。
      ```bash
      cjpm run --name magic.examples.mini_rag
      ```