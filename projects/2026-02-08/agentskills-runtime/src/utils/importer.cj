/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2024-2025. All rights reserved.
 */
package magic.utils

import std.fs.{File, Path, exists, OpenMode, FileInfo}
import std.io.StringReader
import std.collection.{HashMap, ArrayList, ArrayQueue, map, enumerate, collectArray}
import std.deriving.Derive

/**
 * Helper struct to hold file content and its container file path
 */
@Derive[ToString]
private struct Ref {
    Ref(
        let referencePath: String, // The referenced path, e.g. @a/b/c
        let containerFile: Option<Path> // The file that contains this reference
    ) { }
}

public struct ImportedFile {
    ImportedFile(
        public let referencePath: String,
        public let filePath: Path,
        public let content: String,
        public let truncated: Bool
    ) { }
}

/**
 * File importer utility for processing file references in strings
 */
public class Importer {
    /**
     * Directories to search for imported files, in order
     */
    private let searchDirs: Array<String>

    /**
     * Whether to include line numbers in imported file content
     */
    private let withLineNumber: Bool

    /**
     * Record of already processed files to prevent circular references
     */
    private let processedFiles = HashMap<String, Bool>() // Prevent circular references

    /**
     * Initialize importer with search directories
     */
    public init(searchDirs: Array<String>, withLineNumber!: Bool = false) {
        this.searchDirs = searchDirs
        this.withLineNumber = withLineNumber
    }

    /**
     * Parse string and import all referenced files using queue-based approach
     * Returns array of (filePath, content) tuples
     */
    public func importFiles(str: String, lineLimit!: Int64 = 100): Array<ImportedFile> {
        // Clear processed files record (start fresh for each call)
        processedFiles.clear()

        let results = ArrayList<ImportedFile>()
        let queue = ArrayQueue<Ref>()

        // Add initial references from the input string
        let initialReferences = extractReferences(str)
        for (ref in initialReferences) {
            queue.add(Ref(ref, None))  // No container file for top-level references
        }

        // Process queue until empty
        while (let Some(currentRef) <- queue.remove()) {
            if (let Some(importedFile) <- importSingleFile(currentRef, lineLimit)) {
                // Add the result to our results
                results.add(importedFile)

                // Extract references from the file content and add to queue
                let newReferences = extractReferences(importedFile.content)
                for (newRef in newReferences) {
                    queue.add(Ref(newRef, importedFile.filePath))
                }
            }
        }

        return results.toArray()
    }

    /**
     * Extract all file references from string of format @a/b/c
     */
    private func extractReferences(str: String): Array<String> {
        let result = ArrayList<String>()
        let runes = str.toRuneArray()
        var i = 0

        while (i < runes.size) {
            if (runes[i] == r'@') {
                let startIndex = i + 1
                var endIndex = startIndex

                while (endIndex < runes.size &&
                    (runes[endIndex] == r'/' ||
                        runes[endIndex] == r'.' ||
                        runes[endIndex] == r'_' ||
                        runes[endIndex] == r'-' ||
                        runes[endIndex].isAsciiNumberOrLetter())) {
                    endIndex += 1
                }

                if (endIndex > startIndex) {
                    let path = String(runes[startIndex..endIndex])
                    // Validate the path before adding
                    if (isValidPath(path)) {
                        result.add(path)
                    }
                }

                i = endIndex
            } else {
                i += 1
            }
        }

        return result.toArray()
    }

    /**
     * Validate if a path is valid and exists
     */
    private func isValidPath(path: String): Bool {
        // Skip empty paths or paths starting with '/'
        if (path.isEmpty() || path.startsWith("/")) {
            return false
        }
        return true
    }

    /**
     * Import a single file and return (Path, content) tuple
     */
    private func importSingleFile(ref: Ref, lineLimit: Int64): Option<ImportedFile> {
        let filePath = ref.referencePath

        // Check if it's an absolute path (not allowed)
        if (Path(filePath).isAbsolute()) {
            return None
        }
        // Security check: prevent path traversal attacks
        if (filePath.contains("..") || filePath.contains("~/")) {
            return None
        }

        // Search for files in searchDirs order
        for (basePath in searchDirs) {
            // Construct full path, considering container file if any
            // Case 1: if base path is ".", which means the referred path is relative to the container file
            let fullPath = if (basePath == ".") {
                // Case 1.1: relative to the container file path
                if (let Some(containerFilePath) <- ref.containerFile) {
                    let dir = containerFilePath.parent
                    if (dir.isEmpty()) {
                        Path(filePath)
                    } else {
                        dir.join(filePath)
                    }
                } else { // Case 1.2: if it does not have a container file, it's relative to the current dir
                    Path(filePath)
                }
            } else { // Case 2: otherwise, the path is relative to the base path
                Path(basePath).join(filePath)
            }
            // Check if file exists
            if (exists(fullPath) && FileInfo(fullPath).isRegular()) {
                // Check if this file has been processed before (prevent circular references)
                let canonicalPath = canonicalize(fullPath).toString()
                if (processedFiles.contains(canonicalPath)) {
                    return None  // Circular reference detected
                }

                // Mark as processed
                processedFiles[canonicalPath] = true

                // Read file content
                let (isTruncated, content) = readFileWithTruncateInfo(
                    fullPath,
                    startLine: 1,
                    endLine: lineLimit,
                    withLineNumber: this.withLineNumber
                )
                return ImportedFile(ref.referencePath, fullPath, content, isTruncated)
            }
        }

        // File not found
        return None
    }
}