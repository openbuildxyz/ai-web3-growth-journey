/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.log

import magic.core.message.Message
import magic.core.message.MessageList
import magic.config.Config
import magic.utils.exists

public struct LogUtils {
    public static func trace(msg: String): Unit {
        LogUtilsImpl.trace(msg)
    }

    public static func trace(name: String, msg: String): Unit {
        trace("${name}: ${msg}")
        if (Config.enableAgentLog) {
            LogUtilsImpl.agentTrace(name, msg)
        }
    }

    public static func trace(msg: Message): Unit {
        trace(msg.toString())
    }

    public static func trace(messages: MessageList): Unit {
        for (msg in messages) {
            trace(msg)
        }
    }

    //------------------------------------------------------------

    public static func debug(msg: String): Unit {
        LogUtilsImpl.debug(msg)
    }

    public static func debug(msg: Message): Unit {
        debug(msg.toString())
    }

    public static func debug(messages: MessageList): Unit {
        for (msg in messages) {
            debug(msg)
        }
    }

    public static func debug(name: String, msg: String): Unit {
        debug("[${name}] ${msg}")
        if (Config.enableAgentLog) {
            LogUtilsImpl.agentDebug(name, msg)
        }
    }

    public static func debug(name: String, msg: Message): Unit {
        debug(name, msg.toString())
    }

    public static func debug(name: String, messages: MessageList): Unit {
        for (msg in messages) {
            debug(name, msg)
        }
    }

    //------------------------------------------------------------

    public static func info(msg: String): Unit {
        LogUtilsImpl.info(msg)
    }

    public static func info(name: String, msg: String): Unit {
        info("[${name}] ${msg}")
        if (Config.enableAgentLog) {
            LogUtilsImpl.agentInfo(name, msg)
        }
    }

    public static func info(msg: Message): Unit {
        info(msg.toString())
    }

    public static func info(name: String, msg: Message): Unit {
        info(name, msg.toString())
    }

    public static func info(messages: MessageList): Unit {
        for (msg in messages) {
            info(msg)
        }
    }

    public static func info(name: String, history: MessageList): Unit {
        for (msg in history) {
            info(name, msg)
        }
    }

    public static func info(messages: Array<Message>): Unit {
        for (msg in messages) {
            info(msg)
        }
    }

    public static func info(name: String, messages: Array<Message>): Unit {
        for (msg in messages) {
            info(name, msg)
        }
    }

    //------------------------------------------------------------

    public static func error(msg: String): Unit {
        LogUtilsImpl.error(msg)
    }

    public static func error(name: String, msg: String): Unit {
        error("[${name}] ${msg}")
        if (Config.enableAgentLog) {
            LogUtilsImpl.agentError(name, msg)
        }
    }

    //------------------------------------------------------------
    private static func buildExceptionMessage(ex: Exception): String {
        let strBuilder = StringBuilder()
        for (ste in ex.getStackTrace()) {
            strBuilder.append("${ste.fileName}:${ste.lineNumber} ${ste.methodName}\n")
        }
        return strBuilder.toString()
    }

    public static func info(ex: Exception): Unit {
        info(buildExceptionMessage(ex))
    }

    public static func debug(ex: Exception): Unit {
        debug(buildExceptionMessage(ex))
    }

    public static func error(ex: Exception): Unit {
        error(buildExceptionMessage(ex))
    }
}
