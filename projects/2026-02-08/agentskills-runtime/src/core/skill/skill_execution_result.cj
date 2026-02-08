/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

/**
 * Represents the result of executing a skill
 */
public class SkillExecutionResult {
    /**
     * Name of the skill that was executed
     */
    let skillName: String

    /**
     * Enum indicating success, failure, or partial success
     */
    let status: ExecutionStatus

    /**
     * Output from the skill execution
     */
    let output: String

    /**
     * Error message if execution failed
     */
    let error: Option<String>

    /**
     * Time taken for execution in milliseconds
     */
    let executionTime: Int64

    public init(
        skillName: String,
        status: ExecutionStatus,
        output: String,
        error: Option<String>,
        executionTime: Int64
    ) {
        this.skillName = skillName
        this.status = status
        this.output = output
        this.error = error
        this.executionTime = executionTime
    }

    /**
     * Getter method for skillName
     */
    public func getSkillName(): String {
        return this.skillName
    }

    /**
     * Getter method for status
     */
    public func getStatus(): ExecutionStatus {
        return this.status
    }

    /**
     * Getter method for output
     */
    public func getOutput(): String {
        return this.output
    }

    /**
     * Getter method for error
     */
    public func getError(): Option<String> {
        return this.error
    }

    /**
     * Getter method for executionTime
     */
    public func getExecutionTime(): Int64 {
        return this.executionTime
    }
}

/**
 * Enum for skill execution status
 */
public enum ExecutionStatus <: ToString {
    | Success
    | Failure
    | Partial

    public func toString(): String {
        return match (this) {
            case Success => return "Success"
            case Failure => return "Failure"
            case Partial => return "Partial"
        }
    }
}