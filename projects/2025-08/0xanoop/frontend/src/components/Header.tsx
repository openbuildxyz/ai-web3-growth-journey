"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Network, Bot, Rocket, LayoutDashboard } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Link } from "react-router-dom";

interface HeaderProps {
  onDeployClick: () => void;
}

export const Header = ({ onDeployClick }: HeaderProps) => {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected, chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  const handleChainChange = (value: string) => {
    const chainId = parseInt(value, 10);
    if (switchChain) {
      switchChain({ chainId });
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h1 className="text-xl font-bold">Gen3Dao</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-muted-foreground" />
          <Select onValueChange={handleChainChange} value={chain?.id.toString()}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a chain" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isConnected ? (
          <Button onClick={() => disconnect()} variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            {address ? formatAddress(address) : "Disconnect"}
          </Button>
        ) : (
          <Button onClick={() => connect({ connector: injected() })} variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
        <Button onClick={onDeployClick}>
          <Rocket className="mr-2 h-4 w-4" />
          Deploy
        </Button>
      </div>
    </header>
  );
};