# Cross-Platform Compatibility Guide

## Platform Abstraction Layer

The CangjieMagic Agent Skill Runtime is designed to run on different operating systems and architectures while maintaining consistent functionality. This guide explains how to ensure cross-platform compatibility.

## Supported Platforms

- **Operating Systems**: Windows, Linux, macOS, HarmonyOS/OpenHarmony
- **CPU Architectures**: x86, ARM, RISC-V
- **Minimum Requirements**: 
  - 2GB RAM
  - 100MB free disk space
  - Network connectivity (for skill installation and updates)

## Platform-Specific Implementations

### File System Abstraction

```cangjie
/*
 * Platform-agnostic file system operations
 */
package magic.platform.filesystem

import std.fs.{File, Directory, Path, exists}
import std.collection.ArrayList

public class FileSystemAbstraction {
    /**
     * Get the appropriate path separator for the current platform
     */
    public static func getPathSeparator(): String {
        match (getPlatform()) {
            case Platform.Windows => "\\"
            case _ => "/"
        }
    }
    
    /**
     * Get the appropriate temporary directory for the current platform
     */
    public static func getTempDirectory(): String {
        match (getPlatform()) {
            case Platform.Windows => getEnv("TEMP").getOrElse("C:\\temp")
            case Platform.MacOS => "/tmp"
            case Platform.Linux => "/tmp"
            case Platform.HarmonyOS => "/data/local/tmp"
        }
    }
    
    /**
     * Normalize a path for the current platform
     */
    public static func normalizePath(path: String): String {
        let separator = getPathSeparator()
        return path.replace("/", separator).replace("\\", separator)
    }
    
    /**
     * Check if the current platform is case-sensitive for file names
     */
    public static func isCaseSensitive(): Bool {
        match (getPlatform()) {
            case Platform.Windows => false
            case Platform.MacOS => false  // HFS+ is case-insensitive by default
            case _ => true  // Linux, Unix-like systems are typically case-sensitive
        }
    }
}

public enum Platform {
    case Windows
    case Linux
    case MacOS
    case HarmonyOS
    case Unknown
}

public static func getPlatform(): Platform {
    let osName = getEnv("OS").getOrElse(getEnv("OSTYPE").getOrElse(""))
    
    if (osName.toLowerCase().contains("windows")) {
        return Platform.Windows
    } else if (osName.toLowerCase().contains("darwin") || osName.toLowerCase().contains("mac")) {
        return Platform.MacOS
    } else if (osName.toLowerCase().contains("linux")) {
        return Platform.Linux
    } else if (osName.toLowerCase().contains("harmony")) {
        return Platform.HarmonyOS
    } else {
        return Platform.Unknown
    }
}

private func getEnv(key: String): Option<String> {
    // In a real implementation, this would retrieve environment variables
    // For now, we'll return a mock implementation
    return std.env.getEnvironmentVariable(key)
}
```

### Network Abstraction

```cangjie
/*
 * Platform-agnostic network operations
 */
package magic.platform.network

import std.net.{HTTPClient, HTTPRequest, HTTPResponse}
import std.collection.HashMap

public class NetworkAbstraction {
    private let _httpClient: HTTPClient
    
    public init() {
        _httpClient = HTTPClient()
    }
    
    /**
     * Perform an HTTP request with platform-appropriate settings
     */
    public func request(request: HTTPRequest): HTTPResponse {
        // Apply platform-specific network settings
        _applyPlatformSettings(request)
        
        // Execute the request
        return _httpClient.execute(request)
    }
    
    /**
     * Apply platform-specific network settings to the request
     */
    private func _applyPlatformSettings(request: HTTPRequest): Unit {
        let platform = getPlatform()
        
        // Set appropriate timeouts based on platform
        let timeout = match platform {
            case Platform.HarmonyOS => 30000  // 30 seconds for mobile/embedded
            case _ => 15000  // 15 seconds for other platforms
        }
        
        request.timeout = timeout
        
        // Add platform-specific headers if needed
        request.headers.add("X-Platform", platform.toString())
    }
    
    /**
     * Check network connectivity
     */
    public func checkConnectivity(): Bool {
        // In a real implementation, this would check actual network connectivity
        // For now, we'll return true
        return true
    }
}
```

### Process and Command Execution Abstraction

```cangjie
/*
 * Platform-agnostic process and command execution
 */
package magic.platform.process

import std.process.{Process, ProcessResult}
import std.collection.ArrayList

public class ProcessAbstraction {
    /**
     * Execute a command with platform-appropriate shell
     */
    public func executeCommand(command: String, args: Array<String>): ProcessResult {
        let platform = getPlatform()
        let fullCommand = _buildCommand(platform, command, args)
        
        return Process.exec(fullCommand)
    }
    
    /**
     * Build the appropriate command for the platform
     */
    private func _buildCommand(platform: Platform, command: String, args: Array<String>): Array<String> {
        match platform {
            case Platform.Windows => {
                // On Windows, use cmd.exe /c
                let cmdArgs = ArrayList<String>()
                cmdArgs.add("cmd.exe")
                cmdArgs.add("/c")
                cmdArgs.add(command)
                for (arg in args) {
                    cmdArgs.add(arg)
                }
                return cmdArgs.toArray()
            }
            case _ => {
                // On Unix-like systems, use sh -c
                let cmdArgs = ArrayList<String>()
                cmdArgs.add("sh")
                cmdArgs.add("-c")
                cmdArgs.add(command)
                for (arg in args) {
                    cmdArgs.add(arg)
                }
                return cmdArgs.toArray()
            }
        }
    }
    
    /**
     * Get the appropriate shell for the platform
     */
    public func getShell(): String {
        match (getPlatform()) {
            case Platform.Windows => "cmd.exe"
            case Platform.MacOS, Platform.Linux => "/bin/sh"
            case Platform.HarmonyOS => "/system/bin/sh"
            case _ => "/bin/sh"  // Default to Unix shell
        }
    }
}
```

## Build Configuration for Multiple Platforms

### cjpm.toml for Multi-Platform Builds

```toml
[package]
name = "cangjiemagic-skill-runtime"
version = "1.0.0"
description = "Agent Skill Runtime for CangjieMagic framework"
authors = ["CangjieMagic Team"]

[dependencies]
cangjie-core = "1.0.0"
cangjie-stdlib = "1.0.0"
cangjie-encoding = "1.0.0"

# Platform-specific dependencies
[target.'cfg(target_os = "windows")'.dependencies]
windows-specific-lib = "1.0.0"

[target.'cfg(target_os = "linux")'.dependencies]
linux-specific-lib = "1.0.0"

[target.'cfg(target_os = "macos")'.dependencies]
macos-specific-lib = "1.0.0"

[build]
# Default target
default-target = "x86_64-unknown-linux-gnu"

# All supported targets
targets = [
    "x86_64-pc-windows-msvc",
    "x86_64-unknown-linux-gnu", 
    "aarch64-unknown-linux-gnu",
    "x86_64-apple-darwin",
    "aarch64-apple-darwin"
]

# Features for different platforms
[features]
default = ["std"]
wasm = ["wasm-component-model"]
component-model = []

[profile.release]
strip = true  # Automatically strip symbols from release builds
lto = true    # Enable link-time optimization
codegen-units = 1
panic = "abort"