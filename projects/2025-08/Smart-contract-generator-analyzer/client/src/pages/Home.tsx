import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Template, Contract } from "@shared/schema";
import ContractEditor from "../components/ContractEditor";
import AnalysisPanel from "../components/AnalysisPanel";
import TemplateSelector from "../components/TemplateSelector";
import GenerationModal from "../components/GenerationModal";
import ContractAnalyzer from "../components/ContractAnalyzer";
import WalletConnection from "../components/WalletConnection";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [description, setDescription] = useState("");
  const [includeOptimizations, setIncludeOptimizations] = useState(true);
  const [includeSecurity, setIncludeSecurity] = useState(true);
  const [includeBestPractices, setIncludeBestPractices] = useState(true);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const { toast } = useToast();

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const generateContractMutation = useMutation({
    mutationFn: async (data: {
      description: string;
      includeOptimizations: boolean;
      includeSecurity: boolean;
      includeBestPractices: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/contracts/generate", data);
      return await response.json();
    },
    onSuccess: (contract: Contract) => {
      setCurrentContract(contract);
      toast({
        title: "Contract Generated Successfully",
        description: `${contract.name} has been generated and analyzed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe what you want your smart contract to do.",
        variant: "destructive",
      });
      return;
    }

    generateContractMutation.mutate({
      description,
      includeOptimizations,
      includeSecurity,
      includeBestPractices,
    });
  };

  const handleTemplateSelect = (template: Template) => {
    setDescription(template.prompt);
  };

  const handleDownload = async () => {
    if (!currentContract) return;
    
    try {
      const response = await fetch(`/api/contracts/${currentContract.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentContract.name}.sol`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `${currentContract.name}.sol is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the contract file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-cube text-primary-foreground text-lg"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">SolidityAI</h1>
                  <p className="text-sm text-muted-foreground">Smart Contract Generator</p>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Templates</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
                <i className="fas fa-bolt text-primary text-sm"></i>
                <span className="text-sm font-medium">AI Credits: 247</span>
              </div>
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="generate" data-testid="tab-generate">
              <i className="fas fa-magic mr-2"></i>Generate Contract
            </TabsTrigger>
            <TabsTrigger value="analyze" data-testid="tab-analyze">
              <i className="fas fa-search mr-2"></i>Analyze Contract
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Panel - Input & Controls */}
              <div className="lg:col-span-1 space-y-6">
            {/* Natural Language Input */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-magic text-accent-foreground text-sm"></i>
                </div>
                <h2 className="text-lg font-semibold">Describe Your Contract</h2>
              </div>
              
              <div className="space-y-4">
                <Textarea
                  data-testid="input-description"
                  className="w-full h-32 bg-input border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe what you want your smart contract to do...

Examples:
• Create an ERC20 token with supply 1000
• A simple counter contract with increment/decrement
• A voting contract for 5 candidates
• NFT collection with 10,000 tokens"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                
                <div className="flex items-center space-x-4">
                  <Button
                    data-testid="button-generate"
                    onClick={handleGenerate}
                    disabled={generateContractMutation.isPending}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2 flex-1"
                  >
                    <i className="fas fa-wand-magic-sparkles"></i>
                    <span>{generateContractMutation.isPending ? "Generating..." : "Generate Contract"}</span>
                  </Button>
                  <Button
                    data-testid="button-clear"
                    onClick={() => setDescription("")}
                    variant="outline"
                    className="bg-muted text-muted-foreground px-4 py-3 rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <TemplateSelector templates={templates} onSelect={handleTemplateSelect} />

            {/* Analysis Controls */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Options</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <Checkbox
                    data-testid="checkbox-gas-optimization"
                    checked={includeOptimizations}
                    onCheckedChange={(checked) => setIncludeOptimizations(!!checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-medium">Gas Optimization</p>
                    <p className="text-sm text-muted-foreground">Analyze and suggest gas improvements</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <Checkbox
                    data-testid="checkbox-security-audit"
                    checked={includeSecurity}
                    onCheckedChange={(checked) => setIncludeSecurity(!!checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-medium">Security Audit</p>
                    <p className="text-sm text-muted-foreground">Check for common vulnerabilities</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <Checkbox
                    data-testid="checkbox-best-practices"
                    checked={includeBestPractices}
                    onCheckedChange={(checked) => setIncludeBestPractices(!!checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-medium">Best Practices</p>
                    <p className="text-sm text-muted-foreground">Ensure code follows standards</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

              {/* Center Panel - Code Editor */}
              <div className="lg:col-span-2 space-y-6">
                {currentContract ? (
                  <>
                    <ContractEditor contract={currentContract} onDownload={handleDownload} />
                    <AnalysisPanel contract={currentContract} />
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-file-code text-muted-foreground text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Contract Generated</h3>
                    <p className="text-muted-foreground">
                      Describe your contract requirements and click "Generate Contract" to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyze">
            <ContractAnalyzer />
          </TabsContent>
        </Tabs>
      </div>

      <GenerationModal isOpen={generateContractMutation.isPending} />

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-cube text-primary-foreground"></i>
                </div>
                <span className="text-lg font-bold">SolidityAI</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Powered by Google Gemini AI, SolidityAI helps developers generate, optimize, and secure smart contracts with ease.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API Access</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SolidityAI. All rights reserved. Built with Google Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
