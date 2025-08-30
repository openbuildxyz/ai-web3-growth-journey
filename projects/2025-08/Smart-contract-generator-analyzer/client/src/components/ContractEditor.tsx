import { useState } from "react";
import type { Contract } from "@shared/schema";
import { useWallet } from "../hooks/useWallet";
import { deploymentService, type DeploymentProgress, type DeploymentResult } from "../services/deploymentService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ContractEditorProps {
  contract: Contract;
  onDownload: () => void;
}

export default function ContractEditor({ contract, onDownload }: ContractEditorProps) {
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState<DeploymentProgress | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const { isConnected, chainId, signer } = useWallet();
  const { toast } = useToast();

  const SEPOLIA_CHAIN_ID = 11155111;
  const canDeploy = isConnected && chainId === SEPOLIA_CHAIN_ID && signer;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contract.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeploy = async () => {
    if (!canDeploy || !signer) {
      toast({
        title: "Cannot Deploy",
        description: "Please connect wallet and switch to Sepolia network",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);
    
    try {
      const result = await deploymentService.deployContract(
        contract.code,
        contract.name,
        signer,
        setDeploymentProgress
      );
      
      setDeploymentResult(result);
      toast({
        title: "Deployment Successful!",
        description: `Contract deployed at ${result.contractAddress}`,
      });
    } catch (error) {
      console.error('Deployment failed:', error);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
      setDeploymentProgress(null);
    }
  };

  const formatCode = (code: string) => {
    return code
      .split('\n')
      .map((line, index) => {
        let formattedLine = line;
        
        // Syntax highlighting
        formattedLine = formattedLine.replace(
          /(pragma|contract|function|constructor|modifier|require|import|mapping|uint256|address|bool|string|bytes|memory|storage|calldata|pure|view|external|internal|public|private|onlyOwner|payable|override)/g,
          '<span class="syntax-keyword">$1</span>'
        );
        
        formattedLine = formattedLine.replace(
          /"([^"]*)"/g,
          '<span class="syntax-string">"$1"</span>'
        );
        
        formattedLine = formattedLine.replace(
          /\/\/.*$/g,
          '<span class="syntax-comment">$&</span>'
        );
        
        formattedLine = formattedLine.replace(
          /\/\*[\s\S]*?\*\//g,
          '<span class="syntax-comment">$&</span>'
        );
        
        formattedLine = formattedLine.replace(
          /\b(\d+)\b/g,
          '<span class="syntax-number">$1</span>'
        );
        
        formattedLine = formattedLine.replace(
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
          '<span class="syntax-function">$1</span>('
        );

        return (
          <div key={index} className="flex">
            <span className="text-muted-foreground text-xs mr-4 select-none w-8 text-right">
              {index + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }} />
          </div>
        );
      });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-file-code text-primary-foreground text-sm"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Generated Contract</h2>
              <p className="text-sm text-muted-foreground">{contract.name}.sol</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-primary/20 text-primary border-primary/20">
              <i className="fas fa-check-circle mr-1"></i>
              Compiled Successfully
            </Badge>
            <Button
              data-testid="button-copy"
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <i className={`fas fa-${copied ? 'check' : 'copy'} mr-2`}></i>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              data-testid="button-download"
              onClick={onDownload}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <i className="fas fa-download mr-2"></i>Download
            </Button>
            <Button
              data-testid="button-deploy"
              onClick={handleDeploy}
              disabled={!canDeploy || isDeploying}
              className={`${canDeploy 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            >
              <i className={`fas fa-${isDeploying ? 'spinner fa-spin' : 'rocket'} mr-2`}></i>
              {isDeploying ? 'Deploying...' : canDeploy ? 'Deploy to Sepolia' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Deployment Status */}
        {(deploymentProgress || deploymentResult) && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            {deploymentProgress && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <i className="fas fa-rocket mr-2 text-primary"></i>
                  Deployment Progress
                </h4>
                <div className="flex items-center space-x-3">
                  <i className={`fas fa-${deploymentProgress.step === 'error' ? 'times' : 'spinner fa-spin'} text-${deploymentProgress.step === 'error' ? 'red' : 'primary'}-500`}></i>
                  <span className="text-sm">{deploymentProgress.message}</span>
                </div>
                {deploymentProgress.transactionHash && (
                  <p className="text-xs text-muted-foreground">
                    Transaction: {deploymentProgress.transactionHash}
                  </p>
                )}
              </div>
            )}
            
            {deploymentResult && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center text-green-600">
                  <i className="fas fa-check-circle mr-2"></i>
                  Deployment Successful
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contract Address:</p>
                    <p className="font-mono text-xs break-all">{deploymentResult.contractAddress}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gas Used:</p>
                    <p className="font-mono">{deploymentResult.gasUsed}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => window.open(deploymentResult.explorerUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary/20 hover:bg-primary/10"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    View on Etherscan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Editor */}
        <div className="code-editor bg-input rounded-lg p-4 text-sm overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="text-foreground">
            {formatCode(contract.code)}
          </pre>
        </div>
      </div>
    </div>
  );
}
