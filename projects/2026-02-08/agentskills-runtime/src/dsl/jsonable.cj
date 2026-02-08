/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
macro package magic.dsl

import std.collection.{collectArrayList, ArrayList, HashMap, map}
import std.ast.*

private class JsonableAttr <: Attr {
    JsonableAttr(map: AttrMap) { super(map) }

    init() { super(AttrMap()) }

    /**
     * Whether @jsonable is put on a class
     */
    var isClass = true

    var typeName = ""

    var variables = ArrayList<VarDecl>()

    var variableDescriptions = HashMap<String, String>()

    var variableJsonnames = HashMap<String, String>()

    static func parse(attrTokens: Tokens): JsonableAttr {
        let map = AttrParser(attrTokens).parseAttr(
            macroName: "jsonable",
            validKeys: ["dump"]
        )
        return JsonableAttr(map)
    }
}

public macro jsonable(input: Tokens): Tokens {
    let attr = JsonableAttr()
    for (m in getChildMessages("field")) {
        if (m.hasItem("fieldDesc")) {
            let s = m.getString("fieldDesc")
            let items = s.split(":", 2) // Format: ${name}:${desc}
            attr.variableDescriptions.add(items[0], items[1])
        }
    }
    for (m in getChildMessages("jsonname")) {
        if (m.hasItem("jsonname")) {
            let s = m.getString("jsonname")
            let items = s.split(":", 2) // Format: ${varName}:${jsonName}
            attr.variableJsonnames.add(items[0], items[1])
        }
    }
    return transformJsonable(input, attr)
}

public macro jsonable(attrTokens: Tokens, input: Tokens): Tokens {
    let attr = JsonableAttr.parse(attrTokens)

    for (m in getChildMessages("field")) {
        if (m.hasItem("fieldDesc")) {
            let s = m.getString("fieldDesc")
            let items = s.split(":", 2) // Format: ${name}:${desc}
            attr.variableDescriptions.add(items[0], items[1])
        }
    }
    for (m in getChildMessages("jsonname")) {
        if (m.hasItem("jsonname")) {
            let s = m.getString("jsonname")
            let items = s.split(":", 2) // Format: ${varName}:${jsonName}
            attr.variableJsonnames.add(items[0], items[1])
        }
    }

    let content = transformJsonable(input, attr)
    if (attr.dump) {
        printTokens(content)
    }
    return content
}

private func transformJsonable(input: Tokens, attr: JsonableAttr): Tokens {
    let decl = parseDecl(input)
    if (let Some(classDecl) <- (decl as ClassDecl)) {
        return transformJsonableClass(classDecl, attr)
    } else if (let Some(structDecl) <- (decl as StructDecl)) {
        return transformJsonableStruct(structDecl, attr)
    } else if (let Some(enumDecl) <- (decl as EnumDecl)) {
        return transformJsonableEnum(enumDecl, attr)
    } else {
        throw DslException("@jsonable should be used with class/struct/enum.")
    }
}

private func transformJsonableClass(classDecl: ClassDecl, attr: JsonableAttr): Tokens {
    attr.isClass = true
    return transformJsonableType(classDecl, classDecl.superTypes, classDecl.body, attr)
}

private func transformJsonableStruct(structDecl: StructDecl, attr: JsonableAttr): Tokens {
    attr.isClass = false
    return transformJsonableType(structDecl, structDecl.superTypes, structDecl.body, attr)
}

/**
 * Transform
 * @jsonable
 * class F {
 *   let a: String
 *   let b: String
 *   ...
 * }
 * as
 * class F {
 *   let a: String
 *   let b: String
 *
 *   public init(...) { ... }
 *   static func getTypeSchema(): TypeSchema { ...}
 *   static func fromJsonValue(json: JsonValue): T { ... }
 *   func toJsonValue(): JsonValue { ... }
 * }
 */
private func transformJsonableType(typeDecl: Decl, superTypes: ArrayList<TypeNode>, body: Body, attr: JsonableAttr): Tokens {
    let name = typeDecl.identifier
    let allSuperTypes = if (superTypes.isEmpty()) {
        quote(Jsonable<$name>)
    } else {
        quote(Jsonable<$name> & $(superTypes.toTokens()))
    }

    attr.typeName = name.value
    attr.variables = getMemberVariables(body)

    let ctorMethod = buildCtorMethod(attr)
    let getTypeSchemaMethod = buildGetTypeSchemaMethod(attr)
    let fromJsonMethod = buildFromJsonMethod(attr)
    let toJsonMethod = buildToJsonMethod(attr)

    let genericTypeParamTokens = getGenericTypeParamsTokens(typeDecl)
    let genericConstraintTokens = getGenericConstraintsTokens(typeDecl)
    let classOrStruct = if (attr.isClass) {
        Token(TokenKind.CLASS)
    } else {
        Token(TokenKind.STRUCT)
    }

    // Compose all `Tokens`
    return quote(
        $(typeDecl.modifiers) $classOrStruct $name $genericTypeParamTokens <: $allSuperTypes $genericConstraintTokens {
            $(body.decls)
            $ctorMethod
            $getTypeSchemaMethod
            $fromJsonMethod
            $toJsonMethod
        }
    )
}

func getMemberVariables(body: Body): ArrayList<VarDecl> {
    let result = ArrayList<VarDecl>()
    for (decl in body.decls) {
        if (decl.isVarDecl()) {
            let varDecl = (decl as VarDecl).getOrThrow()
            result.add(varDecl)
        }
    }
    return result
}

/**
 * For each member variable, create a named parameter and a initialization expression for it.
 * public init(v!: type, ...) {
 *    this.v = v
 * }
 **/
private func buildCtorMethod(attr: JsonableAttr): Tokens {
    let params = ArrayList<Tokens>()
    let paramsWithDefaultValue = ArrayList<Tokens>()

    for (varDecl in attr.variables) {
        let v = newIdentifierToken(varDecl.identifier.value)
        let tyName = varDecl.declType.toTokens()
        try {
            let initExpr = varDecl.expr
            paramsWithDefaultValue.add(quote($v!: $tyName = $initExpr))
        } catch (_: ASTException) {
            params.add(quote($v!: $tyName))
        }
    }
    params.add(all: paramsWithDefaultValue)
    let comma = Token(TokenKind.COMMA)

    let body: Tokens = joinTokens(
        attr.variables |>
            map { varDecl: VarDecl =>
                let id =  newIdentifierToken(varDecl.identifier.value)
                return quote(this.$id = $id)
            } |>
            collectArrayList,
        Token(TokenKind.NL)
    )
    return quote(
        public init($(joinTokens(params, comma))) {
            $body
        }
    )
}

private func buildGetTypeSchemaMethod(attr: JsonableAttr): Tokens {
    let body = Tokens()
    for (varDecl in attr.variables) {
        let varName = varDecl.identifier.value
        let tyName = varDecl.declType.toTokens()

        let desc = attr.variableDescriptions.get(varName) ?? ""
        let descToken = if (desc.contains("\n")) {
            newMultilineStringLiteralToken(desc)
        } else {
            newLiteralToken(desc)
        }

        let jsonName = attr.variableJsonnames.get(varName) ?? varName
        let jsonNameToken = newLiteralToken(jsonName)

        let required = newLiteralToken(!isOption(varDecl.declType))
        body.append(quote(
            fields.add(FieldSchema($jsonNameToken, $descToken, $tyName.getTypeSchema(), required: $required))
        ))
    }
    return quote(
        public static func getTypeSchema(): TypeSchema {
            let fields = ArrayList<FieldSchema>()
            $body
            return TypeSchema.Obj(fields.toArray())
        }
    )
}

private func getDefaultValueOfType(typeNode: TypeNode): Option<Tokens> {
    if (let Some(varType) <- (typeNode as RefType)) {
        return match (varType.identifier.value) {
            case "Option" => Some(quote(JsonNull()))
            case "Array" => Some(quote(JsonArray()))
            case "String" => Some(quote(JsonString("")))
            case _ => Some(quote(JsonObject()))
        }
    }
    if (let Some(varType) <- (typeNode as PrimitiveType)) {
        if (varType.keyword.value.startsWith("Int")) {
            return Some(quote(JsonInt(0)))
        } else if (varType.keyword.value.startsWith("Float")) {
            return Some(quote(JsonFloat(0.0)))
        } else if (varType.keyword.value.startsWith("Bool")) {
            return Some(quote(JsonBool(false)))
        } else if (varType.keyword.value.startsWith("Rune")) {
            return Some(quote(JsonString("")))
        } else {
            return Option.None
        }
    }
    return Option.None
}

private func buildFromJsonMethod(attr: JsonableAttr): Tokens {
    let className = newIdentifierToken(attr.typeName)

    // Build the field initialization
    // return Cls(
    //   <fieldName>: <FieldType>.fromJsonValue(jo.get("<fieldName>").getOrDefault({ => <defaultValue> }))
    //   ...
    // )
    //
    let body: Tokens = joinTokens(
        attr.variables |>
            map { varDecl: VarDecl =>
                let varName = varDecl.identifier.value
                let fieldName = newIdentifierToken(varName)
                // Special identifier like `type`
                let fieldNameStr = if (varName.startsWith("`")) {
                    varName[1..(varName.size - 1)]
                } else {
                    varName
                }
                let fieldJsonname = attr.variableJsonnames.get(varName) ?? fieldNameStr
                let fieldJsonStr = newLiteralToken(fieldJsonname)
                let varType = varDecl.declType

                // Case 1: field has default value
                try {
                    let initExpr = varDecl.expr
                    return quote(
                        $fieldName: jo.get($fieldJsonStr).map({ v => $varType.fromJsonValue(v) }).getOrDefault({ => $initExpr })
                    )
                } catch (_: ASTException) {
                    // Skip the exception
                }
                // Case 2: field type has default value
                if (let Some(defaultValue) <- getDefaultValueOfType(varType)) {
                    return quote(
                        $fieldName: $varType.fromJsonValue(jo.get($fieldJsonStr).getOrDefault({ => $defaultValue }))
                    )
                } else{ // Case 3: field has no default value
                    return quote(
                        $fieldName: $varType.fromJsonValue(jo.get($fieldJsonStr).getOrThrow({ => throw JsonableException("Get JSON object field error")}))
                    )
                }

            } |>
            collectArrayList,
        Token(TokenKind.COMMA)
    )
    return quote(
        public static func fromJsonValue(json: JsonValue): $className {
            let jo: JsonObject = match (json.kind()) {
                case JsonKind.JsObject => json.asObject()
                case _ => throw JsonableException("Get JSON object error.")
            }
            return $className(
                $body
            )
        }
    )
}

private func buildToJsonMethod(attr: JsonableAttr): Tokens {
    let body = Tokens()
    for (varDecl in attr.variables) {
        let varName = varDecl.identifier.value

        let fieldName = if (varName.startsWith("`")) {
            varName[1..(varName.size - 1)]
        } else {
            varName
        }
        let tempVar = newIdentifierToken("__TEMP_OF__${fieldName}")
        let fieldJsonname = attr.variableJsonnames.get(varName) ?? fieldName
        // A field of type Option means it's a non-required fields,
        // so, if its value is JsonNull, skip it.
        if (isOption(varDecl.declType)) {
            body.append(quote(
                let $tempVar = $(newIdentifierToken(varName)).toJsonValue()
                match ($tempVar.kind()) {
                    case JsonKind.JsNull => ()
                    case _ => map.add($(newLiteralToken(fieldJsonname)), $tempVar)
                }
            ))
        } else {
            body.append(quote(
                map.add($(newLiteralToken(fieldJsonname)), $(newIdentifierToken(varName)).toJsonValue())
            ))
        }
    }

    return quote(
        public func toJsonValue(): JsonValue {
            let map = HashMap<String, JsonValue>()
            $body
            return JsonObject(map)
        }
    )
}

private func transformJsonableEnum(enumDecl: EnumDecl, attr: JsonableAttr): Tokens {
    if (enumDecl.ellipsis.kind != TokenKind.ILLEGAL) {
        throw DslException("@jsonable should be used with exhaustive enum")
    }
    let ctorNames = ArrayList<String>()
    for (ctor in enumDecl.constructors) {
        if (!ctor.typeArguments.isEmpty()) {
            throw DslException("@jsonable enum cannot have constructors with type arguments")
        }
        ctorNames.add(ctor.identifier.value)
    }

    let name = enumDecl.identifier
    let allSuperTypes = if (enumDecl.superTypes.isEmpty()) {
        quote(Jsonable<$name>)
    } else {
        quote(Jsonable<$name> & $(enumDecl.superTypes.toTokens()))
    }
    let getTypeSchemaMethod = buildEnumGetTypeSchemaMethod(ctorNames)
    let fromJsonMethod = buildEnumFromJsonMethod(name, ctorNames)
    let toJsonMethod = buildEnumToJsonMethod(name, ctorNames)

    // Compose all `Tokens`
    return quote(
        $(enumDecl.modifiers) enum $name <: $allSuperTypes {
            $(enumDecl.decls)
            $(enumDecl.constructors)
            $getTypeSchemaMethod
            $fromJsonMethod
            $toJsonMethod
        }
    )
}

private func buildEnumGetTypeSchemaMethod(ctorNames: ArrayList<String>): Tokens {
    let values = joinTokens(
        ctorNames |> map { ctorName => newLiteralToken(ctorName) } |> collectArrayList,
        Token(TokenKind.COMMA)
    )
    return quote(
        public static func getTypeSchema(): TypeSchema {
            return TypeSchema.Enum([ $values ])
        }
    )
}

private func buildEnumFromJsonMethod(enumName: Token, ctorNames: ArrayList<String>): Tokens {
    let matchBody = Tokens()
    for (ctorName in ctorNames) {
        matchBody.append(quote(
            case $( newLiteralToken(ctorName) ) => $enumName.$( newIdentifierToken(ctorName) )
        ))
    }

    return quote(
        public static func fromJsonValue(json: JsonValue): $enumName {
            let js: JsonString = match (json.kind()) {
                case JsonKind.JsString => json.asString()
                case _ => throw JsonableException("Get JSON string error.")
            }
            return match (js.getValue()) {
                $matchBody
                case _ => throw JsonableException("${js} is not listed in the enumerated strings.")
            }
        }
    )
}

private func buildEnumToJsonMethod(enumName: Token, ctorNames: ArrayList<String>): Tokens {
    let matchBody = Tokens()
    for (ctorName in ctorNames) {
        matchBody.append(quote(
            case $enumName.$( newIdentifierToken(ctorName) ) => JsonString( $( newLiteralToken(ctorName) ) )
        ))
    }
    return quote(
        public func toJsonValue(): JsonValue {
            return match (this) {
                $matchBody
            }
        }
    )
}