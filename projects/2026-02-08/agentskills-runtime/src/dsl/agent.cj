/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.ast.*
import std.regex.{Regex, MatchData}
import std.sort.SortExtension
import std.convert.Parsable
import std.collection.{ArrayList, HashMap, map, collectArrayList, collectArray}

enum AgentToolAttr {
    | StdioMcp(String, HashMap<String, Token>)
    | SseMcp(String)
    | HttpMcp(String, HashMap<String, Token>)
    | NativeFuncTool(Token)
    | AgentTool(Expr)
    | NativeToolset(Expr)

    static func parse(rawAttr: Tokens): AgentToolAttr {
        // The deprecated syntax of specifying the MCP as a map
        // I.e., tools: [ {command: ...}]
        if (rawAttr[0].kind == TokenKind.LCURL) {
            let rawMapAttr = MapParser(rawAttr).parseMap()
            return AgentToolAttr.parseMcpMap(rawMapAttr)
        } else {
            if (rawAttr[0].kind != TokenKind.IDENTIFIER) {
                throw DslException("Invalid agent tool config `${rawAttr}`")
            }
            let name = rawAttr[0].value
            return match (name) {
                case "stdioMCP" | "stdioMcp" => AgentToolAttr.parseStdio(rawAttr)
                case "sseMCP" | "sseMcp" => AgentToolAttr.parseSse(rawAttr)
                case "httpMCP" | "httpMcp" => AgentToolAttr.parseHttp(rawAttr)
                case _ => AgentToolAttr.parseNative(rawAttr)
            }
        }
    }

    /**
     * The first item is a string literal, followed by environment arguments,
     * like stdioMCP("bash -c a.sh", PATH: "xxx", LD_PATH: "yyy", ...)
     */
    static func parseStdio(rawAttr: Tokens): AgentToolAttr {
        if (rawAttr.size < 4 ||
            rawAttr[1].kind != TokenKind.LPAREN ||
            (rawAttr[2].kind != TokenKind.STRING_LITERAL &&
             rawAttr[2].kind != TokenKind.SINGLE_QUOTED_STRING_LITERAL) ||
            rawAttr[rawAttr.size-1].kind != TokenKind.RPAREN) {
            throw DslException("Invalid MCP stdio server config `${rawAttr}`")
        }
        let commandLine = rawAttr[2].value
        // Reconstruct environment arguments as a map
        let mapAttr = Tokens([Token(TokenKind.LCURL)])
        // Skip the first four tokens: stdio ( "..." ,
        if (rawAttr.size > 4) {
            mapAttr.append(rawAttr[4..(rawAttr.size-1)])
        }
        mapAttr.append(Token(TokenKind.RCURL))
        let env = MapParser(mapAttr).parseMapOf(TokenKind.STRING_LITERAL)
        return AgentToolAttr.StdioMcp(commandLine, env)
    }

    /**
     * A single string literal, like sseMcp("https://...")
     */
    static func parseSse(rawAttr: Tokens): AgentToolAttr {
        // Reconstruct the values as a list and parse it
        let urls = ArrayParser(rawAttr[1..], beginSymbol: TokenKind.LPAREN, endSymbol: TokenKind.RPAREN)
            .parseArrayOf(TokenKind.STRING_LITERAL) |>
            map{ token: Token => token.value } |>
            collectArray
        if (urls.size != 1) {
            throw DslException("Invalid MCP http server config `${rawAttr}`")
        }
        return AgentToolAttr.SseMcp(urls[0])
    }

    /**
     * The first item is a string literal, followed by headers,
     * like httpMCP("https://...", Authorization: "Bearer ...", ...)
     */
    static func parseHttp(rawAttr: Tokens): AgentToolAttr {
        if (rawAttr.size < 4 ||
            rawAttr[1].kind != TokenKind.LPAREN ||
            (rawAttr[2].kind != TokenKind.STRING_LITERAL &&
             rawAttr[2].kind != TokenKind.SINGLE_QUOTED_STRING_LITERAL) ||
            rawAttr[rawAttr.size-1].kind != TokenKind.RPAREN) {
            throw DslException("Invalid MCP stdio server config `${rawAttr}`")
        }
        let commandLine = rawAttr[2].value
        // Reconstruct environment arguments as a map
        let mapAttr = Tokens([Token(TokenKind.LCURL)])
        // Skip the first four tokens: stdio ( "..." ,
        if (rawAttr.size > 4) {
            mapAttr.append(rawAttr[4..(rawAttr.size-1)])
        }
        mapAttr.append(Token(TokenKind.RCURL))
        let headers = MapParser(mapAttr).parseMapOf(TokenKind.STRING_LITERAL)
        return AgentToolAttr.HttpMcp(commandLine, headers)
    }

    /**
     * An identifier
     */
    static func parseNative(rawAttr: Tokens): AgentToolAttr {
        let expr = try {
            parseExpr(rawAttr)
        } catch (ex: ParseASTException) {
            throw DslException("Invalid native tool config `${rawAttr}`")
        }
        if (expr is RefExpr) {
            let refExpr = (expr as RefExpr).getOrThrow()
            return AgentToolAttr.NativeFuncTool(refExpr.identifier)
        } else if (expr is CallExpr) {
            let callExpr = (expr as CallExpr).getOrThrow()
            if (!(callExpr.callFunc is RefExpr)) {
                throw DslException("Invalid native tool set config `${rawAttr}`")
            }
            if ((callExpr.callFunc as RefExpr).getOrThrow().identifier.value == "AgentAsTool") {
                return AgentToolAttr.AgentTool(callExpr)
            }
            return AgentToolAttr.NativeToolset(callExpr)
        } else {
            throw DslException("Invalid native tool config `${rawAttr}`")
        }
    }

    /**
     * Deprecated syntax of specify MCP as a map
     */
    static func parseMcpMap(rawMapAttr: HashMap<String, Tokens>): AgentToolAttr {
        AgentToolAttr.checkAttr(rawMapAttr)
        if (let Some(command) <- rawMapAttr.get("command")) {
            let args = ArrayParser(rawMapAttr.get("args") ?? quote([]))
                .parseArrayOf(TokenKind.STRING_LITERAL) |>
                map { token: Token => token.value } |>
                collectArray
            let env = MapParser(rawMapAttr.get("env") ?? quote({})).parseMapOf(TokenKind.STRING_LITERAL)
            return AgentToolAttr.StdioMcp(
                "${command[0].value} ${String.join(args, delimiter: " ")}",
                env
            )
        } else {
            let url = rawMapAttr.get("url").getOrThrow()[0]
            return AgentToolAttr.SseMcp(url.value)
        }
    }

    static func checkAttr(rawMapAttr: HashMap<String, Tokens>): Unit {
        if (rawMapAttr.contains("command") && rawMapAttr.contains("url")) {
            throw DslException("MCP cannot have a command and a URL")
        } else if (!rawMapAttr.contains("command") && !rawMapAttr.contains("url")) {
            throw DslException("MCP must have a command or a URL")
        } else if (rawMapAttr.contains("command")) {
            let commandAttr = rawMapAttr["command"]
            if (commandAttr.size != 1 || commandAttr[0].kind != TokenKind.STRING_LITERAL) {
                throw DslException("MCP command has invalid value `${commandAttr}`")
            }
        } else if (rawMapAttr.contains("url")) {
            let urlAttr = rawMapAttr["url"]
            if (urlAttr.size != 1 || urlAttr[0].kind != TokenKind.STRING_LITERAL) {
                throw DslException("MCP url has invalid value `${urlAttr}`")
            }
        }
    }
}

/**
 * The model attribute accept a string literal or an expression
 */
private enum ModelAttr {
    | Literal(String)
    | Expr(Tokens)
}

private class AgentAttr <: Attr {
    private static let ATTR_NAMES = [
        "model",
        "executor",
        "description",
        "temperature",
        "rag",
        "memory",
        "tools",
        "enableToolFilter",
        "dump"
    ]

    AgentAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    static func parse(attrTokens: Tokens): AgentAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "agent",
            validKeys: AgentAttr.ATTR_NAMES
        )
        return AgentAttr(map)
    }

    // Whether defined by @prompt
    var hasPrompt = false
    var solidPrompt = true

    prop model: ModelAttr {
        get() {
            try {
                if (let Some(v) <- getString("model")) {
                    return ModelAttr.Literal(v)
                }
            } catch (_: DslException) {
                // Value is not a string literal, skip the exception
            }

            if (let Some(expr) <- getTokens("model")) {
                ModelAttr.Expr(expr)
            } else {
                ModelAttr.Literal("deepseek:deepseek-chat")
            }
        }
    }

    // Whether defined by @execution
    var hasExecutionDSL = false

    prop executor: String {
        get() {
            if (this.hasExecutionDSL) {
                return "dsl-executor"
            } else {
                getString("executor") ?? "react"
            }
        }
    }

    // Whether defined by @handler
    var hasEventHandler = false

    prop description: String {
        get() { getString("description") ?? "" }
    }

    prop temperature: Option<Tokens> {
        get() {
            return getTokens("temperature")
        }
    }

    private var _rag: Option<HashMap<String, Tokens>> = None

    /**
     * rag: {source:..., mode: ..., description: ...}
     */
    prop rag: HashMap<String, Tokens> {
        get() {
            if (let Some(v) <- _rag) { return v }

            let result = if (let Some(tokens) <- getTokens("rag")) {
                MapParser(tokens).parseMap()
            } else {
                HashMap<String, Tokens>()
            }
            _rag = Some(result)
            return result
        }
    }

    prop memory: Bool {
        get() { getBool("memory") }
    }

    /**
     * tools: [
     *   stdioMCP("...", ABC: "VALUE", ...)
     *   sseMCP("...")
     *   id
     * ]
     */
    private var _tools: Option<Array<AgentToolAttr>> = None
    prop tools: Array<AgentToolAttr> {
        get() {
            if (let Some(v) <- _tools) {
                return v
            }
            if (let Some(tokens) <- getTokens("tools")) {
                let result = ArrayList<AgentToolAttr>()
                for (toolTokens in ArrayParser(tokens).parseArrayOfTokens()) {
                    result.add(AgentToolAttr.parse(toolTokens))
                }
                _tools = result.toArray()
                return _tools.getOrThrow()
            }
            return []
        }
    }

    prop enableToolFilter: Bool {
        get() { getBool("enableToolFilter") }
    }

    let internalTools = ArrayList<String>()
}

public macro agent(input: Tokens): Tokens {
    let agentAttr = AgentAttr()

    for (m in getChildMessages("tool")) {
        if (m.hasItem("internalTool")) {
            let name = m.getString("internalTool")
            agentAttr.internalTools.add(name)
        }
    }
    for (m in getChildMessages("prompt")) {
        if (m.hasItem("prompt:solid")) {
            agentAttr.solidPrompt = m.getBool("prompt:solid")
        }
        agentAttr.hasPrompt = true
    }
    for (m in getChildMessages("execution")) {
        if (m.hasItem("executionDSL")) {
            agentAttr.hasExecutionDSL = m.getBool("executionDSL")
        }
    }
    for (m in getChildMessages("handler")) {
        if (m.hasItem("defineHandler")) {
            agentAttr.hasEventHandler = m.getBool("defineHandler")
        }
    }

    return transformAgent(input, agentAttr)
}

public macro agent(attr: Tokens, input: Tokens): Tokens {
    let agentAttr = AgentAttr.parse(attr)

    for (m in getChildMessages("tool")) {
        if (m.hasItem("internalTool")) {
            let name = m.getString("internalTool")
            agentAttr.internalTools.add(name)
        }
    }
    for (m in getChildMessages("prompt")) {
        if (m.hasItem("prompt:solid")) {
            agentAttr.solidPrompt = m.getBool("prompt:solid")
        }
        agentAttr.hasPrompt = true
    }
    for (m in getChildMessages("execution")) {
        if (m.hasItem("defineExecution")) {
            agentAttr.hasExecutionDSL = m.getBool("defineExecution")
        }
    }
    for (m in getChildMessages("handler")) {
        if (m.hasItem("defineHandler")) {
            agentAttr.hasEventHandler = m.getBool("defineHandler")
        }
    }

    let content = transformAgent(input, agentAttr)
    if (agentAttr.dump) {
        printTokens(content)
    }
    return content
}

private func transformAgent(input: Tokens, agentAttr: AgentAttr): Tokens {
    let decl = parseDecl(input)
    if (decl.isClassDecl()) {
        return transformAgentClass(decl.asClassDecl(), agentAttr)
    } else {
        throw DslException("@agent should be called on class declarations")
    }
}

/**
 * Transform the class as an agent class type
 */
private func transformAgentClass(classDecl: ClassDecl, agentAttr: AgentAttr): Tokens {
    let modifier = classDecl.modifiers

    let genericTypeParamTokens = getGenericTypeParamsTokens(classDecl)
    let genericConstraintTokens = getGenericConstraintsTokens(classDecl)

    let classNameToken = classDecl.identifier
    let classDeclBody = classDecl.body.decls

    // Compose all `Tokens`
    return quote(
        $modifier class $classNameToken $genericTypeParamTokens $genericConstraintTokens <: UserDefinedAgent {
            $classDeclBody
            public static let typeName = $( newLiteralToken(classDecl.identifier.value) )
            $( buildAgentSystemPromptProp(classDecl, agentAttr) )
            $( buildAgentModelProp(agentAttr) )
            $( buildAgentExecutorProp(agentAttr) )
            $( buildAgentNameProp(classDecl) )
            $( buildAgentDescriptionProp(agentAttr) )
            $( buildAgentTemperatureProp(agentAttr) )
            $( buildAgentToolManagerProp(classDecl, agentAttr) )
            $( buildAgentRetrieverProp(agentAttr) )
            $( buildAgentMemoryProp(agentAttr) )
            $( buildAgentEventHandlerProp(agentAttr) )
        }
    )
}

//=============================================================================

private func buildAgentSystemPromptProp(classDecl: ClassDecl, agentAttr: AgentAttr) {
    if (!agentAttr.hasPrompt) {
        return quote (
            private var __SYSTEM_PROMPT__: String = ""
            public override mut prop systemPrompt: String {
                get() { return __SYSTEM_PROMPT__ }
                set(v) { __SYSTEM_PROMPT__ = v }
            }
        )
    }
    return quote(
        private var __SYSTEM_PROMPT__: String = ""
        private var __IS_SYSTEM_PROMPT_INIT__ = false
        private var __IS_SYSTEM_PROMPT_SOLID__ = $(newLiteralToken(agentAttr.solidPrompt))
        public override mut prop systemPrompt: String {
            get() {
                if (__IS_SYSTEM_PROMPT_INIT__ && __IS_SYSTEM_PROMPT_SOLID__) {
                    return __SYSTEM_PROMPT__
                }
                __IS_SYSTEM_PROMPT_INIT__ = true
                __SYSTEM_PROMPT__ = $(newIdentifierToken(SYSTEM_PROMPT_FUNC))()
                return __SYSTEM_PROMPT__
            }
            set(v) {
                __IS_SYSTEM_PROMPT_INIT__ = true
                __IS_SYSTEM_PROMPT_SOLID__ = true
                __SYSTEM_PROMPT__ = v
            }
        }
    )
}

//============================================================================================

private func buildAgentNameProp(classDecl: ClassDecl) {
    let tokens = newLiteralToken(classDecl.identifier.value)
    return quote(
        private var __NAME__: String = $tokens
        public override mut prop name: String {
            get() { __NAME__ }
            set(v) { __NAME__ = v }
        }
    )
}

//============================================================================================

private func buildAgentModelProp(agentAttr: AgentAttr): Tokens {
    let tokens = match (agentAttr.model) {
        case ModelAttr.Literal(v) =>
            quote(ModelManager.createChatModel( $(newLiteralToken(v)) ))
        case ModelAttr.Expr(expr) => expr
    }
    return quote(
        private var __IS_MODEL_INIT__ = false
        private var __MODEL__: Option<ChatModel> = None
        public override mut prop model: ChatModel {
            get() {
                if (!__IS_MODEL_INIT__) {
                    __MODEL__ = $tokens
                    __IS_MODEL_INIT__ = true
                }
                return __MODEL__.getOrThrow()
            }
            set(v) {
                __IS_MODEL_INIT__ = true
                __MODEL__ = v
            }
        }
    )
}

//============================================================================================

private func buildAgentExecutorProp(agentAttr: AgentAttr): Tokens {
    let tokens = newLiteralToken(agentAttr.executor)
    return quote(
        private var __IS_EXECUTOR_INIT__ = false
        private var __EXECUTOR__: Option<AgentExecutor> = None
        public override mut prop executor: AgentExecutor {
            get() {
                if (!__IS_EXECUTOR_INIT__) {
                    __EXECUTOR__ = AgentExecutorManager.create($tokens)
                    __IS_EXECUTOR_INIT__ = true
                }
                return __EXECUTOR__.getOrThrow()
            }
            set(v) {
                __EXECUTOR__ = v
                __IS_EXECUTOR_INIT__ = true
            }
        }
    )
}

//============================================================================================

private func buildAgentDescriptionProp(agentAttr: AgentAttr): Tokens {
    let tokens = newLiteralToken(agentAttr.description)
    return quote(
        public override prop description: String {
            get() { $tokens }
        }
    )
}

//============================================================================================

private func buildAgentTemperatureProp(agentAttr: AgentAttr): Tokens {
    let tokens = if (let Some(t) <- agentAttr.temperature) {
        t
    } else {
        quote(None)
    }
    return quote(
        private var __TEMPERATURE__: Option<Float64> = $tokens
        public override mut prop temperature: Option<Float64> {
            get() { __TEMPERATURE__ }
            set(v) { __TEMPERATURE__ = v }
        }
    )
}

//============================================================================================

private enum RagSource {
    | Path(String)
    | Expr(Tokens)
}

private struct RagAttr {
    RagAttr(
        let source: RagSource,
        let mode: Option<String>,
        let description: Option<String>) { }

    static func parse(rawAttr: HashMap<String, Tokens>): RagAttr {
        RagAttr.checkAttr(rawAttr)
        let sourceAttr: Tokens = rawAttr.get("source").getOrThrow()
        let source = if (sourceAttr.size == 1 && sourceAttr[0].kind == TokenKind.STRING_LITERAL) {
            RagSource.Path(sourceAttr[0].value)
        } else {
            RagSource.Expr(sourceAttr)
        }

        let mode = (rawAttr.get("mode")?[0])?.value
        let desc = (rawAttr.get("description")?[0])?.value
        return RagAttr(source, mode, desc)
    }

    static func checkAttr(rawAttr: HashMap<String, Tokens>): Unit {
        if (!rawAttr.contains("source")) {
            throw DslException("Rag must has a source")
        }
        if (rawAttr.contains("mode")) {
            let modeAttr = rawAttr["mode"]
            if (modeAttr.size != 1 || modeAttr[0].kind != TokenKind.STRING_LITERAL) {
                throw DslException("Rag mode has invalid value `${modeAttr}`")
            }
        }
        if (rawAttr.contains("description")) {
            let descAttr = rawAttr["description"]
            if (descAttr.size != 1 || descAttr[0].kind != TokenKind.STRING_LITERAL) {
                throw DslException("Rag description has invalid value `${descAttr}`")
            }
        }
    }
}

private func buildAgentRetrieverProp(agentAttr: AgentAttr): Tokens {
    let retrieverInitTokens = if (agentAttr.rag.isEmpty()) {
        quote(None)
    } else {
        let ragAttr = RagAttr.parse(agentAttr.rag)
        let mode = if (let Some(v) <- ragAttr.mode) {
            if (v == "static") {
                quote(RetrieverMode.Static)
            } else {
                quote(RetrieverMode.Dynamic)
            }
        } else {
            quote(None)
        }
        let desc = if (let Some(v) <- ragAttr.description) {
            quote($(newLiteralToken(v)))
        } else {
            quote(None)
        }
        match (ragAttr.source) {
            case RagSource.Expr(expr) =>
                quote(RetrieverUtils.createRetriever(this, $expr, $mode, $desc))
            case RagSource.Path(p) =>
                let path = newLiteralToken(p)
                quote(RetrieverUtils.createRetriever(this, $path, $mode, $desc))
        }
    }

    return quote(
        private var __IS_RETRIEVER_INIT__ = false
        private var __RETRIEVER__: Option<Retriever> = None
        public override mut prop retriever: Option<Retriever> {
            get() {
                if (!__IS_RETRIEVER_INIT__) {
                    __RETRIEVER__ = $retrieverInitTokens
                    __IS_RETRIEVER_INIT__ = true
                }
                return __RETRIEVER__
            }
            set(v) {
                __RETRIEVER__ = v
                __IS_RETRIEVER_INIT__ = true
            }
        }
    )
}

//============================================================================================

private func buildAgentMemoryProp(agentAttr: AgentAttr): Tokens {
    let tokens = if (agentAttr.memory) {
        quote(Some(ShortMemory()))
    } else {
        quote(None)
    }
    return quote(
        private var __IS_MEMORY_INIT__ = false
        private var __MEMORY__: Option<Memory> = None
        public override mut prop memory: Option<Memory> {
            get() {
                if (!__IS_MEMORY_INIT__) {
                    __MEMORY__ = $tokens
                    __IS_MEMORY_INIT__ = true
                }
                return __MEMORY__
            }
            set(v) {
                __MEMORY__ = v
                __IS_MEMORY_INIT__ = true
            }
        }
    )
}

//============================================================================================

private func buildAgentToolManagerProp(classDecl: ClassDecl, agentAttr: AgentAttr) {
    let addTools = Tokens()
    // Internal tools
    for (name in agentAttr.internalTools) {
        let funcName = newIdentifierToken(name)
        addTools.append(
            quote(
                tm.addTool($funcName)
            )
        )
    }
    // Native func tools and MCP tools
    for (i in 0..agentAttr.tools.size) {
        match (agentAttr.tools[i]) {
            case AgentToolAttr.StdioMcp(_commandLine, _env) =>
                let commandLine = newLiteralToken(_commandLine)
                let env = joinTokens(
                    _env.iterator() |>
                        map { tuple: (String, Token) =>
                            let key = newLiteralToken(tuple[0])
                            let value = tuple[1]
                            return quote( ($key, $value) )
                        } |>
                        collectArrayList,
                    Token(TokenKind.COMMA)
                )
                let client = newIdentifierToken("_client_${i}")
                addTools.append(
                    quote(
                        let $client = StdioMCPClient($commandLine, env: [$env])
                        tm.addTools($client.tools)
                    )
                )
            case AgentToolAttr.SseMcp(_url) =>
                let url = newLiteralToken(_url)
                let client = newIdentifierToken("_client_${i}")
                addTools.append(
                    quote(
                        let $client = SseMCPClient($url)
                        tm.addTools($client.tools)
                    )
                )
            case AgentToolAttr.HttpMcp(_url, _headers) =>
                let url = newLiteralToken(_url)
                let headers = joinTokens(
                    _headers.iterator() |>
                        map { tuple: (String, Token) =>
                            let key = newLiteralToken(tuple[0])
                            let value = tuple[1]
                            return quote( ($key, $value) )
                        } |>
                        collectArrayList,
                    Token(TokenKind.COMMA)
                )
                let client = newIdentifierToken("_client_${i}")
                addTools.append(
                    quote(
                        let $client = HttpMCPClient($url, headers: [$headers])
                        tm.addTools($client.tools)
                    )
                )

            case AgentToolAttr.NativeFuncTool(tool) =>
                addTools.append(
                    quote(
                        tm.addTool($tool)
                    )
                )
            case AgentToolAttr.AgentTool(expr) =>
                addTools.append(
                    quote(
                        tm.addTool( ($expr) )
                    )
                )
            case AgentToolAttr.NativeToolset(toolset) =>
                addTools.append(
                    quote(
                        tm.addTools( ($toolset).tools )
                    )
                )
        }
    }

    return quote(
        private var __TOOL_MANAGER__: Option<ToolManager> = None
        public override prop toolManager: ToolManager {
            get() {
                match (__TOOL_MANAGER__) {
                    case Some(tm) => return tm
                    case None =>
                        let tm = SimpleToolManager([], enableFilter: $(newLiteralToken(agentAttr.enableToolFilter)))

                        $addTools

                        __TOOL_MANAGER__ = Some(tm)
                        return tm
                }
            }
        }
    )
}

//============================================================================================

private func buildAgentEventHandlerProp(agentAttr: AgentAttr) {
    if (!agentAttr.hasEventHandler) {
        return quote(
            public override prop eventHandlerManager: Option<Object> {
                get() { return None }
            }
        )
    }
    return quote(
        private var __EVENT_HANDLER__: Option<EventHandlerManager> = None
        public override prop eventHandlerManager: Option<Object> {
            get() {
                match (__EVENT_HANDLER__) {
                    case Some(handler) => return handler
                    case None =>
                        let handler = $( newIdentifierToken(HANDLER_FUNC_NAME) )()
                        __EVENT_HANDLER__ = Some(handler)
                        return handler
                }
            }
        }
    )
}