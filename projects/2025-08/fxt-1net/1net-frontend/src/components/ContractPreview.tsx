import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code2, Download, Eye } from "lucide-react";
import { ContractSpec } from "./SmartContractBuilder";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";

// Read Gemini API key from environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

interface ContractPreviewProps {
  spec: ContractSpec;
  onCodeGenerated: (code: string) => void;
  generatedCode: string;
}

export const ContractPreview: React.FC<ContractPreviewProps> = ({ 
  spec, 
  onCodeGenerated, 
  generatedCode 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContractCode = async (): Promise<string> => {
    if (!GEMINI_API_KEY.trim()) {
      throw new Error("Gemini API key is not set in the environment");
    }

    const { type, name, symbol, supply, features } = spec;
    
    const prompt = `Generate a secure Solidity smart contract with the following specifications:
- Token Type: ${type}
- Name: ${name}
- Symbol: ${symbol}
${supply ? `- Total Supply: ${supply}` : ''}
- Features: ${features.join(', ')}
- Description: ${spec.description}

Requirements:
1. Use OpenZeppelin contracts for security
2. Include SPDX license identifier (MIT)
3. Use Solidity version ^0.8.20
4. Follow best practices for gas optimization
5. Include proper error handling
6. Add comprehensive comments
7. Implement all requested features properly

Generate only the complete Solidity contract code without any explanation or markdown formatting.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("No content received from Gemini API");
    }

    let contractCode = data.candidates[0].content.parts[0].text;
    
    // Clean up the response - remove markdown formatting if present
    contractCode = contractCode.replace(/```solidity\n?/g, '').replace(/```\n?/g, '');
    
    return contractCode.trim();
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await generateContractCode();
      onCodeGenerated(code);
      toast({
        title: "Contract Generated",
        description: "AI-generated smart contract code ready for review",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec.name}.sol`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Spec Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Contract Specification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant="outline">{spec.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="text-sm font-medium">{spec.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Symbol:</span>
              <span className="text-sm font-medium">{spec.symbol}</span>
            </div>
            {spec.supply && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Supply:</span>
                <span className="text-sm font-medium">{parseInt(spec.supply).toLocaleString()}</span>
              </div>
            )}
          </div>

          {spec.features.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Features:</span>
              <div className="flex flex-wrap gap-1">
                {spec.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Code Preview */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Contract</CardTitle>
            {generatedCode && (
              <Button variant="outline" size="sm" onClick={downloadCode}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px]">
              <Editor
                height="100%"
                defaultLanguage="solidity"
                value={generatedCode || "// Contract code will appear here after generation..."}
                theme="vs-dark"
                options={{
                  readOnly: !generatedCode,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};