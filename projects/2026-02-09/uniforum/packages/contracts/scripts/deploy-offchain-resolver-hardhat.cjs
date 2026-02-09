const hre = require('hardhat');

async function main() {
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerKey) {
    throw new Error('Missing DEPLOYER_PRIVATE_KEY.');
  }

  const gatewayUrl =
    process.env.ENS_CCIP_GATEWAY_URL ||
    process.env.ENS_GATEWAY_URL ||
    'https://api-uniforum.up.railway.app/v1/ens/ccip';

  let signerAddress = process.env.ENS_CCIP_SIGNER_ADDRESS;
  if (!signerAddress && process.env.ENS_CCIP_SIGNER_PRIVATE_KEY) {
    signerAddress = new hre.ethers.Wallet(
      process.env.ENS_CCIP_SIGNER_PRIVATE_KEY
    ).address;
  }
  if (!signerAddress) {
    throw new Error(
      'Missing ENS_CCIP_SIGNER_ADDRESS (or ENS_CCIP_SIGNER_PRIVATE_KEY to derive it).'
    );
  }

  console.log('[deploy] deploying OffchainResolver to Sepolia...');
  console.log(`[deploy] gateway url: ${gatewayUrl}`);
  console.log(`[deploy] signer: ${signerAddress}`);

  const factory = await hre.ethers.getContractFactory('OffchainResolver');
  const resolver = await factory.deploy(gatewayUrl, [signerAddress]);
  await resolver.waitForDeployment();

  const address = await resolver.getAddress();
  console.log('[deploy] success');
  console.log(`OFFCHAIN_RESOLVER_ADDRESS=${address}`);

  if (!process.env.ETHERSCAN_API_KEY) {
    console.warn(
      '[verify] ETHERSCAN_API_KEY not set, skipping verification.'
    );
    return;
  }

  try {
    await hre.run('verify:verify', {
      address,
      constructorArguments: [gatewayUrl, [signerAddress]],
    });
    console.log('[verify] submitted');
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    if (message.toLowerCase().includes('already verified')) {
      console.log('[verify] already verified');
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error('[deploy] failed', err);
  process.exit(1);
});
