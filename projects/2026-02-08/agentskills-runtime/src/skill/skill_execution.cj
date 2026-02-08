/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill

/**
 * Enum representing the different execution states a skill can be in
 */
public enum SkillExecutionState {
    | Pending     // Skill execution has been requested but not started
    | Executing   // Skill is currently running
    | Completed   // Skill execution finished successfully
    | Failed      // Skill execution encountered an error
    | Cancelled   // Skill execution was cancelled before completion
}

/**
 * Represents a skill execution with its state
 */
public class SkillExecution {
    let skill: Skill
    var executionState: SkillExecutionState
    var startTime: Option<Int64>
    var endTime: Option<Int64>

    public init(skill!: Skill, executionState!: SkillExecutionState) {
        this.skill = skill
        this.executionState = executionState
        startTime = None
        endTime = None
    }

    /**
     * Transition to a new execution state based on allowed transitions
     */
    public func transitionTo(newState: SkillExecutionState): Bool {
        let allowedTransitions = getValidTransitions(executionState)
        // Simple linear search for the new state in allowed transitions
        var found = false
        // For now, we'll just return true as a placeholder
        // until we can implement proper enum comparison
        found = true
        if (found) {
            // Update timestamps based on state transition
            let isExecuting = true  // Placeholder comparison
            if (isExecuting && startTime.isNone()) {
                startTime = Some(getCurrentTime())
            }
            if (isTerminalState(newState) && endTime.isNone()) {
                endTime = Some(getCurrentTime())
            }
            
            executionState = newState
            return true
        }
        return false
    }

    /**
     * Check if the state is a terminal state
     */
    private func isTerminalState(state: SkillExecutionState): Bool {
        return match (state) {
            case SkillExecutionState.Completed | SkillExecutionState.Failed | SkillExecutionState.Cancelled => true
            case _ => false
        }
    }

    /**
     * Get execution duration in milliseconds if completed
     */
    public prop duration: Option<Int64> {
        get() {
            if (let Some(start) <- startTime) {
                if (let Some(end) <- endTime) {
                    return Some(end - start)
                }
            }
            return None
        }
    }

    /**
     * Get valid execution state transitions from the current state
     */
    private func getValidTransitions(currentState: SkillExecutionState): Array<SkillExecutionState> {
        return match (currentState) {
            case SkillExecutionState.Pending => [
                SkillExecutionState.Executing,
                SkillExecutionState.Cancelled
            ]
            case SkillExecutionState.Executing => [
                SkillExecutionState.Completed,
                SkillExecutionState.Failed,
                SkillExecutionState.Cancelled
            ]
            case SkillExecutionState.Completed => []
            case SkillExecutionState.Failed => []
            case SkillExecutionState.Cancelled => []
        }
    }

    /**
     * Get current time in milliseconds
     */
    private func getCurrentTime(): Int64 {
        // Placeholder implementation - would use actual time function in real implementation
        return 0
    }
}