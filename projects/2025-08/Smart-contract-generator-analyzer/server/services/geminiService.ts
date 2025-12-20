import { GoogleGenAI } from "@google/genai";
import type { GasOptimization, SecurityIssue, ContractStats } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface ContractGenerationRequest {
  description: string;
  includeOptimizations?: boolean;
  includeSecurity?: boolean;
  includeBestPractices?: boolean;
}

export interface ContractGenerationResponse {
  code: string;
  name: string;
  gasOptimizations: GasOptimization[];
  securityIssues: SecurityIssue[];
  stats: ContractStats;
}

export async function generateContract(request: ContractGenerationRequest): Promise<ContractGenerationResponse> {
  try {
    const prompt = `You are an expert Solidity developer. Generate a complete, production-ready smart contract based on this description: "${request.description}"

Requirements:
- Use Solidity ^0.8.0 or higher
- Include proper SPDX license identifier
- Follow OpenZeppelin standards where applicable
- Add comprehensive comments
- Include proper error handling with require statements
- Use appropriate access control modifiers

${request.includeOptimizations ? '- Optimize for gas efficiency' : ''}
${request.includeSecurity ? '- Include security best practices' : ''}
${request.includeBestPractices ? '- Follow Solidity style guide' : ''}

Return a JSON response with:
1. "code": The complete Solidity contract code
2. "name": A suitable contract name (without .sol extension)
3. "description": Brief description of what the contract does`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            code: { type: "string" },
            name: { type: "string" },
            description: { type: "string" }
          },
          required: ["code", "name", "description"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    
    // Analyze the generated code
    const gasOptimizations = await analyzeGasOptimizations(result.code);
    const securityIssues = await analyzeSecurityIssues(result.code);
    const stats = calculateContractStats(result.code);

    return {
      code: result.code,
      name: result.name,
      gasOptimizations,
      securityIssues,
      stats
    };
  } catch (error) {
    throw new Error(`Failed to generate contract: ${error}`);
  }
}

export async function analyzeGasOptimizations(code: string): Promise<GasOptimization[]> {
  try {
    const prompt = `Analyze this Solidity code for gas optimization opportunities: ${code}

Identify specific gas optimization issues and return a JSON array of optimizations. Each optimization should have:
- id: unique identifier
- type: category of optimization (storage, computation, etc.)
- title: brief title
- description: detailed explanation
- line: line number if applicable
- severity: "low", "medium", or "high"
- estimatedGasSaving: estimated gas savings in wei`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              line: { type: "number" },
              severity: { type: "string", enum: ["low", "medium", "high"] },
              estimatedGasSaving: { type: "number" }
            },
            required: ["id", "type", "title", "description", "severity"]
          }
        }
      },
      contents: prompt
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gas optimization analysis failed:", error);
    return [];
  }
}

export async function analyzeSecurityIssues(code: string): Promise<SecurityIssue[]> {
  try {
    const prompt = `Perform a security audit of this Solidity code: ${code}

Identify security vulnerabilities and return a JSON array of issues. Each issue should have:
- id: unique identifier
- type: vulnerability type (reentrancy, overflow, etc.)
- title: brief title
- description: detailed explanation
- line: line number if applicable
- severity: "low", "medium", "high", or "critical"
- recommendation: how to fix the issue`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              line: { type: "number" },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              recommendation: { type: "string" }
            },
            required: ["id", "type", "title", "description", "severity", "recommendation"]
          }
        }
      },
      contents: prompt
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Security analysis failed:", error);
    return [];
  }
}

function calculateContractStats(code: string): ContractStats {
  const lines = code.split('\n').filter(line => line.trim() !== '');
  const linesOfCode = lines.length;
  
  // Simple heuristics for estimation
  const functionMatches = code.match(/function\s+\w+/g) || [];
  const functions = functionMatches.length;
  
  // Basic gas estimation (very rough)
  const estimatedGas = Math.floor(50000 + (linesOfCode * 1000) + (functions * 5000));
  
  // Security score based on presence of security patterns
  let securityScore = 50;
  if (code.includes('require(')) securityScore += 10;
  if (code.includes('onlyOwner')) securityScore += 10;
  if (code.includes('ReentrancyGuard')) securityScore += 15;
  if (code.includes('SafeMath')) securityScore += 10;
  if (code.includes('address(0)')) securityScore += 5;
  
  return {
    linesOfCode,
    estimatedGas,
    functions,
    securityScore: Math.min(securityScore, 100)
  };
}
