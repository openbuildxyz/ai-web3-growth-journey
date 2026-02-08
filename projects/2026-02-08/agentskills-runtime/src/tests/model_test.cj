/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.tests

import magic.core.message.*
import magic.core.model.*
import magic.model.{ModelUtils, ModelManager}
import magic.log.LogUtils
import magic.config.Config

import std.collection.collectArray

@Test
class TestModel {
    let imageBase64: String = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAAGVn0euAAABDUlEQVR4nO3aQW6EMBQFQS+4/5XhDEaYlqFqPejrpVEUjXKMMc4x4Zj5sAf+9oB3yQNPPTD1Lt05sJQDDjjwlQN+FznggAMOOOCAAw688HfRast/QqsZUDOgZkDNgJoBNQNqBtQMqBlQM6BmQM33QjUDagbUDKgZUDOgZkDNgJoBNQNqBtQMqBlQM6BmQM2AmgE1A2oG1AyoGVAzoGZAzYDa9v8vtLvt36DdCRATICZATICYADEBYgLEBIgJEBMgJkBMgJgAMQFiAsQEiAkQEyAmQEyAmAAxAWICxASICRATICZATICYADEBYgLEBIgJEBMgJkBMgJgAMQFiAsQEiAkQEyAmQEyAmAAxAWIXdAkJygYResIAAAAASUVORK5CYII="

    @BeforeAll
    func setup() {
        Config.logLevel = "INFO"
    }

    @TestCase
    func testOpenAIChat() {
        let client = ModelManager.createChatModel(OPENAI_CHAT_MODEL)
        let msgList = MessageList([
            Message.user("hello")
        ])
        let resp = client.create(ChatRequest(msgList))
        @Assert(resp.message.content.size > 0)
        println(resp.message.content)
    }

    @TestCase
    func testOpenAIAsyncChat() {
        let model = ModelManager.createChatModel(OPENAI_CHAT_MODEL)
        let msgList = MessageList([
            Message.user("hello")
        ])
        let asyncResp = model.asyncCreate(ChatRequest(msgList))
        let content: Array<String> = asyncResp.iter() |> collectArray
        @Assert(content.size > 0)
        @Assert(asyncResp.message.content.size > 0)
    }

    @TestCase
    func testOpenAIChatWithImage() {
        let model = ModelManager.createChatModel(OPENAI_CHAT_MODEL)
        let msgList = MessageList([
            Message.user("what's in this image", image: this.imageBase64)
        ])
        let resp = model.create(ChatRequest(msgList))
        @Assert(resp.message.content.size > 0)
    }

    @TestCase
    func testOpenAIEmbedding() {
        let model = ModelManager.createEmbeddingModel(OPENAI_EMBEDDING_MODEL)
        let resp = model.create(EmbeddingRequest("hello"))
        @Assert(resp.data.size > 0)
    }

    @TestCase
    func testOllamaChat() {
        let model = ModelManager.createChatModel(OLLAMA_CHAT_MODEL)
        let msgList = MessageList([
            Message.user("hello")
        ])
        let resp = model.create(ChatRequest(msgList))
        @Assert(resp.message.content.size > 0)
    }

    // @TestCase
    func testOllamaChatModelWithImage() {
        let model = ModelManager.createChatModel(OLLAMA_VLM)
        let msgList = MessageList([
            Message.user("what's in this image", image: this.imageBase64)
        ])
        let resp = model.create(ChatRequest(msgList))
        @Assert(resp.message.content.size > 0)
    }

    // @TestCase
    func testOllamaEmbedding() {
        let model = ModelManager.createEmbeddingModel(OLLAMA_EMBEDDING_MODEL)
        let resp = model.create(EmbeddingRequest("hello"))
        @Assert(resp.data.size > 0)
    }

    @TestCase
    func testOllamaAsyncChat() {
        let model = ModelManager.createChatModel(OLLAMA_CHAT_MODEL)
        let msgList = MessageList([
            Message.user("hello")
        ])
        let asyncResp = model.asyncCreate(ChatRequest(msgList))
        let content: Array<String> = asyncResp.iter() |> collectArray
        @Assert(content.size > 0)
        @Assert(asyncResp.message.content.size > 0)
    }
}
