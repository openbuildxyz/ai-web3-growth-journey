/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.integration

import std.collection.{HashMap, ArrayList}
import stdx.encoding.json.{JsonValue, JsonObject, JsonArray, JsonString, JsonInt}
import magic.core.skill.SkillManager
import magic.skill.CompositeSkillToolManager
import magic.skill.application.SkillManagementService
import magic.log.LogUtils
import magic.skill.search.SearchResult

/**
 * Integration with UCToo Admin management platform
 * Provides seamless integration with the UCToo Admin platform (Vue 3 + Ant Design Vue)
 * following the UMI full-stack model isomorphism specification
 */
public class UctooAdminIntegration {
    private let _skillManager: SkillManager
    private let _skillManagementService: SkillManagementService

    public init() {
        _skillManager = CompositeSkillToolManager()
        _skillManagementService = SkillManagementService()
    }

    /**
     * Get skills data formatted for UCToo Admin frontend
     */
    public func getSkillsForAdminPanel(): JsonValue {
        let skills = _skillManager.availableSkills.values().toArray()
        let skillsArray = JsonArray()
        
        for (skill in skills) {
            let skillObj = JsonObject()
            skillObj.put("id", JsonString(skill.name))
            skillObj.put("name", JsonString(skill.name))
            skillObj.put("description", JsonString(skill.description))
            skillObj.put("version", JsonString("1.0.0"))  // In a real implementation, this would come from skill metadata
            let author = if (skill.metadata.contains("author")) {
                skill.metadata["author"]
            } else {
                "Unknown"
            }
            skillObj.put("author", JsonString(author))

            let license = if (skill.license.isSome()) {
                skill.license.getOrThrow()
            } else {
                "MIT"
            }
            skillObj.put("license", JsonString(license))
            skillObj.put("enabled", JsonString(if (_skillManager.isSkillEnabled(skill.name)) { "true" } else { "false" }))
            skillObj.put("createdAt", JsonString("2026-01-25T10:00:00Z"))  // Placeholder
            skillObj.put("updatedAt", JsonString("2026-01-25T10:00:00Z"))  // Placeholder
            
            skillsArray.add(skillObj)
        }
        
        let response = JsonObject()
        response.put("current_page", JsonInt(0))
        response.put("total_count", JsonInt(skills.size))
        response.put("total_page", JsonInt(1))
        response.put("skills", skillsArray)
        
        return response
    }

    /**
     * Format skill data for Ant Design Vue tables
     */
    public func formatSkillsForTable(): JsonValue {
        let skills = _skillManager.availableSkills.values().toArray()
        let tableData = JsonArray()
        
        for (skill in skills) {
            let rowData = JsonObject()
            rowData.put("key", JsonString(skill.name))
            rowData.put("name", JsonString(skill.name))
            rowData.put("description", JsonString(skill.description))
            rowData.put("version", JsonString("1.0.0"))  // Placeholder
            let author = if (skill.metadata.contains("author")) {
                skill.metadata["author"]
            } else {
                "Unknown"
            }
            rowData.put("author", JsonString(author))

            let license = if (skill.license.isSome()) {
                skill.license.getOrThrow()
            } else {
                "MIT"
            }
            rowData.put("license", JsonString(license))
            rowData.put("status", JsonString(if (_skillManager.isSkillEnabled(skill.name)) { "Active" } else { "Inactive" }))
            rowData.put("actions", JsonString(""))  // Placeholder for action buttons
            
            tableData.add(rowData)
        }
        
        return tableData
    }

    /**
     * Execute a skill via the admin panel interface
     */
    public func executeSkillViaAdmin(skillName: String, parameters: HashMap<String, JsonValue>): JsonValue {
        LogUtils.info("Admin panel executing skill: ${skillName} with parameters: ${parameters}")
        
        // In a real implementation, this would execute the skill
        // For now, we'll return a mock result
        let result = JsonObject()
        result.put("success", JsonString("true"))
        result.put("output", JsonString("Mock execution result for skill: ${skillName}"))
        result.put("executionTime", JsonString("123ms"))
        
        return result
    }

    /**
     * Install a skill via the admin panel
     */
    public func installSkillViaAdmin(source: String, validate: Bool): JsonValue {
        LogUtils.info("Admin panel installing skill from: ${source}")
        
        // In a real implementation, this would install the skill
        // For now, we'll return a mock result
        let result = JsonObject()
        result.put("desc", JsonString("Mock installation successful"))
        result.put("skillName", JsonString("mock-skill"))
        result.put("status", JsonString("installed"))
        
        return result
    }

    /**
     * Uninstall a skill via the admin panel
     */
    public func uninstallSkillViaAdmin(skillName: String): JsonValue {
        LogUtils.info("Admin panel uninstalling skill: ${skillName}")
        
        // In a real implementation, this would uninstall the skill
        // For now, we'll return a mock result
        let result = JsonObject()
        result.put("desc", JsonString("Mock uninstallation successful"))
        
        return result
    }

    /**
     * Enable/disable a skill via the admin panel
     */
    public func toggleSkillStatus(skillName: String, enable: Bool): JsonValue {
        LogUtils.info("Admin panel ${if (enable) { "enabling" } else { "disabling" }} skill: ${skillName}")
        
        if (enable) {
            _skillManager.enableSkill(skillName)
        } else {
            _skillManager.disableSkill(skillName)
        }
        
        let result = JsonObject()
        result.put("skillName", JsonString(skillName))
        result.put("status", JsonString(if (enable) { "enabled" } else { "disabled" }))
        
        return result
    }
}

/**
 * API adapter for UMI full-stack model isomorphism
 * Follows the UMI (Universal Model Isomorphism) design principle, ensuring consistent data models across all application layers
 */
public class UmiApiAdapter {
    private let _integration: UctooAdminIntegration

    public init() {
        _integration = UctooAdminIntegration()
    }

    /**
     * Get skills list following UMI isomorphism pattern
     */
    public func getSkillsList(currentPage: Int32, pageSize: Int32, queryParam: String): JsonValue {
        // This follows the same pattern as the existing uctoo_entity usage in the codebase
        // It returns data in the format expected by the UCToo Admin frontend
        let allSkills = _integration.getSkillsForAdminPanel().asObject()
        
        // Apply pagination
        let skillsArray = allSkills["skills"].asArray()
        let total = Int32(skillsArray.size())

        let startIndex = (currentPage - 1) * pageSize
        let endIndex = min(startIndex + pageSize, total)

        let paginatedSkills = if (Int64(startIndex) < Int64(total)) {
            let items = skillsArray.getItems()
            let subList = ArrayList<JsonValue>()
            for (i in Int64(startIndex)..Int64(endIndex)) {
                subList.add(items[i])
            }
            subList
        } else {
            ArrayList<JsonValue>()
        }
        
        let result = JsonObject()
        result.put("current_page", JsonInt(Int64(currentPage)))
        result.put("total_count", JsonInt(Int64(total)))
        result.put("total_page", JsonInt(Int64((total + pageSize - 1) / pageSize)))
        
        let data = JsonArray()
        for (skill in paginatedSkills) {
            data.add(skill)
        }
        result.put("skills", data)
        
        return result
    }
    
    /**
     * Helper function for min operation
     */
    private func min(a: Int32, b: Int32): Int32 {
        return if (a < b) { a } else { b }
    }
}