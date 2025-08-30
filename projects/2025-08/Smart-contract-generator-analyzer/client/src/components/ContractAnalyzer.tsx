import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GasOptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  explanation: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
  estimatedSavings: string;
  codeExample?: string;
}

interface ModifierRecommendation {
  id: string;
  title: string;
  description: string;
  explanation: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
  recommendedModifier: string;
  codeExample?: string;
}

interface ContractAnalysisResult {
  gasOptimizations: GasOptimizationSuggestion[];
  modifierRecommendations: ModifierRecommendation[];
  overallScore: number;
  summary: string;
}

export default function ContractAnalyzer() {
  const [contractCode, setContractCode] = useState("");
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeContractMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/contracts/analyze", { contractCode: code });
      return await response.json();
    },
    onSuccess: (result: ContractAnalysisResult) => {
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: `Found ${result.gasOptimizations.length} gas optimizations and ${result.modifierRecommendations.length} security recommendations.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!contractCode.trim()) {
      toast({
        title: "Contract Required",
        description: "Please paste your Solidity contract code to analyze.",
        variant: "destructive",
      });
      return;
    }

    analyzeContractMutation.mutate(contractCode);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Input */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <i className="fas fa-search text-accent-foreground text-sm"></i>
          </div>
          <h2 className="text-lg font-semibold">Contract Analysis</h2>
        </div>
        
        <div className="space-y-4">
          <Textarea
            data-testid="input-contract-code"
            className="w-full h-64 bg-input border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            placeholder="Paste your Solidity contract code here...

Example:
pragma solidity ^0.8.0;

contract MyContract {
    uint256 public value;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
    }
}"
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
          />
          
          <div className="flex items-center space-x-4">
            <Button
              data-testid="button-review-ai"
              onClick={handleAnalyze}
              disabled={analyzeContractMutation.isPending}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <i className="fas fa-robot"></i>
              <span>{analyzeContractMutation.isPending ? "Analyzing..." : "Review with AI"}</span>
            </Button>
            <Button
              data-testid="button-clear-code"
              onClick={() => setContractCode("")}
              variant="outline"
              className="bg-muted text-muted-foreground px-4 py-3 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Overall Score:</span>
                <Badge className={`${analysisResult.overallScore >= 80 ? 'bg-green-500' : analysisResult.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                  {analysisResult.overallScore}/100
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">{analysisResult.summary}</p>
          </div>

          {/* Gas Optimizations */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-gas-pump text-white text-sm"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Gas Optimization Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.gasOptimizations.length} opportunities found
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysisResult.gasOptimizations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-check text-green-500"></i>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">Excellent gas efficiency!</p>
                  <p className="text-sm text-muted-foreground">No significant optimizations needed.</p>
                </div>
              ) : (
                analysisResult.gasOptimizations.map((optimization) => (
                  <div
                    key={optimization.id}
                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 ${getSeverityColor(optimization.severity)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <i className="fas fa-exclamation text-white text-xs"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium text-yellow-600 dark:text-yellow-400">
                            {optimization.title}
                          </p>
                          {optimization.line && (
                            <Badge variant="outline" className="text-xs">
                              Line {optimization.line}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getSeverityTextColor(optimization.severity)}`}>
                            {optimization.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {optimization.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                          <strong>Why this helps:</strong> {optimization.explanation}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                          <strong>Estimated savings:</strong> {optimization.estimatedSavings}
                        </p>
                        {optimization.codeExample && (
                          <details className="mt-2">
                            <summary className="text-xs text-primary cursor-pointer hover:underline">
                              View code example
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              <code>{optimization.codeExample}</code>
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modifier Recommendations */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-destructive-foreground text-sm"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Security & Modifier Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.modifierRecommendations.length} recommendations found
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysisResult.modifierRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-shield-check text-green-500"></i>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">Great security practices!</p>
                  <p className="text-sm text-muted-foreground">No critical security issues found.</p>
                </div>
              ) : (
                analysisResult.modifierRecommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 ${getSeverityColor(recommendation.severity)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <i className="fas fa-shield text-white text-xs"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium text-red-600 dark:text-red-400">
                            {recommendation.title}
                          </p>
                          {recommendation.line && (
                            <Badge variant="outline" className="text-xs">
                              Line {recommendation.line}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getSeverityTextColor(recommendation.severity)}`}>
                            {recommendation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {recommendation.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                          <strong>Why this is important:</strong> {recommendation.explanation}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                          <strong>Recommended:</strong> {recommendation.recommendedModifier}
                        </p>
                        {recommendation.codeExample && (
                          <details className="mt-2">
                            <summary className="text-xs text-primary cursor-pointer hover:underline">
                              View code example
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              <code>{recommendation.codeExample}</code>
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}