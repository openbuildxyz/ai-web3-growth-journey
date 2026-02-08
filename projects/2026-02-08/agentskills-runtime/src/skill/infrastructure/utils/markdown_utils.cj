/*
 * Copyright (c) 2026. All rights reserved.
 */
package magic.skill.infrastructure.utils

import std.collection.ArrayList
import commonmark4cj.commonmark.*

/**
 * Markdown utilities for processing markdown content using the commonmark4cj library from the Cangjie ecosystem.
 */
public class MarkdownUtils {
    /**
     * Parse markdown content
     */
    public static func parseMarkdownContent(content: String): String {
        // Use the commonmark4cj library to parse markdown content
        let parser = Parser.builder().build()
        let document = parser.parse(content)

        // For now, return the original content
        // In a real implementation, we would process the document node
        return content
    }

    /**
     * Extract sections from markdown
     */
    public static func extractSections(markdown: String): Array<String> {
        let lines = markdown.split("\n")
        let sections = ArrayList<String>()
        
        var currentSection = ""
        for (line in lines) {
            if (line.startsWith("# ")) {
                // Found a top-level heading, save the previous section
                if (!currentSection.isEmpty()) {
                    sections.add(currentSection.trimAscii())
                }
                currentSection = line + "\n"
            } else if (line.startsWith("## ") || line.startsWith("### ")) {
                // Found a sub-heading, add to current section
                currentSection += line + "\n"
            } else {
                // Regular content, add to current section
                currentSection += line + "\n"
            }
        }
        
        // Add the last section if it exists
        if (!currentSection.isEmpty()) {
            sections.add(currentSection.trimAscii())
        }
        
        return sections.toArray()
    }

    /**
     * Render markdown to HTML
     */
    public static func renderToHtml(markdown: String): String {
        // Use the commonmark4cj library to render markdown to HTML
        let parser = Parser.builder().build()
        let document = parser.parse(markdown)

        let renderer = HtmlRenderer.builder().build()
        return renderer.render(document)
    }
}