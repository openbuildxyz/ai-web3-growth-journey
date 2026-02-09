import {
  createPublicClient,
  http,
  encodeFunctionData,
  decodeFunctionResult,
  namehash,
  encodeAbiParameters,
} from 'viem';

const resolver = process.env.RESOLVER || '0xfeb9Ab3b26bB829Fa0555d6735fc0852294CE2bC';
const name = process.env.ENS_NAME || 'jasdf.uniforum.eth';
const gateway =
  process.env.GATEWAY_URL ||
  'https://e3ca-2001-f40-9a4-9909-c174-3ed7-2e4a-bb9e.ngrok-free.app/v1/ens/ccip';
const rpc = process.env.RPC_URL || 'https://sepolia.drpc.org';

if (!resolver || !name || !gateway || !rpc) {
  console.error('Missing envs: RESOLVER, ENS_NAME, GATEWAY_URL, RPC_URL');
  process.exit(1);
}

function dnsEncode(n: string) {
  const labels = n.split('.');
  const bytes: number[] = [];
  for (const label of labels) {
    const enc = new TextEncoder().encode(label);
    bytes.push(enc.length, ...enc);
  }
  bytes.push(0);
  return `0x${Buffer.from(bytes).toString('hex')}` as const;
}

async function main() {
  const dns = dnsEncode(name);
  console.log('DNS encoded name:', dns);

  const node = namehash(name);
  console.log('namehash node:', node);

  const addrData = encodeFunctionData({
    abi: [
      {
        type: 'function',
        name: 'addr',
        stateMutability: 'view',
        inputs: [{ name: 'node', type: 'bytes32' }],
        outputs: [{ name: 'a', type: 'address' }],
      },
    ],
    functionName: 'addr',
    args: [node],
  });

  const callData = encodeFunctionData({
    abi: [
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
    ],
    functionName: 'resolve',
    args: [dns, addrData],
  });

  console.log('callData:', callData);

  const url = `${gateway}?sender=${resolver}&data=${callData}`;
  console.log('gateway url:', url);

  const res = await fetch(gateway, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sender: resolver, data: callData }),
  });
  console.log('gateway status:', res.status);

  const bodyText = await res.text();
  console.log('gateway body:', bodyText);

  let responseData: `0x${string}` | undefined;
  try {
    const json = JSON.parse(bodyText);
    console.log('gateway json:', json);
    responseData = json.data || json.result;
  } catch (e) {
    console.error('gateway returned non-json');
    process.exit(1);
  }

  if (!responseData) {
    console.error('missing response data');
    process.exit(1);
  }

  const extraData = encodeAbiParameters(
    [{ type: 'bytes' }, { type: 'address' }],
    [callData, resolver as `0x${string}`]
  );

  const client = createPublicClient({ transport: http(rpc) });

  const result = await client.readContract({
    address: resolver as `0x${string}`,
    abi: [
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
    ],
    functionName: 'resolveWithProof',
    args: [responseData, extraData],
  });

  const decoded = decodeFunctionResult({
    abi: [
      {
        type: 'function',
        name: 'addr',
        stateMutability: 'view',
        inputs: [{ name: 'node', type: 'bytes32' }],
        outputs: [{ name: 'a', type: 'address' }],
      },
    ],
    functionName: 'addr',
    data: result,
  });

  console.log('resolved addr:', decoded[0]);
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
