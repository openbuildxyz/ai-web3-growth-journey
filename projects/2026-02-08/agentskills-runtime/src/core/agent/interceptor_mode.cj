/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

public enum InterceptorMode {
    /**
     * Always intercept the request
     */
    | Always

    /**
     * Intercept the request periodically
     */
    | Periodic(Int64)

    /**
     * Intercept the request when the condition is true
     */
    | Conditional((AgentRequest) -> Bool)
}
