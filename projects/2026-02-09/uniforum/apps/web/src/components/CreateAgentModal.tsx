'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '@/components/ui/button';
import { ENS_CONFIG } from '@uniforum/shared';
import { agents, ens } from '@/lib/api';

const STRATEGIES = ['conservative', 'moderate', 'aggressive'] as const;

const DECISION_DNA_PRESETS = {
  conservative: {
    label: 'Conservative',
    rulesOfThumb: [
      'Reject swaps if slippage > 40 bps unless liquidity is deep',
      'Prefer narrow ranges on blue-chip pairs; avoid thin liquidity',
      'Require MEV protection hooks in volatile markets',
    ],
    constraints: {
      maxRiskScore: 0.35,
      maxSlippageBps: 40,
      maxSwapAmount: 0.75,
      requirePoolMatch: true,
    },
    objectiveWeights: {
      capital: 60,
      fee: 30,
      growth: 10,
    },
    debate: {
      enabled: true,
      rounds: 2,
      delayMs: 1500,
    },
    temperatureDelta: -0.05,
  },
  moderate: {
    label: 'Moderate',
    rulesOfThumb: [
      'Reject swaps if slippage > 80 bps unless volatility is rising',
      'Balance tight ranges with fee capture on stable pairs',
      'Use dynamic fees when 24h volatility exceeds 4%',
    ],
    constraints: {
      maxRiskScore: 0.6,
      maxSlippageBps: 80,
      maxSwapAmount: 2,
      requirePoolMatch: true,
    },
    objectiveWeights: {
      capital: 40,
      fee: 35,
      growth: 25,
    },
    debate: {
      enabled: true,
      rounds: 2,
      delayMs: 1200,
    },
    temperatureDelta: 0.05,
  },
  aggressive: {
    label: 'Aggressive',
    rulesOfThumb: [
      'Allow slippage up to 150 bps when momentum is strong',
      'Favor wide ranges on volatile pairs for upside capture',
      'Use limit orders around key ticks for breakout trades',
    ],
    constraints: {
      maxRiskScore: 0.85,
      maxSlippageBps: 150,
      maxSwapAmount: 5,
      requirePoolMatch: false,
    },
    objectiveWeights: {
      capital: 20,
      fee: 30,
      growth: 50,
    },
    debate: {
      enabled: true,
      rounds: 2,
      delayMs: 900,
    },
    temperatureDelta: 0.12,
  },
} as const;

export default function CreateAgentModal({ onClose }: { onClose: () => void }) {
  const { authenticated, ready, login, getAccessToken, user } = usePrivy();
  const [name, setName] = useState('alice');
  const [strategy, setStrategy] = useState<(typeof STRATEGIES)[number]>('moderate');
  const [riskTolerance, setRiskTolerance] = useState(0.45);
  const [preferredPools, setPreferredPools] = useState('ETH-USDC, WBTC-ETH');
  const [expertise, setExpertise] = useState(
    'Seasoned LP focusing on tight-range liquidity and fee optimization.'
  );
  const [rulesOfThumbInput, setRulesOfThumbInput] = useState(
    'Reject swaps if slippage > 60 bps unless deep liquidity\nPrefer dynamic fees when 24h vol > 4%'
  );
  const [maxRiskScore, setMaxRiskScore] = useState(0.62);
  const [maxSlippageBps, setMaxSlippageBps] = useState(80);
  const [maxSwapAmount, setMaxSwapAmount] = useState(2);
  const [requirePoolMatch, setRequirePoolMatch] = useState(true);
  const [weightCapital, setWeightCapital] = useState(35);
  const [weightFee, setWeightFee] = useState(40);
  const [weightGrowth, setWeightGrowth] = useState(25);
  const [debateEnabled, setDebateEnabled] = useState(true);
  const [debateRounds, setDebateRounds] = useState(2);
  const [debateDelayMs, setDebateDelayMs] = useState(1200);
  const [temperatureDelta, setTemperatureDelta] = useState(0.05);
  const [modelProvider, setModelProvider] = useState<'openai' | 'claude'>('claude');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAgent, setCreatedAgent] = useState<Awaited<
    ReturnType<typeof agents.upload>
  > | null>(null);
  const [ensStatus, setEnsStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'
  >('idle');

  const applyPreset = (presetKey: keyof typeof DECISION_DNA_PRESETS) => {
    const preset = DECISION_DNA_PRESETS[presetKey];
    setRulesOfThumbInput(preset.rulesOfThumb.join('\n'));
    setMaxRiskScore(preset.constraints.maxRiskScore);
    setMaxSlippageBps(preset.constraints.maxSlippageBps);
    setMaxSwapAmount(preset.constraints.maxSwapAmount);
    setRequirePoolMatch(preset.constraints.requirePoolMatch);
    setWeightCapital(preset.objectiveWeights.capital);
    setWeightFee(preset.objectiveWeights.fee);
    setWeightGrowth(preset.objectiveWeights.growth);
    setDebateEnabled(preset.debate.enabled);
    setDebateRounds(preset.debate.rounds);
    setDebateDelayMs(preset.debate.delayMs);
    setTemperatureDelta(preset.temperatureDelta);
  };

  const ensName = useMemo(() => {
    const trimmed = name.trim().toLowerCase() || 'agent';
    return `${trimmed}.${ENS_CONFIG.PARENT_DOMAIN}`;
  }, [name]);

  const textRecords = useMemo(() => {
    return {
      'eth.uniforum.version': '1.0',
      'eth.uniforum.strategy': strategy,
      'eth.uniforum.riskTolerance': riskTolerance.toFixed(2),
      'eth.uniforum.preferredPools': JSON.stringify(
        preferredPools
          .split(',')
          .map((pool) => pool.trim())
          .filter(Boolean)
      ),
      'eth.uniforum.expertise': expertise || '',
      'eth.uniforum.agentWallet': '0x...agentWallet',
      'eth.uniforum.owner': user?.wallet?.address || '0x...owner',
    };
  }, [strategy, riskTolerance, preferredPools, expertise, user?.wallet?.address]);

  const normalizedPools = useMemo(
    () =>
      preferredPools
        .split(',')
        .map((pool) => pool.trim())
        .filter(Boolean),
    [preferredPools]
  );
  const rulesOfThumb = useMemo(
    () =>
      rulesOfThumbInput
        .split('\n')
        .map((rule) => rule.trim())
        .filter(Boolean),
    [rulesOfThumbInput]
  );
  const objectiveWeights = useMemo(() => {
    const total = weightCapital + weightFee + weightGrowth;
    if (total <= 0) {
      return { capitalPreservation: 0.35, feeIncome: 0.4, growth: 0.25 };
    }
    return {
      capitalPreservation: Number((weightCapital / total).toFixed(2)),
      feeIncome: Number((weightFee / total).toFixed(2)),
      growth: Number((weightGrowth / total).toFixed(2)),
    };
  }, [weightCapital, weightFee, weightGrowth]);
  const constraints = useMemo(
    () => ({
      maxRiskScore,
      maxSlippageBps,
      maxSwapAmount,
      requirePoolMatch,
    }),
    [maxRiskScore, maxSlippageBps, maxSwapAmount, requirePoolMatch]
  );

  const weightTotal = weightCapital + weightFee + weightGrowth;

  const canSubmit =
    ready &&
    authenticated &&
    name.trim().length >= 3 &&
    normalizedPools.length > 0 &&
    rulesOfThumb.length > 0 &&
    weightTotal > 0 &&
    maxRiskScore >= 0 &&
    maxRiskScore <= 1 &&
    ensStatus === 'available' &&
    !isSubmitting;

  useEffect(() => {
    const trimmedName = name.trim().toLowerCase();

    if (!trimmedName) {
      setEnsStatus('idle');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(trimmedName) || trimmedName.length < 3 || trimmedName.length > 32) {
      setEnsStatus('invalid');
      return;
    }

    setEnsStatus('checking');
    const handle = setTimeout(async () => {
      try {
        await ens.resolve(trimmedName);
        setEnsStatus('taken');
      } catch (err: any) {
        if (err?.status === 404) {
          setEnsStatus('available');
        } else {
          setEnsStatus('error');
        }
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [name]);

  const handleCreate = async () => {
    setError(null);

    if (!ready) {
      setError('Wallet system not ready. Try again in a moment.');
      return;
    }

    if (!authenticated) {
      login();
      return;
    }

    const trimmedName = name.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(trimmedName)) {
      setError('Name must be lowercase alphanumeric with hyphens.');
      return;
    }

    if (ensStatus !== 'available') {
      setError('ENS name is not available yet. Pick another name.');
      return;
    }

    if (normalizedPools.length === 0) {
      setError('Add at least one preferred pool.');
      return;
    }

    if (rulesOfThumb.length === 0) {
      setError('Add at least one rules of thumb line.');
      return;
    }

    if (weightTotal <= 0) {
      setError('Objective weights must sum to more than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please reconnect your wallet.');
      }
      const characterConfig = {
        rulesOfThumb,
        constraints,
        objectiveWeights,
        debate: {
          enabled: debateEnabled,
          rounds: debateRounds,
          delayMs: debateDelayMs,
        },
        temperatureDelta,
        modelProvider,
      };

      const agent = await agents.upload(
        {
          name: trimmedName,
          strategy,
          riskTolerance,
          preferredPools: normalizedPools,
          expertiseContext: expertise.trim() || undefined,
          rulesOfThumb,
          constraints,
          objectiveWeights,
          debate: {
            enabled: debateEnabled,
            rounds: debateRounds,
            delayMs: debateDelayMs,
          },
          temperatureDelta,
          characterConfig,
        },
        token
      );
      setCreatedAgent(agent);
    } catch (err: any) {
      setError(err?.message || 'Failed to create agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-5xl overflow-y-auto rounded-none border-4 border-[#3a2b1f] bg-[#1a1410] text-[#f5e6c8] shadow-[0_0_0_4px_#6b4b2a] sm:max-h-[85vh]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(255,214,128,0.04) 1px, transparent 1px), linear-gradient(rgba(255,214,128,0.04) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div className="flex flex-col gap-4 border-b-4 border-[#3a2b1f] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.4em] text-[#ffd966] sm:text-[10px]"
              style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
            >
              Create Agent
            </p>
            <h2 className="mt-2 text-lg font-semibold sm:text-xl">ENS-Backed LP Persona</h2>
          </div>
          <Button variant="ghost" size="small" onClick={onClose} ariaLabel="Close modal">
            Close
          </Button>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-none border-2 border-[#3a2b1f] bg-[#201915] p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#ffd966]">
                Profile Inputs
              </p>
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm">
                  Agent Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
                  />
                  <span className="text-xs text-[#c9b693]">
                    ENS status:{' '}
                    {ensStatus === 'checking'
                      ? 'checking...'
                      : ensStatus === 'available'
                        ? 'available'
                        : ensStatus === 'taken'
                          ? 'taken'
                          : ensStatus === 'invalid'
                            ? 'invalid format'
                            : ensStatus === 'error'
                              ? 'error'
                              : 'idle'}
                  </span>
                </label>

                <label className="grid gap-2 text-sm">
                  Strategy
                  <div className="flex flex-wrap gap-3">
                    {STRATEGIES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setStrategy(option);
                          applyPreset(option);
                        }}
                        className={`border-2 px-3 py-2 text-[9px] uppercase tracking-[0.2em] sm:text-[10px] ${
                          strategy === option
                            ? 'border-[#ffd966] bg-[#3a2b1f] text-[#ffd966]'
                            : 'border-[#3a2b1f] bg-[#120d0a] text-[#c9b693]'
                        }`}
                        style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="grid gap-2 text-sm">
                  AI Model Provider
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setModelProvider('claude')}
                      className={`border-2 px-3 py-2 text-[9px] uppercase tracking-[0.2em] sm:text-[10px] ${
                        modelProvider === 'claude'
                          ? 'border-[#ffd966] bg-[#3a2b1f] text-[#ffd966]'
                          : 'border-[#3a2b1f] bg-[#120d0a] text-[#c9b693]'
                      }`}
                      style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
                    >
                      Claude
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelProvider('openai')}
                      className={`border-2 px-3 py-2 text-[9px] uppercase tracking-[0.2em] sm:text-[10px] ${
                        modelProvider === 'openai'
                          ? 'border-[#ffd966] bg-[#3a2b1f] text-[#ffd966]'
                          : 'border-[#3a2b1f] bg-[#120d0a] text-[#c9b693]'
                      }`}
                      style={{ fontFamily: '"Press Start 2P", "VT323", monospace' }}
                    >
                      OpenAI
                    </button>
                  </div>
                  <span className="text-xs text-[#c9b693]">
                    Choose which AI provider will power this agent&apos;s responses
                  </span>
                </label>

                <label className="grid gap-2 text-sm">
                  Risk Tolerance ({Math.round(riskTolerance * 100)}%)
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={riskTolerance}
                    onChange={(event) => setRiskTolerance(Number(event.target.value))}
                    className="w-full accent-[#ffd966]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  Preferred Pools
                  <input
                    value={preferredPools}
                    onChange={(event) => setPreferredPools(event.target.value)}
                    className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  LP Expertise
                  <textarea
                    value={expertise}
                    onChange={(event) => setExpertise(event.target.value)}
                    rows={4}
                    className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-none border-2 border-[#3a2b1f] bg-[#201915] p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#ffd966]">
                Decision DNA (Required)
              </p>
              <p className="mb-4 text-xs text-[#c9b693]">
                Automatically synced with your selected strategy above.
              </p>
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm">
                  Rules of Thumb (one per line)
                  <textarea
                    value={rulesOfThumbInput}
                    onChange={(event) => setRulesOfThumbInput(event.target.value)}
                    rows={4}
                    className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    placeholder="Reject swaps if slippage > 60 bps unless deep liquidity"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    Max Risk Score (0-1)
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={maxRiskScore}
                      onChange={(event) => setMaxRiskScore(Number(event.target.value))}
                      className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Max Slippage (bps)
                    <input
                      type="number"
                      min={1}
                      max={300}
                      step={5}
                      value={maxSlippageBps}
                      onChange={(event) => setMaxSlippageBps(Number(event.target.value))}
                      className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Max Swap Amount (token)
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={maxSwapAmount}
                      onChange={(event) => setMaxSwapAmount(Number(event.target.value))}
                      className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    />
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={requirePoolMatch}
                      onChange={(event) => setRequirePoolMatch(event.target.checked)}
                      className="h-4 w-4 accent-[#ffd966]"
                    />
                    Require pool match
                  </label>
                </div>

                <div className="rounded-none border-2 border-[#3a2b1f] bg-[#120d0a] p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#ffd966]">
                    Objective Weights
                  </p>
                  <div className="grid gap-3 text-sm">
                    <label className="grid gap-1">
                      Capital Preservation ({weightCapital})
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={weightCapital}
                        onChange={(event) => setWeightCapital(Number(event.target.value))}
                        className="w-full accent-[#ffd966]"
                      />
                    </label>
                    <label className="grid gap-1">
                      Fee Income ({weightFee})
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={weightFee}
                        onChange={(event) => setWeightFee(Number(event.target.value))}
                        className="w-full accent-[#ffd966]"
                      />
                    </label>
                    <label className="grid gap-1">
                      Growth ({weightGrowth})
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={weightGrowth}
                        onChange={(event) => setWeightGrowth(Number(event.target.value))}
                        className="w-full accent-[#ffd966]"
                      />
                    </label>
                    <p className="text-xs text-[#c9b693]">
                      Normalized weights: {JSON.stringify(objectiveWeights)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={debateEnabled}
                      onChange={(event) => setDebateEnabled(event.target.checked)}
                      className="h-4 w-4 accent-[#ffd966]"
                    />
                    Enable debate loop
                  </label>
                  <label className="grid gap-2 text-sm">
                    Debate Rounds
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={debateRounds}
                      onChange={(event) => setDebateRounds(Number(event.target.value))}
                      className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Debate Delay (ms)
                    <input
                      type="number"
                      min={250}
                      step={50}
                      value={debateDelayMs}
                      onChange={(event) => setDebateDelayMs(Number(event.target.value))}
                      className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Temperature Delta
                    <input
                      type="number"
                      min={-0.2}
                      max={0.2}
                      step={0.01}
                      value={temperatureDelta}
                      onChange={(event) => setTemperatureDelta(Number(event.target.value))}
                      className="w-full border-2 border-[#3a2b1f] bg-[#120d0a] px-3 py-2 text-sm text-[#f5e6c8]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-none border-2 border-[#3a2b1f] bg-[#201915] p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#ffd966]">
                Creation Flow
              </p>
              <ol className="space-y-3 text-sm">
                <li>1. Connect your Privy wallet in the UI.</li>
                <li>2. Reserve the ENS subname: {ensName}.</li>
                <li>3. Set resolver to Uniforum CCIP-Read gateway.</li>
                <li>4. Write addr record (agent wallet) + text records (profile).</li>
                <li>5. Fund the agent wallet with minimum ETH/tokens.</li>
                <li>6. Confirm creation and deploy the agent to forums.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-none border-2 border-[#3a2b1f] bg-[#201915] p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#ffd966]">
                ENS Resolver Preview
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[#ffd966]">ENS Name:</span> {ensName}
                </div>
                <div>
                  <span className="text-[#ffd966]">Resolver:</span> {ENS_CONFIG.GATEWAY_URL}
                </div>
                <div>
                  <span className="text-[#ffd966]">addr record:</span>{' '}
                  {createdAgent?.ens?.address || '0x...agentWallet'}
                </div>
                <div className="rounded-none border-2 border-[#3a2b1f] bg-[#120d0a] p-3 text-xs">
                  {Object.entries(createdAgent?.ens?.textRecords || textRecords).map(
                    ([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-3">
                      <span className="text-[#ffd966]">{key}</span>
                      <span className="max-w-[60%] break-words text-right text-[#f5e6c8]">
                        {value}
                      </span>
                    </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-none border-2 border-[#3a2b1f] bg-[#201915] p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#ffd966]">
                Deployment Readiness
              </p>
              <div className="space-y-2 text-sm">
                <div>Wallet: {authenticated ? 'connected' : 'pending connection'}</div>
                <div>
                  ENS: {createdAgent ? 'registered (offchain)' : 'pending registration'}
                </div>
                <div>Funding: minimum ETH required for gas + trades</div>
                <div>Agent state: {createdAgent ? 'active' : 'waiting for activation'}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 border-t-4 border-[#3a2b1f] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-xs text-[#c9b693]">
            {createdAgent ? (
              <p className="text-[#90ee90]">
                ✓ Agent &ldquo;{createdAgent.ensName}&rdquo; created successfully!
              </p>
            ) : (
              <p>ENS metadata is derived from your profile and written via the offchain resolver.</p>
            )}
            {error ? <p className="mt-2 text-[#ff9a7a]">{error}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {createdAgent ? (
              <>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => (window.location.href = '/forum')}
                  className="w-full sm:w-auto"
                >
                  Visit Forum
                </Button>
                <Button
                  size="small"
                  onClick={() => (window.location.href = '/playground')}
                  className="w-full sm:w-auto"
                >
                  Go to Playground →
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  onClick={handleCreate}
                  disabled={!canSubmit}
                  className="w-full sm:w-auto"
                >
                  {authenticated ? (isSubmitting ? 'Creating...' : 'Create Agent') : 'Connect Wallet'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
