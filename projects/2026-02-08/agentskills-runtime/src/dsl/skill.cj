/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
macro package magic.dsl

import std.ast.*
import std.collection.{ArrayList, HashMap, map, collectArrayList}
import std.convert.Parsable
import std.regex.{Regex, MatchData}
import std.sort.SortExtension

private class SkillAttr <: Attr {
    private static let ATTR_NAMES = [
        "name",
        "description",
        "license",
        "compatibility",
        "metadata",
        "allowedTools",
        "parameters",
        "dump",
        "security",
        "capabilities",
        "executionTimeout",
        "resourceLimits"
    ]

    SkillAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    static func parse(attrTokens: Tokens): SkillAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "skill",
            validKeys: SkillAttr.ATTR_NAMES
        )
        return SkillAttr(map)
    }

    prop name: String {
        get() { getString("name").getOrThrow() }
    }

    prop description: String {
        get() { getString("description").getOrThrow() }
    }

    prop license: Option<String> {
        get() { getString("license") }
    }

    prop compatibility: Option<String> {
        get() { getString("compatibility") }
    }

    private var _metadata: Option<HashMap<String, String>> = None
    prop metadata: HashMap<String, String> {
        get() {
            if (let Some(v) <- _metadata) { return v }

            let result = HashMap<String, String>()
            if (let Some(tokens) <- getTokens("metadata")) {
                let tokenMap = MapParser(tokens).parseMapOf(TokenKind.STRING_LITERAL)
                for ((name, token) in tokenMap) {
                    result.add(name, token.value)
                }
            }
            _metadata = Some(result)
            return result
        }
    }

    prop allowedTools: Option<String> {
        get() { getString("allowedTools") }
    }

    private var _parameters: Option<HashMap<String, String>> = None
    prop parameters: HashMap<String, String> {
        get() {
            if (let Some(v) <- _parameters) { return v }

            let result = HashMap<String, String>()
            if (let Some(tokens) <- getTokens("parameters")) {
                let tokenMap = MapParser(tokens).parseMapOf(TokenKind.STRING_LITERAL)
                for ((name, token) in tokenMap) {
                    result.add(name, token.value)
                }
            }
            _parameters = Some(result)
            return result
        }
    }

    prop security: Option<String> {
        get() { getString("security") }
    }

    prop capabilities: Option<String> {
        get() { getString("capabilities") }
    }

    prop executionTimeout: Option<String> {
        get() { getString("executionTimeout") }
    }

    prop resourceLimits: Option<String> {
        get() { getString("resourceLimits") }
    }
}

/**
 * The @skill macro transforms class declarations into skill implementations
 * following the same pattern as @tool and @toolset macros
 */
public macro skill(input: Tokens): Tokens {
    let skillAttr = SkillAttr()
    return transformSkill(input, skillAttr)
}

public macro skill(attr: Tokens, input: Tokens): Tokens {
    let skillAttr = SkillAttr.parse(attr)
    let content = transformSkill(input, skillAttr)
    if (skillAttr.dump) {
        printTokens(content)
    }
    return content
}

private func transformSkill(input: Tokens, skillAttr: SkillAttr): Tokens {
    let decl = parseDecl(input)
    if (decl.isClassDecl()) {
        return transformSkillClass(decl.asClassDecl(), skillAttr)
    } else {
        throw DslException("@skill should be called on class declarations")
    }
}

/**
 * Transform the class as a skill class type with uctoo-inspired features
 */
private func transformSkillClass(classDecl: ClassDecl, skillAttr: SkillAttr): Tokens {
    let modifier = classDecl.modifiers

    let genericTypeParamTokens = getGenericTypeParamsTokens(classDecl)
    let genericConstraintTokens = getGenericConstraintsTokens(classDecl)

    let classNameToken = classDecl.identifier
    let classDeclBody = classDecl.body.decls

    // Compose all `Tokens`
    return quote(
        $modifier class $classNameToken $genericTypeParamTokens $genericConstraintTokens <: BaseSkill {
            public init() {
                super(
                    name: $(newLiteralToken(skillAttr.name)),
                    description: $(newLiteralToken(skillAttr.description)),
                    license: $(if (let Some(value) <- skillAttr.license) { quote(Some($(newLiteralToken(value)))) } else { quote(None) }),
                    compatibility: $(if (let Some(value) <- skillAttr.compatibility) { quote(Some($(newLiteralToken(value)))) } else { quote(None) }),
                    metadata: $(buildMetadataMap(skillAttr.metadata)),
                    allowedTools: $(if (let Some(value) <- skillAttr.allowedTools) { quote(Some($(newLiteralToken(value)))) } else { quote(None) }),
                    instructions: $(newLiteralToken("")),
                    skillPath: $(newLiteralToken("./" + skillAttr.name))
                )

                // Initialize uctoo-inspired security and resource management
                $(if (let Some(timeout) <- skillAttr.executionTimeout) {
                    quote(this.setExecutionTimeout($(newLiteralToken(timeout))))
                } else { quote(()) })

                $(if (let Some(resources) <- skillAttr.resourceLimits) {
                    quote(this.setResourceLimits($(newLiteralToken(resources))))
                } else { quote(()) })

                $(if (let Some(caps) <- skillAttr.capabilities) {
                    quote(this.setCapabilities($(newLiteralToken(caps))))
                } else { quote(()) })
            }
            $classDeclBody
        }
    )
}

private func buildMetadataMap(metadata: HashMap<String, String>): Tokens {
    if (metadata.isEmpty()) {
        return quote(HashMap<String, String>())
    }

    let entries = ArrayList<Tokens>()
    for ((key, value) in metadata) {
        entries.add(quote(($(newLiteralToken(key)), $(newLiteralToken(value)))))
    }

    let joinedEntries = joinTokens(entries, Token(TokenKind.COMMA))
    return quote(HashMap<String, String>([$joinedEntries]))
}