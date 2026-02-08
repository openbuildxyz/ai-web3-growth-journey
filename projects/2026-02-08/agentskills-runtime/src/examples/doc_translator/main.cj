/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2024. All rights reserved.
 */
package magic.examples.doc_translator

import magic.config.Config
import magic.utils.{readFile, writeFile, Color, Colorful}

import std.env.*
import std.argopt.*
import std.collection.ArrayList
import std.fs.{Path, FileInfo, Directory, canonicalize, exists}

var SOURCE_PATH = Path(".")
var TARGET_PATH = Path(".")

private func translate(content: String): String {
    let translator = Translator()
    // A file may exceed the LLM context, so we should split it as chunks,
    // and translate these chunks
    let lines = content.split("\n")
    let CHUNK_SIZE = 300 // If the chunk size is too long, LLM is error-prone
    var count = 1
    let result = ArrayList<String>()
    for (start in 0..lines.size:CHUNK_SIZE) {
        println("  Chunks: ${count}/${(lines.size + CHUNK_SIZE - 1) / CHUNK_SIZE}")
        var end = start + CHUNK_SIZE
        if (end > lines.size) {
            end = lines.size
        }
        let chunk = String.join(lines[start..end], delimiter: "\n")
        result.add(translator.chat(chunk))
        count += 1
    }
    return String.join(result.toArray(), delimiter: "\n")
}

private func translateDoc(docPath: Path, newPath: Path): Unit {
    let doc = readFile(docPath)
    println("Process the doc: ${docPath.toString().withColor(Color.Blue)}")
    let newDoc = translate(doc)
    println(newDoc)
    println("Save to ==> ${newPath.toString().withColor(Color.Green)}")
    writeFile(newPath, newDoc)
}

private func buildNewPath(docPath: Path): Path {
    // Since all paths are absolute, we replace the prefix directly
    let newPath = Path(
        docPath.toString().replace(
            SOURCE_PATH.toString(),
            TARGET_PATH.toString()
        )
    )
    // If the parent dir does not exist, create it
    if (!exists(newPath.parent)) {
        Directory.create(newPath.parent, recursive: true)
    }
    return newPath
}

private func translateFilesUnderDir(dirPath: Path, ext!: String): Unit {
    Directory.walk(dirPath) { fileInfo =>
        let path = canonicalize(fileInfo.path)
        if (fileInfo.isRegular() && path.extensionName == ext) {
            println(path)
            let newPath = buildNewPath(path)
            translateDoc(path, newPath)
        } else if (fileInfo.isDirectory()) {
            translateFilesUnderDir(path, ext: ext)
        }
        return true
    }
}

//===================================================================

private func parseArgs(args: Array<String>): Unit {
    let argSpecs = [
        Long("source", RequiredValue),
        Long("target", RequiredValue)
    ]
    try {
        let parsedArgs = parseArguments(args, argSpecs)
        let source = parsedArgs.options.get("source").getOrThrow()
        let target = parsedArgs.options.get("target").getOrThrow()
        SOURCE_PATH = canonicalize(source)
        TARGET_PATH = Path(target)
    } catch (_: ArgumentParseException) {
        dumpManual()
        exit(1)
    } catch (_: NoneValueException) {
        dumpManual()
        exit(1)
    }
}

private func dumpManual(): Unit {
    println("Magic Translator:")
    println('cjpm run --run-args "--source <path-to-markdown> --target <path-to-new-file>"')
}

main(args: Array<String>): Unit {
    Config.logLevel = "DEBUG"
    Config.logFile = "./logs/abc.log"
    // Config.defaultContextLen = 32000

    parseArgs(args)
    let fileInfo = FileInfo(SOURCE_PATH)
    if (fileInfo.isRegular()) {
        translateDoc(SOURCE_PATH, TARGET_PATH)
    } else {
        // If the target dir does not exist, create it
        if (!exists(TARGET_PATH)) {
            Directory.create(TARGET_PATH, recursive: true)
        }
        translateFilesUnderDir(SOURCE_PATH, ext: "md")
    }
}
