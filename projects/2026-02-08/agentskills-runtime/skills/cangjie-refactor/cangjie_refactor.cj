/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 * 
 * Cangjie Code Refactoring Skill
 * 
 * This skill automatically refactors Cangjie code according to the 
 * CANGJIE_CODING_GUIDELINES.md specification.
 */

/// @skill
/// name: cangjie-refactor
/// description: 根据CANGJIE_CODING_GUIDELINES.md规范自动重构仓颉代码
/// version: 1.0.0
/// author: UCToo Team
/// license: MIT
/// metadata:
///   category: development
///   tags: ["refactoring", "coding-standards", "automation"]
/// 
/// instructions: |
///   # Cangjie代码重构技能
///   
///   此技能用于根据CANGJIE_CODING_GUIDELINES.md规范自动重构仓颉代码。
///   
///   ## 功能
///   - 自动检测代码中的规范问题
///   - 根据指南自动修复常见问题（如字符串处理、类型转换、异常处理等）
///   - 提供重构建议和报告
///   
///   ## 使用方法
///   1. 指定要重构的代码文件或目录路径
///   2. 设置是否自动修复问题
///   3. 运行技能进行重构
///   
///   ## 注意事项
///   - 重构前请备份重要代码
///   - 建议先在测试环境中验证重构效果
/// 
/// parameters:
///   - name: path
///     description: 要重构的代码文件或目录路径
///     required: true
///     type: string
///   - name: fix
///     description: 是否自动修复发现的问题
///     required: false
///     type: boolean
///     default: true
///   - name: report
///     description: 是否生成重构报告
///     required: false
///     type: boolean
///     default: true
skill cangjie_refactor(
    /// 要重构的代码文件或目录路径
    path: String,
    /// 是否自动修复发现的问题
    fix: Option<String> = Some("true"),
    /// 是否生成重构报告
    report: Option<String> = Some("true")
) {
    let shouldFix = _parseBoolean(fix.getOrElse("true"))
    let shouldReport = _parseBoolean(report.getOrElse("true"))
    
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
            return {
                success: false,
                output: "Path is not a .cj file: ${path}",
                errorMessage: Some("Invalid file type")
            }
        }
    } else {
        return {
            success: false,
            output: "Path does not exist: ${path}",
            errorMessage: Some("Path not found")
        }
    }
    
    let summary = StringBuilder()
    summary.append("Refactoring completed for ${results.size()} files.\n")
    for (result in results) {
        summary.append("- ${result}\n")
    }
    
    return {
        success: true,
        output: summary.toString(),
        errorMessage: None
    }
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
        refactoredContent = _applyOptionHandlingRule(refactoredContent)
        
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
    let reader = fileStream.asReader("UTF-8")
    let content = reader.readToEnd()
    reader.close()
    fileStream.close()
    return content
}

/**
 * 写入文件内容
 */
private func _writeFileContent(filePath: String, content: String): Unit {
    let fileStream = FileOutputStream(filePath)
    let writer = fileStream.asWriter("UTF-8")
    writer.write(content)
    writer.flush()
    writer.close()
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
    var result = content
    let pattern = Regex("\\.trim\\(\\s*\\)")
    result = pattern.replaceAll(result, ".trimAscii()")
    return result
}

/**
 * 应用字符串字面量规则 - 修正多行字符串使用
 */
private func _applyStringLiteralRule(content: String): String {
    var result = content
    
    // 查找错误的三重引号用法（在单行中使用）
    // 将单行中的三重引号字符串替换为普通字符串
    let pattern = Regex("""\"\"\"([^"\n]*)\"\"\"""")
    result = pattern.replaceAll(result, "\"$1\"")
    
    return result
}

/**
 * 应用Option类型处理规则
 */
private func _applyOptionHandlingRule(content: String): String {
    var result = content
    
    // 查找 .get() 方法调用并建议使用更安全的替代方法
    // 这里我们不会自动替换，而是标记潜在问题
    // 在实际实现中，我们可以添加注释或报告这些问题
    
    return result
}