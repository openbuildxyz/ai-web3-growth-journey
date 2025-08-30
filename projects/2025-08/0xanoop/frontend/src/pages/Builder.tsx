import { useState } from "react";
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection } from "reactflow";
import { Layout } from "@/components/Layout";
import { Sidebar } from "@/components/Sidebar";
import { DaoCanvas } from "@/components/DaoCanvas";
import { ConfigurationPanel } from "@/components/ConfigurationPanel";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { Sheet } from "@/components/ui/sheet";
import { sendMessageToAI } from "@/lib/gemini";
import { templates } from "@/lib/templates";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const initialNodes: Node[] = [];
let id = 1;
const getId = () => `${id++}`;

const BuilderPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDeploySheetOpen, setIsDeploySheetOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! Describe your DAO, and I'll help you build it. Try 'Create a DAO with a token and voting'.",
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const onConnect = (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds));

  const handleNodeDataChange = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
    }
  };

  const handleNodeDelete = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setSelectedNode(null);
  };

  const handleAiSendMessage = async (input: string) => {
    if (!input.trim() || isAiLoading) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      const result = await sendMessageToAI(input, nodes);
      const { response } = result;

      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        let newNodes: Node[] = [];
        let newEdges: Edge[] = [];
        const currentNodes = nodes;

        for (const call of functionCalls) {
          if (call.name === "addNode" && call.args.type) {
            const nodeInfo = {
              type: call.args.type as string,
              connectToType: call.args.connectToType as string | undefined
            };
            const newNodeId = getId();
            const newNode: Node = {
              id: newNodeId,
              type: nodeInfo.type,
              position: { x: Math.random() * 250 + 100, y: Math.random() * 150 + 50 },
              data: { label: `${nodeInfo.type.charAt(0).toUpperCase() + nodeInfo.type.slice(1)} Node` },
            };
            newNodes.push(newNode);

            if (nodeInfo.connectToType) {
              const allAvailableNodes = [...currentNodes, ...newNodes];
              const sourceNode = [...allAvailableNodes].reverse().find(n => n.type === nodeInfo.connectToType);
              if (sourceNode) {
                newEdges.push({
                  id: `e-${sourceNode.id}-${newNodeId}`,
                  source: sourceNode.id,
                  target: newNodeId,
                });
              }
            }
          }
          if (call.name === "addCustomNode" && call.args.label && call.args.description) {
            const customNodeInfo = {
              label: call.args.label as string,
              description: call.args.description as string
            };
            newNodes.push({
              id: getId(),
              type: 'ai',
              position: { x: Math.random() * 250 + 100, y: Math.random() * 150 + 50 },
              data: { label: customNodeInfo.label, description: customNodeInfo.description },
            });
          }
        }
        
        if (newNodes.length > 0) {
          setNodes(nds => [...nds, ...newNodes]);
        }
        if (newEdges.length > 0) {
          setEdges(eds => newEdges.reduce((acc, edge) => addEdge(edge, acc), eds));
        }
      }

      const aiText = response.text();
      const aiResponse: Message = { sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage: Message = {
        sender: "ai",
        text: "Sorry, I encountered an error. Please check your API key and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey];
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNode(null);
  };

  return (
    <Sheet open={isDeploySheetOpen} onOpenChange={setIsDeploySheetOpen}>
      <Layout
        onDeployClick={() => setIsDeploySheetOpen(true)}
        sidebar={<Sidebar 
          messages={messages}
          isLoading={isAiLoading}
          onSendMessage={handleAiSendMessage}
          onSelectTemplate={handleSelectTemplate}
        />}
        configPanel={<ConfigurationPanel 
          selectedNode={selectedNode} 
          onNodeDataChange={handleNodeDataChange}
          onNodeDelete={handleNodeDelete}
        />}
      >
        <DaoCanvas
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeSelect={setSelectedNode}
        />
      </Layout>
      <DeploymentPanel nodes={nodes} edges={edges} />
    </Sheet>
  );
};

export default BuilderPage;