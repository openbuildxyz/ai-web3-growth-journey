/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import std.collection.HashMap
import std.convert

/**
 * Natural Language Processor for UCToo API Skills
 * Handles parsing of natural language requests and extraction of intent and parameters
 */
public class NaturalLanguageProcessor {
    public init() {
        
    }

    /**
     * Process a natural language request and extract intent and parameters
     */
    public func processRequest(request: String): HashMap<String, String> {
        Utils.logMessage("DEBUG", "Processing natural language request: " + request);
        
        let result = HashMap<String, String>()
        
        // Detect intent
        let intent = detectIntent(request)
        Utils.logMessage("DEBUG", "Detected intent: " + intent);
        result.add("intent", intent)
        
        // Extract parameters
        let params = extractParameters(request)
        let paramSizeVal = params.size;
let paramCountStr = paramSizeVal.toString();
Utils.logMessage("DEBUG", "Extracted " + paramCountStr + " parameters");
        for ((key, value) in params.iterator()) {
            result.add(key, value)
        }
        
        let resultSizeVal = result.size;
let resultCountStr = resultSizeVal.toString();
Utils.logMessage("DEBUG", "Completed processing request with " + resultCountStr + " results");
        
        return result
    }

    /**
     * Detect the intent from a natural language request
     */
    public func detectIntent(request: String): String {
        Utils.logMessage("DEBUG", "Detecting intent for request: " + request);

        let lowerRequest = request.toAsciiLower()

        // First, check for special non-standard endpoints like hello
        if (lowerRequest.contains("hello") || lowerRequest.contains("问候") || lowerRequest.contains("测试连接") ||
            lowerRequest.contains("调用hello") || lowerRequest.contains("hello接口")) {
            Utils.logMessage("DEBUG", "Detected hello endpoint request: " + request);
            return "HELLO_ENDPOINT"
        }

        // Define intent patterns with scoring
        let getIntentScore = calculateIntentScore(lowerRequest, [
            "get", "find", "retrieve", "show", "list", "fetch", "obtain", "acquire"
        ])
        let createIntentScore = calculateIntentScore(lowerRequest, [
            "create", "add", "new", "make", "generate", "build", "establish", "form"
        ])
        let updateIntentScore = calculateIntentScore(lowerRequest, [
            "update", "modify", "change", "edit", "alter", "adjust", "revise", "upgrade"
        ])
        let deleteIntentScore = calculateIntentScore(lowerRequest, [
            "delete", "remove", "destroy", "eliminate", "erase", "cancel", "drop", "clear"
        ])

        Utils.logMessage("DEBUG", "Intent scores - GET: " + getIntentScore.toString() + ", CREATE: " + createIntentScore.toString() + ", UPDATE: " + updateIntentScore.toString() + ", DELETE: " + deleteIntentScore.toString());

        // Determine the highest scoring intent
        let maxScore = max(getIntentScore, max(createIntentScore, max(updateIntentScore, deleteIntentScore)))

        let detectedIntent = if (maxScore == 0) {
            "UNKNOWN"
        } else if (maxScore == getIntentScore) {
            "GET"
        } else if (maxScore == createIntentScore) {
            "CREATE"
        } else if (maxScore == updateIntentScore) {
            "UPDATE"
        } else {
            "DELETE"
        }

        Utils.logMessage("DEBUG", "Detected intent: " + detectedIntent);

        return detectedIntent
    }

    /**
     * Calculate score for an intent based on keyword matches
     */
    private func calculateIntentScore(text: String, keywords: Array<String>): Int32 {
        var score: Int32 = 0
        let lowerText = text.toAsciiLower()

        for (keyword in keywords) {
            if (lowerText.contains(keyword)) {
                score += 1
            }
        }

        return score
    }

    /**
     * Extract parameters from a natural language request
     */
    public func extractParameters(request: String): HashMap<String, String> {
        Utils.logMessage("DEBUG", "Extracting parameters from request: " + request);
        
        let params = HashMap<String, String>()
        let lowerRequest = request.toAsciiLower()
        
        // Extract ID parameter (common patterns)
        let idPatterns = [
            "id\\s*(is|=|:)\\s*([a-zA-Z0-9\\-_]+)",
            "with\\s+id\\s+([a-zA-Z0-9\\-_]+)",
            "with\\s+identifier\\s+([a-zA-Z0-9\\-_]+)"
        ]
        
        for (pattern in idPatterns) {
            // Note: Actual regex implementation would depend on Cangjie's regex support
            // For now, using simplified string matching
            if (lowerRequest.contains("id ") || lowerRequest.contains("id:")) {
                Utils.logMessage("DEBUG", "Found 'id' in request, extracting ID value...");
                // Extract ID value after "id" or "id:"
                let parts = request.split(" ")
                for (i in 0..parts.size) {
                    if (parts[i].toAsciiLower().trimAscii() == "id" && i + 1 < parts.size) {
                        var idValue = parts[i + 1].trimAscii()
                        // Remove trailing punctuation
                        if (idValue.endsWith(",") || idValue.endsWith(".") || idValue.endsWith("!") || idValue.endsWith("?")) {
                            idValue = idValue[0..(idValue.size - 1)]
                        }
                        if (idValue.size > 0) {
                            params.add("id", idValue)
                            Utils.logMessage("DEBUG", "Extracted ID parameter: " + idValue);
                            break
                        }
                    }
                }
            }
        }
        
        // Extract name parameter
        if (lowerRequest.contains("named") || lowerRequest.contains("name is") || lowerRequest.contains("called")) {
            Utils.logMessage("DEBUG", "Found name-related keyword in request, extracting name...");
            let parts = request.split(" ")
            if (parts.size > 1) {
                var afterKeyword = parts[1].trimAscii()
                // Remove any trailing punctuation
                if (afterKeyword.endsWith(",") || afterKeyword.endsWith(".") || afterKeyword.endsWith("!") || afterKeyword.endsWith("?")) {
                    afterKeyword = afterKeyword[0..(afterKeyword.size - 1)]
                }
                params.add("name", afterKeyword)
                Utils.logMessage("DEBUG", "Extracted name parameter: " + afterKeyword);
            }
        }
        
        // Extract email parameter
        // Simplified email detection
        Utils.logMessage("DEBUG", "Looking for email addresses in request...");
        let words = request.split(" ")
        for (word in words) {
            let trimmedWord = word.trimAscii()
            if (trimmedWord.contains("@") && trimmedWord.contains(".") && 
                !trimmedWord.endsWith(",") && !trimmedWord.endsWith(".") && 
                !trimmedWord.endsWith("!") && !trimmedWord.endsWith("?")) {
                params.add("email", trimmedWord)
                Utils.logMessage("DEBUG", "Extracted email parameter: " + trimmedWord);
            }
        }
        
        // Extract other common parameters
        Utils.logMessage("DEBUG", "Extracting numeric parameters...");
        extractNumericParameters(request, params)
        
        // Additional specific extraction for Chinese login requests
        extractChineseLoginParameters(request, params)
        
        let totalParamSizeVal = params.size;
let totalParamCountStr = totalParamSizeVal.toString();
Utils.logMessage("DEBUG", "Parameter extraction completed. Total parameters: " + totalParamCountStr);
        
        return params
    }

    /**
     * Extract parameters specifically for Chinese login requests
     */
    private func extractChineseLoginParameters(request: String, params: HashMap<String, String>): Unit {
        Utils.logMessage("DEBUG", "Checking for Chinese login parameters in request: " + request);
        
        // Look for Chinese login patterns
        let lowerRequest = request.toAsciiLower()
        
        // Pattern: 账号/用户名/邮箱 + 值
        if (lowerRequest.contains("账号") || lowerRequest.contains("用户名") || lowerRequest.contains("邮箱")) {
            Utils.logMessage("DEBUG", "Found Chinese login identifier keywords in request");
            
            // Find username after keywords
            var startIndex = -1
            if (request.contains("账号")) {
                let idxOpt = request.indexOf("账号");
                if (idxOpt != None) {
                    startIndex = idxOpt.getOrThrow() + 2;
                }
            } else if (request.contains("用户名")) {
                let idxOpt = request.indexOf("用户名");
                if (idxOpt != None) {
                    startIndex = idxOpt.getOrThrow() + 3;
                }
            } else if (request.contains("邮箱")) {
                let idxOpt = request.indexOf("邮箱");
                if (idxOpt != None) {
                    startIndex = idxOpt.getOrThrow() + 2;
                }
            }
            
            if (startIndex != -1) {
                // Extract value after the keyword
                var remainingPart = request[startIndex..request.size].trimStart()

                // If it continues with '是' or '为', skip those
                if (remainingPart.startsWith("是") || remainingPart.startsWith("为")) {
                    let charIdx = if (remainingPart.startsWith("是")) {
                        1
                    } else {
                        2
                    };
                    remainingPart = remainingPart[charIdx..remainingPart.size].trimStart();
                }

                // Extract until next space, '和', '密码', or '登录'
                var usernameEnd = remainingPart.size
                for (i in 0..remainingPart.size) {
                    if (i < remainingPart.size) {
                        let charValue = remainingPart[i] as UInt16;
                        if (charValue == ' ' as UInt16 || charValue == '和' as UInt16 || charValue == '密' as UInt16 || charValue == '登' as UInt16) {
                            usernameEnd = i
                            break
                        }
                        
                        // Also check for two-character sequences like '登录'
                        if (i + 1 < remainingPart.size) {
                            let nextCharValue = remainingPart[i + 1] as UInt16;
                            if (charValue == '登' as UInt16 && nextCharValue == '录' as UInt16) {
                                usernameEnd = i
                                break
                            }
                        }
                    }
                }
                
                if (usernameEnd > 0) {
                    let username = remainingPart[0..usernameEnd];
                    params.add("username", username);
                    Utils.logMessage("DEBUG", "Extracted Chinese username parameter: " + username);
                }
            }
        }
        
        // Pattern: 密码 + 值
        if (lowerRequest.contains("密码")) {
            Utils.logMessage("DEBUG", "Found Chinese password keyword in request");

            let idxOpt = request.indexOf("密码");
            if (idxOpt != None) {
                let startIndex = idxOpt.getOrThrow() + 2;
                if (startIndex < request.size) {
                    // Extract value after the keyword
                    var remainingPart = request[startIndex..request.size].trimStart();

                    // If it continues with '是' or '为', skip those
                    if (remainingPart.startsWith("是") || remainingPart.startsWith("为")) {
                        let charIdx = if (remainingPart.startsWith("是")) {
                            1
                        } else {
                            2
                        };
                        remainingPart = remainingPart[charIdx..remainingPart.size].trimStart();
                    }

                    // Extract until end, next space, '登录', or other Chinese indicators
                    var passwordEnd = remainingPart.size
                    for (i in 0..remainingPart.size) {
                        if (i + 1 < remainingPart.size) {
                            let charValue = remainingPart[i] as UInt16;
                            let nextCharValue = remainingPart[i + 1] as UInt16;
                            
                            // Check for space
                            if (charValue == ' ' as UInt16) {
                                passwordEnd = i
                                break
                            }
                            
                            // Check for Chinese '登录' (login)
                            if (charValue == '登' as UInt16 && nextCharValue == '录' as UInt16) {
                                passwordEnd = i
                                break
                            }
                            
                            // Check for other Chinese characters that might indicate end of password
                            if (charValue == '和' as UInt16) {
                                passwordEnd = i
                                break
                            }
                        } else if (i < remainingPart.size) {
                            // Last character check
                            let charValue = remainingPart[i] as UInt16;
                            if (charValue == ' ' as UInt16) {
                                passwordEnd = i
                                break
                            }
                        }
                    }

                    if (passwordEnd > 0) {
                        let password = remainingPart[0..passwordEnd];
                        params.add("password", password);
                        Utils.logMessage("DEBUG", "Extracted Chinese password parameter: " + password);
                    }
                }
            }
        }
    }

    /**
     * Extract numeric parameters like age, count, etc.
     */
    private func extractNumericParameters(request: String, params: HashMap<String, String>): Unit {
        Utils.logMessage("DEBUG", "Starting numeric parameter extraction from request: " + request);
        
        let words = request.split(" ")
        
        for (i in 0..words.size) {
            let word = words[i].trimAscii()
            
            // Check if word is a number
            try {
                let cleanedWord = word.replace(",", "").replace(".", "").replace("!", "").replace("?", "")
                let numValue = Int32.parse(cleanedWord)
                params.add("value", "${numValue}")
                Utils.logMessage("DEBUG", "Extracted numeric value: " + numValue.toString() + " from word: " + word);
            } catch (ex: Exception) {
                // Not a number, continue
                Utils.logMessage("DEBUG", "Word '" + word + "' is not a number, continuing...");
            }
            
            // Look for patterns like "age 25", "count 10", etc.
            if (i + 1 < words.size) {
                try {
                    let cleanedNextWord = words[i + 1].replace(",", "").replace(".", "").replace("!", "").replace("?", "")
                    let numValue = Int32.parse(cleanedNextWord)
                    
                    if (word.toAsciiLower() == "age") {
                        params.add("age", "${numValue}")
                        Utils.logMessage("DEBUG", "Extracted age: " + numValue.toString());
                    } else if (word.toAsciiLower() == "count" || word.toAsciiLower() == "number") {
                        params.add("count", "${numValue}")
                        Utils.logMessage("DEBUG", "Extracted count/number: " + numValue.toString());
                    } else if (word.toAsciiLower() == "size") {
                        params.add("size", "${numValue}")
                        Utils.logMessage("DEBUG", "Extracted size: " + numValue.toString());
                    }
                } catch (ex: Exception) {
                    // Next word is not a number, continue
                    Utils.logMessage("DEBUG", "Next word '" + words[i + 1] + "' after '" + word + "' is not a number, continuing...");
                }
            }
        }
        
        Utils.logMessage("DEBUG", "Completed numeric parameter extraction");
    }
}