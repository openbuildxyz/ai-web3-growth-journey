/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Enhanced MCP Client for testing uctoo_api_mcp_server
 * This version improves login success rate and provides better error handling
 */

package magic.examples.uctoo_api_mcp_client

import magic.dsl.*
import magic.prelude.*
import magic.config.Config

@agent[
    model: "dashscope:qwen3-max-preview",
    tools: [
        // Use stdioMCP to connect to the uctoo_api_mcp_server
        stdioMCP("cjpm run --skip-build --name magic.examples.uctoo_api_mcp_server")
    ]
]
class EnhancedUctooMCPTestAgent {
    @prompt(
        "你是一个专门处理uctoo后端API的智能助手，你可以通过自然语言调用uctoo系统的entity实体相关功能、通用功能如hello接口，以及用户认证功能如登录。当用户要求登录时，请提取用户名和密码参数并调用登录API。能够执行完整的entity实体CRUD操作。API规范如下：\n" +
        "- 获取单个实体: GET /api/uctoo/entity/{id}\n" +
        "- 获取多个实体: GET /api/uctoo/entity/{limit}/{page} 或 /api/uctoo/entity/{limit}/{page}/{skip}\n" +
        "- 新增实体: POST /api/uctoo/entity/add (需要提供实体的所有必要字段)\n" +
        "- 更新实体: POST /api/uctoo/entity/edit (需要提供ID和要更新的字段)\n" +
        "- 删除实体: POST /api/uctoo/entity/del (需要提供ID)\n" +
        "\n" +
        "当用户请求操作entity实体时，你需要：\n" +
        "1. 对于获取操作，提取ID或分页参数\n" +
        "2. 对于新增操作，提取所有实体字段数据并确保包含必要字段\n" +
        "3. 对于更新操作，提取ID和要更新的字段\n" +
        "4. 对于删除操作，提取ID\n" +
        "5. 当需要登录时，提取用户名和密码参数\n" +
        "\n" +
        "示例实体字段可能包括：id, link, privacy_level, stars, description, city, price, name, created_at, updated_at等。\n" +
        "\n" +
        "特别注意：\n" +
        "- 登录成功后，系统会自动保存认证令牌，用于后续需要认证的API调用\n" +
        "- 在执行任何需要认证的entity操作前，请确保已成功登录\n" +
        "- 对于新增实体操作，至少需要提供name或title等标识性字段\n" +
        "- 对于更新实体操作，必须提供ID和至少一个要更新的字段\n" +
        "- 对于删除实体操作，仅需提供ID\n" +
        "- 对于获取多个实体操作，可以使用分页参数控制结果数量和位置\n" +
        "- 所有API调用都应该返回完整的响应数据，包括状态码和响应体。\n" +
        "\n" +
        "登录请求格式示例：\n" +
        "- 请使用账号demo和密码123456登录\n" +
        "- 使用用户名demo和密码123456进行登录\n" +
        "- 登录，用户名为demo，密码为123456\n" +
        "\n" +
        "请严格按照这些格式和要求处理用户请求，以确保参数被正确提取。"
    )
}

main() {
    Config.logLevel = "INFO"
    Config.logFile = "./logs/uctoo-mcp-client-enhanced.log"
    Config.env["DASHSCOPE_API_KEY"] = "sk-025f7e910bce4231ab320fa4d838f426"
    let agent = EnhancedUctooMCPTestAgent()

    // Test the hello endpoint
    let result0 = agent.chat("调用hello接口")
    println("调用hello接口结果: " + result0)

    // Test login with demo account - this should be done first
    // Using multiple formats to increase chance of successful parameter extraction
    let resultLogin = agent.chat("请使用账号demo和密码123456登录")
    println("登录结果: " + resultLogin)

    // If first attempt fails, try alternative format
    var loginSuccess = false
    if (resultLogin.contains("登录成功") || resultLogin.contains("access_token") || resultLogin.contains("token")) {
        loginSuccess = true
        println("登录成功，现在可以执行entity操作...")
    } else {
        // Try alternative format
        let resultLogin2 = agent.chat("使用用户名demo和密码123456进行登录")
        println("第二次登录尝试结果: " + resultLogin2)
        if (resultLogin2.contains("登录成功") || resultLogin2.contains("access_token") || resultLogin2.contains("token")) {
            loginSuccess = true
            println("登录成功，现在可以执行entity操作...")
        } else {
            // Try third format
            let resultLogin3 = agent.chat("登录，用户名为demo，密码为123456")
            println("第三次登录尝试结果: " + resultLogin3)
            if (resultLogin3.contains("登录成功") || resultLogin3.contains("access_token") || resultLogin3.contains("token")) {
                loginSuccess = true
                println("登录成功，现在可以执行entity操作...")
            }
        }
    }

    if (loginSuccess) {
        // Test getting a single entity
        let result1 = agent.chat("获取id等于fab0f921-654c-459b-8cb8-0ad34d2b331c的entity实体")
        println("获取entity实体结果: " + result1)

        // Test getting multiple entities with pagination
        let result2 = agent.chat("获取全部entity实体")
        println("获取多个entity实体结果: " + result2)

        // Test getting entities with specific pagination parameters
        let result2a = agent.chat("获取entity实体，每页限制20条，第一页")
        println("获取entity实体（分页参数）结果: " + result2a)

        // Test adding an entity with specific data
        let result3 = agent.chat("新增一个entity实体，名称为测试实体，链接为test.uctoo.com，隐私等级为3，星级为5，描述为这是一个测试实体")
        println("新增entity实体结果: " + result3)

        // Test editing an entity with specific ID and data
        let result4 = agent.chat("编辑id为fab0f921-654c-459b-8cb8-0ad34d2b331c的entity实体，将名称改为更新的测试实体，隐私等级改为4")
        println("编辑entity实体结果: " + result4)

        // Test deleting an entity with specific ID
        let result5 = agent.chat("删除id为3a5a079d-38b2-4ea2-b8cd-f3c0d93dacfb的entity实体")
        println("删除entity实体结果: " + result5)

        // Test creating another entity
        let result6 = agent.chat("创建一个新entity实体，标题为新实体，链接为new.uctoo.com，隐私等级为1，星级为4，描述为这是新创建的实体，城市为深圳")
        println("创建新entity实体结果: " + result6)

        // Test listing entities again after CRUD operations
        let result7 = agent.chat("列出所有entity实体，限制10条")
        println("列出entity实体结果: " + result7)
    } else {
        println("登录失败或未获取到有效token，跳过entity操作...")
    }
}