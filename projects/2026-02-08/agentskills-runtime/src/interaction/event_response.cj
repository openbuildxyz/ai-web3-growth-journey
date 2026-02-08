/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.interaction

/**
 * Event responses for agent interaction
 */
public enum EventResponse<T> {
    | Continue                // Agent continues to work
    | Continue(T)             // Continues with a specific result
    | Terminate(T)            // Abort execution with a result
    // | Delegate(Agent)      // Redirect to an alternative agent
}
