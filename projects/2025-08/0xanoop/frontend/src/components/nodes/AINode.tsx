import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export const AINode = ({ data }: NodeProps<{ label: string, description: string }>) => {
  return (
    <Card className="w-64 border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 shadow-lg">
      <div className="bg-card rounded-[calc(var(--radius)-2px)] h-full w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{data.label || 'AI-Generated Node'}</CardTitle>
          <Sparkles className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">Custom Module</div>
          <p className="text-xs text-muted-foreground truncate">{data.description || 'User-defined logic.'}</p>
        </CardContent>
      </div>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </Card>
  );
};