import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityValidatorProps {
  contractCode: string;
}

interface SecurityIssue {
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  line?: number;
  suggestion?: string;
}

export const SecurityValidator: React.FC<SecurityValidatorProps> = ({ contractCode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<SecurityIssue[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const { toast } = useToast();

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    
    try {
      // Simulate security analysis
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const issues: SecurityIssue[] = [];
      
      // Basic static analysis checks
      if (!contractCode.includes('SPDX-License-Identifier')) {
        issues.push({
          severity: 'medium',
          title: 'Missing License Identifier',
          description: 'Contract should include SPDX license identifier',
          suggestion: 'Add // SPDX-License-Identifier: MIT at the top'
        });
      }

      if (contractCode.includes('tx.origin')) {
        issues.push({
          severity: 'high',
          title: 'Use of tx.origin',
          description: 'Using tx.origin for authorization is vulnerable to phishing attacks',
          suggestion: 'Use msg.sender instead of tx.origin'
        });
      }

      if (contractCode.includes('block.timestamp')) {
        issues.push({
          severity: 'low',
          title: 'Timestamp Dependence',
          description: 'Relying on block.timestamp can be manipulated by miners',
          suggestion: 'Consider using block.number or external oracle for time-sensitive operations'
        });
      }

      if (!contractCode.includes('ReentrancyGuard') && contractCode.includes('external') && contractCode.includes('payable')) {
        issues.push({
          severity: 'high',
          title: 'Potential Reentrancy Vulnerability',
          description: 'External payable functions may be vulnerable to reentrancy attacks',
          suggestion: 'Implement ReentrancyGuard from OpenZeppelin'
        });
      }

      if (contractCode.includes('Ownable') && !contractCode.includes('renounceOwnership')) {
        issues.push({
          severity: 'info',
          title: 'Centralization Risk',
          description: 'Contract has owner privileges without renouncement capability',
          suggestion: 'Consider implementing multi-sig or governance mechanisms'
        });
      }

      // Check for OpenZeppelin usage (positive)
      if (contractCode.includes('@openzeppelin/contracts')) {
        issues.push({
          severity: 'info',
          title: 'OpenZeppelin Integration',
          description: 'Good practice: Using audited OpenZeppelin contracts',
          suggestion: 'Continue using battle-tested contract libraries'
        });
      }

      setScanResults(issues);
      
      // Calculate security score
      const highIssues = issues.filter(i => i.severity === 'high').length;
      const mediumIssues = issues.filter(i => i.severity === 'medium').length;
      const lowIssues = issues.filter(i => i.severity === 'low').length;
      
      let score = 100;
      score -= highIssues * 25;
      score -= mediumIssues * 10;
      score -= lowIssues * 5;
      score = Math.max(0, score);
      
      setSecurityScore(score);
      setScanComplete(true);

      toast({
        title: "Security Scan Complete",
        description: `Found ${issues.length} items. Security score: ${score}/100`,
        variant: issues.some(i => i.severity === 'high') ? 'destructive' : 'default'
      });

    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Security scan encountered an error",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      case 'info': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Scan Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Analyze your smart contract code for common security vulnerabilities and best practices.
            </p>
            <Button 
              onClick={runSecurityScan} 
              disabled={isScanning}
              variant="outline"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Run Security Scan
                </>
              )}
            </Button>
          </div>

          {scanComplete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Score</span>
                <span className={`font-bold ${securityScore >= 80 ? 'text-green-500' : securityScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                  {securityScore}/100
                </span>
              </div>
              <Progress value={securityScore} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Scan Results</h3>
          
          {scanResults.map((issue, index) => (
            <Alert key={index} className={`border-l-4 ${
              issue.severity === 'high' ? 'border-l-destructive' :
              issue.severity === 'medium' ? 'border-l-yellow-500' :
              issue.severity === 'low' ? 'border-l-blue-500' :
              'border-l-green-500'
            }`}>
              <div className="flex items-start gap-2">
                <div className={getSeverityColor(issue.severity)}>
                  {getSeverityIcon(issue.severity)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{issue.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(issue.severity)}`}
                    >
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <AlertDescription className="text-sm">
                    {issue.description}
                  </AlertDescription>
                  {issue.suggestion && (
                    <div className="bg-muted/50 p-2 rounded text-xs">
                      <strong>Suggestion:</strong> {issue.suggestion}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-500">✓ Recommended</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use OpenZeppelin contracts</li>
                <li>• Implement proper access controls</li>
                <li>• Add reentrancy guards</li>
                <li>• Use SafeMath for older Solidity</li>
                <li>• Include comprehensive tests</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-destructive">✗ Avoid</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Using tx.origin for auth</li>
                <li>• Unchecked external calls</li>
                <li>• Timestamp dependencies</li>
                <li>• Integer overflow/underflow</li>
                <li>• Unprotected state changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};