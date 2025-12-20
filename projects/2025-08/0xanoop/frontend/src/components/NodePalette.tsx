import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Vote, Landmark, ShieldCheck, Timer } from "lucide-react";

const DraggableNode = ({ type, icon: Icon, label }: { type: string, icon: React.ElementType, label: string }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-4 border rounded-lg bg-background hover:shadow-md cursor-grab transition-shadow"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <Icon className="h-8 w-8 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};


export const NodePalette = () => {
  return (
    <div className="p-4">
       <div className="grid grid-cols-2 gap-4">
        <DraggableNode type="token" icon={Coins} label="Token" />
        <DraggableNode type="voting" icon={Vote} label="Voting" />
        <DraggableNode type="treasury" icon={Landmark} label="Treasury" />
        <DraggableNode type="quorum" icon={ShieldCheck} label="Quorum" />
        <DraggableNode type="timelock" icon={Timer} label="Timelock" />
      </div>
    </div>
  );
};