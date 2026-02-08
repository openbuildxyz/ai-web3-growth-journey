/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.model

import magic.core.agent.Agent
import magic.core.message.*
import magic.core.model.*
import magic.log.LogUtils
import magic.utils.getEnv
import magic.config.Config
import magic.model.openai.{OpenAIChatModel, OpenAIEmbeddingModel, OpenAIImageModel}
import magic.model.ollama.{OllamaChatModel, OllamaEmbeddingModel}
import magic.model.dashscope.DashscopeEmbeddingModel
import magic.model.llamacpp.LlamacppEmbeddingModel
import magic.model.siliconflow.SiliconflowImageModel
import magic.model.zhipuai.ZhipuAIImageModel
import magic.model.stepfun.{StepFunChatModel, StepFunEmbeddingModel, StepFunImageModel}
import std.convert.*
import std.collection.HashMap
import std.collection.{filter, collectArray}

//====================================================================================
private struct ProviderConfig {
    ProviderConfig(
        let urlEnvVar: String,
        let urlEnvValue: String,
        let keyEnvVar: String
    ) { }
}

private let DEFAULT_PROVIDER_MAP = HashMap<String, ProviderConfig>([
    ("openai", ProviderConfig("OPENAI_BASE_URL",
                              "https://api.openai.com/v1",
                              "OPENAI_API_KEY")),
    ("dashscope", ProviderConfig("DASHSCOPE_BASE_URL", // openai-compatible
                                 "https://dashscope.aliyuncs.com/compatible-mode/v1",
                                 "DASHSCOPE_API_KEY")),
    ("ark",       ProviderConfig("ARK_BASE_URL",       // openai-compatible
                                 "https://ark.cn-beijing.volces.com/api/v3",
                                 "ARK_API_KEY")),
    ("deepseek",  ProviderConfig("DEEPSEEK_BASE_URL",  // openai-compatible
                                 "https://api.deepseek.com",
                                 "DEEPSEEK_API_KEY")),
    ("siliconflow", ProviderConfig("SILICONFLOW_BASE_URL", // openai-compatible
                                   "https://api.siliconflow.cn/v1",
                                   "SILICONFLOW_API_KEY")),
    ("zhipuai",   ProviderConfig("ZHIPU_BASE_URL", // openai-compatible
                                 "https://open.bigmodel.cn/api/paas/v4",
                                 "ZHIPU_API_KEY")),
    ("maas",   ProviderConfig("MAAS_BASE_URL", // openai-compatible
                              "",
                              "MAAS_API_KEY")),
    ("google", ProviderConfig("GOOGLE_BASE_URL", // openai-compatible
                              "https://generativelanguage.googleapis.com/v1beta/openai",
                              "GOOGLE_API_KEY")),
    ("moonshot", ProviderConfig("MOONSHOT_BASE_URL", // openai-compatible
                             "https://api.moonshot.cn/v1",
                             "MOONSHOT_API_KEY")),
    ("openrouter", ProviderConfig("OPENROUTER_BASE_URL", // openai-compatible
                             "https://openrouter.ai/api/v1",
                             "OPENROUTER_API_KEY")),
    ("stepfun",   ProviderConfig("STEPFUN_BASE_URL", // openai-compatible
                                "https://api.stepfun.com/v1",
                                "STEPFUN_API_KEY")),
    ("ollama",    ProviderConfig("OLLAMA_BASE_URL",
                                 "http://localhost:11434",
                                 "")),
    ("llamacpp",  ProviderConfig("LLAMACPP_BASE_URL",
                                 "http://localhost:8080",
                                  ""))
])

private func getAllProviderNames(): Array<String> {
    return DEFAULT_PROVIDER_MAP.keys().toArray()
}

private func checkProvider(provider: String): Bool {
    return DEFAULT_PROVIDER_MAP.keys().contains(provider)
}

private func getDefaultBaseURL(provider: String, kind: String): String {
    let config = DEFAULT_PROVIDER_MAP[provider]
    let envVarName = config.urlEnvVar
    // Special cases of default values
    let defaultValue = if (kind == "embedding" && provider == "dashscope") {
        "https://dashscope.aliyuncs.com/api/v1"
    } else if (provider == "maas") {
        match (getEnv(envVarName)) {
            case Some(v) => v
            case None => throw Exception("Fail to get env variable ${envVarName}.")
        }
    } else {
        config.urlEnvValue
    }
    return getEnv(envVarName) ?? defaultValue
}

func getDefaultApiKey(provider: String): String {
    let config = DEFAULT_PROVIDER_MAP[provider]
    let envVarName = config.keyEnvVar
    if (envVarName == "") {
        return ""
    }
    match (getEnv(envVarName)) {
        case Some(v) => return v
        case None =>
            LogUtils.error("Get env variable ${envVarName} error.")
            throw Exception("Get env variable ${envVarName} error.")
    }
}

//====================================================================================

private func getDefaultContextLen(): Int64 {
    if (let Some(cl) <- getEnv("CHAT_MODEL_CONTEXT_LEN")) {
        try {
            Int64.parse(cl)
        } catch (e: Exception) {
            throw Exception("env CHAT_MODEL_CONTEXT_LEN must be a positive integer")
        }
    } else {
        Config.defaultContextLen
    }
}

public class ModelConfig {
    let provider: String // Model provider, like "openai"
    let kind: String    // "chat", "embedding", or "image"
    let name: String    // Model name, like "gpt-4o", "text-embedding-ada-002"
    let apiKey: String
    let baseURL: String
    let contextLength: Int64 // default-32000

    /**
     * If apiKey is not specified, XX_API_KEY will be used.
     * If baseURL is not specified, XX_BASE_URL will be used.
     */
    public init(provider!: String, kind!: String, name!: String, apiKey!: String = "", baseURL!: String = "",
        contextLength!: ?Int64 = None) {
        if (!checkProvider(provider)) {
            LogUtils.error("Only ${getAllProviderNames()} are supported now.")
        }
        this.provider = provider
        this.kind = kind
        this.name = name
        if (apiKey == "") {
            this.apiKey = getDefaultApiKey(provider)
        } else {
            this.apiKey = apiKey
        }
        if (baseURL == "") {
            this.baseURL = getDefaultBaseURL(provider, kind)
        } else {
            this.baseURL = baseURL
        }
        if (let Some(cl) <- contextLength) {
            this.contextLength = cl
        } else {
            this.contextLength = getDefaultContextLen()
        }
    }
}

/**
 * The model contains a provider name and a model name, splitted by a ':'
 */
private func parseModel(model: String, kind!: String): ModelConfig {
    let items = model.split(":", 2)
    if (items.size == 1) {
        if (items[0] == "llamacpp") {
            return ModelConfig(provider: "llamacpp", kind: kind, name: "unknown")
        }
    } else if (items.size == 2) {
        let provider = items[0].trimAscii()
        let modelName = items[1].trimAscii()
        if (!checkProvider(provider)) {
            throw ModelException("${model} is invalid. Only ${getAllProviderNames()} are supported now.")
        }
        return ModelConfig(provider: provider, kind: kind, name: modelName)
    }
    throw ModelException("${model} is invalid. Only ${getAllProviderNames()} are supported now.")
}

public struct ModelManager {
    private static let CHAT_MODEL_BUILD_FN_MAP = HashMap<String, () -> ChatModel>()

    public static func registerChatModel(modelName: String,
                                         buildFn: () -> ChatModel): Unit {
        CHAT_MODEL_BUILD_FN_MAP.add(modelName, buildFn)
    }

    public static func createChatModel(modelName: String): ChatModel {
        if (let Some(fn) <- CHAT_MODEL_BUILD_FN_MAP.get(modelName)) {
            return fn()
        }
        let modelConfig = parseModel(modelName, kind: "chat")
        return ModelManager.createChatModel(modelConfig)
    }

    public static func createChatModel(modelConfig: ModelConfig): ChatModel {
        match (modelConfig.provider) {
            case "openai" | "dashscope" | "ark" | "deepseek" |
                 "siliconflow" | "zhipuai" | "maas" | "google" | "moonshot" | "openrouter" | "stepfun" =>
                return OpenAIChatModel(modelConfig.provider, modelConfig.name, apiKey: modelConfig.apiKey, baseURL: modelConfig.baseURL)
            case "ollama" =>
                return OllamaChatModel(modelConfig.name, baseURL: modelConfig.baseURL)
            case _ =>
                throw UnsupportedException("Unreachable")
        }
    }

    private static let EMBEDDING_MODEL_BUILD_FN_MAP = HashMap<String, () -> EmbeddingModel>()

    public static func registerEmbeddingModel(modelName: String,
                                              buildFn: () -> EmbeddingModel): Unit {
        EMBEDDING_MODEL_BUILD_FN_MAP.add(modelName, buildFn)
    }

    public static func createEmbeddingModel(modelName: String): EmbeddingModel {
        if (let Some(fn) <- EMBEDDING_MODEL_BUILD_FN_MAP.get(modelName)) {
            return fn()
        }
        let modelConfig = parseModel(modelName, kind: "embedding")
        return ModelManager.createEmbeddingModel(modelConfig)
    }

    public static func createEmbeddingModel(modelConfig: ModelConfig): EmbeddingModel {
        match (modelConfig.provider) {
            case "openai" | "ark" | "siliconflow" | "stepfun" =>
                return OpenAIEmbeddingModel(modelConfig.name, apiKey: modelConfig.apiKey, baseURL: modelConfig.baseURL)
            case "dashscope" =>
                return DashscopeEmbeddingModel(modelConfig.name, apiKey: modelConfig.apiKey, baseURL: modelConfig.baseURL)
            case "ollama" =>
                return OllamaEmbeddingModel(modelConfig.name, baseURL: modelConfig.baseURL)
            case "llamacpp" =>
                return LlamacppEmbeddingModel(baseURL: modelConfig.baseURL)
            case _ =>
                throw UnsupportedException("Unreachable")
        }
    }

    private static let IMAGE_MODEL_BUILD_FN_MAP = HashMap<String, () -> ImageModel>()

    public static func registerImageModel(modelName: String,
                                          buildFn: () -> ImageModel): Unit {
        IMAGE_MODEL_BUILD_FN_MAP.add(modelName, buildFn)
    }

    public static func createImageModel(modelName: String): ImageModel {
        if (let Some(fn) <- IMAGE_MODEL_BUILD_FN_MAP.get(modelName)) {
            return fn()
        }
        let modelConfig = parseModel(modelName, kind: "image")
        return ModelManager.createImageModel(modelConfig)
    }

    public static func createImageModel(modelConfig: ModelConfig): ImageModel {
        match (modelConfig.provider) {
            case "openai" | "stepfun" =>
                return OpenAIImageModel(modelConfig.name, apiKey: modelConfig.apiKey, baseURL: modelConfig.baseURL)
            case "siliconflow" =>
                return SiliconflowImageModel(modelConfig.name, apiKey: modelConfig.apiKey, baseURL: modelConfig.baseURL)
            case "zhipuai" =>
                return ZhipuAIImageModel(modelConfig.name, apiKey: modelConfig.apiKey, baseURL: modelConfig.baseURL)
            case _ =>
                throw UnsupportedException("Unreachable")
        }
    }
}
