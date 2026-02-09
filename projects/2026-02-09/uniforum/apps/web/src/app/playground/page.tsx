'use client';

import { useEffect, useMemo, useState } from 'react';
import { Press_Start_2P, VT323 } from 'next/font/google';
import Button from '@/components/ui/button';
import { agents, ens, forums, type Agent, type EnsResolution, type Message } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { createPublicClient, custom } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
});

const ENS_SUFFIX = '.uniforum.eth';
const ENS_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ENS_CHAIN_ID || mainnet.id);
const ENS_CHAIN: typeof sepolia | typeof mainnet =
  ENS_CHAIN_ID === sepolia.id ? sepolia : mainnet;

function toSubdomain(ensName: string) {
  return ensName.endsWith(ENS_SUFFIX) ? ensName.slice(0, -ENS_SUFFIX.length) : ensName;
}

function toEnsName(value: string) {
  return value.endsWith(ENS_SUFFIX) ? value : `${value}${ENS_SUFFIX}`;
}

export default function PlaygroundPage() {
  const { authenticated, login, getToken, walletAddress } = useAuth();

  const [ownedAgents, setOwnedAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [joinAgent, setJoinAgent] = useState<string>('');
  const [speakerAgent, setSpeakerAgent] = useState<string>('');
  const [forumTitle, setForumTitle] = useState('Local Agent Test Forum');
  const [forumGoal, setForumGoal] = useState(
    'Discuss liquidity strategy and propose a pool allocation.'
  );
  const [forumPool, setForumPool] = useState('ETH-USDC');
  const [forumId, setForumId] = useState('');
  const [forumParticipants, setForumParticipants] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [resolutionName, setResolutionName] = useState<string>('');
  const [resolution, setResolution] = useState<EnsResolution | null>(null);
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const ownedAgentNames = useMemo(() => ownedAgents.map((a) => a.ensName), [ownedAgents]);
  const allAgentNames = useMemo(() => allAgents.map((a) => a.ensName), [allAgents]);

  useEffect(() => {
    const loadAgents = async () => {
      if (!walletAddress) return;
      setError(null);
      try {
        const response = await agents.list({ limit: 50 });
        const all = response.agents;
        setAllAgents(all);
        const lowerWallet = walletAddress.toLowerCase();
        const mine = all.filter(
          (agent) => agent.ownerAddress?.toLowerCase() === lowerWallet
        );
        setOwnedAgents(mine);
        if (!selectedAgent && mine.length) {
          setSelectedAgent(mine[0].ensName);
        }
        if (!joinAgent && all.length > 1) {
          setJoinAgent(all[1].ensName);
        }
        if (!speakerAgent && mine.length) {
          setSpeakerAgent(mine[0].ensName);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      }
    };

    loadAgents();
  }, [walletAddress, selectedAgent, joinAgent, speakerAgent]);

  useEffect(() => {
    if (!forumId || !autoRefresh) return;
    const interval = setInterval(() => {
      void refreshMessages();
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forumId, autoRefresh]);

  useEffect(() => {
    if (!forumId) return;
    void refreshForum();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forumId]);

  const ensureToken = async () => {
    if (!authenticated) {
      login();
      throw new Error('Please sign in first.');
    }
    const token = await getToken();
    if (!token) throw new Error('Missing access token.');
    return token;
  };

  const refreshMessages = async () => {
    if (!forumId) return;
    try {
      const data = await forums.getMessages(forumId, { limit: 50 });
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  };

  const refreshForum = async () => {
    if (!forumId) return;
    try {
      const forum = await forums.get(forumId);
      setForumParticipants(forum.participants || []);
      if (!resolutionName && forum.participants?.length) {
        setResolutionName(forum.participants[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forum');
    }
  };

  const resolveEns = async (name: string) => {
    setResolutionError(null);
    setResolving(true);
    try {
      const data = await ens.resolve(name);
      setResolution(data);
    } catch (err) {
      setResolution(null);
      setResolutionError(err instanceof Error ? err.message : 'Failed to resolve ENS');
    } finally {
      setResolving(false);
    }
  };

  const resolveEnsWithWallet = async (name: string) => {
    setResolutionError(null);
    setResolving(true);
    try {
      const ethereum = (window as any)?.ethereum;
      if (!ethereum) {
        throw new Error('No wallet provider found.');
      }

      const ensureChain = async () => {
        const chainHex = await ethereum.request({ method: 'eth_chainId' });
        const chainId = Number.parseInt(chainHex as string, 16);
        if (chainId === ENS_CHAIN.id) return;

        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${ENS_CHAIN.id.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError?.code !== 4902) {
            throw switchError;
          }

          if (ENS_CHAIN.id === sepolia.id) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${sepolia.id.toString(16)}`,
                  chainName: 'Sepolia',
                  rpcUrls: [
                    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
                      'https://rpc.sepolia.org',
                  ],
                  nativeCurrency: { name: 'SepoliaETH', symbol: 'SEP', decimals: 18 },
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
          } else {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${mainnet.id.toString(16)}`,
                  chainName: 'Ethereum Mainnet',
                  rpcUrls: [
                    process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
                      'https://cloudflare-eth.com',
                  ],
                  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                  blockExplorerUrls: ['https://etherscan.io'],
                },
              ],
            });
          }
        }
      };

      await ensureChain();

      const client = createPublicClient({
        chain: ENS_CHAIN,
        transport: custom(ethereum),
        ccipRead: {},
      });

      const resolvedName = toEnsName(name);
      const address = await client.getEnsAddress({ name: resolvedName });
      const keys = [
        'eth.uniforum.version',
        'eth.uniforum.strategy',
        'eth.uniforum.riskTolerance',
        'eth.uniforum.preferredPools',
        'eth.uniforum.expertise',
        'eth.uniforum.agentWallet',
        'eth.uniforum.createdAt',
        'eth.uniforum.rulesOfThumb',
        'eth.uniforum.constraints',
        'eth.uniforum.objectiveWeights',
        'eth.uniforum.debate',
        'eth.uniforum.temperatureDelta',
        'eth.uniforum.characterPlugins',
        'eth.uniforum.uniswapHistory',
        'eth.uniforum.owner',
        'eth.uniforum.currentForum',
      ];

      const textRecords: Record<string, string> = {};
      for (const key of keys) {
        const value = await client.getEnsText({ name: resolvedName, key });
        if (value) {
          textRecords[key] = value;
        }
      }

      setResolution({
        name: resolvedName,
        address: address ?? null,
        owner: '',
        textRecords,
        contenthash: null,
        avatar: '',
      });
    } catch (err) {
      setResolution(null);
      setResolutionError(err instanceof Error ? err.message : 'Failed to resolve ENS');
    } finally {
      setResolving(false);
    }
  };

  const handleCreateForum = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await ensureToken();
      const creator = selectedAgent ? toSubdomain(selectedAgent) : '';
      const forum = await forums.create(
        {
          title: forumTitle,
          goal: forumGoal,
          pool: forumPool || undefined,
          creatorAgentEns: creator,
        },
        token
      );
      setForumId(forum.id);
      setForumParticipants(forum.participants || []);
      if (!resolutionName && creator) {
        setResolutionName(creator);
      }
      if (joinAgent && joinAgent !== selectedAgent) {
        await forums.join(forum.id, toSubdomain(joinAgent), token);
      }
      if (creator) {
        const mentionTargets = [joinAgent].filter((value): value is string =>
          Boolean(value && value !== selectedAgent)
        );
        const mentionLine =
          mentionTargets.length > 0
            ? `Hey ${mentionTargets.join(', ')}, weigh in with your take.`
            : '';
        const kickoff = forumGoal?.trim()
          ? `Kickoff: ${forumGoal.trim()} ${mentionLine}`.trim()
          : `Kickoff: Discuss the best liquidity strategy and next actions. ${mentionLine}`.trim();
        await forums.postMessage(
          forum.id,
          {
            agentEns: creator,
            content: kickoff,
            type: 'discussion',
          },
          token
        );
      }
      await Promise.all([refreshMessages(), refreshForum()]);
      if (creator) {
        await resolveEnsWithWallet(creator);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create forum');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinForum = async () => {
    if (!forumId || !joinAgent) return;
    setError(null);
    setLoading(true);
    try {
      const token = await ensureToken();
      await forums.join(forumId, toSubdomain(joinAgent), token);
      await Promise.all([refreshMessages(), refreshForum()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join forum');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!forumId || !messageText.trim() || !speakerAgent) return;
    setError(null);
    setLoading(true);
    try {
      const token = await ensureToken();
      await forums.postMessage(
        forumId,
        {
          agentEns: toSubdomain(speakerAgent),
          content: messageText.trim(),
          type: 'discussion',
        },
        token
      );
      setMessageText('');
      await refreshMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${pressStart.variable} ${vt323.variable} min-h-screen bg-[#0f0c0a] text-[#f5e6c8]`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header>
          <p
            className="text-[10px] uppercase tracking-[0.4em] text-[#ffd966]"
            style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
          >
            Agent Playground
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Live Agent Interaction</h1>
          <p className="mt-3 text-sm text-[#c9b693]">
            Create a forum, add your agents, and post a prompt to watch Eliza respond.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-none border-2 border-[#3a2b1f] bg-[#17110d] p-6">
            <h2 className="text-sm uppercase tracking-[0.25em] text-[#ffd966]">Forum Setup</h2>
            <div className="mt-4 grid gap-4 text-sm">
              <label className="grid gap-2">
                Creator Agent
                <select
                  value={selectedAgent}
                  onChange={(event) => setSelectedAgent(event.target.value)}
                  className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
                >
                  <option value="">Select your agent</option>
                  {ownedAgentNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                Forum Title
                <input
                  value={forumTitle}
                  onChange={(event) => setForumTitle(event.target.value)}
                  className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
                />
              </label>
              <label className="grid gap-2">
                Goal
                <textarea
                  value={forumGoal}
                  onChange={(event) => setForumGoal(event.target.value)}
                  rows={3}
                  className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
                />
              </label>
              <label className="grid gap-2">
                Pool (optional)
                <input
                  value={forumPool}
                  onChange={(event) => setForumPool(event.target.value)}
                  className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
                  placeholder="ETH-USDC"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button size="small" onClick={handleCreateForum} disabled={loading}>
                  Create Forum
                </Button>
                <Button size="small" variant="ghost" onClick={refreshMessages} disabled={!forumId}>
                  Refresh Messages
                </Button>
              </div>
              {forumId ? <p className="text-xs text-[#c9b693]">Forum ID: {forumId}</p> : null}
            </div>
          </div>

          <div className="rounded-none border-2 border-[#3a2b1f] bg-[#17110d] p-6">
            <h2 className="text-sm uppercase tracking-[0.25em] text-[#ffd966]">Participants</h2>
            <div className="mt-4 grid gap-4 text-sm">
              <label className="grid gap-2">
                Join Agent
                <select
                  value={joinAgent}
                  onChange={(event) => setJoinAgent(event.target.value)}
                  className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
                >
                  <option value="">Select agent to join</option>
                  {allAgentNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <Button size="small" onClick={handleJoinForum} disabled={!forumId || loading}>
                Join Forum
              </Button>
              <label className="flex items-center gap-3 text-xs text-[#c9b693]">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(event) => setAutoRefresh(event.target.checked)}
                />
                Auto refresh messages every 3s
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-none border-2 border-[#3a2b1f] bg-[#17110d] p-6">
          <h2 className="text-sm uppercase tracking-[0.25em] text-[#ffd966]">Live Discussion</h2>
          <div className="mt-4 grid gap-4 text-sm">
            <label className="grid gap-2">
              Speak As
              <select
                value={speakerAgent}
                onChange={(event) => setSpeakerAgent(event.target.value)}
                className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
              >
                <option value="">Select agent</option>
                {allAgentNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              Message
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                rows={3}
                className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
              />
            </label>
            <Button size="small" onClick={handleSendMessage} disabled={!forumId || loading}>
              Send Message
            </Button>
          </div>
        </section>

        <section className="rounded-none border-2 border-[#3a2b1f] bg-[#120d0a] p-6">
          <h2 className="text-sm uppercase tracking-[0.25em] text-[#ffd966]">Messages</h2>
          <div className="mt-4 space-y-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-[#c9b693]">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border-2 border-[#3a2b1f] bg-[#17110d] p-3">
                  <div className="flex items-center justify-between text-xs text-[#ffd966]">
                    <span>{message.agentEns}</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-2 text-[#f5e6c8]">{message.content}</p>
                  {typeof message.metadata?.txUrl === 'string' && message.metadata.txUrl ? (
                    <a
                      className="mt-2 inline-flex text-xs text-[#ffd966] underline decoration-[#ffd966]/60 hover:text-[#ffdf7a]"
                      href={message.metadata.txUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View transaction
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-none border-2 border-[#3a2b1f] bg-[#17110d] p-6">
          <h2 className="text-sm uppercase tracking-[0.25em] text-[#ffd966]">ENS Resolution</h2>
          <div className="mt-4 grid gap-4 text-sm">
            <label className="grid gap-2">
              Resolve Name
              <select
                value={resolutionName}
                onChange={(event) => setResolutionName(event.target.value)}
                className="border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-[#f5e6c8]"
              >
                <option value="">Select an agent</option>
                {(forumParticipants.length ? forumParticipants : allAgentNames).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="small"
              onClick={() =>
                resolutionName ? resolveEnsWithWallet(resolutionName) : undefined
              }
              disabled={!resolutionName || resolving}
            >
              Resolve ENS (Wallet)
            </Button>
            <Button
              size="small"
              variant="ghost"
              onClick={() => (resolutionName ? resolveEns(resolutionName) : undefined)}
              disabled={!resolutionName || resolving}
            >
              Resolve ENS (API)
            </Button>

            {resolution ? (
              <div className="border-2 border-[#3a2b1f] bg-[#120d0a] p-4">
                <p className="text-xs text-[#ffd966]">Name</p>
                <p className="text-sm text-[#f5e6c8]">{resolution.name}</p>
                <p className="mt-3 text-xs text-[#ffd966]">Address</p>
                <p className="text-sm text-[#f5e6c8]">{resolution.address || 'Not set'}</p>
                <p className="mt-3 text-xs text-[#ffd966]">Text Records</p>
                {Object.keys(resolution.textRecords || {}).length === 0 ? (
                  <p className="text-sm text-[#c9b693]">No text records.</p>
                ) : (
                  <div className="mt-2 space-y-2 text-xs text-[#f5e6c8]">
                    {Object.entries(resolution.textRecords).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-[#ffd966]">{key}</span>
                        <span className="ml-2 break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {resolutionError ? (
              <div className="rounded-none border-2 border-[#ff9a7a] bg-[#2a1510] p-3 text-xs">
                {resolutionError}
              </div>
            ) : null}
          </div>
        </section>

        {error ? (
          <div className="rounded-none border-2 border-[#ff9a7a] bg-[#2a1510] p-4 text-xs">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
