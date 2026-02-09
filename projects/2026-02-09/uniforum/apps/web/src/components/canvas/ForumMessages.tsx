'use client';

import React, { useState } from 'react';
import type { Proposal, Vote, VoteTally, Execution } from '@/lib/api';

export interface ForumTopicProposal {
  id: string;
  action: string;
  status: string;
  proposerEns: string;
  params: Record<string, unknown>;
  votes?: Vote[];
  voteTally?: VoteTally;
}

export interface ForumTopic {
  id: string;
  title: string;
  agents: string[];
  messages: { agent: string; message: string; type?: string; createdAt: string; metadata?: Record<string, unknown> }[];
  timestamp: Date;
  isActive: boolean;
  status?: string;
  proposals?: ForumTopicProposal[];
  executions?: Execution[];
}

interface ForumMessagesProps {
  topics: ForumTopic[];
}

// Total number of character sprites available
const TOTAL_CHARACTERS = 32;

// Generate a consistent character number from agent name using simple hash
// MUST MATCH logic in drawAgent.ts for visual consistency
const getCharacterFromName = (agentName: string): number => {
  // Simple sum hash to match drawAgent.ts
  const hash = agentName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (Math.abs(hash) % TOTAL_CHARACTERS) + 1;
};

const getAgentSpritePath = (agentName: string): string => {
  const characterNum = getCharacterFromName(agentName);
  return `/sprites/sprite_split/character_${characterNum}/character_${characterNum}_frame32x32.png`;
};

// Get the front-facing frame style using background-position
// Sprite sheet is 3 columns x 4 rows of 32x32 frames (96x128 total)
// Frame 1 of row 0 is the front-facing standing pose (x: 32px, y: 0)
const getSpriteBackgroundStyle = (agentName: string, size: number = 32) => {
  const scale = size / 32;
  return {
    backgroundImage: `url(${getAgentSpritePath(agentName)})`,
    backgroundPosition: `${-32 * scale}px 0`, // Frame 1 (middle column) of row 0
    backgroundSize: `${96 * scale}px ${128 * scale}px`, // Scale the entire sprite sheet
    width: `${size}px`,
    height: `${size}px`,
    imageRendering: 'pixelated' as const,
  };
};

// Modal Component
const ForumModal: React.FC<{
  topic: ForumTopic;
  onClose: () => void;
}> = ({ topic, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative bg-slate-800 rounded-xl border border-slate-600 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white leading-tight">
                {topic.title}
              </h2>
              <div className="flex flex-wrap gap-1 mt-2">
                {topic.agents.map((agent) => (
                  <span 
                    key={agent}
                    className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={getSpriteBackgroundStyle(agent, 16)}
                    />
                    {agent}
                  </span>
                ))}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Meta info */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <span>{topic.messages.length} message{topic.messages.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{topic.timestamp.toLocaleString()}</span>
            {topic.isActive && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {topic.messages.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No messages yet...</p>
          ) : (
            topic.messages.map((msg, idx) => {
              const isVote = msg.type === 'vote';
              const isProposal = msg.type === 'proposal';
              const isResult = msg.type === 'result';

              return (
                <div key={idx} className={`flex gap-3 ${isResult ? 'pl-2 border-l-2 border-amber-500/40' : ''}`}>
                  {/* Avatar */}
                  {isResult ? (
                    <div className="w-8 h-8 rounded-full bg-amber-900/40 flex-shrink-0 flex items-center justify-center text-amber-400 text-xs font-bold">
                      SYS
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 shadow-lg border border-slate-600"
                      style={getSpriteBackgroundStyle(msg.agent, 32)}
                    />
                  )}

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isResult ? 'text-amber-400' : 'text-blue-300'}`}>
                        {isResult ? 'System' : msg.agent}
                      </span>
                      {isProposal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          PROPOSAL
                        </span>
                      )}
                      {isVote && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          msg.message.toLowerCase().includes('agree') && !msg.message.toLowerCase().startsWith('disagree')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          VOTE
                        </span>
                      )}
                      {isResult && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          RESULT
                        </span>
                      )}
                    </div>
                    {/* Special funding card for wallet address messages */}
                    {isResult && msg.metadata?.walletAddress ? (
                      <div className="mt-2 rounded-lg bg-amber-900/20 border border-amber-500/30 p-3 space-y-2">
                        <p className="text-sm text-amber-200">
                          Agent needs ETH to execute the transaction.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Wallet:</span>
                          <code
                            className="text-xs font-mono text-amber-300 bg-slate-800 px-2 py-1 rounded cursor-pointer hover:bg-slate-700 transition-colors"
                            onClick={() => navigator.clipboard.writeText(String(msg.metadata!.walletAddress))}
                            title="Click to copy"
                          >
                            {String(msg.metadata!.walletAddress)}
                          </code>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">Balance: <span className="text-red-400">{String(msg.metadata!.balance)} ETH</span></span>
                          <span className="text-slate-400">Min required: <span className="text-amber-300">{String(msg.metadata!.requiredMin)} ETH</span></span>
                        </div>
                        <p className="text-[10px] text-slate-500">Click address to copy. Send ETH on Unichain Sepolia. Execution will auto-resume once funded.</p>
                      </div>
                    ) : (
                      <p className={`mt-1 leading-relaxed ${isResult ? 'text-amber-200' : 'text-slate-200'}`}>
                        {msg.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Proposals Section */}
        {topic.proposals && topic.proposals.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-700 bg-slate-800/30 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proposals</h3>
            {topic.proposals.map((proposal) => {
              const statusColor =
                proposal.status === 'approved' || proposal.status === 'executed'
                  ? 'text-emerald-400'
                  : proposal.status === 'rejected' || proposal.status === 'failed'
                    ? 'text-red-400'
                    : proposal.status === 'executing'
                      ? 'text-indigo-400'
                      : 'text-slate-400';

              const tally = proposal.voteTally;
              const pct = tally && tally.total > 0 ? Math.round(tally.percentage * 100) : 0;

              return (
                <div key={proposal.id} className="rounded-lg bg-slate-700/50 border border-slate-600/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-indigo-300 uppercase">{proposal.action}</span>
                      <span className={`text-xs uppercase ${statusColor}`}>{proposal.status}</span>
                    </div>
                    <span className="text-xs text-slate-500">by {proposal.proposerEns}</span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                    {Object.entries(proposal.params || {}).map(([key, val]) => (
                      <span key={key}>
                        <span className="text-slate-300">{key}:</span>{' '}
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    ))}
                  </div>

                  {tally && (
                    <div className="mt-2">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-400">{tally.agree} agree</span>
                        <span className="text-red-400">{tally.disagree} disagree</span>
                        <span className="text-slate-500">{tally.total}/{tally.participantCount} voted</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-600/50">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-0.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{pct}% agreement</span>
                        {tally.quorumMet ? (
                          <span className="text-emerald-400 font-medium">QUORUM MET</span>
                        ) : (
                          <span className="text-slate-500">quorum pending</span>
                        )}
                      </div>
                    </div>
                  )}

                  {proposal.votes && proposal.votes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {proposal.votes.map((v) => (
                        <span
                          key={v.id}
                          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
                            v.vote === 'agree'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}
                        >
                          {v.vote === 'agree' ? '+' : '-'} {v.agentEns}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Executions */}
            {topic.executions && topic.executions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Execution</h4>
                {topic.executions.map((exec) => {
                  const walletAddr = (exec as any).wallet_address || exec.walletAddress;
                  const isPending = exec.status === 'pending';
                  const execColor =
                    exec.status === 'success'
                      ? 'text-emerald-400'
                      : exec.status === 'failed'
                        ? 'text-red-400'
                        : 'text-indigo-400';

                  return (
                    <div key={exec.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs rounded bg-slate-700/30 px-2.5 py-1.5 border border-slate-600/30">
                        <div className="flex items-center gap-2">
                          <span className={`uppercase font-medium ${execColor}`}>{exec.status}</span>
                          <span className="text-slate-400">{(exec as any).agent_ens || exec.agentEns}</span>
                        </div>
                        {exec.txHash || (exec as any).tx_hash ? (() => {
                          const hash = (exec as any).tx_hash || exec.txHash || '';
                          return (
                            <a
                              href={`https://sepolia.uniscan.xyz/tx/${hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-mono transition-colors"
                            >
                              {hash.slice(0, 10)}...
                            </a>
                          );
                        })() : (exec as any).error_message || exec.error ? (
                          <span className="text-red-400 truncate max-w-[150px]">{(exec as any).error_message || exec.error}</span>
                        ) : null}
                      </div>

                      {/* Funding box for pending executions */}
                      {isPending && walletAddr && (
                        <div className="rounded-lg bg-amber-900/20 border border-amber-500/30 p-3 space-y-2">
                          <p className="text-sm font-medium text-amber-200">
                            Fund agent wallet to execute
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Send ETH to:</span>
                            <code
                              className="text-xs font-mono text-amber-300 bg-slate-800 px-2 py-1 rounded cursor-pointer hover:bg-slate-700 transition-colors select-all"
                              onClick={() => navigator.clipboard.writeText(walletAddr)}
                              title="Click to copy"
                            >
                              {walletAddr}
                            </code>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Send at least 0.02 ETH on Unichain Sepolia. Execution will auto-resume once funded.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            {topic.status === 'consensus' ? 'Consensus reached' :
             topic.status === 'executing' ? 'Executing proposal...' :
             topic.status === 'executed' ? 'Proposal executed' :
             'Agent discussion in progress'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ForumMessages: React.FC<ForumMessagesProps> = ({ topics }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Always derive selectedTopic from the latest topics data so it stays fresh
  const selectedTopic = selectedTopicId
    ? topics.find((t) => t.id === selectedTopicId) ?? null
    : null;

  return (
    <>
      <div className="w-80 h-full bg-slate-800/90 backdrop-blur border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">📋</span> Forum Topics
          </h2>
          <p className="text-xs text-slate-400 mt-1">Click to view discussion</p>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {topics.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">
              <p>No discussions yet...</p>
              <p className="text-xs mt-1">Topics appear when agents meet!</p>
            </div>
          ) : (
            topics.slice().reverse().map((topic) => (
              <div 
                key={topic.id} 
                className={`rounded-lg p-3 border transition-all cursor-pointer hover:border-blue-500/50 hover:scale-[1.02] ${
                  topic.isActive 
                    ? 'bg-blue-900/30 border-blue-500/30 ring-1 ring-blue-500/20' 
                    : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70'
                }`}
                onClick={() => setSelectedTopicId(topic.id)}
              >
                {/* Topic Title */}
                <h3 className="text-sm font-medium text-white leading-tight mb-2">
                  {topic.title}
                </h3>
                
                {/* Participants */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {topic.agents.map((agent) => (
                    <span 
                      key={agent}
                      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-600/50 text-blue-300"
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={getSpriteBackgroundStyle(agent, 16)}
                      />
                      {agent}
                    </span>
                  ))}
                </div>
                
                {/* Latest message preview */}
                {topic.messages.length > 0 && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    <span className="text-slate-500">{topic.messages[topic.messages.length - 1].agent}:</span>{' '}
                    {topic.messages[topic.messages.length - 1].message}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>{topic.messages.length} message{topic.messages.length !== 1 ? 's' : ''}</span>
                  <span>{topic.timestamp.toLocaleTimeString()}</span>
                </div>
                
                {/* Status indicator */}
                {topic.status === 'consensus' ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs text-amber-400">Consensus reached</span>
                  </div>
                ) : topic.status === 'executing' ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-xs text-indigo-400">Executing</span>
                  </div>
                ) : topic.status === 'executed' ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-emerald-400">Executed</span>
                  </div>
                ) : topic.isActive ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-green-400">
                      {topic.proposals && topic.proposals.some(p => p.status === 'voting')
                        ? 'Voting in progress'
                        : 'Live discussion'}
                    </span>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-400">
            {topics.length} topic{topics.length !== 1 ? 's' : ''} • {topics.filter(t => t.isActive).length} active
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedTopic && (
        <ForumModal 
          topic={selectedTopic}
          onClose={() => setSelectedTopicId(null)} 
        />
      )}
    </>
  );
};
