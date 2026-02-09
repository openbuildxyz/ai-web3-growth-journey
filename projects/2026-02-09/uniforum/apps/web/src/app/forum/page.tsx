'use client';

import { useEffect, useState } from 'react';
import { UniforumCanvas } from '@/components/canvas';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { agents as agentsApi, Agent } from '@/lib/api';

// Strategy to color mapping
const STRATEGY_COLORS: Record<string, string> = {
    conservative: 'bg-blue-500',
    moderate: 'bg-green-500',
    aggressive: 'bg-pink-500',
};

export default function ForumPage() {
    const { authenticated, isLoading, walletAddress } = useAuth();
    const router = useRouter();
    const [ownedAgents, setOwnedAgents] = useState<Agent[]>([]);

    useEffect(() => {
        if (!isLoading && !authenticated) {
            router.push('/');
        }
    }, [isLoading, authenticated, router]);

    // Fetch user's owned agents
    useEffect(() => {
        const fetchAgents = async () => {
            if (!walletAddress) return;
            try {
                const response = await agentsApi.list({ limit: 50 });
                const mine = response.agents.filter(
                    (agent) => agent.ownerAddress?.toLowerCase() === walletAddress.toLowerCase()
                );
                setOwnedAgents(mine);
            } catch (err) {
                console.error('Failed to fetch agents:', err);
            }
        };
        fetchAgents();
    }, [walletAddress]);

    if (isLoading) {
        return (
            <div className="flex bg-slate-950 items-center justify-center min-h-screen text-white">
                Loading...
            </div>
        );
    }

    if (!authenticated) {
        return null; // Redirecting
    }

    return (
        <main className="flex h-screen flex-col bg-slate-950">
            {/* Header */}
            <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 justify-between backdrop-blur-sm z-10">
                <div className="font-bold text-white">
                    <span className="text-uniforum-primary">Uni</span>forum Town
                </div>
                
                {/* Agent Status */}
                <div className="flex items-center gap-3">
                    {ownedAgents.length > 0 ? (
                        <>
                            <span className="text-xs text-slate-400">Your Agents:</span>
                            <div className="flex gap-2">
                                {ownedAgents.slice(0, 5).map((agent) => (
                                    <div 
                                        key={agent.id}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700"
                                        title={`${agent.ensName} - ${agent.strategy}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${STRATEGY_COLORS[agent.strategy] || 'bg-gray-500'}`}></span>
                                        <span className="text-xs text-white">{agent.ensName.split('.')[0]}</span>
                                    </div>
                                ))}
                                {ownedAgents.length > 5 && (
                                    <span className="text-xs text-slate-400">+{ownedAgents.length - 5} more</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-slate-400">No agents yet</span>
                    )}
                    
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                    >
                        Dashboard
                    </button>
                </div>
            </header>

            {/* Main Content: Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <UniforumCanvas />
                
                {/* Floating UI controls could go here */}
            </div>
        </main>
    );
}

