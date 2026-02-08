/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.core.agent

/**
 * This exception is used to indicate that the agent execution is cancelled by user.
 */
public class AgentCancelException <: Exception {
    protected let reason: String

    public init(reason!: String = "Cancelled by user") {
        super("Cancelled by user")
        this.reason = reason
    }
}
