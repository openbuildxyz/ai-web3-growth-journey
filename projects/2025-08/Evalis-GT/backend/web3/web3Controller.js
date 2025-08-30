const asyncHandler = require('express-async-handler');
const { Teacher, Student } = require('../models');

async function loadEthers() {
  try { const mod = await import('ethers'); return mod.ethers ?? mod; } catch { return require('ethers'); }
}

// Minimal ERC20Votes/Token ABI with mint and balanceOf
const tokenAbi = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not configured`);
  return v;
}

// Check if web3 is properly configured
function isWeb3Available() {
  try {
    requireEnv('CHAIN_RPC_URL');
    requireEnv('TOKEN_ADDRESS');
    return true;
  } catch {
    return false;
  }
}

exports.linkWallet = asyncHandler(async (req, res) => {
  const { address } = req.body;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ message: 'Valid Ethereum address required' });
  }
  const role = req.user.role;
  if (role === 'teacher') {
    const t = await Teacher.findByPk(req.user.id);
    if (!t) return res.status(404).json({ message: 'Teacher not found' });
    t.walletAddress = address;
    await t.save();
  } else if (role === 'student') {
    const s = await Student.findByPk(req.user.id);
    if (!s) return res.status(404).json({ message: 'Student not found' });
    s.walletAddress = address;
    await s.save();
  } else {
    return res.status(403).json({ message: 'Only teachers or students can link wallet' });
  }
  res.json({ message: 'Wallet linked', address });
});

exports.getMyWeb3Profile = asyncHandler(async (req, res) => {
  let walletAddress = null;
  let user = null;
  
  if (req.user.role === 'teacher') {
    user = await Teacher.findByPk(req.user.id); 
    walletAddress = user?.walletAddress || null;
  } else if (req.user.role === 'student') {
    user = await Student.findByPk(req.user.id); 
    walletAddress = user?.walletAddress || null;
  }
  
  let onchain = null;
  let balanceFormatted = '0';
  
  if (!isWeb3Available()) {
    onchain = { error: 'Web3 not configured' };
  } else if (walletAddress) {
    try {
      const ethers = await loadEthers();
      
      // Ensure the wallet address has proper checksum
      // Convert to lowercase first to remove any incorrect checksum, then apply proper checksum
      const checksummedAddress = ethers.getAddress(walletAddress.toLowerCase());
      
      const provider = new (ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider)(requireEnv('CHAIN_RPC_URL'));
      const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, provider);
      const [bal, dec] = await Promise.all([token.balanceOf(checksummedAddress), token.decimals()]);
      
      onchain = { balance: bal.toString(), decimals: Number(dec) };
      balanceFormatted = ethers.formatUnits(bal, dec);
    } catch (e) { 
      onchain = { error: e.message }; 
    }
  }
  
  res.json({ 
    walletAddress, 
    walletLinked: !!walletAddress,
    onchain,
    balance: onchain?.balance || '0',
    balanceFormatted,
    user: {
      id: user?.id,
      name: user?.name,
      role: req.user.role
    }
  });
});

exports.adminMintTokens = asyncHandler(async (req, res) => {
  // Simple RBAC: only admin can mint via backend service key
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured. Please deploy contracts first.' });
  }
  
  const { userId, role, amount } = req.body;
  if (!userId || !role) return res.status(400).json({ message: 'userId and role required' });
  const amt = BigInt(amount ?? 0);
  if (amt <= 0n) return res.status(400).json({ message: 'positive amount required' });

  const model = role === 'teacher' ? Teacher : role === 'student' ? Student : null;
  if (!model) return res.status(400).json({ message: 'role must be teacher or student' });
  const user = await model.findByPk(userId);
  if (!user || !user.walletAddress) return res.status(404).json({ message: 'User or wallet not found' });

  const ethers = await loadEthers();
  const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
  const Wallet = ethers.Wallet || ethers.Wallet; // v6/v5 compat
  const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
  const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
  const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, signer);

  const tx = await token.mint(user.walletAddress, amt);
  const receipt = await tx.wait();
  res.json({ message: 'Minted', txHash: receipt?.hash || tx.hash });
});

// Test mint endpoint for authenticated users (development only)
exports.testMintTokens = asyncHandler(async (req, res) => {
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured. Please deploy contracts first.' });
  }
  
  if (!req.user.walletAddress) {
    return res.status(400).json({ message: 'Please link your wallet first' });
  }
  
  // Allow any authenticated user to mint 100 EVLT for testing
  const amount = '100000000000000000000'; // 100 EVLT with 18 decimals
  
  try {
    const ethers = await loadEthers();
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const Wallet = ethers.Wallet || ethers.Wallet;
    const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
    const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
    const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, signer);

    const tx = await token.mint(req.user.walletAddress, amount);
    const receipt = await tx.wait();
    
    res.json({ 
      message: 'Successfully minted 100 EVLT tokens!', 
      txHash: receipt?.hash || tx.hash,
      amount: '100',
      walletAddress: req.user.walletAddress
    });
  } catch (error) {
    console.error('Test mint error:', error);
    res.status(500).json({ message: 'Minting failed: ' + error.message });
  }
});
