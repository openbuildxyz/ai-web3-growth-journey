import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContractPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contracts: { filename: string; code: string }[];
}

export const ContractPreviewDialog = ({ isOpen, onOpenChange, contracts }: ContractPreviewDialogProps) => {
  if (contracts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Contract Preview</DialogTitle>
          <DialogDescription>
            Review the generated smart contracts below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden border rounded-lg mt-4">
          <Tabs defaultValue={contracts[0].filename} className="h-full flex flex-col">
            <TabsList className="m-2 flex-shrink-0 overflow-x-auto">
              {contracts.map(contract => (
                <TabsTrigger key={contract.filename} value={contract.filename}>{contract.filename}</TabsTrigger>
              ))}
            </TabsList>
            {contracts.map(contract => (
              <TabsContent key={contract.filename} value={contract.filename} className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <pre className="text-xs bg-background p-4"><code>{contract.code}</code></pre>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};