/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.examples.doc_generator

import magic.config.Config
import magic.utils.{canonicalize, directoryOf, fileNameWithoutExt, isRegularFile, fileExt, exists, readFile, writeFile}

import std.ast.*
import std.collection.{ArrayList, HashMap}
import std.sort.SortExtension
import std.fs.{File, OpenMode, Directory, Path}
import std.io.{StringWriter}

import stdx.encoding.json.JsonValue

private let SRC_DIR = "./src"
private let OUT_DIR = "./temp-docs"

/**
 * Read a Cangjie file and filter out the API type definitions.
 */
private func readAndFilterCJFile(path: Path): String {
    let buffer = ArrayList<String>()
    let content = readFile(path)
    let program = parseProgram(cangjieLex(content))
    // File line numbers starts from 1, so adding an empty line at the beginning
    let astFile = AstFile(content)
    for (topDecl in program.decls) {
        if (!isApiTypeDecl(topDecl)) {
            continue
        }
        buffer.add(astFile.extractDeclComment(topDecl))
        buffer.add(astFile[Int64(topDecl.beginPos.line)])

        if (topDecl.keyword.value == "class") {
            let classDecl = (topDecl as ClassDecl).getOrThrow()
            buffer.add(all: astFile.extractMemberDecls(classDecl.body, needCheck: true))
        } else if (topDecl.keyword.value == "struct") {
            let structDecl = (topDecl as StructDecl).getOrThrow()
            buffer.add(all: astFile.extractMemberDecls(structDecl.body, needCheck: true))
        } else if (topDecl.keyword.value == "interface") {
            let interfaceDecl = (topDecl as InterfaceDecl).getOrThrow()
            buffer.add(all: astFile.extractMemberDecls(interfaceDecl.body, needCheck: false))
        } else if (topDecl.keyword.value == "enum") {
            let enumDecl = (topDecl as EnumDecl).getOrThrow()
            for (constructor in enumDecl.constructors) {
                let pos = constructor.toTokens()[0].pos
                // There is a bug of ast, we cannot use `constructor.beginPos` directly
                buffer.add(astFile.extractDeclComment(pos))
                buffer.add(astFile[Int64(pos.line)])
                buffer.add("")
            }
            buffer.add(all: astFile.extractMemberDecls(enumDecl.decls, needCheck: true))
        }

        buffer.add("}")
    }
    return String.join(buffer.toArray(), delimiter: "\n")
}

//------------------------------------------------------------------------

func checkFile(path: Path): Bool {
    let content = readFile(path)
    let targets = ["public enum", "public class", "public struct", "public interface"]
    for (target in targets) {
        if (content.contains(target)) {
            return true
        }
    }
    return false
}

let blacklist = [
    "openai", "ollama", "zhipuai", "dashscope", "siliconflow",
    "llamacpp", "main", "prompt", "tests", "examples", "dsl", "utils"
]

private func getFilesImpl(dirPath: Path, ext: String, result: ArrayList<Path>): Unit  {
    Directory.walk(dirPath) { fileInfo =>
        let filePath = canonicalize(fileInfo.path)
        println(filePath)
        if (blacklist.contains(fileNameWithoutExt(filePath))) {
            return true
        } else if (isRegularFile(fileInfo) && fileExt(filePath) == ext) {
            if (checkFile(filePath)) {
                result.add(fileInfo.path)
            }
        } else if (fileInfo.isDirectory()) {
            getFilesImpl(filePath, ext, result)
        }
        return true // Continue walking
    }
}

func getCJFiles(dirPath: Path): ArrayList<Path> {
    let result = ArrayList<Path>()
    getFilesImpl(dirPath, "cj", result)
    return result
}

//------------------------------------------------------------------------

@When[os != "Windows"]
const SEPARATOR = "/"
@When[os == "Windows"]
const SEPARATOR = "\\"

/**
 * Input: <path>/src/a/b/c/d.cj
 * Output: a.b.c
 */
func getPackageName(path: Path): String {
    let pkgPath = directoryOf(canonicalize(path)).toString()
    let target = "${SEPARATOR}src${SEPARATOR}"
    let idx = pkgPath.indexOf(target).getOrThrow()
    return pkgPath[(idx + target.size)..].replace(SEPARATOR, ".")
}

func buildFileDocs(files: ArrayList<Path>, outDir: Path): ArrayList<Doc> {
    let docs = ArrayList<Doc>()
    let agent = DocAgent()
    for (path in files) {
        // println(pkgName)
        let pkgName = getPackageName(path)
        let docPath = outDir.join("${pkgName}.${path.fileNameWithoutExtension}.json")
        println(path.toString())
        if (exists(docPath)) {
            println("Skip ${docPath}. Already exists.")
            continue
        }
        let content = readAndFilterCJFile(path)
        let result = agent.chatGet<Doc>(("code", content))
        if (let Some(doc) <- result) {
            doc.packageName = pkgName
            writeFile(docPath, doc.toJsonValue().toJsonString())
            println(doc.toJsonValue().toJsonString())
            docs.add(doc)
        }
        println("------------------------")
    }
    return docs
}

func buildPackageToc(packageName: String, typeDefs: ArrayList<TypeDef>): String {
    let linkNameCount = HashMap<String, Int64>()
    let createLinkName = { title: String =>
        var linkName = "#" + title.toAsciiLower().replace(" ", "-")
        if (linkNameCount.contains(linkName)) {
            let count = linkNameCount[linkName]
            linkName = "${linkName}-${count}"
            linkNameCount.add(linkName, count + 1)
        } else {
            linkNameCount.add(linkName, 1)
        }
        return linkName
    }

    let sb = StringBuilder()
    let packageTitle = "Package ${packageName}"
    let packageLinkName = createLinkName(packageTitle)
    sb.append("- [${packageTitle}](${packageLinkName})\n")

    for (typeDef in typeDefs) {
        let typeTitle = "${typeDef.kind} ${typeDef.name}"
        let typeLinkName = createLinkName(typeTitle)
        sb.append("  - [${typeTitle}](${typeLinkName})\n")
        for (memberDef in typeDef.sortedMemberDefs) {
            let memberTitle = "${memberDef.kind} ${memberDef.name}"
            let memberLinkName = createLinkName(memberTitle)
            sb.append("    - [${memberTitle}](${memberLinkName})\n")
        }
    }
    return sb.toString()
}

private func loadFileDocs(dirPath: Path): ArrayList<Doc> {
    let docs = ArrayList<Doc>()
    Directory.walk(dirPath) { fileInfo =>
        if (isRegularFile(fileInfo) && fileExt(fileInfo.path) == "json") {
            let content = readFile(fileInfo.path)
            let doc = Doc.fromJsonValue(JsonValue.fromStr(content))
            docs.add(doc)
        }
        return true
    }
    return docs
}

func mergeFileDocs(outDir: Path, docs!: Option<ArrayList<Doc>>): Unit  {
    // Merge all type definitions according to their package names
    let allDocs = HashMap<String, ArrayList<TypeDef>>()
    for (doc in docs ?? loadFileDocs(outDir)) {
        if (!allDocs.contains(doc.packageName)) {
            allDocs.add(doc.packageName, ArrayList<TypeDef>())
        }
        allDocs[doc.packageName].add(all: doc.typeDefs)
    }
    // Sort all package names in order
    let sortedPackageNames = allDocs.keys().toArray()
    sortedPackageNames.sort()

    // Create the Toc file
    try (tocFile = File(outDir.join("api_reference.md"),
                        OpenMode.Write)) {
        let tocWriter = StringWriter(tocFile)
        tocWriter.write("# API Reference\n\n")
        for (packageName in sortedPackageNames) {
            tocWriter.write("- 📁 [${packageName}](./package_docs/${packageName}.md)\n")
            tocWriter.flush()
        }
    }
    // Create the package docs directory
    let packageDocDir = outDir.join("package_docs")
    if (!exists(packageDocDir)) {
        Directory.create(packageDocDir, recursive: true)
    }
    // Create the package docs
    for (packageName in sortedPackageNames) {
        let packageDocPath = packageDocDir.join("${packageName}.md")
        // Sort types in order
        let typeDefs = allDocs[packageName]
        typeDefs.sortBy(comparator: { t1, t2 =>
            return t1.name.compare(t2.name)
        })

        try (packageDocFile = File(packageDocPath, OpenMode.Write)) {
            let packageDocWriter = StringWriter(packageDocFile)
            packageDocWriter.write("## Package ${packageName}\n")
            packageDocWriter.write(buildPackageToc(packageName, typeDefs))
            packageDocWriter.write("\n")
            for (typeDef in typeDefs) {
                packageDocWriter.write(typeDef.toString())
                packageDocWriter.write("\n")
            }
            packageDocWriter.flush()
        }
    }
}

main() {
    Config.logLevel = "DEBUG"
    Config.logFile = "./logs/abc.log"

    if (!exists(OUT_DIR)) {
        Directory.create(OUT_DIR, recursive: true)
    }

    let files = getCJFiles(Path(SRC_DIR))
    let docs = buildFileDocs(files, Path(OUT_DIR))
    mergeFileDocs(Path(OUT_DIR), docs: docs)
    // mergeFileDocs(Path(OUT_DIR), docs: None)
}