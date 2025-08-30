import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export const TokenNode = ({ data }: NodeProps<{ label: string, name: string, symbol: string }>) => {
  return (
    <Card className="w-64 border-2 border-primary shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold">{data.name || 'My Token'}</div>
        <p className="text-xs text-muted-foreground">{data.symbol || 'TKN'}</p>
      </CardContent>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
    </Card>
  );
};