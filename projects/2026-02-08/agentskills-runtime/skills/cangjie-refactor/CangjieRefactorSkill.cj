/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 * 
 * Cangjie Code Refactoring Skill
 * 
 * This skill automatically refactors Cangjie code according to the 
 * CANGJIE_CODING_GUIDELINES.md specification.
 */

package magic.skills.cangjie.refactor

import std.collection.{ArrayList, HashMap}
import std.fs.{Path, Directory}
import std.io.{FileInputStream, FileOutputStream}
import std.text.StringBuilder
import std.util.Regex
import magic.core.skill.{Skill, SkillResult}
import magic.skill.defineSkill
import magic.skill.types.{SkillParam, ParamType}

/**
 * Cangjie代码重构技能 - 根据CANGJIE_CODING_GUIDELINES.md规范自动重构仓颉代码
 */
public func main(): Unit {
    // 定义技能
    defineSkill({
        metadata: {
            name: "cangjie-refactor",
            version: "1.0.0",
            description: "根据CANGJIE_CODING_GUIDELINES.md规范自动重构仓颉代码",
            author: "UCToo Team"
        },
        tools: [
            {
                name: "refactor",
                description: "根据CANGJIE_CODING_GUIDELINES.md规范自动重构仓颉代码",
                parameters: [
                    {
                        name: "path",
                        paramType: ParamType.STRING,
                        description: "要重构的代码文件或目录路径",
                        required: true
                    },
                    {
                        name: "fix",
                        paramType: ParamType.BOOLEAN,
                        description: "是否自动修复发现的问题",
                        required: false,
                        defaultValue: Some("true")
                    },
                    {
                        name: "report",
                        paramType: ParamType.BOOLEAN,
                        description: "是否生成重构报告",
                        required: false,
                        defaultValue: Some("true")
                    }
                ],
                handler: refactorHandler
            }
        ]
    })
}

/**
 * 重构处理器
 */
private func refactorHandler(args: HashMap<String, String>): SkillResult {
    let path = args.get("path").getOrElse("")
    if (path.isEmpty()) {
        return SkillResult.error("Parameter 'path' is required")
    }
    
    let shouldFix = _parseBoolean(args.get("fix").getOrElse("true"))
    let shouldReport = _parseBoolean(args.get("report").getOrElse("true"))
    
    let results = ArrayList<String>()
    
    let pathObj = Path(path)
    if (pathObj.exists()) {
        if (pathObj.isDir()) {
            // 处理目录
            Directory.walk(pathObj.toString()) { fileInfo =>
                if (_isCangjieFile(fileInfo.path())) {
                    let filePath = fileInfo.path().toString()
                    let result = _refactorFile(filePath, shouldFix)
                    results.add(result)
                }
                return true  // Continue walking
            }
        } else if (_isCangjieFile(pathObj)) {
            // 处理单个文件
            let result = _refactorFile(path, shouldFix)
            results.add(result)
        } else {
            return SkillResult.error("Path is not a .cj file or directory: ${path}")
        }
    } else {
        return SkillResult.error("Path does not exist: ${path}")
    }
    
    let summary = StringBuilder()
    summary.append("Refactoring completed for ${results.size()} files.\n")
    for (result in results) {
        summary.append("- ${result}\n")
    }
    
    return SkillResult.success(summary.toString())
}

/**
 * 重构单个文件
 */
private func _refactorFile(filePath: String, shouldFix: Bool): String {
    try {
        // 读取文件内容
        let content = _readFileContent(filePath)
        let originalContent = content
        var refactoredContent = content
        
        // 应用重构规则
        refactoredContent = _applyTrimRule(refactoredContent)
        refactoredContent = _applyStringLiteralRule(refactoredContent)
        
        // 如果需要修复，则写回文件
        if (shouldFix && originalContent != refactoredContent) {
            _writeFileContent(filePath, refactoredContent)
            return "Fixed issues in ${filePath}"
        } else if (originalContent != refactoredContent) {
            return "Detected issues in ${filePath} (not fixed due to fix=false)"
        } else {
            return "No issues found in ${filePath}"
        }
    } catch (ex: Exception) {
        return "Error processing ${filePath}: ${ex.message}"
    }
}

/**
 * 读取文件内容
 */
private func _readFileContent(filePath: String): String {
    let fileStream = FileInputStream(filePath)
    let content = fileStream.readAll()
    fileStream.close()
    return content.toString()
}

/**
 * 写入文件内容
 */
private func _writeFileContent(filePath: String, content: String): Unit {
    let fileStream = FileOutputStream(filePath)
    fileStream.write(content.toBytes())
    fileStream.close()
}

/**
 * 检查是否为仓颉文件
 */
private func _isCangjieFile(path: Path): Bool {
    let fileName = path.fileName().toString()
    return fileName.endsWith(".cj") || fileName.endsWith(".cangjie")
}

/**
 * 解析布尔值
 */
private func _parseBoolean(value: String): Bool {
    let lowerValue = value.toLowerCase()
    return lowerValue == "true" || lowerValue == "1" || lowerValue == "yes" || lowerValue == "on"
}

/**
 * 应用字符串trim规则 - 将trim()替换为trimAscii()
 */
private func _applyTrimRule(content: String): String {
    // 查找 .trim() 调用并替换为 .trimAscii()
    let regex = Regex("\\.trim\\(\\s*\\)")
    return regex.replaceAll(content, ".trimAscii()")
}

/**
 * 应用字符串字面量规则 - 修正多行字符串使用
 */
private func _applyStringLiteralRule(content: String): String {
    var result = content
    
    // 查找错误的三重引号用法（在单行中使用）
    // 将单行中的三重引号字符串替换为普通字符串
    let regex = Regex("""\"\"\"([^"\n]*)\"\"\"""")
    result = regex.replaceAll(result, "\"$1\"")
    
    return result
}