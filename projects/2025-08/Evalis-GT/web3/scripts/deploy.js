const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying EvalisToken...');
  const Token = await ethers.getContractFactory('EvalisToken');
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log('Token deployed at:', tokenAddr);

  // Set voting params
  const votingDelay = 1; // blocks
  const votingPeriod = 50400; // ~1 week on Ethereum (~12s blocks)
  const quorumPercent = 4; // 4% quorum

  console.log('Deploying EvalisGovernor...');
  const Gov = await ethers.getContractFactory('EvalisGovernor');
  const governor = await Gov.deploy(tokenAddr, votingDelay, votingPeriod, quorumPercent);
  await governor.waitForDeployment();
  const governorAddr = await governor.getAddress();
  console.log('Governor deployed at:', governorAddr);

  console.log('\nExport env:');
  console.log(`GOVERNOR_ADDRESS=${governorAddr}`);
  console.log(`TOKEN_ADDRESS=${tokenAddr}`);

  console.log('Deploying EvalisCertificate...');
  const Cert = await ethers.getContractFactory('EvalisCertificate');
  const cert = await Cert.deploy();
  await cert.waitForDeployment();
  const certAddr = await cert.getAddress();
  console.log('Certificate deployed at:', certAddr);
  console.log(`CERTIFICATE_ADDRESS=${certAddr}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
