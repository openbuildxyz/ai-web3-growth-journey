/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.examples.doc_generator

import std.ast.*
import std.collection.ArrayList

private func isPublicDecl(decl: Decl): Bool {
    var isPublic = false
    for (m in decl.modifiers) {
        if (m.keyword.value == "public") {
            isPublic = true
        }
    }
    return isPublic
}

func isApiTypeDecl(decl: Decl): Bool {
    if (!isPublicDecl(decl)) {
        return false
    }
    if (decl.identifier.value.startsWith("__")) {
        return false
    }
    match (decl.keyword.value) {
        case "class" | "enum" | "struct" | "interface" => true
        case _ => false
    }
}

func isApiMemberDecl(decl: Decl): Bool {
    if (!isPublicDecl(decl)) {
        return false
    }
    match (decl.keyword.value) {
        case "func" | "prop" | "init" | "operator" | "let" | "var" => true
        case _ => false
    }
}

class AstFile {
    private let fileLines: Array<String>

    init(content: String) {
        // File line numbers starts from 1, so adding an empty line at the beginning
        this.fileLines = "\n${content}".split("\n")
    }

    operator func[](index: Int64): String {
        return fileLines[index]
    }

    func extractDeclComment(beginPos: Position): String {
        var beginLineNo = Int64(beginPos.line)
        // Check whether the decl has a comment prefix
        var curr = beginLineNo - 1
        if (fileLines[curr].trimAscii().endsWith("*/")) {
            while (!fileLines[curr].trimAscii().startsWith("/*")) {
                curr -= 1
            }
            // println("Decl comment: ${curr}, ${beginLineNo}")
            return String.join(fileLines[curr..beginLineNo], delimiter: "\n")
        } else if (fileLines[curr].trimAscii().startsWith("//")) {
            while (fileLines[curr].trimAscii().startsWith("//")) {
                curr -= 1
            }
            curr += 1
            // println("Decl comment: ${curr}, ${beginLineNo}")
            return String.join(fileLines[curr..beginLineNo], delimiter: "\n")
        }else {
            return ""
        }
    }

    func extractDeclComment(decl: Decl): String {
        return extractDeclComment(decl.beginPos)
    }

    private func extractDeclWithComment(decl: Decl): String {
        var beginLineNo = Int64(decl.beginPos.line)
        let endLineNo = Int64(decl.endPos.line)
        // println("Decl: ${beginLineNo}, ${endLineNo}")
        let comment = extractDeclComment(decl)
        let declContent = String.join(fileLines[beginLineNo..(endLineNo+1)], delimiter: "\n")
        if (comment.isEmpty()) {
            return declContent
        } else {
            return comment + "\n" + declContent
        }
    }

    func extractMemberDecls(body: Body, needCheck!: Bool): ArrayList<String> {
        return extractMemberDecls(body.decls, needCheck: needCheck)
    }

    func extractMemberDecls(decls: ArrayList<Decl>, needCheck!: Bool): ArrayList<String> {
        let buffer = ArrayList<String>()
        for (memberDecl in decls) {
            if (needCheck && !isApiMemberDecl(memberDecl)) {
                continue
            }
            let declContent = extractDeclWithComment(memberDecl)
            buffer.add(declContent)
            buffer.add("")
        }
        return buffer
    }

}