/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.log

import magic.core.message.Message
import magic.core.message.MessageList
@When[ohos == "true"]
import ohos.base.AppLog

import std.collection.ArrayList

@When[ohos == "true"]
struct LogUtilsImpl {
    /**
     * AppLog.info will truncate a long message, so we split it as multiple messages
     */
    private static func splitMessages(msg: String): Array<String> {
        let result = ArrayList<String>()
        let runes = msg.toRuneArray()
        var start = 0
        let SIZE = 1500
        while (true) {
            if (start + SIZE <= runes.size) {
                result.add(String(runes[start..(start + SIZE)]))
                start += SIZE
            } else {
                result.add(String(runes[start..]))
                break
            }
        }
        return result.toArray()
    }

    public static func info(msg: String): Unit {
        for (line in splitMessages(msg)) {
            AppLog.info(line)
        }
    }

    public static func agentInfo(name: String, msg: String): Unit {
    }

    //------------------------------------------------------------

    public static func trace(msg: String): Unit {
        info(msg)  // AppLog.debug has no effects?
    }

    public static func agentTrace(name: String, msg: String): Unit {
    }

    //------------------------------------------------------------

    public static func debug(msg: String): Unit {
        info(msg)  // AppLog.debug has no effects?
    }

    public static func agentDebug(name: String, msg: String): Unit {
    }

    //------------------------------------------------------------

    public static func error(msg: String): Unit {
        AppLog.info(msg)
    }

    public static func agentError(name: String, msg: String): Unit {
    }
}
