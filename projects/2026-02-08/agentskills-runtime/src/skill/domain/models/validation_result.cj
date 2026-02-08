/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.models

import std.collection.ArrayList
import std.time.*

/**
 * ValidationResult represents the result of validating a skill or SKILL.md file. Part of the domain layer.
 */
public class ValidationResult {
    public let isValid: Bool  // Whether the validation passed
    public let errors: Array<String>  // List of validation errors if any
    public let warnings: Array<String>  // List of warnings if any
    public let validationDate: Int64  // Timestamp of validation

    public init(
        isValid!: Bool,
        errors!: Array<String>,
        warnings!: Array<String>,
        validationDate!: Int64
    ) {
        this.isValid = isValid
        this.errors = errors
        this.warnings = warnings
        this.validationDate = validationDate
    }

    /**
     * Factory method to create a successful validation result
     */
    public static func success(): ValidationResult {
        return ValidationResult(
            isValid: true,
            errors: [],
            warnings: [],
            validationDate: (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        )
    }

    /**
     * Factory method to create a failed validation result with errors
     */
    public static func failure(errors: Array<String>, warnings: Array<String>): ValidationResult {
        return ValidationResult(
            isValid: false,
            errors: errors,
            warnings: warnings,
            validationDate: (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        )
    }
}