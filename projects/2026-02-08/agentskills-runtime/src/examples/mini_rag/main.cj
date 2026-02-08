/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.examples.mini_rag

import magic.rag.graph.{MiniRagBuilder, MiniRagConfig, MiniRag}
import magic.model.openai.OpenAIChatModel
import magic.model.ollama.OllamaEmbeddingModel
import magic.utils.readToEnd
import magic.tokenizer.Cl100kTokenizer
import magic.dsl.*
import magic.prelude.*
import magic.utils.readFile
import magic.config.Config

import std.fs.*

@agent[
    model: "deepseek:deepseek-chat",
    executor: "naive",
    rag: { source: miniRagRetriever(), mode: "static" }
]
class MiniRagAgent {
    @prompt("""
        ---Role---
        You are a helpful assistant responding to questions about documents provided.
        ---Goal---
        Generate a response of the target length and format that responds to the user's question, summarizing all information in the input data tables appropriate for the response length and format, and incorporating any relevant general knowledge.
        If you don't know the answer, just say so. Do not make anything up.
        Do not include information where the supporting evidence for it is not provided.
        Add sections and commentary to the response as appropriate for the length and format. Style the response in markdown.
    """
    )
}

func instantiate(): MiniRag {
    let model = ModelManager.createChatModel("deepseek:deepseek-chat")
    let embeddingModel = ModelManager.createEmbeddingModel("ollama:bge-m3:567m")
    let tokenizer = Cl100kTokenizer(Path("resource/mini_rag/tiktoken/cl100k_base.tiktoken"))
    MiniRagBuilder(MiniRagConfig(model, embeddingModel, tokenizer)).build()
}

func miniRagRetriever(): Retriever {
    let miniRag = instantiate()
    miniRag.asRetriever()
}

func buildGraph(): Unit {
    let miniRag = instantiate()
    Directory.walk("resource/mini_rag/data") { fileInfo =>
        let content = readFile(fileInfo.path)
        miniRag.insert(content)
        return true
    }
    miniRag.commit()
}

main(): Unit {
    //Config.env["DEEPSEEK_API_KEY"] = "<your api key>"
   // Config.env["OLLAMA_BASE_URL"] = "http://127.0.0.1:11434"
    Config.logLevel = "INFO"
    Config.env["DASHSCOPE_API_KEY"] = "sk-025f7e910bce4231ab320fa4d838f426"
    // if graph is already built, turn it off
    var build = true
    if (build) {
        buildGraph()
    }
    let agent = MiniRagAgent()
    let response = agent.chat('What does LiHua predict will happen in "The Rings of Power"?')
    println("ANSWER:\n${response}")
}
