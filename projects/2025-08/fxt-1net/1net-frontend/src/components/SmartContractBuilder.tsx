import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ContractInput } from "./ContractInput";
import { ContractPreview } from "./ContractPreview";
import { SecurityValidator } from "./SecurityValidator";
import { DeploymentPanel } from "./DeploymentPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, FileCode2, Shield, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ContractSpec {
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  name: string;
  symbol: string;
  supply?: string;
  description: string;
  features: string[];
}

export const SmartContractBuilder = () => {
  const [contractSpec, setContractSpec] = useState<ContractSpec | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const { toast } = useToast();

  const handleSpecGenerated = (spec: ContractSpec) => {
    setContractSpec(spec);
    setActiveTab("preview");
    toast({
      title: "Contract Spec Generated",
      description: `AI parsed your requirements for ${spec.type} token: ${spec.name}`,
    });
  };

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    toast({
      title: "Smart Contract Generated",
      description: "Your contract code is ready for review",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
          1net
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Describe your smart contract requirements in plain language. Our AI will parse your intent and generate secure, OpenZeppelin-based contracts.
        </p>
      </div>

      {/* Main Interface */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Input
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!contractSpec} className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4" />
              Contract
            </TabsTrigger>
            <TabsTrigger value="security" disabled={!generatedCode} className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="deploy" disabled={!generatedCode} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Deploy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <ContractInput onSpecGenerated={handleSpecGenerated} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {contractSpec && (
              <ContractPreview 
                spec={contractSpec} 
                onCodeGenerated={handleCodeGenerated}
                generatedCode={generatedCode}
              />
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {generatedCode && (
              <SecurityValidator contractCode={generatedCode} />
            )}
          </TabsContent>

          <TabsContent value="deploy" className="space-y-6">
            {generatedCode && (
              <DeploymentPanel 
                contractCode={generatedCode} 
                contractSpec={contractSpec} 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};