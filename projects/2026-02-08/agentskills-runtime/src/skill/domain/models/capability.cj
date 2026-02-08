/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.skill.domain.models

import std.collection.ArrayList

/**
 * Capability definition for uctoo-inspired security model
 * Defines what system resources a skill is allowed to access
 */
public class Capability {
    private let _type: String
    private let _resources: ArrayList<String>
    private let _permissions: ArrayList<String>

    public init(`type`!: String, resources!: ArrayList<String>, permissions!: ArrayList<String>) {
        _type = `type`
        _resources = resources
        _permissions = permissions
    }

    public prop `type`: String {
        get() { _type }
    }

    public prop resources: ArrayList<String> {
        get() { _resources }
    }

    public prop permissions: ArrayList<String> {
        get() { _permissions }
    }
}

/**
 * Security policy for uctoo-inspired security model
 * Defines access controls and execution constraints
 */
public class SecurityPolicy {
    private let _allowNetworkAccess: Bool
    private let _allowFileSystemAccess: Bool
    private let _allowCommandExecution: Bool
    private let _executionTimeoutMs: Int64
    
    public init(
        allowNetworkAccess!: Bool,
        allowFileSystemAccess!: Bool,
        allowCommandExecution!: Bool,
        executionTimeoutMs!: Int64
    ) {
        _allowNetworkAccess = allowNetworkAccess
        _allowFileSystemAccess = allowFileSystemAccess
        _allowCommandExecution = allowCommandExecution
        _executionTimeoutMs = executionTimeoutMs
    }
    
    public prop allowNetworkAccess: Bool {
        get() { _allowNetworkAccess }
    }
    
    public prop allowFileSystemAccess: Bool {
        get() { _allowFileSystemAccess }
    }
    
    public prop allowCommandExecution: Bool {
        get() { _allowCommandExecution }
    }
    
    public prop executionTimeoutMs: Int64 {
        get() { _executionTimeoutMs }
    }
    
    public static func default(): SecurityPolicy {
        return SecurityPolicy(
            allowNetworkAccess: false,
            allowFileSystemAccess: false,
            allowCommandExecution: false,
            executionTimeoutMs: 30000  // 30 seconds default
        )
    }
}

/**
 * Resource limits for uctoo-inspired resource management
 * Defines constraints on resource consumption
 */
public class ResourceLimits {
    private let _maxMemory: Int64
    private let _maxCpuTime: Int64
    private let _maxNetworkBytes: Int64
    private let _maxFileOperations: Int32
    
    public init(
        maxMemory!: Int64,
        maxCpuTime!: Int64,
        maxNetworkBytes!: Int64,
        maxFileOperations!: Int32
    ) {
        _maxMemory = maxMemory
        _maxCpuTime = maxCpuTime
        _maxNetworkBytes = maxNetworkBytes
        _maxFileOperations = maxFileOperations
    }
    
    public prop maxMemory: Int64 {
        get() { _maxMemory }
    }
    
    public prop maxCpuTime: Int64 {
        get() { _maxCpuTime }
    }
    
    public prop maxNetworkBytes: Int64 {
        get() { _maxNetworkBytes }
    }
    
    public prop maxFileOperations: Int32 {
        get() { _maxFileOperations }
    }
    
    public static func default(): ResourceLimits {
        return ResourceLimits(
            maxMemory: 100 * 1024 * 1024,  // 100 MB
            maxCpuTime: 30000,  // 30 seconds in milliseconds
            maxNetworkBytes: 10 * 1024 * 1024,  // 10 MB
            maxFileOperations: 100
        )
    }
}