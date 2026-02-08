/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.markdown_qa

import magic.dsl.*
import magic.prelude.*
import magic.config.Config
import magic.model.ModelManager

@agent[
    model: "dashscope:qwen3-max-preview",
    executor: "naive",
    rag: {
        source: "./docs/tutorial.md",
        mode: "static"
    }
]
class QABot {
    @prompt[pattern: ERA] (
        expectation: "代码块被标签 ```cangjie 和 ```包裹",
        role: "简单问答助手",
        action: "搜索文档获取知识并回答问题"
    )
}

main () {
    Config.logLevel = "INFO"
    Config.defaultEmbeddingModel = ModelManager.createEmbeddingModel("ollama:nomic-embed-text")

    let bot = QABot()
    let aresp = bot.asyncChat("Agent RAG 怎么编写")
    for (chunk in aresp) {
        print(chunk)
    }
    println("\n---end---")
    for (info in aresp.execution.retrievalInfo) {
        for (doc in info.retrieval.sources) {
            println(doc.metadata)
        }
    }
}