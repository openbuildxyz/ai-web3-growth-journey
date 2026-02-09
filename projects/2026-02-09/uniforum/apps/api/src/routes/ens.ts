import { Hono, type Context } from 'hono';
import { getSupabase } from '../lib/supabase';
import { buildEnsTextRecords, ENS_TEXT_KEYS } from '@uniforum/contracts';
import { ENS_CONFIG } from '@uniforum/shared';
import {
  decodeFunctionData,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionResult,
  encodePacked,
  encodeFunctionData,
  keccak256,
  isAddress,
  namehash,
  toBytes,
  toHex,
  createPublicClient,
  http,
} from 'viem';
import { secp256k1 } from '@noble/curves/secp256k1';

export const ensRoutes = new Hono();

const ENS_SUFFIX = `.${ENS_CONFIG.PARENT_DOMAIN}`;
console.log('[ens.ts] Module loaded. ENS_SUFFIX:', ENS_SUFFIX, 'ENS_CONFIG:', ENS_CONFIG);

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  'https://e3ca-2001-f40-9a4-9909-c174-3ed7-2e4a-bb9e.ngrok-free.app';

function normalizeEnsInput(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.endsWith(ENS_SUFFIX)) {
    return {
      subdomain: trimmed.slice(0, -ENS_SUFFIX.length),
      full: trimmed,
    };
  }
  return {
    subdomain: trimmed,
    full: `${trimmed}${ENS_SUFFIX}`,
  };
}

const RESOLVE_ABI = [
  {
    type: 'function',
    name: 'resolve',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: 'result', type: 'bytes' }],
  },
] as const;

const ADDR_ABI = [
  {
    type: 'function',
    name: 'addr',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: 'a', type: 'address' }],
  },
] as const;

const ADDR_COIN_ABI = [
  {
    type: 'function',
    name: 'addr',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'coinType', type: 'uint256' },
    ],
    outputs: [{ name: 'a', type: 'bytes' }],
  },
] as const;

const TEXT_ABI = [
  {
    type: 'function',
    name: 'text',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: 'value', type: 'string' }],
  },
] as const;

const CONTENTHASH_ABI = [
  {
    type: 'function',
    name: 'contenthash',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: 'hash', type: 'bytes' }],
  },
] as const;

const ADDR_SELECTOR = '0x3b3b57de';
const ADDR_COIN_SELECTOR = '0xf1cb7e06';
const TEXT_SELECTOR = '0x59d1d43c';
const CONTENTHASH_SELECTOR = '0xbc1c58d1';
const RESOLVE_WITH_PROOF_ABI = [
  {
    type: 'function',
    name: 'resolveWithProof',
    stateMutability: 'view',
    inputs: [
      { name: 'response', type: 'bytes' },
      { name: 'extraData', type: 'bytes' },
    ],
    outputs: [{ name: 'result', type: 'bytes' }],
  },
] as const;

function decodeDnsName(encoded: Uint8Array): string {
  const labels: string[] = [];
  let offset = 0;
  while (offset < encoded.length) {
    const len = encoded[offset];
    if (len === 0) break;
    const labelBytes = encoded.slice(offset + 1, offset + 1 + len);
    labels.push(new TextDecoder().decode(labelBytes));
    offset += len + 1;
  }
  return labels.join('.');
}

function encodeDnsName(name: string): `0x${string}` {
  const labels = name.split('.');
  const bytes: number[] = [];
  for (const label of labels) {
    const enc = new TextEncoder().encode(label);
    bytes.push(enc.length, ...enc);
  }
  bytes.push(0);
  return `0x${Buffer.from(bytes).toString('hex')}` as `0x${string}`;
}

function buildSignatureHash(
  resolverAddress: string,
  expires: bigint,
  request: `0x${string}`,
  result: `0x${string}`
): `0x${string}` {
  const packed = encodePacked(
    ['bytes2', 'address', 'uint64', 'bytes32', 'bytes32'],
    ['0x1900', resolverAddress as `0x${string}`, expires, keccak256(request), keccak256(result)]
  );
  return keccak256(packed);
}

function signHash(hash: `0x${string}`, privateKey: `0x${string}`): `0x${string}` {
  const sig = secp256k1.sign(toBytes(hash), toBytes(privateKey));
  const compact = sig.toCompactRawBytes();
  const r = toHex(compact.slice(0, 32)).slice(2).padStart(64, '0');
  const s = toHex(compact.slice(32, 64)).slice(2).padStart(64, '0');
  const v = (sig.recovery ?? 0) + 27;
  return `0x${r}${s}${v.toString(16).padStart(2, '0')}`;
}

function getAgentWalletAddress(agent: unknown): string | undefined {
  if (!agent || typeof agent !== 'object') return undefined;
  const wallets = (agent as { agent_wallets?: unknown }).agent_wallets;
  if (!wallets) return undefined;
  if (Array.isArray(wallets)) {
    const first = wallets[0] as { wallet_address?: string } | undefined;
    return first?.wallet_address;
  }
  return (wallets as { wallet_address?: string }).wallet_address;
}

function normalizeWalletAddress(value: unknown): string {
    console.log('normalizeWalletAddress', value);
  if (typeof value !== 'string') return ZERO_ADDRESS;
  return isAddress(value) ? value : ZERO_ADDRESS;
}  

async function resolveRecord(name: string, data: `0x${string}`) {
  console.log('[resolveRecord] Starting with name:', name, 'data:', data?.slice(0, 20));
  
  try {
    if (typeof name !== 'string') {
      throw new Error(`name is not a string: ${typeof name}`);
    }
    
    const { subdomain, full } = normalizeEnsInput(name);
    console.log('[resolveRecord] Normalized - subdomain:', subdomain, 'full:', full);
    
    if (!full.endsWith(ENS_SUFFIX)) {
      throw new Error('Unsupported ENS domain');
    }

    const supabase = getSupabase();
    const { data: agent, error } = await supabase
      .from('agents')
      .select(
        `
        *,
        agent_wallets (wallet_address)
      `
      )
      .eq('ens_name', subdomain)
      .eq('status', 'active')
      .single();

    console.log('[resolveRecord] Agent query error:', error?.message);
    console.log('[resolveRecord] Agent found:', agent ? 'yes' : 'no');

    if (error || !agent) {
      return {
        result: encodeAbiParameters([{ type: 'bytes' }], ['0x']),
        fullName: full,
      };
    }

    console.log('[resolveRecord] agent.agent_wallets:', JSON.stringify(agent.agent_wallets));
    const rawWalletAddress = getAgentWalletAddress(agent);
    console.log('[resolveRecord] rawWalletAddress:', rawWalletAddress, 'type:', typeof rawWalletAddress);
    const walletAddress = normalizeWalletAddress(rawWalletAddress);
    console.log('[resolveRecord] walletAddress:', walletAddress);
    const safeWalletAddress = isAddress(walletAddress) ? walletAddress : ZERO_ADDRESS;
    console.log('[resolveRecord] safeWalletAddress:', safeWalletAddress);
  if (safeWalletAddress === ZERO_ADDRESS && rawWalletAddress) {
    console.warn(
      'Unexpected wallet address value:',
      typeof rawWalletAddress,
      rawWalletAddress
    );
  }

  console.log('[resolveRecord] Building text records with:', {
    strategy: agent.strategy,
    riskTolerance: agent.risk_tolerance,
    preferredPools: agent.preferred_pools,
    expertiseContext: typeof agent.expertise_context,
    agentWallet: safeWalletAddress,
    createdAt: agent.created_at,
  });
  
  const textRecords: Record<string, string> = buildEnsTextRecords({
    strategy: agent.strategy,
    riskTolerance: agent.risk_tolerance,
    preferredPools: agent.preferred_pools,
    expertiseContext: agent.expertise_context || '',
    agentWallet: safeWalletAddress,
    createdAt: new Date(agent.created_at),
    characterConfig: (agent as { character_config?: Record<string, unknown> }).character_config,
    characterPlugins:
      (agent as { character_plugins?: string[] | null }).character_plugins || undefined,
    uniswapHistory: (agent as { uniswap_history?: unknown }).uniswap_history,
  });
  console.log('[resolveRecord] Text records built successfully');

  textRecords['eth.uniforum.owner'] = agent.owner_address;
  textRecords[ENS_TEXT_KEYS.AGENT_WALLET] = safeWalletAddress;
  if (agent.current_forum_id) {
    textRecords['eth.uniforum.currentForum'] = agent.current_forum_id;
  }

  console.log('[resolveRecord] About to get selector from data');
  const selector = data.slice(0, 10).toLowerCase();
  console.log('[resolveRecord] selector:', selector);

  if (selector === ADDR_SELECTOR) {
    console.log('[resolveRecord] Processing addr() call');
    const decoded = decodeFunctionData({ abi: ADDR_ABI, data });
    console.log('[resolveRecord] About to call namehash with full:', full, 'type:', typeof full);
    const expectedNode = namehash(full);
    console.log('[resolveRecord] namehash result:', expectedNode);
    if (decoded.args?.[0] !== expectedNode) {
      return { result: encodeAbiParameters([{ type: 'bytes' }], ['0x']), fullName: full };
    }
    if (!isAddress(safeWalletAddress)) {
      return { result: encodeAbiParameters([{ type: 'bytes' }], ['0x']), fullName: full };
    }
    const result = encodeFunctionResult({
      abi: ADDR_ABI,
      functionName: 'addr',
      result: safeWalletAddress as `0x${string}`,
    });
    return { result, fullName: full };
  }

  if (selector === ADDR_COIN_SELECTOR) {
    const decoded = decodeFunctionData({ abi: ADDR_COIN_ABI, data });
    const expectedNode = namehash(full);
    const coinType = decoded.args?.[1] as bigint;
    if (decoded.args?.[0] !== expectedNode || coinType !== 60n) {
      const empty = encodeAbiParameters([{ type: 'bytes' }], ['0x']);
      return { result: empty, fullName: full };
    }
    const addressBytes = toHex(toBytes(safeWalletAddress));
    const result = encodeFunctionResult({
      abi: ADDR_COIN_ABI,
      functionName: 'addr',
      result: addressBytes,
    });
    return { result, fullName: full };
  }

  if (selector === TEXT_SELECTOR) {
    const decoded = decodeFunctionData({ abi: TEXT_ABI, data });
    const expectedNode = namehash(full);
    const key = decoded.args?.[1] as string;
    if (decoded.args?.[0] !== expectedNode) {
      const empty = encodeFunctionResult({
        abi: TEXT_ABI,
        functionName: 'text',
        result: '',
      });
      return { result: empty, fullName: full };
    }
    const value = textRecords[key] ?? '';
    const result = encodeFunctionResult({
      abi: TEXT_ABI,
      functionName: 'text',
      result: value,
    });
    return { result, fullName: full };
  }

  if (selector === CONTENTHASH_SELECTOR) {
    const decoded = decodeFunctionData({ abi: CONTENTHASH_ABI, data });
    const expectedNode = namehash(full);
    if (decoded.args?.[0] !== expectedNode) {
      const empty = encodeFunctionResult({
        abi: CONTENTHASH_ABI,
        functionName: 'contenthash',
        result: '0x',
      });
      return { result: empty, fullName: full };
    }
    const empty = encodeFunctionResult({
      abi: CONTENTHASH_ABI,
      functionName: 'contenthash',
      result: '0x',
    });
    return { result: empty, fullName: full };
  }

  return { result: encodeAbiParameters([{ type: 'bytes' }], ['0x']), fullName: full };
  } catch (err) {
    console.error('[resolveRecord] Error:', err);
    console.error('[resolveRecord] Stack:', err instanceof Error ? err.stack : 'no stack');
    throw err;
  }
}

/**
 * ENS Offchain Resolver Gateway
 *
 * These endpoints implement a CCIP-Read compliant gateway for resolving
 * .uniforum.eth subnames without on-chain registration.
 *
 * Flow:
 * 1. User queries yudhagent.uniforum.eth
 * 2. ENS mainnet resolver has CCIP-Read set to this gateway
 * 3. Gateway queries Supabase for agent data
 * 4. Returns address and text records
 */

// GET /ens/resolve/:name - Resolve ENS name to address and records
ensRoutes.get('/resolve/:name', async (c) => {
  const name = c.req.param('name');
  const supabase = getSupabase();

  const { subdomain, full: ensName } = normalizeEnsInput(name);

  // Query agent
  const { data: agent, error } = await supabase
    .from('agents')
    .select(
      `
      *,
      agent_wallets (wallet_address)
    `
    )
    .eq('ens_name', subdomain)
    .eq('status', 'active')
    .single();

  if (error || !agent) {
    return c.json(
      {
        error: 'Name not found',
        message: `No agent found for ${ensName}`,
      },
      404
    );
  }

  const walletAddress = normalizeWalletAddress(getAgentWalletAddress(agent));

  const textRecords: Record<string, string> = buildEnsTextRecords({
    strategy: agent.strategy,
    riskTolerance: agent.risk_tolerance,
    preferredPools: agent.preferred_pools,
    expertiseContext: agent.expertise_context || '',
    agentWallet: walletAddress,
    createdAt: new Date(agent.created_at),
    characterConfig: (agent as { character_config?: Record<string, unknown> }).character_config,
    characterPlugins:
      (agent as { character_plugins?: string[] | null }).character_plugins || undefined,
    uniswapHistory: (agent as { uniswap_history?: unknown }).uniswap_history,
  });

  textRecords['eth.uniforum.owner'] = agent.owner_address;
  textRecords[ENS_TEXT_KEYS.AGENT_WALLET] = walletAddress;

  // Add optional records if present
  if (agent.current_forum_id) {
    textRecords['eth.uniforum.currentForum'] = agent.current_forum_id;
  }

  return c.json({
    name: ensName,
    address: walletAddress,
    owner: agent.owner_address,
    textRecords,
    contenthash: null,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${subdomain}`,
  });
});

// CCIP-Read gateway endpoint
ensRoutes.get('/ccip', async (c) => {
  const sender = c.req.query('sender');
  const data = c.req.query('data');
  if (!sender || !data) {
    return c.json({ error: 'Missing sender or data' }, 400);
  }
  return await handleCcipRequest(c, sender, data);
});

ensRoutes.post('/ccip', async (c) => {
  let body: { sender?: string; data?: string } = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.sender || !body.data) {
    return c.json({ error: 'Missing sender or data' }, 400);
  }

  return await handleCcipRequest(c, body.sender, body.data);
});

// GET /ens/text/:name/:key - Get specific text record
ensRoutes.get('/text/:name/:key', async (c) => {
  const name = c.req.param('name');
  const key = c.req.param('key');
  const supabase = getSupabase();

  const { subdomain, full: ensName } = normalizeEnsInput(name);

  const { data: agent, error } = await supabase
    .from('agents')
    .select(
      `
      *,
      agent_wallets (wallet_address)
    `
    )
    .eq('ens_name', subdomain)
    .eq('status', 'active')
    .single();

  if (error || !agent) {
    return c.json({ error: 'Name not found' }, 404);
  }

  const walletAddress = normalizeWalletAddress(getAgentWalletAddress(agent));

  // Map key to value
  const keyMap: Record<string, string | null> = {
    ...buildEnsTextRecords({
      strategy: agent.strategy,
      riskTolerance: agent.risk_tolerance,
      preferredPools: agent.preferred_pools,
      expertiseContext: agent.expertise_context || '',
      agentWallet: walletAddress,
      createdAt: new Date(agent.created_at),
      characterConfig: (agent as { character_config?: Record<string, unknown> }).character_config,
      characterPlugins:
        (agent as { character_plugins?: string[] | null }).character_plugins || undefined,
      uniswapHistory: (agent as { uniswap_history?: unknown }).uniswap_history,
    }),
    'eth.uniforum.owner': agent.owner_address,
    'eth.uniforum.currentForum': agent.current_forum_id,
    // Standard ENS records
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${subdomain}`,
    description: `Uniforum agent with ${agent.strategy} strategy`,
    url: `${APP_URL.replace(/\/$/, '')}/agents/${ensName}`,
  };

  const value = keyMap[key];

  if (value === undefined) {
    return c.json(
      {
        key,
        value: null,
        message: 'Text record not found',
      },
      404
    );
  }

  return c.json({
    key,
    value,
  });
});

// GET /ens/address/:name - Get address for name (convenience endpoint)
ensRoutes.get('/address/:name', async (c) => {
  const name = c.req.param('name');
  const supabase = getSupabase();

  const { subdomain, full: ensName } = normalizeEnsInput(name);

  const { data: agent, error } = await supabase
    .from('agents')
    .select('agent_wallets (wallet_address)')
    .eq('ens_name', subdomain)
    .eq('status', 'active')
    .single();

  if (error || !agent) {
    return c.json({ error: 'Name not found' }, 404);
  }

  const walletAddress = normalizeWalletAddress(getAgentWalletAddress(agent));
  return c.json({
    name: ensName,
    address: walletAddress,
  });
});

// GET /ens/verify/:name - Verify CCIP-Read resolution via resolveWithProof
ensRoutes.get('/verify/:name', async (c) => {
  const name = c.req.param('name');
  const { full: ensName } = normalizeEnsInput(name);

  const resolverAddress = "0x2846431C50663E1Afc306074FDf3EfC894683ed5";
  const gatewayUrl = "https://api-uniforum.up.railway.app/v1/ens/ccip"
  const rpcUrl = "https://sepolia.drpc.org";

  if (!resolverAddress || !gatewayUrl || !rpcUrl) {
    return c.json(
      { error: 'Missing ENS_OFFCHAIN_RESOLVER_ADDRESS, ENS_CCIP_GATEWAY_URL, or RPC URL' },
      500
    );
  }

  const dns = encodeDnsName(ensName);
  const node = namehash(ensName);
  const addrData = encodeFunctionData({
    abi: ADDR_ABI,
    functionName: 'addr',
    args: [node],
  });
  const callData = encodeFunctionData({
    abi: RESOLVE_ABI,
    functionName: 'resolve',
    args: [dns, addrData],
  });

  let responseData: `0x${string}` | undefined;
  const res = await fetch(gatewayUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sender: resolverAddress, data: callData }),
  });
  if (!res.ok) {
    const body = await res.text();
    return c.json({ error: 'Gateway error', status: res.status, body }, 502);
  }
  try {
    const json = (await res.json()) as { data?: `0x${string}`; result?: `0x${string}` };
    responseData = json.data || json.result;
  } catch {
    return c.json({ error: 'Gateway returned invalid JSON' }, 502);
  }
  if (!responseData) {
    return c.json({ error: 'Gateway response missing data' }, 502);
  }

  const extraData = encodeAbiParameters(
    [{ type: 'bytes' }, { type: 'address' }],
    [callData, resolverAddress as `0x${string}`]
  );

  const client = createPublicClient({ transport: http(rpcUrl) });
  const result = await client.readContract({
    address: resolverAddress as `0x${string}`,
    abi: RESOLVE_WITH_PROOF_ABI,
    functionName: 'resolveWithProof',
    args: [responseData, extraData],
  });

  const decoded = decodeFunctionResult({
    abi: ADDR_ABI,
    functionName: 'addr',
    data: result,
  }) as readonly [`0x${string}`];

  return c.json({
    ok: true,
    name: ensName,
    address: decoded[0],
  });
});

async function handleCcipRequest(c: Context, sender: string, data: string) {
  try {
    const resolverAddress = process.env.ENS_OFFCHAIN_RESOLVER_ADDRESS;
    const signerKey = process.env.ENS_CCIP_SIGNER_PRIVATE_KEY;

    if (!resolverAddress || !signerKey) {
      return c.json({ error: 'CCIP signer configuration missing' }, 500);
    }

    const senderValue = Array.isArray(sender) ? sender[0] : sender;
    const dataValue = Array.isArray(data) ? data[0] : data;

    console.log('CCIP request from sender:', senderValue);
    console.log('CCIP request data:', dataValue);
    console.log('Using resolver address:', resolverAddress);

    if (typeof senderValue !== 'string' || typeof dataValue !== 'string') {
      return c.json({ error: 'Invalid sender or data type' }, 400);
    }

    if (!senderValue.startsWith('0x')) {
      return c.json({ error: 'Invalid sender address' }, 400);
    }

    const normalizedResolver = resolverAddress.startsWith('0x')
      ? resolverAddress
      : `0x${resolverAddress}`;
    const normalizedSigner = signerKey.startsWith('0x') ? signerKey : `0x${signerKey}`;

    if (normalizedResolver.toLowerCase() !== senderValue.toLowerCase()) {
      return c.json({ error: 'Resolver address mismatch' }, 400);
    }

    if (!dataValue.startsWith('0x')) {
      return c.json({ error: 'Invalid resolve calldata' }, 400);
    }

    const calldata = dataValue as `0x${string}`;
    let decoded;
    try {
      decoded = decodeFunctionData({ abi: RESOLVE_ABI, data: calldata });
    } catch {
      return c.json({ error: 'Invalid resolve calldata' }, 400);
    }

    const nameBytes = decoded.args?.[0];
    const recordData = decoded.args?.[1];

    if (typeof nameBytes !== 'string' || typeof recordData !== 'string') {
      return c.json({ error: 'Invalid resolve args' }, 400);
    }

    const dnsName = decodeDnsName(toBytes(nameBytes)).toLowerCase();
    const { result } = await resolveRecord(dnsName, recordData as `0x${string}`);
    const expires = BigInt(Math.floor(Date.now() / 1000) + 300);

    const signatureHash = buildSignatureHash(
      normalizedResolver as `0x${string}`,
      expires,
      calldata,
      result
    );

    const signature = signHash(signatureHash, normalizedSigner as `0x${string}`);
    const response = encodeAbiParameters(
      [
        { name: 'result', type: 'bytes' },
        { name: 'expires', type: 'uint64' },
        { name: 'sig', type: 'bytes' },
      ],
      [result, expires, signature]
    );

    return c.json({ data: response });
  } catch (error) {
    console.error('[ccip] Gateway error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ error: 'Internal Server Error', message }, 500);
  }
}

// GET /ens/list - List all registered names (admin/debug endpoint)
ensRoutes.get('/list', async (c) => {
  const supabase = getSupabase();

  const { limit, offset } = c.req.query();

  const limitNum = Math.min(parseInt(limit || '50', 10), 100);
  const offsetNum = parseInt(offset || '0', 10);

  const {
    data: agents,
    error,
    count,
  } = await supabase
    .from('agents')
    .select('ens_name, status, created_at', { count: 'exact' })
    .eq('status', 'active')
    .range(offsetNum, offsetNum + limitNum - 1)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to list names' }, 500);
  }

  return c.json({
    names: agents?.map((a) => a.ens_name) || [],
    pagination: {
      limit: limitNum,
      offset: offsetNum,
      total: count,
    },
  });
});
