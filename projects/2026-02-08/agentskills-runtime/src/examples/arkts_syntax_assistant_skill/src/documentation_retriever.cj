/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.arkts_syntax_assistant_skill.src

import std.collection.{HashMap, ArrayList}
import std.fs.{File, Path, exists, Directory}
import std.core.StringBuilder
import std.regex.Regex
import std.regex.RegexOption
import magic.log.LogUtils as Utils
import stdx.encoding.json.JsonValue


/**
 * Documentation Retriever for ArkTS Syntax Assistant
 * Retrieves relevant information from ArkTS documentation based on user queries
 */
public class DocumentationRetriever {
    private let docsPath: String
    private var cachedDocs: Option<String> = None

    public init(docsPath!: String = "./docs") {
        this.docsPath = docsPath
    }

    /**
     * Retrieve relevant information from documentation based on the query
     */
    public func retrieveInfo(query: String): String {
        Utils.debug("Retrieving information for query: ${query}")

        // First, try to load documentation content
        let docsContentOpt = loadDocumentation()
        if (docsContentOpt.isNone()) {
            // If no documentation is found, return a simple error response
            return "{\"error\":\"No documentation available\",\"message\":\"Could not find or load ArkTS documentation files\"}"
        }

        let docsContent = docsContentOpt.getOrThrow()

        // Search for relevant sections in the documentation
        let relevantContentOpt = searchInDocumentation(query, docsContent)

        if (relevantContentOpt.isNone()) {
            // If no relevant content found, return a default response
            return "{\"error\":\"No relevant information found\",\"query\":\"${query.replace("\"", "\\\"")}\"}"
        }

        let relevantContent = relevantContentOpt.getOrThrow()

        // Format the result as JSON
        return formatAsJsonResponse(query, relevantContent)
    }

    /**
     * Load ArkTS documentation content from files
     */
    private func loadDocumentation(): Option<String> {
        if (this.cachedDocs.isSome()) {
            return this.cachedDocs
        }

        // Look for ArkTS documentation files in the specified directory
        let arktsDocFiles = findArkTSDocFiles()

        if (arktsDocFiles.size == 0) {
            Utils.debug("No ArkTS documentation files found in: ${this.docsPath}")
            return None
        }

        // Read and concatenate all documentation files
        let contentBuilder = StringBuilder()
        for (filePath in arktsDocFiles) {
            try {
                let fileContent = String.fromUtf8(File.readFrom(Path(filePath)))
                contentBuilder.append("\n\n--- DOCUMENT: ${filePath} ---\n\n")
                contentBuilder.append(fileContent)
            } catch (ex: Exception) {
                Utils.debug("Could not read documentation file ${filePath}: ${ex.message}")
            }
        }

        let fullContent = contentBuilder.toString()
        this.cachedDocs = Some(fullContent)
        Utils.debug("Loaded ArkTS documentation from ${arktsDocFiles.size} files")
        return Some(fullContent)
    }

    /**
     * Find ArkTS documentation files in the specified directory
     */
    private func findArkTSDocFiles(): Array<String> {
        let docFiles = ArrayList<String>()

        // Look for common ArkTS documentation file patterns
        let patterns = [
            "${this.docsPath}/README.md",
            "${this.docsPath}/SKILL.md",
            "${this.docsPath}/SKILL.zh.md"
        ]

        // Also check in subdirectories like references/
        let refPatterns = [
            "${this.docsPath}/references/zh/introduction-to-arkts.md",
            "${this.docsPath}/references/zh/arkts-get-started.md",
            "${this.docsPath}/references/zh/typescript-to-arkts-migration-guide.md",
            "${this.docsPath}/references/zh/arkts-migration-background.md",
            "${this.docsPath}/references/zh/arkts-high-performance-programming.md",
            "${this.docsPath}/references/zh/arkts-more-cases.md",
            "${this.docsPath}/references/en/introduction-to-arkts.md",
            "${this.docsPath}/references/en/arkts-get-started.md",
            "${this.docsPath}/references/en/typescript-to-arkts-migration-guide.md",
            "${this.docsPath}/references/en/arkts-migration-background.md",
            "${this.docsPath}/references/en/arkts-high-performance-programming.md",
            "${this.docsPath}/references/en/arkts-more-cases.md"
        ]

        // Check for all possible file locations
        for (pattern in patterns) {
            if (exists(Path(pattern))) {
                docFiles.add(pattern)
            }
        }

        for (pattern in refPatterns) {
            if (exists(Path(pattern))) {
                docFiles.add(pattern)
            }
        }

        // Also look for any markdown files in the directory
        try {
            let dirPath = Path(this.docsPath)
            if (exists(dirPath) && dirPath.toString().endsWith("/")) {  // Check if path refers to a directory
                // For now, we'll skip this functionality as the API might differ
                // The main patterns should be sufficient for most cases
            }
        } catch (ex: Exception) {
            Utils.debug("Error scanning documentation directory: ${ex.message}")
        }

        return docFiles.toArray()
    }

    /**
     * Search for relevant content in the documentation based on the query
     */
    private func searchInDocumentation(query: String, docsContent: String): Option<String> {
        let lowerQuery = query.toAsciiLower()
        let queryTerms = extractQueryTerms(lowerQuery)

        // Split the documentation into sections (by headers or major divisions)
        let sections = splitIntoSections(docsContent)
        var bestMatch: Option<String> = None
        var bestScore: Int32 = 0

        for (section in sections) {
            let score = calculateRelevanceScore(section, queryTerms)
            if (score > bestScore) {
                bestScore = score
                bestMatch = Some(section)
            }
        }

        if (bestMatch.isSome()) {
            return bestMatch
        }

        // If no section matches well, try keyword-based search
        let keywordMatch = findKeywordMatches(queryTerms, docsContent)
        if (!keywordMatch.isEmpty()) {
            return Some(keywordMatch)
        }

        return None
    }

    /**
     * Split documentation into sections based on markdown headers
     */
    private func splitIntoSections(docsContent: String): Array<String> {
        // Split by lines and identify sections based on markdown headers (lines starting with #)
        let lines = docsContent.split("\n")
        let sections = ArrayList<String>()
        var currentSectionContent = ""

        for (line in lines) {
            if (line.startsWith("#")) {
                // If we have accumulated content in current section, add it to sections
                let sectionStr = currentSectionContent.trimAscii()
                if (!sectionStr.isEmpty()) {
                    sections.add(sectionStr)
                }
                // Start a new section with the header line
                currentSectionContent = line + "\n"
            } else {
                // Add non-header line to current section
                currentSectionContent += line + "\n"
            }
        }

        // Add the last section if it has content
        let lastSectionStr = currentSectionContent.trimAscii()
        if (!lastSectionStr.isEmpty()) {
            sections.add(lastSectionStr)
        }

        // If no sections were identified (no headers found), return the whole content as one section
        if (sections.size == 0) {
            sections.add(docsContent)
        }

        return sections.toArray()
    }

    /**
     * Calculate relevance score between a section and query terms
     */
    private func calculateRelevanceScore(section: String, queryTerms: Array<String>): Int32 {
        var score: Int32 = 0
        let lowerSection = section.toAsciiLower()
        
        for (term in queryTerms) {
            // Score higher for exact matches in headers or early in the section
            if (lowerSection.startsWith("#") && lowerSection.contains(term)) {
                score += 10  // Higher score for matches in headers
            } else if (lowerSection.contains(" " + term + " ") || 
                      lowerSection.contains(" " + term + ",") || 
                      lowerSection.contains(" " + term + ".") ||
                      lowerSection.contains(term + ":") ||
                      lowerSection.contains("," + term + ",")) {
                score += 5  // Standard score for word boundary matches
            } else if (lowerSection.contains(term)) {
                score += 1  // Lower score for substring matches
            }
        }
        
        return score
    }

    /**
     * Extract key terms from the query for matching
     */
    private func extractQueryTerms(query: String): Array<String> {
        // Remove common stop words and extract key terms
        let stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "how", "what", "when", "where", "why", "which", "who", "can", "could", "would", "should", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "should", "may", "might", "must", "shall"]
        
        let terms = ArrayList<String>()
        let words = query.split(" ")
        for (word in words) {
            let cleanWord = word.trimAscii().replace(",", "").replace(".", "").replace("?", "").replace("!", "").replace(";", "").replace(":", "")
            if (!stopWords.contains(cleanWord.toAsciiLower()) && cleanWord.size > 2) {
                terms.add(cleanWord)
            }
        }

        return terms.toArray()
    }

    /**
     * Find content based on keyword matching if semantic search fails
     */
    private func findKeywordMatches(queryTerms: Array<String>, docsContent: String): String {
        let matches = ArrayList<String>()
        
        for (term in queryTerms) {
            // Find paragraphs containing the term
            let paragraphs = docsContent.split("\n\n")  // Split by paragraph breaks
            for (paragraph in paragraphs) {
                if (paragraph.toAsciiLower().contains(term)) {
                    matches.add(paragraph)
                    if (matches.size >= 2) {
                        break  // Limit to 2 matches to avoid too much content
                    }
                }
            }
            if (matches.size >= 2) {
                break
            }
        }
        
        if (matches.size > 0) {
            return String.join(matches.toArray(), delimiter: "\n\n")
        }
        
        return ""
    }

    /**
     * Format the retrieved content as a JSON response
     */
    private func formatAsJsonResponse(query: String, content: String): String {
        // Clean up the content for JSON inclusion
        let cleanContent = content.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
        
        return """
{
"query": "${query.replace("\"", "\\\"")}",
"response_type": "documentation_retrieval",
"content": "${cleanContent}",
"source": "arkts_documentation",
"retrieval_method": "semantic_search"
}"""
    }
}