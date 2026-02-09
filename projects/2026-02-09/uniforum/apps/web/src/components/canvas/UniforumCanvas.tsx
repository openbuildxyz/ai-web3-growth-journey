'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CanvasManager } from './core/CanvasManager';
import { Agent } from './core/types';
import { ForumMessages, ForumTopic } from './ForumMessages';
import {
    agents as agentsApi,
    Agent as ApiAgent,
    forums as forumsApi,
    proposals as proposalsApi,
    executions as executionsApi,
    Forum,
} from '@/lib/api';

import { getRandomWalkablePosition, findPath, getNearestWalkablePosition } from './assets/mapData';

// Map strategy to color
const STRATEGY_COLORS: Record<string, string> = {
    conservative: '#3b82f6', // blue
    moderate: '#10b981',     // green
    aggressive: '#ec4899',   // pink
};

// Fallback colors for variety
const FALLBACK_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16'];

// Convert API Agent to Canvas Agent
const apiAgentToCanvasAgent = (apiAgent: ApiAgent, index: number): Agent => {
    const position = getRandomWalkablePosition();
    const color = STRATEGY_COLORS[apiAgent.strategy] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    
    return {
        id: apiAgent.id,
        name: apiAgent.ensName,
        position,
        color,
        status: 'moving',
        expertise: apiAgent.expertiseContext, // For expertise clustering
        direction: Math.random() > 0.5 ? 'left' : 'right',
    };
};

// Real data hook that fetches agents from API
const useCanvasData = (forumTopics: ForumTopic[]) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch agents from API on mount
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                setIsLoading(true);
                const response = await agentsApi.list({ limit: 50 });
                const canvasAgents = response.agents.map((agent, index) => 
                    apiAgentToCanvasAgent(agent, index)
                );
                setAgents(canvasAgents);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch agents:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch agents');
                // Fallback to sample agents for demo
                setAgents([
                    { id: 'demo1', name: 'demo.uniforum.eth', position: getRandomWalkablePosition(), color: '#3b82f6', status: 'moving' },
                    { id: 'demo2', name: 'sample.uniforum.eth', position: getRandomWalkablePosition(), color: '#10b981', status: 'moving' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAgents();
    }, []);

    // Forum-aware movement: agents in same forum cluster around creator
    useEffect(() => {
        if (forumTopics.length === 0) {
            // No forums - random movement
            const interval = setInterval(() => {
                setAgents(prev => prev.map(a => {
                if (a.status === 'discussing') return a;
                const move = Math.random() > 0.95; // Only 5% chance to move each check (was 70%)
                    if (!move) return a;
                    const target = getRandomWalkablePosition();
                    if (!target) return a;
                    const path = findPath(a.position, target);
                    if (path.length > 0) {
                        return { ...a, status: 'moving', path };
                    }
                    return a;
                }));
            }, 2000);
            return () => clearInterval(interval);
        }

        // Forum-based clustering
        const interval = setInterval(() => {
            setAgents(prev => {
                // Build a map of agent ENS -> forums they're in
                const agentForums = new Map<string, ForumTopic[]>();
                forumTopics.forEach(topic => {
                    if (!topic.isActive) return;
                    topic.agents.forEach(agentEns => {
                        const existing = agentForums.get(agentEns) || [];
                        agentForums.set(agentEns, [...existing, topic]);
                    });
                });

                return prev.map(agent => {
                    const myForums = agentForums.get(agent.name) || [];
                    
                    if (myForums.length === 0) {
                        // Not in any forum - check for expertise alignment with active forums
                        // User Request: "move to the forum that is closest to the level of expertise"
                        
                        // Find active forums and their creators
                        const activeForums = forumTopics.filter(f => f.isActive);
                        
                        if (activeForums.length > 0 && agent.expertise) {
                             // Find best matching forum based on expertise string (Exact/Normalized Match)
                             let bestForum: ForumTopic | null = null;
                             let bestCreator: Agent | undefined = undefined;

                             // Normalize my expertise
                             const myExpertise = agent.expertise.trim().toLowerCase();

                             for (const forum of activeForums) {
                                 const creatorEns = forum.agents[0];
                                 const creator = prev.find(a => a.name === creatorEns);
                                 
                                 if (creator && creator.expertise) {
                                     // Check for match
                                     const creatorExpertise = creator.expertise.trim().toLowerCase();
                                     if (myExpertise === creatorExpertise) {
                                         // Found a match!
                                         bestForum = forum;
                                         bestCreator = creator;
                                         break; // Stop at first match (or could prioritize by activity if multiple matches)
                                     }
                                 }
                             }

                             // If we found a matching forum (and its creator is on canvas), move towards it
                             if (bestForum && bestCreator) {
                                  // Cluster loosely around this forum (lurk)
                                  const agentIndex = prev.indexOf(agent); // Stable index for position
                                  const angle = (agentIndex + Date.now()/10000) % (Math.PI * 2); 
                                  const radius = 60 + (agentIndex % 3) * 15; // Further out than participants (35)
                                  
                                  const targetX = bestCreator.position.x + Math.cos(angle) * radius;
                                  const targetY = bestCreator.position.y + Math.sin(angle) * radius;

                                  // Find nearest walkable spot to the ideal target
                                  const validTarget = getNearestWalkablePosition(targetX, targetY);

                                  // Check distance
                                  const dist = Math.hypot(agent.position.x - validTarget.x, agent.position.y - validTarget.y);
                                  
                                  if (dist < 20) {
                                      return { ...agent, status: 'idle' };
                                  }
                                  
                                  const path = findPath(agent.position, validTarget);
                                  if (path.length > 0) {
                                       return { ...agent, status: 'moving', path };
                                  }
                             }
                        }


                        // Fallback: Random movement if no matching forum found
                        if (agent.status === 'discussing') {
                            return { ...agent, status: 'idle', lastMessage: undefined };
                        }
                        const move = Math.random() > 0.95; // Only 5% chance to move each check (was 50%)
                        if (!move || agent.path?.length) return agent;
                        const target = getRandomWalkablePosition();
                        if (!target) return agent;
                        const path = findPath(agent.position, target);
                        if (path.length > 0) {
                            return { ...agent, status: 'moving', path };
                        }
                        return agent;
                    }
                    
                    // Sort forums to prioritize active participation (Global Consensus)
                    // Pick the forum with the most recent message activity AND closest expertise match
                    myForums.sort((a, b) => {
                         const timeA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : 0;
                         const timeB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : 0;
                         
                         let scoreA = timeA;
                         let scoreB = timeB;

                         // Boost score if expertise matches
                         if (agent.expertise) {
                             const creatorA = prev.find(p => p.name === a.agents[0]);
                             const creatorB = prev.find(p => p.name === b.agents[0]);
                             
                             const myExpertise = agent.expertise.trim().toLowerCase();

                             if (creatorA?.expertise && creatorA.expertise.trim().toLowerCase() === myExpertise) {
                                 scoreA += 3600000; // Add 1 hour priority for matching expertise
                             }
                             if (creatorB?.expertise && creatorB.expertise.trim().toLowerCase() === myExpertise) {
                                  scoreB += 3600000;
                             }
                         }

                         return scoreB - scoreA; // Descending order
                    });
                    
                    // Agent is in a forum - find the creator (first participant) to cluster around
                    const primaryForum = myForums[0];
                    const creatorEns = primaryForum.agents[0]; // First participant is creator
                    
                    // Get latest message from this agent in the forum
                    const myMessages = primaryForum.messages.filter(m => {
                        // Soft matching for ENS names (case insensitive)
                        return m.agent.toLowerCase() === agent.name.toLowerCase();
                    });
                    
                    const latestMessage = myMessages.length > 0 
                        ? myMessages[myMessages.length - 1].message.slice(0, 60) + (myMessages[myMessages.length - 1].message.length > 60 ? '...' : '')
                        : undefined;
                    
                    // If this agent is the creator, stay put and discuss
                    if (creatorEns === agent.name) {
                        return {
                            ...agent,
                            status: 'discussing',
                            path: [],
                            lastMessage: latestMessage,
                        };
                    }
                    
                    // Find the creator agent's position
                    const creatorAgent = prev.find(a => a.name === creatorEns);
                    if (!creatorAgent) {
                        // Creator not on canvas - random position
                        return { ...agent, status: 'discussing', lastMessage: latestMessage };
                    }
                    
                    // Calculate offset position around creator (cluster formation)
                    const agentIndex = primaryForum.agents.indexOf(agent.name);
                    const angle = (agentIndex / primaryForum.agents.length) * 2 * Math.PI;
                    const radius = 35; // Distance from creator
                    const targetX = creatorAgent.position.x + Math.cos(angle) * radius;
                    const targetY = creatorAgent.position.y + Math.sin(angle) * radius;
                    
                    // Check if already close enough
                    const dist = Math.hypot(agent.position.x - targetX, agent.position.y - targetY);
                    if (dist < 15) {
                        return {
                            ...agent,
                            status: 'discussing',
                            path: [],
                            lastMessage: latestMessage,
                        };
                    }
                    
                    // Move toward cluster position
                    const validTarget = getNearestWalkablePosition(targetX, targetY);
                    const path = findPath(agent.position, validTarget);
                    // console.log(`[Canvas] Agent ${agent.name} moving to cluster - Target: ${validTarget.x},${validTarget.y}`);
                    return {
                        ...agent,
                        status: 'moving',
                        path: path.length > 0 ? path : [validTarget],
                        lastMessage: latestMessage,
                    };
                });
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [forumTopics]);

    return { agents, setAgents, isLoading, error };
};

export const UniforumCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const managerRef = useRef<CanvasManager | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Forum data - fetch first since agents need it for clustering
    const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
    const [, setIsLoadingForums] = useState(true);
    
    // Fetch real forums from API
    useEffect(() => {
        const fetchForums = async () => {
            try {
                setIsLoadingForums(true);
                const response = await forumsApi.list({ limit: 20 });

                // Convert API forums to ForumTopic format
                const topics: ForumTopic[] = await Promise.all(
                    response.forums.map(async (forum) => {
                        // Fetch messages for each forum
                        let messages: { agent: string; message: string; type?: string; createdAt: string; metadata?: Record<string, unknown> }[] = [];
                        try {
                            const msgResponse = await forumsApi.getMessages(forum.id, { limit: 50 });
                            messages = msgResponse.messages.map(msg => ({
                                agent: msg.agentEns,
                                message: msg.content,
                                type: msg.type,
                                createdAt: msg.createdAt,
                                metadata: msg.metadata,
                            }));
                        } catch (err) {
                            console.error(`Failed to fetch messages for forum ${forum.id}:`, err);
                        }

                        // Fetch proposals with vote details
                        let forumProposals: ForumTopic['proposals'] = [];
                        let forumExecutions: ForumTopic['executions'] = [];
                        try {
                            const propData = await forumsApi.getProposals(forum.id);
                            const propList = propData.proposals || [];
                            // Fetch detailed vote tally for each proposal
                            forumProposals = await Promise.all(
                                propList.map(async (p) => {
                                    try {
                                        const detailed = await proposalsApi.get(p.id);
                                        return {
                                            id: detailed.id,
                                            action: detailed.action,
                                            status: detailed.status,
                                            proposerEns: detailed.proposerEns,
                                            params: detailed.params,
                                            votes: detailed.votes,
                                            voteTally: detailed.voteTally,
                                        };
                                    } catch (err) {
                                        console.warn(`[Canvas] Failed to fetch proposal detail ${p.id}:`, err);
                                        return {
                                            id: p.id,
                                            action: p.action,
                                            status: p.status,
                                            proposerEns: p.proposerEns,
                                            params: p.params,
                                        };
                                    }
                                })
                            );

                            // Fetch executions if any proposal is approved+
                            const hasApproved = propList.some((p) =>
                                ['approved', 'executing', 'executed'].includes(p.status)
                            );
                            if (hasApproved) {
                                const execData = await executionsApi.list({ forumId: forum.id }).catch(() => ({ executions: [] }));
                                forumExecutions = execData.executions || [];
                            }
                        } catch (err) {
                            console.warn(`[Canvas] Failed to fetch proposals for forum ${forum.id}:`, err);
                        }

                        const topic = {
                            id: forum.id,
                            title: forum.title,
                            agents: forum.participants,
                            messages,
                            timestamp: new Date(forum.createdAt),
                            isActive: forum.status === 'active',
                            status: forum.status,
                            proposals: forumProposals,
                            executions: forumExecutions,
                        };
                        return topic;
                    })
                );
                
                setForumTopics(topics);
            } catch (err) {
                console.error('Failed to fetch forums:', err);
            } finally {
                setIsLoadingForums(false);
            }
        };
        
        fetchForums();
        
        // Poll for updates every 10 seconds
        const pollInterval = setInterval(fetchForums, 10000);
        return () => clearInterval(pollInterval);
    }, []);
    
    // Agent data - now with forum-aware clustering
    const { agents, setAgents } = useCanvasData(forumTopics);



    useEffect(() => {
        if (!canvasRef.current) return;

        const manager = new CanvasManager(
            canvasRef.current, 
            (_event) => {
                // console.log('Interaction:', _event);
            },
            (updatedAgents) => {
                // Sync status changes from CanvasManager back to React
                setAgents(updatedAgents);
                // Forums are now fetched from API (no longer generated locally)
            }
        );
        
        manager.start();
        managerRef.current = manager;

        return () => manager.destroy();
    }, [setAgents]);

    // Sync Data
    useEffect(() => {
        if (managerRef.current) {
            managerRef.current.setAgents(agents);
        }
    }, [agents]);

    // Handle Resize - DISABLED (Fixed Size)
    // useEffect(() => {
    //     const handleResize = () => {
    //          if (containerRef.current && managerRef.current) {
    //              const { clientWidth, clientHeight } = containerRef.current;
    //              managerRef.current.resize(clientWidth, clientHeight);
    //          }
    //     };
    //     window.addEventListener('resize', handleResize);
    //     handleResize();
    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);

    // Initial Setup with Fixed Size
    useEffect(() => {
        if (managerRef.current) {
             managerRef.current.resize(928, 640);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pan & Zoom Handlers - DISABLED
    const handleMouseDown = (e: React.MouseEvent) => {
        // Just click detection, no dragging
        managerRef.current?.handleInteractionRaw(e.clientX, e.clientY, 'click');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Just hover detection
        managerRef.current?.handleInteractionRaw(e.clientX, e.clientY, 'hover');
    };

    const handleMouseUp = () => {
        // No-op
    };

    return (
        <div className="w-full h-full flex bg-slate-900 overflow-hidden">
            {/* Forum Messages Panel - Left Side */}
            <ForumMessages topics={forumTopics} />
            
            {/* Canvas Area - Center */}
            <div className="flex-1 flex items-center justify-center">
                <div 
                    ref={containerRef} 
                    style={{ width: 928, height: 640 }}
                    className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700"
                >
                    <canvas 
                        ref={canvasRef} 
                        className="block outline-none cursor-default"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>
            </div>
        </div>
    );
};
