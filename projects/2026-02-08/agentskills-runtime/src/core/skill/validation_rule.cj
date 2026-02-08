/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.core.skill

/**
 * A single rule used to validate skills
 */
public class ValidationRule {
    /**
     * Name of the validation rule
     */
    let ruleName: String

    /**
     * Description of what the rule checks
     */
    let description: String

    /**
     * Message to display if validation fails
     */
    let errorMessage: String

    public init(
        ruleName: String,
        description: String,
        errorMessage: String
    ) {
        this.ruleName = ruleName
        this.description = description
        this.errorMessage = errorMessage
    }
}