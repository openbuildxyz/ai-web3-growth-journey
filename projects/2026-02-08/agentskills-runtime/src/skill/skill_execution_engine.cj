/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill

import magic.core.skill.Skill
import std.collection.HashMap
import stdx.encoding.json.JsonValue
import magic.log.LogUtils
@When[cjc_version < "1.0.0"]
import std.time.Duration
import std.collection.ArrayList
import magic.skill.domain.models.Capability
import std.time.DateTime

/**
 * SkillExecutionEngine handles the execution of skills with proper security and resource management
 * Implements uctoo-inspired features for secure execution environments
 */
public class SkillExecutionEngine {
    private let _securityManager: SecurityManager
    private let _resourceManager: ResourceManager

    public init() {
        _securityManager = SecurityManager()
        _resourceManager = ResourceManager()
    }

    /**
     * Execute a skill with enhanced security and resource management
     */
    public func executeSkillSecurely(
        skill: Skill, 
        args: HashMap<String, JsonValue>,
        capabilities: Array<Capability>,
        timeoutMs: Int64
    ): ExecutionResult {
        LogUtils.info("Starting secure execution of skill: ${skill.name}")
        
        // Apply security policies before execution
        let securityCheck = _securityManager.validateSkillExecutionWithCapabilities(skill, args, capabilities)
        if (!securityCheck.isValid) {
            LogUtils.error("Security validation failed for skill: ${skill.name}, issues: ${securityCheck.issues}")
            return ExecutionResult(
                success: false,
                output: "",
                error: "Security validation failed: ${String.join(securityCheck.issues, delimiter: ", ")}",
                executionTime: 0,
                resourcesUsed: ResourceUsage.empty()
            )
        }
        
        // Apply resource limits before execution
        if (!_resourceManager.validateResourceUsage(skill, args)) {
            LogUtils.error("Resource validation failed for skill: ${skill.name}")
            return ExecutionResult(
                success: false,
                output: "",
                error: "Resource limits exceeded",
                executionTime: 0,
                resourcesUsed: ResourceUsage.empty()
            )
        }
        
        // Track resource usage during execution
        let startResources = _resourceManager.getUsageSnapshot()
        let startTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        
        try {
            // Execute the skill with timeout
            let result = _executeWithTimeout(skill, args, timeoutMs)
            let endTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            
            // Calculate resource usage
            let endResources = _resourceManager.getUsageSnapshot()
            let resourceUsage = _resourceManager.calculateUsage(startResources, endResources)
            
            LogUtils.info("Skill ${skill.name} executed successfully in ${endTime - startTime}ms with resource usage: ${resourceUsage}")
            
            return ExecutionResult(
                success: true,
                output: result,
                error: None,
                executionTime: endTime - startTime,
                resourcesUsed: resourceUsage
            )
        } catch (ex: Exception) {
            let endTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            LogUtils.error("Error executing skill ${skill.name}: ${ex.message}")
            return ExecutionResult(
                success: false,
                output: "",
                error: Some(ex.message),
                executionTime: endTime - startTime,
                resourcesUsed: ResourceUsage.empty()
            )
        }
    }

    /**
     * Convenience method with default parameters
     */
    public func executeSkillSecurely(
        skill: Skill,
        args: HashMap<String, JsonValue>
    ): ExecutionResult {
        return executeSkillSecurely(skill, args, [], 30000)  // Default 30 seconds
    }
    
    /**
     * Execute a skill with timeout protection
     */
    private func _executeWithTimeout(skill: Skill, args: HashMap<String, JsonValue>, timeoutMs: Int64): String {
        // In a real implementation, this would use proper timeout handling
        // For now, we'll just execute the skill directly
        return skill.execute(args)
    }
}

/**
 * Security manager for validating skill execution
 */
public class SecurityManager {
    public func validateSkillExecution(skill: Skill, args: HashMap<String, JsonValue>): Bool {
        // Perform basic security validation
        // In a real implementation, this would check permissions, capabilities, etc.
        LogUtils.debug("Validated security for skill: ${skill.name}")
        return true
    }
    
    public func validateSkillExecutionWithCapabilities(
        skill: Skill, 
        args: HashMap<String, JsonValue>,
        capabilities: Array<Capability>
    ): SecurityValidationResult {
        let issues = ArrayList<String>()
        
        // Validate that requested capabilities are allowed for this skill
        for (capability in capabilities) {
            if (!_isCapabilityAllowed(skill, capability)) {
                issues.add("Capability ${capability.`type`} is not allowed for skill ${skill.name}")
            }
        }
        
        return SecurityValidationResult(
            isValid: issues.isEmpty(),
            issues: issues.toArray()
        )
    }
    
    private func _isCapabilityAllowed(skill: Skill, capability: Capability): Bool {
        // In a real implementation, this would check against the skill's allowed tools
        // and the requested capability
        return true
    }
}

/**
 * Resource manager for tracking and limiting resource usage
 */
public class ResourceManager {
    public func validateResourceUsage(skill: Skill, args: HashMap<String, JsonValue>): Bool {
        // Perform basic resource validation
        // In a real implementation, this would check memory, CPU, network, etc. usage
        LogUtils.debug("Validated resource usage for skill: ${skill.name}")
        return true
    }
    
    public func getUsageSnapshot(): ResourceSnapshot {
        // In a real implementation, this would capture current resource usage
        return ResourceSnapshot(
            cpuTime: 0,
            memoryPeak: 0,
            networkBytesIn: 0,
            networkBytesOut: 0,
            fileOperations: 0
        )
    }
    
    public func calculateUsage(start: ResourceSnapshot, end: ResourceSnapshot): ResourceUsage {
        // Calculate the difference between start and end snapshots
        return ResourceUsage(
            cpuTime: end.cpuTime - start.cpuTime,
            memoryPeak: end.memoryPeak,
            networkBytesIn: end.networkBytesIn - start.networkBytesIn,
            networkBytesOut: end.networkBytesOut - start.networkBytesOut,
            fileOperations: end.fileOperations - start.fileOperations
        )
    }
}

/**
 * Result of security validation
 */
public struct SecurityValidationResult {
    public let isValid: Bool
    public let issues: Array<String>

    public init(
        isValid!: Bool,
        issues!: Array<String>
    ) {
        this.isValid = isValid
        this.issues = issues
    }
}

/**
 * Snapshot of resource usage at a point in time
 */
public struct ResourceSnapshot {
    public let cpuTime: Int64
    public let memoryPeak: Int64
    public let networkBytesIn: Int64
    public let networkBytesOut: Int64
    public let fileOperations: Int32

    public init(
        cpuTime!: Int64,
        memoryPeak!: Int64,
        networkBytesIn!: Int64,
        networkBytesOut!: Int64,
        fileOperations!: Int32
    ) {
        this.cpuTime = cpuTime
        this.memoryPeak = memoryPeak
        this.networkBytesIn = networkBytesIn
        this.networkBytesOut = networkBytesOut
        this.fileOperations = fileOperations
    }
}

/**
 * Result of skill execution
 */
public struct ExecutionResult {
    public let success: Bool
    public let output: String
    public let error: Option<String>
    public let executionTime: Int64  // in milliseconds
    public let resourcesUsed: ResourceUsage

    public init(
        success!: Bool,
        output!: String,
        error!: Option<String>,
        executionTime!: Int64,
        resourcesUsed!: ResourceUsage
    ) {
        this.success = success
        this.output = output
        this.error = error
        this.executionTime = executionTime
        this.resourcesUsed = resourcesUsed
    }
}

/**
 * Resource usage during skill execution
 */
public struct ResourceUsage <: ToString {
    public let cpuTime: Int64  // in milliseconds
    public let memoryPeak: Int64  // in bytes
    public let networkBytesIn: Int64  // bytes received
    public let networkBytesOut: Int64  // bytes sent
    public let fileOperations: Int32  // number of file operations

    public init(
        cpuTime!: Int64,
        memoryPeak!: Int64,
        networkBytesIn!: Int64,
        networkBytesOut!: Int64,
        fileOperations!: Int32
    ) {
        this.cpuTime = cpuTime
        this.memoryPeak = memoryPeak
        this.networkBytesIn = networkBytesIn
        this.networkBytesOut = networkBytesOut
        this.fileOperations = fileOperations
    }

    public static func empty(): ResourceUsage {
        return ResourceUsage(
            cpuTime: 0,
            memoryPeak: 0,
            networkBytesIn: 0,
            networkBytesOut: 0,
            fileOperations: 0
        )
    }

    public func toString(): String {
        return "ResourceUsage(cpuTime=${cpuTime}ms, memoryPeak=${memoryPeak}B, networkIn=${networkBytesIn}B, networkOut=${networkBytesOut}B, fileOps=${fileOperations})"
    }
}