/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.api

import magic.core.skill.{Skill, SkillExecutionResult, ExecutionStatus}
import std.collection.HashMap
import stdx.encoding.json.JsonValue
import std.time.*

/**
 * Request object for skill execution
 */
public class SkillExecutionRequest {
    let arguments: HashMap<String, JsonValue>

    public init(arguments: HashMap<String, JsonValue>) {
        this.arguments = arguments
    }
}

/**
 * Service for handling skill execution API endpoint
 */
public class SkillExecutionService {
    /**
     * Execute a specific skill with provided arguments
     */
    public func executeSkill(skill: Skill, request: SkillExecutionRequest): SkillExecutionResult {
        let startTime = getCurrentTime()

        try {
            let output = skill.execute(request.arguments)
            let endTime = getCurrentTime()

            return SkillExecutionResult(
                skill.name,
                ExecutionStatus.Success,
                output,
                None,
                endTime - startTime
            )
        } catch (ex: Exception) {
            let endTime = getCurrentTime()

            return SkillExecutionResult(
                skill.name,
                ExecutionStatus.Failure,
                "",
                Some(ex.toString()),
                endTime - startTime
            )
        }
    }

    /**
     * Get current time in milliseconds
     */
    private func getCurrentTime(): Int64 {
        return (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
    }
}