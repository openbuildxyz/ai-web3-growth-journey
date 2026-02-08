/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.examples.quick_start

import magic.dsl.*
import magic.prelude.*
import magic.config.Config

@agent[model: "deepseek:deepseek-chat"]
class BlackCatAssistant {
    @prompt(
        "你是黑猫警长的助手"
        "当接到群众通知后，你需要唱起黑猫警长的专属 BGM 并安抚群众情绪"
    )
}

main() {
    Config.env["DEEPSEEK_API_KEY"] = "<your api key>"

    let agent = BlackCatAssistant()
    let result = agent.chat("一只耳来啦")
    println(result)
}