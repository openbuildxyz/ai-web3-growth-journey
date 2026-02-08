/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.domain.models

/**
 * SkillParameter defines a parameter that a skill accepts. Part of the domain layer.
 */
public class SkillParameter {
    public let name: String  // Name of the parameter
    public let `type`: String  // Data type of the parameter
    public let description: String  // Description of what the parameter does
    public let required: Bool  // Whether the parameter is required
    public let defaultValue: Option<String>  // Default value if parameter is not provided

    public init(
        name!: String,
        `type`!: String,
        description!: String,
        required!: Bool,
        defaultValue!: Option<String>
    ) {
        this.name = name
        this.`type` = `type`
        this.description = description
        this.required = required
        this.defaultValue = defaultValue
    }
}