import type { Contract, GasOptimization, SecurityIssue, ContractStats } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalysisPanelProps {
  contract: Contract;
}

export default function AnalysisPanel({ contract }: AnalysisPanelProps) {
  const gasOptimizations = (contract.gasOptimizations as GasOptimization[]) || [];
  const securityIssues = (contract.securityIssues as SecurityIssue[]) || [];
  const stats = (contract.stats as ContractStats) || {
    linesOfCode: 0,
    estimatedGas: 0,
    functions: 0,
    securityScore: 0
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gas Optimization */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-gas-pump text-white text-sm"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gas Optimization</h3>
              <p className="text-sm text-muted-foreground">
                {gasOptimizations.length} suggestions found
              </p>
            </div>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {gasOptimizations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-check text-green-500"></i>
                </div>
                <p className="text-green-600 dark:text-green-400 font-medium">No optimizations needed</p>
                <p className="text-sm text-muted-foreground">Your contract is already well optimized!</p>
              </div>
            ) : (
              gasOptimizations.map((optimization) => (
                <div
                  key={optimization.id}
                  className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 ${getSeverityColor(optimization.severity)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className="fas fa-exclamation text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-yellow-600 dark:text-yellow-400">
                          {optimization.title}
                        </p>
                        {optimization.line && (
                          <Badge variant="outline" className="text-xs">
                            Line {optimization.line}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {optimization.description}
                      </p>
                      {optimization.estimatedGasSaving && (
                        <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                          Estimated savings: {formatNumber(optimization.estimatedGasSaving)} gas
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 hover:text-yellow-500 border-yellow-600/20"
                      >
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Audit */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-destructive-foreground text-sm"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Security Audit</h3>
              <p className="text-sm text-muted-foreground">
                {securityIssues.length} issues found
              </p>
            </div>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {securityIssues.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-shield-check text-green-500"></i>
                </div>
                <p className="text-green-600 dark:text-green-400 font-medium">No security issues</p>
                <p className="text-sm text-muted-foreground">Your contract follows security best practices!</p>
              </div>
            ) : (
              securityIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 ${getSeverityColor(issue.severity)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className="fas fa-times text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-red-600 dark:text-red-400">
                          {issue.title}
                        </p>
                        {issue.line && (
                          <Badge variant="outline" className="text-xs">
                            Line {issue.line}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-xs ${
                          issue.severity === 'critical' ? 'border-red-500 text-red-500' :
                          issue.severity === 'high' ? 'border-red-400 text-red-400' :
                          issue.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                          'border-blue-500 text-blue-500'
                        }`}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-500 border-red-600/20"
                      >
                        Fix Issue
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contract Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Contract Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center" data-testid="stat-lines-of-code">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-code text-primary"></i>
            </div>
            <p className="text-2xl font-bold">{stats.linesOfCode}</p>
            <p className="text-sm text-muted-foreground">Lines of Code</p>
          </div>
          
          <div className="text-center" data-testid="stat-estimated-gas">
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-gas-pump text-secondary"></i>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.estimatedGas)}</p>
            <p className="text-sm text-muted-foreground">Estimated Gas</p>
          </div>
          
          <div className="text-center" data-testid="stat-functions">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-function text-accent"></i>
            </div>
            <p className="text-2xl font-bold">{stats.functions}</p>
            <p className="text-sm text-muted-foreground">Functions</p>
          </div>
          
          <div className="text-center" data-testid="stat-security-score">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-shield-check text-green-500"></i>
            </div>
            <p className="text-2xl font-bold">{stats.securityScore}%</p>
            <p className="text-sm text-muted-foreground">Security Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
