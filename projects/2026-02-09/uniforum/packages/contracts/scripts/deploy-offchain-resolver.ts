import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';
import { createPublicClient, createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

type CompileResult = {
  abi: any[];
  bytecode: Hex;
};

function resolvePath(relativePath: string) {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(scriptDir, relativePath);
}

function findImports(importPath: string) {
  const contractsDir = resolvePath('../contracts');
  const candidates = [
    path.resolve(contractsDir, importPath),
    path.resolve(contractsDir, importPath.replace('./', '')),
    path.resolve(contractsDir, importPath.replace('../', '')),
    path.resolve(contractsDir, importPath.replace('../', '')),
    path.resolve(contractsDir, importPath.replace(/^@/, 'node_modules/@')),
    path.resolve(contractsDir, '../node_modules', importPath),
    path.resolve(contractsDir, '../../node_modules', importPath),
    path.resolve(process.cwd(), 'node_modules', importPath),
  ];

  for (const candidate of candidates) {
    try {
      const contents = readFileSync(candidate, 'utf8');
      return { contents };
    } catch {
      continue;
    }
  }

  return { error: `Import not found: ${importPath}` };
}

function compileOffchainResolver(): CompileResult {
  const contractPath = resolvePath('../contracts/OffchainResolver.sol');
  const source = readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'OffchainResolver.sol': { content: source },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors && output.errors.length > 0) {
    const fatal = output.errors.filter((err: any) => err.severity === 'error');
    for (const err of output.errors) {
      console.error(err.formattedMessage || err.message);
    }
    if (fatal.length > 0) {
      throw new Error('Solidity compilation failed.');
    }
  }

  const contract = output.contracts?.['OffchainResolver.sol']?.['OffchainResolver'];
  if (!contract) {
    throw new Error('Compiled OffchainResolver not found in output.');
  }

  const bytecode = `0x${contract.evm.bytecode.object}` as Hex;
  return { abi: contract.abi, bytecode };
}

async function main() {
  const rpcUrl = 'https://sepolia.drpc.org';
  if (!rpcUrl) {
    throw new Error('Missing ETH_RPC_URL (or SEPOLIA_RPC_URL). Set it to a Sepolia RPC endpoint.');
  }

  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!deployerKey) {
    throw new Error('Missing DEPLOYER_PRIVATE_KEY.');
  }

  const gatewayUrl =
    process.env.ENS_CCIP_GATEWAY_URL ||
    process.env.ENS_GATEWAY_URL ||
    'https://api-uniforum.up.railway.app/v1/ens/ccip';

  const signerAddress =
    process.env.ENS_CCIP_SIGNER_ADDRESS ||
    (process.env.ENS_CCIP_SIGNER_PRIVATE_KEY
      ? privateKeyToAccount(process.env.ENS_CCIP_SIGNER_PRIVATE_KEY as Hex).address
      : undefined);

  if (!signerAddress) {
    throw new Error(
      'Missing ENS_CCIP_SIGNER_ADDRESS (or ENS_CCIP_SIGNER_PRIVATE_KEY to derive it).'
    );
  }

  const { abi, bytecode } = compileOffchainResolver();
  const account = privateKeyToAccount(deployerKey as Hex);
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport,
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport,
  });

  console.log('[deploy] deploying OffchainResolver to Sepolia...');
  console.log(`[deploy] gateway url: ${gatewayUrl}`);
  console.log(`[deploy] signer: ${signerAddress}`);

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [gatewayUrl, [signerAddress]],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;
  if (!address) {
    throw new Error('Deployment failed: no contract address in receipt.');
  }

  console.log('[deploy] success');
  console.log(`OFFCHAIN_RESOLVER_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error('[deploy] failed', err);
  process.exit(1);
});
