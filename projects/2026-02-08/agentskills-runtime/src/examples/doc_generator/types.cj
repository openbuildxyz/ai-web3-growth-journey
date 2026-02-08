/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.examples.doc_generator

import magic.dsl.*
import magic.prelude.*

import std.ast.*
import std.sort.SortExtension

@jsonable
class Doc <: ToString {
    @field["Name of the package"]
    var packageName: String

    let typeDefs: Array<TypeDef>

    override public func toString(): String {
        let sb = StringBuilder()
        sb.append("## Package ${packageName}\n")
        for (t in typeDefs) {
            sb.append("${t}\n")
        }
        return sb.toString()
    }
}

@jsonable
class TypeDef <: ToString {
    @field["Available values: enum, class, struct, interface"]
    let kind: String

    @field["Name of the type definition"]
    let name: String

    @field["A list of member definition"]
    let memberDefs: Array<MemberDef>

    override public func toString(): String {
        let sb = StringBuilder()
        sb.append("### ${kind} ${name}\n")
        for (m in this.sortedMemberDefs) {
            sb.append("${m}\n\n")
        }
        return sb.toString()
    }

    prop sortedMemberDefs: Array<MemberDef> {
        get() {
            let members = ArrayList(this.memberDefs)
            members.sortBy(comparator: { m1, m2 =>
                return m1.name.compare(m2.name)
            })
            return members.toArray()
        }
    }
}

@jsonable
class MemberDef <: ToString {
    @field["Available values: prop, func, let, var, enumeration (for enum types)"]
    let kind: String

    @field["Name of the definition"]
    let name: String

    @field["Complete signature of the definition."
           "For example,"
           "- function signature: func foo(arg: String): Int64"
           "- operator function signature: operator func[](idx: Int64): String"
           "- prop signature: prop bar: Int64"
           "- variable signature: let a: Int64"
           "- enumeration signature: B(String)"]
    let signature: String

    @field["Functionality description of the member. It must be In Chinese. For example, description: 根据用户问题，在内存中查找相关内容"]
    let description: String

    @field["If kind is func, parameter descriptions are provided"]
    let parameters: Array<Parameter>

    private func getModifier(): String {
        if (kind == "enumeration") {
            return ""
        }
        return kind
    }

    private func getName(): String {
        if (kind == "func") {
            if (signature.contains("operator")) {
                return "operator ${name}"
            }
        }
        return name
    }

    override public func toString(): String {
        let s = ArrayList([
            "#### ${this.getModifier()} ${this.getName()}",
            "```",
            "${signature}",
            "```",
            "- Description: ${description}"
        ])
        if (!parameters.isEmpty()) {
            s.add("- Parameters:")
        }
        for (p in parameters) {
            s.add("  - ${p}")
        }
        return String.join(s.toArray(), delimiter: "\n")
    }
}

@jsonable
class Parameter <: ToString {
    @field["Name of the parameter"]
    let name: String
    @field["Type name of the parameter"]
    let typeName: String
    @field["Description of the parameter. In Chinese"]
    let description: String

    override public func toString(): String {
        return "`${name}`: `${typeName}`, ${description}"
    }
}

