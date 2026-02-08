/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.log

import magic.core.message.Message
import magic.core.message.MessageList
import magic.config.Config
import magic.utils.exists

import std.fs.{File, OpenMode, Directory, Path}
import std.console.Console
import std.collection.HashMap
import std.io.OutputStream

import stdx.log.LogLevel

@When[cjc_version < "1.0.0"]
import std.log.SimpleLogger

@When[cjc_version >= "1.0.0"]
import stdx.logger.SimpleLogger

@When[cjc_version >= "1.0.0"]
private func buildSimpleLogger(output: OutputStream): SimpleLogger {
    let logger = SimpleLogger(output)
    logger.level = match (Config.logLevel.toAsciiLower()) {
        case "trace" => LogLevel.TRACE
        case "debug" => LogLevel.DEBUG
        case "info" => LogLevel.INFO
        case "warn" => LogLevel.WARN
        case "error" => LogLevel.ERROR
        case _ => LogLevel.INFO
    }
    return logger
}

@When[ohos != "true"]
struct LogUtilsImpl {
    private static var _LOGGER: Option<SimpleLogger> = None
    private static var CURR_LOG_FILE: String = Config.logFile

    private static prop LOGGER: SimpleLogger {
        get() {
            // Log file is changed
            if (Config.logFile != CURR_LOG_FILE) {
                let logger = buildLogger()
                _LOGGER = logger
                return logger
            }
            match (_LOGGER) {
                case Some(logger) =>
                    return logger
                case None =>
                    let logger = buildLogger()
                    _LOGGER = logger
                    return logger
            }
        }
    }

    private static func buildLogger(): SimpleLogger {
        let logger = if (Config.logFile == "stdout") {
            buildSimpleLogger(Console.stdOut)
        } else if (Config.logFile == "stderr") {
            buildSimpleLogger(Console.stdErr)
        } else {
            let path = Path(Config.logFile)
            if (!exists(path.parent)) {
                Directory.create(path.parent, recursive: true)
            }
            let file = File(path, OpenMode.Write)
            buildSimpleLogger(file)
        }
        CURR_LOG_FILE = Config.logFile
        return logger
    }


    private static let NAMED_LOGGERS = HashMap<String, SimpleLogger>()

    private static func getNamedLogger(name: String): SimpleLogger {
        if (NAMED_LOGGERS.contains(name)) {
            return NAMED_LOGGERS[name]
        }
        if (!exists(Config.agentLogDir)) {
            Directory.create(Config.agentLogDir, recursive: true)
        }
        let path = Path(Config.agentLogDir).join("${name}.log")
        let file = File(path, OpenMode.Write)
        let logger = buildSimpleLogger(file)
        NAMED_LOGGERS[name] = logger
        return logger
    }

    //------------------------------------------------------------

    public static func trace(msg: String): Unit {
        LOGGER.trace(msg)
    }

    public static func agentTrace(name: String, msg: String): Unit {
        let logger = getNamedLogger(name)
        logger.trace("[${name}] ${msg}")
    }

    //------------------------------------------------------------

    public static func debug(msg: String): Unit {
        LOGGER.debug(msg)
    }

    public static func agentDebug(name: String, msg: String): Unit {
        let logger = getNamedLogger(name)
        logger.debug("[${name}] ${msg}")
    }

    //------------------------------------------------------------

    public static func info(msg: String): Unit {
        LOGGER.info(msg)
    }

    public static func agentInfo(name: String, msg: String): Unit {
        let logger = getNamedLogger(name)
        logger.info("[${name}] ${msg}")
    }

    //------------------------------------------------------------

    public static func error(msg: String): Unit {
        LOGGER.error(msg)
    }

    public static func agentError(name: String, msg: String): Unit {
        let logger = getNamedLogger(name)
        logger.error("[${name}] ${msg}")
    }
}
