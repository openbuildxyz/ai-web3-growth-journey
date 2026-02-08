/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.model

/**
 * A model consist of
 * - a provider name, e.g., openai
 * - a model name, e.g., gpt-4o
 * There are different models, e.g., chat model, image model, audio model, etc.
 */
public interface Model {
    /**
     * Provider of the model
     */
    prop provider: String

    /**
     * Name of the model
     */
    prop name: String

    prop fullName: String {
        get() { "${provider}:${name}" }
    }
}
