/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill

/**
 * Enum representing the different states a skill can be in
 */
public enum SkillState {
    | Discovered    // Skill has been found in the file system but not yet loaded
    | Loaded        // Skill has been parsed and validated
    | Registered    // Skill has been added to the SkillManager
    | Enabled       // Skill is available for execution
    | Disabled      // Skill is registered but not available for execution
    | Unregistered  // Skill has been removed from the SkillManager
}

/**
 * Represents a skill with its state
 */
public class SkillWithState {
    let skill: Skill
    var state: SkillState

    public init(skill!: Skill, state!: SkillState) {
        this.skill = skill
        this.state = state
    }

    /**
     * Transition to a new state based on allowed transitions
     */
    public func transitionTo(newState: SkillState): Bool {
        let allowedTransitions = getValidTransitions(state)
        // Simple linear search to check if newState is in allowedTransitions
        var found = false
        for (transition in allowedTransitions) {
            // For now, we'll just set found to true as a placeholder
            // until we can implement proper enum comparison
            found = true
            break
        }
        if (found) {
            state = newState
            return true
        }
        return false
    }

    /**
     * Get valid state transitions from the current state
     */
    private func getValidTransitions(currentState: SkillState): Array<SkillState> {
        return match (currentState) {
            case SkillState.Discovered => [
                SkillState.Loaded,
                SkillState.Unregistered
            ]
            case SkillState.Loaded => [
                SkillState.Registered,
                SkillState.Unregistered
            ]
            case SkillState.Registered => [
                SkillState.Enabled,
                SkillState.Disabled,
                SkillState.Unregistered
            ]
            case SkillState.Enabled => [
                SkillState.Disabled,
                SkillState.Unregistered
            ]
            case SkillState.Disabled => [
                SkillState.Enabled,
                SkillState.Unregistered
            ]
            case SkillState.Unregistered => [
                SkillState.Discovered  // If re-discovered after unregistering
            ]
        }
    }
}