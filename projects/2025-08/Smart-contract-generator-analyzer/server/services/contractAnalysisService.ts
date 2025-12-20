import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface GasOptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  explanation: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
  estimatedSavings: string;
  codeExample?: string;
}

export interface ModifierRecommendation {
  id: string;
  title: string;
  description: string;
  explanation: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
  recommendedModifier: string;
  codeExample?: string;
}

export interface ContractAnalysisResult {
  gasOptimizations: GasOptimizationSuggestion[];
  modifierRecommendations: ModifierRecommendation[];
  overallScore: number;
  summary: string;
}

export async function analyzeContract(contractCode: string): Promise<ContractAnalysisResult> {
  try {
    const prompt = `You are an expert Solidity auditor and gas optimization specialist. Analyze this Solidity contract and provide comprehensive recommendations:

CONTRACT CODE:
${contractCode}

Provide a detailed analysis with:

1. GAS OPTIMIZATION SUGGESTIONS - Look for:
   - Storage vs memory usage inefficiencies
   - Missing constant/immutable declarations
   - Unbounded loops or expensive operations
   - Unnecessary state reads/writes
   - Struct packing opportunities
   - Function visibility optimizations
   - Inefficient string operations
   - Boolean storage optimizations

2. MODIFIER & SECURITY RECOMMENDATIONS - Look for:
   - Missing access control (onlyOwner, roles)
   - Missing input validation (require statements)
   - Reentrancy vulnerabilities
   - Integer overflow/underflow risks
   - Missing event emissions
   - Function visibility issues
   - Missing pausing mechanisms

For each suggestion, provide:
- Clear title and description
- Detailed explanation of WHY it improves gas/security
- Estimated gas savings or security impact
- Code example showing the improvement
- Line number if applicable
- Severity level (low/medium/high)

Return JSON with gasOptimizations array, modifierRecommendations array, overallScore (0-100), and summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            gasOptimizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  explanation: { type: "string" },
                  line: { type: "number" },
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  estimatedSavings: { type: "string" },
                  codeExample: { type: "string" }
                },
                required: ["id", "title", "description", "explanation", "severity", "estimatedSavings"]
              }
            },
            modifierRecommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  explanation: { type: "string" },
                  line: { type: "number" },
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  recommendedModifier: { type: "string" },
                  codeExample: { type: "string" }
                },
                required: ["id", "title", "description", "explanation", "severity", "recommendedModifier"]
              }
            },
            overallScore: { type: "number" },
            summary: { type: "string" }
          },
          required: ["gasOptimizations", "modifierRecommendations", "overallScore", "summary"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      gasOptimizations: result.gasOptimizations || [],
      modifierRecommendations: result.modifierRecommendations || [],
      overallScore: result.overallScore || 50,
      summary: result.summary || "Analysis completed"
    };
  } catch (error) {
    console.error("Contract analysis failed:", error);
    throw new Error(`Failed to analyze contract: ${error}`);
  }
}