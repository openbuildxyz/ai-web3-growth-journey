
async function loadEthers() {
  try {
    const mod = await import('ethers');
    return mod.ethers ?? mod; 
  } catch (e) {
    
    return require('ethers');
  }
}

const { Proposal, ProposalVote, Notification } = require('../models');


const governorAbi = [
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
  'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
  'event ProposalExecuted(uint256 proposalId)'
];

async function startGovernanceListener({ rpcUrl, governorAddress }) {
  if (!rpcUrl || !governorAddress) {
    console.warn('Governance listener not started: missing rpcUrl or governorAddress');
    return;
  }
  const ethers = await loadEthers();
  const Provider = ethers.JsonRpcProvider || (ethers.providers && ethers.providers.JsonRpcProvider);
  if (!Provider) {
    console.error('Unable to resolve ethers JsonRpcProvider. Ensure ethers v5 or v6 is installed.');
    return;
  }
  const provider = new Provider(rpcUrl);
  const governor = new ethers.Contract(governorAddress, governorAbi, provider);

  governor.on('ProposalCreated', async (proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description) => {
    try {
      
      await Proposal.create({
        title: description.split('\n')[0].slice(0, 120),
        description,
        type: 'onchain',
        options: ['For', 'Against', 'Abstain'],
        status: 'active',
        startAt: null,
        endAt: null,
        createdByAdminId: 1 // optional: map proposer to admin
      });
    } catch (e) { console.error('Mirror ProposalCreated failed:', e.message); }
  });

  governor.on('VoteCast', async (voter, proposalId, support, weight, reason) => {
    try {
      // Attempt to find teacher by wallet address mapping (future work)
      // For now, store address in teacherId field if not mapped
      await ProposalVote.upsert({
        proposalId: String(proposalId),
        teacherId: voter, // placeholder until mapping exists
        choiceIndex: Number(support)
      }, { conflictFields: ['proposalId', 'teacherId'] });
    } catch (e) { console.error('Mirror VoteCast failed:', e.message); }
  });

  governor.on('ProposalExecuted', async (proposalId) => {
    try {
      // Mark as closed/executed
      const p = await Proposal.findByPk(String(proposalId));
      if (p) { p.status = 'closed'; await p.save(); }
      await Notification.create({ recipientRole: 'teacher', title: 'Proposal Executed', message: `Proposal ${proposalId} executed on-chain` });
    } catch (e) { console.error('Mirror ProposalExecuted failed:', e.message); }
  });
}

module.exports = { startGovernanceListener };
