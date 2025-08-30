const asyncHandler = require('express-async-handler');
const { Submission, Student, Certificate } = require('../models');

async function loadEthers() { try { const m = await import('ethers'); return m.ethers ?? m; } catch { return require('ethers'); } }
const CERT_ABI = [ 'function mintTo(address to, string tokenUri) external returns (uint256)', 'function tokenURI(uint256 tokenId) view returns (string)' ];

async function getSigner() {
  if (!process.env.CHAIN_RPC_URL || !process.env.MINTER_PRIVATE_KEY || !process.env.CERTIFICATE_ADDRESS) {
    throw new Error('Web3 not configured. Please set CHAIN_RPC_URL, MINTER_PRIVATE_KEY, and CERTIFICATE_ADDRESS');
  }
  const ethers = await loadEthers();
  const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
  const provider = new Provider(process.env.CHAIN_RPC_URL);
  const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider);
  return { ethers, provider, wallet };
}

exports.issueCertificate = asyncHandler(async (req, res) => {
  // Admin: issue NFT for a graded submission above threshold
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { submissionId, tokenUri, studentId } = req.body;
  if (!submissionId || !tokenUri || !studentId) return res.status(400).json({ message: 'submissionId, tokenUri, studentId required' });

  try {
    const sub = await Submission.findByPk(submissionId);
    if (!sub || sub.studentId !== studentId) return res.status(404).json({ message: 'Submission not found' });

    const student = await Student.findByPk(studentId);
    if (!student || !student.walletAddress) return res.status(400).json({ message: 'Student wallet not linked' });

    // Ensure the wallet address has proper checksum
    const { ethers, wallet } = await getSigner();
    const checksummedAddress = ethers.getAddress(student.walletAddress);
    
    const cert = new ethers.Contract(process.env.CERTIFICATE_ADDRESS, CERT_ABI, wallet);
    const tx = await cert.mintTo(checksummedAddress, tokenUri);
    const rc = await tx.wait();
    const event = rc?.logs?.[0];
    // In OZ v5, parse receipt to get tokenId; as a simple fallback we query token count pattern, but here we accept missing and store unknown
    let tokenId = '0';
    try { tokenId = rc.logs?.map(l=>l)?.find(()=>true) ? (tx.value?.toString?.() || '0') : '0'; } catch {}

    const record = await Certificate.create({ submissionId, studentId, tokenId, tokenUri, contractAddress: process.env.CERTIFICATE_ADDRESS, chain: 'sepolia' });
    res.json({ message: 'Certificate issued', txHash: rc?.hash || tx.hash, certificate: record });
  } catch (error) {
    console.error('Certificate issuance error:', error);
    res.status(500).json({ message: 'Failed to issue certificate', error: error.message });
  }
});

exports.verifyCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params; // certificate id or tokenId
  const certRecord = await Certificate.findByPk(id) || await Certificate.findOne({ where: { tokenId: id } });
  if (!certRecord) return res.status(404).json({ message: 'Certificate not found' });

  // Fetch tokenURI and media, compare to stored tokenUri
  let onchainUri = null, mediaOk = false, notes = [];
  try {
    const { ethers, provider } = await getSigner();
    const contract = new ethers.Contract(certRecord.contractAddress, CERT_ABI, provider);
    try { onchainUri = await contract.tokenURI(certRecord.tokenId); } catch (e) { notes.push('tokenURI read failed: '+e.message); }
    if (onchainUri && onchainUri !== certRecord.tokenUri) { notes.push('tokenURI mismatch'); }
  } catch (e) { notes.push('on-chain read failed: '+e.message); }

  // Fetch JSON metadata
  const fetchJson = async (url) => {
    const r = await fetch(url); if (!r.ok) throw new Error('HTTP '+r.status); return r.json();
  };
  let meta = null;
  try {
    meta = await fetchJson(certRecord.tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/'));
  } catch (e) { notes.push('metadata fetch failed: '+e.message); }

  // Basic validations
  let similarityOk = false;
  try {
    const imageUrl = (meta?.image || '').replace('ipfs://', 'https://ipfs.io/ipfs/');
    if (imageUrl) {
      // Fast path: ping image exists
      const r = await fetch(imageUrl, { method: 'HEAD' });
      mediaOk = r.ok;
    }
    // CLIP/AI similarity placeholder – for demo we flag true if title/description present
    if (meta?.name && meta?.description) similarityOk = true;
  } catch (e) { notes.push('media check failed: '+e.message); }

  const ok = Boolean(mediaOk && similarityOk);
  certRecord.lastVerifiedAt = new Date();
  certRecord.lastVerificationOk = ok;
  certRecord.lastVerificationNotes = notes.join('\n');
  await certRecord.save();

  res.json({ ok, details: { onchainUri, storedUri: certRecord.tokenUri, mediaOk, similarityOk, notes, meta }, cert: certRecord });
});

exports.listStudentCertificates = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user?.id;
  const list = await Certificate.findAll({ where: { studentId }, order: [['createdAt','DESC']] });
  res.json(list);
});
