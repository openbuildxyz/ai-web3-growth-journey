import { ChatPanel } from "./ChatPanel";
import { NodePalette } from "./NodePalette";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { templates } from "@/lib/templates";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface SidebarProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onSelectTemplate: (templateKey: keyof typeof templates) => void;
}

const TemplateSelector = ({ onSelectTemplate }: { onSelectTemplate: (templateKey: keyof typeof templates) => void }) => (
  <div className="p-4 space-y-4">
    {Object.entries(templates).map(([key, template]) => (
      <Card key={key}>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription className="text-xs pt-2">{template.description}</CardDescription>
        </CardHeader>
        <div className="p-4 pt-0">
          <Button className="w-full" onClick={() => onSelectTemplate(key as keyof typeof templates)}>
            Use Template
          </Button>
        </div>
      </Card>
    ))}
  </div>
);

export const Sidebar = ({ messages, isLoading, onSendMessage, onSelectTemplate }: SidebarProps) => {
  return (
    <aside className="w-1/4 min-w-[300px] max-w-[400px] bg-card border-r flex flex-col h-full">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 m-2">
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="flex-1 overflow-hidden flex">
          <ChatPanel 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={onSendMessage}
          />
        </TabsContent>
        <TabsContent value="components">
          <NodePalette />
        </TabsContent>
        <TabsContent value="templates">
          <TemplateSelector onSelectTemplate={onSelectTemplate} />
        </TabsContent>
      </Tabs>
    </aside>
  );
};