const asyncHandler = require('express-async-handler');
const { Student, Submission, Certificate, Assignment } = require('../models');
const path = require('path');

async function loadEthers() {
  try {
    // Try modern import first
    return await import('ethers');
  } catch {
    // Fallback to require
    return require('ethers');
  }
}

// Badge tier configuration
const BADGE_TIERS = [
  {
    type: 'diamond',
    name: 'Diamond Excellence',
    minGrade: 95,
    maxGrade: 100,
    imagePath: '/nft-badges/diamond-badge.png',
    color: '#B9F2FF',
    description: 'Outstanding performance with exceptional mastery',
    evtTokens: 100
  },
  {
    type: 'platinum',
    name: 'Platinum Achievement',
    minGrade: 90,
    maxGrade: 94.99,
    imagePath: '/nft-badges/platinum-badge.png',
    color: '#E5E4E2',
    description: 'Excellent performance with strong understanding',
    evtTokens: 75
  },
  {
    type: 'gold',
    name: 'Gold Standard',
    minGrade: 85,
    maxGrade: 89.99,
    imagePath: '/nft-badges/gold-badge.png',
    color: '#FFD700',
    description: 'Very good performance with solid knowledge',
    evtTokens: 50
  },
  {
    type: 'silver',
    name: 'Silver Merit',
    minGrade: 80,
    maxGrade: 84.99,
    imagePath: '/nft-badges/silver-badge.png',
    color: '#C0C0C0',
    description: 'Good performance with adequate understanding',
    evtTokens: 30
  },
  {
    type: 'bronze',
    name: 'Bronze Recognition',
    minGrade: 75,
    maxGrade: 79.99,
    imagePath: '/nft-badges/bronze-badge.png',
    color: '#CD7F32',
    description: 'Satisfactory performance meeting requirements',
    evtTokens: 20
  }
];

function getBadgeForGrade(grade) {
  if (grade < 75) return null; // No badge for grades below 75
  
  return BADGE_TIERS.find(badge => 
    grade >= badge.minGrade && grade <= badge.maxGrade
  ) || null;
}

// EVT Token ABI with mint function
const tokenAbi = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// NFT Certificate ABI
const certificateAbi = [
  'function mintTo(address to, string memory tokenUri) external returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)'
];

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

// Generate NFT metadata URI for certificate with badge integration
function generateCertificateMetadata(submission, student) {
  const badge = getBadgeForGrade(submission.score);
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  const metadata = {
    name: `${badge ? badge.name : 'Academic Achievement'} Certificate - ${submission.Assignment?.title || 'Assignment'}`,
    description: `${badge ? badge.description : 'Academic achievement certificate'} earned by ${student.name} on ${submission.Assignment?.title || 'an assignment'}. Score achieved: ${submission.score}% (${submission.letterGrade || 'N/A'})`,
    image: `${baseUrl}/nft-badges/nft_certificate.jpeg`,
    attributes: [
      {
        trait_type: "Student Name",
        value: student.name
      },
      {
        trait_type: "Assignment",
        value: submission.Assignment?.title || 'Assignment'
      },
      {
        trait_type: "Score",
        value: submission.score
      },
      {
        trait_type: "Grade",
        value: submission.letterGrade || 'N/A'
      },
      {
        trait_type: "Badge Type",
        value: badge ? badge.name : 'No Badge'
      },
      {
        trait_type: "Badge Tier",
        value: badge ? badge.type : 'none'
      },
      {
        trait_type: "EVT Tokens Earned",
        value: badge ? badge.evtTokens : 0
      },
      {
        trait_type: "Date Earned",
        value: new Date().toISOString().split('T')[0]
      },
      {
        trait_type: "Institution",
        value: "Evalis University"
      }
    ],
    external_url: "https://evalis.edu",
    background_color: badge ? badge.color.replace('#', '') : "4F46E5"
  };
  
  // For now, return a data URI with the metadata
  // In production, you'd upload this to IPFS or another decentralized storage
  return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
}

// Check if web3 is properly configured
function isWeb3Available() {
  try {
    requireEnv('CHAIN_RPC_URL');
    requireEnv('MINTER_PRIVATE_KEY');
    requireEnv('TOKEN_ADDRESS');
    return true;
  } catch {
    return false;
  }
}

// Get certificate contract address
function getCertificateAddress() {
  return process.env.CERTIFICATE_ADDRESS;
}

// Award EVT tokens to student for good performance
const awardEvtTokens = asyncHandler(async (req, res) => {
  const { studentId, amount, reason } = req.body;
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured. Please deploy contracts first.' });
  }

  // Validate request
  if (!studentId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid student ID and positive amount required' });
  }

  // Verify teacher is authorized to award tokens
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can award tokens' });
  }

  try {
    // Find student and verify wallet address
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student has a valid wallet address
    const walletAddress = student.walletAddress?.trim();
    if (!walletAddress || walletAddress === 'null' || walletAddress === 'undefined') {
      return res.status(400).json({ message: 'Student must link their wallet first to receive tokens' });
    }

    // Ensure the wallet address has proper checksum
    const ethers = await loadEthers();
    // Convert to lowercase first to remove any incorrect checksum, then apply proper checksum
    const checksummedAddress = ethers.getAddress(walletAddress.toLowerCase());

    // Mint EVT tokens to student
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const Wallet = ethers.Wallet || ethers.Wallet;
    
    const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
    const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
    const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, signer);

    // Convert amount to wei (EVT has 18 decimals)
    const amountInWei = ethers.parseEther(amount.toString());
    
    const tx = await token.mint(checksummedAddress, amountInWei);
    const receipt = await tx.wait();
    
    res.json({ 
      message: `Successfully awarded ${amount} EVT tokens to ${student.name}!`, 
      txHash: receipt?.hash || tx.hash,
      amount: amount.toString(),
      student: {
        id: student.id,
        name: student.name,
        walletAddress: checksummedAddress
      },
      reason: reason || 'Good academic performance'
    });
  } catch (error) {
    console.error('EVT token award error:', error);
    res.status(500).json({ message: 'Token awarding failed: ' + error.message });
  }
});

// Award badge-based EVT tokens and NFT certificate based on grade
const awardBadgeBasedRewards = asyncHandler(async (req, res) => {
  const { submissionId, awardCertificate = false } = req.body;
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured. Please deploy contracts first.' });
  }

  // Verify teacher is authorized
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can award rewards' });
  }

  try {
    // Find submission with student and assignment info
    const submission = await Submission.findByPk(submissionId, {
      include: [
        { model: Student, as: 'Student' },
        { model: Assignment, as: 'Assignment' }
      ]
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Debug submission data
    console.log('[DEBUG] Submission loaded for badge rewards:', {
      submissionId: submission.id,
      score: submission.score,
      graded: submission.graded,
      hasStudent: !!submission.Student,
      studentId: submission.Student?.id,
      studentName: submission.Student?.name,
      walletAddress: submission.Student?.walletAddress,
      studentKeys: submission.Student ? Object.keys(submission.Student.dataValues || submission.Student) : 'no student'
    });

    // Check if student has a valid wallet address
    console.log('[DEBUG] Badge rewards - Student wallet check:', {
      studentId: submission.Student?.id,
      studentName: submission.Student?.name,
      rawWalletAddress: submission.Student?.walletAddress,
      walletType: typeof submission.Student?.walletAddress,
      walletLength: submission.Student?.walletAddress?.length,
      isNull: submission.Student?.walletAddress === null,
      isUndefined: submission.Student?.walletAddress === undefined,
      isEmpty: submission.Student?.walletAddress === '',
      isNullString: submission.Student?.walletAddress === 'null'
    });
    
    const walletAddress = submission.Student.walletAddress?.trim();
    if (!walletAddress || walletAddress === 'null' || walletAddress === 'undefined') {
      console.log('[DEBUG] Wallet validation FAILED:', {
        originalAddress: submission.Student.walletAddress,
        trimmedAddress: walletAddress,
        failureReason: !walletAddress ? 'empty/falsy' : walletAddress === 'null' ? 'null string' : 'undefined string'
      });
      return res.status(400).json({ message: 'Student must link their wallet to receive automatic badge rewards. Ask them to connect their wallet in the Student Portal first.' });
    }
    
    console.log('[DEBUG] Wallet validation PASSED:', {
      originalAddress: submission.Student.walletAddress,
      trimmedAddress: walletAddress
    });

    // Ensure the wallet address has proper checksum
    const ethers = await loadEthers();
    // Convert to lowercase first to remove any incorrect checksum, then apply proper checksum
    const checksummedAddress = ethers.getAddress(walletAddress.toLowerCase());

    // Check if submission has been graded
    if (submission.score === null || submission.score === undefined) {
      return res.status(400).json({ 
        message: 'Submission must be graded before awarding badge rewards. Please grade the submission first with a score.' 
      });
    }

    // Determine badge based on grade
    const badge = getBadgeForGrade(submission.score);
    
    if (!badge) {
      return res.status(400).json({ 
        message: `Grade ${submission.score}% does not qualify for any badge (minimum 75% required)` 
      });
    }

    const results = {
      badge: badge,
      tokens: null,
      certificate: null
    };

    // Award EVT tokens based on badge tier
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const Wallet = ethers.Wallet || ethers.Wallet;
    
    const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
    const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
    const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, signer);

    // Mint EVT tokens
    const tokenAmount = badge.evtTokens;
    const amountInWei = ethers.parseEther(tokenAmount.toString());
    
    const tokenTx = await token.mint(checksummedAddress, amountInWei);
    const tokenReceipt = await tokenTx.wait();
    
    results.tokens = {
      amount: tokenAmount,
      txHash: tokenReceipt?.hash || tokenTx.hash
    };

    // Award NFT certificate automatically for Silver+ grades (80%+) or if explicitly requested
    const shouldAwardCertificate = awardCertificate || (submission.score >= 80);
    
    if (shouldAwardCertificate) {
      const certificateAddress = getCertificateAddress();
      if (certificateAddress) {
        // Check if certificate already exists for this submission
        const existingCertificate = await Certificate.findOne({ 
          where: { submissionId: submission.id } 
        });
        
        if (!existingCertificate) {
          const certificate = new ethers.Contract(certificateAddress, certificateAbi, signer);
          const metadataUri = generateCertificateMetadata(submission, submission.Student);
          
          const certTx = await certificate.mintTo(checksummedAddress, metadataUri);
          const certReceipt = await certTx.wait();
          
          // Extract token ID from transaction logs
          let tokenId = null;
          const logs = certReceipt.logs;
          for (const log of logs) {
            try {
              if (log.topics[0] === ethers.id('Transfer(address,address,uint256)')) {
                tokenId = ethers.toBigInt(log.topics[3]).toString();
                break;
              }
            } catch (e) {
              // Continue searching
            }
          }
          
          // Save certificate to database
          const certificateRecord = await Certificate.create({
            studentId: submission.Student.id,
            submissionId: submission.id,
            tokenId: tokenId || 'pending',
            tokenUri: metadataUri,
            contractAddress: certificateAddress,
            chain: 'sepolia'
          });

          results.certificate = {
            tokenId: certificateRecord.tokenId,
            txHash: certReceipt?.hash || certTx.hash,
            badgeType: badge.type,
            autoAwarded: submission.score >= 80 && !awardCertificate
          };
        } else {
          results.certificate = {
            existing: true,
            tokenId: existingCertificate.tokenId,
            message: 'Certificate already awarded for this submission'
          };
        }
      } else {
        results.certificate = {
          error: 'Certificate contract not deployed'
        };
      }
    }

    const certificateMessage = results.certificate ? 
      (results.certificate.autoAwarded ? ' + NFT certificate (auto-awarded for Silver+ grade)' : 
       results.certificate.existing ? ' (certificate already exists)' : ' + NFT certificate') : '';

    res.json({
      message: `Successfully awarded ${badge.name} badge with ${tokenAmount} EVT tokens to ${submission.Student.name}!${certificateMessage}`,
      student: {
        id: submission.Student.id,
        name: submission.Student.name,
        walletAddress: checksummedAddress
      },
      submission: {
        id: submission.id,
        score: submission.score,
        assignment: submission.Assignment?.title
      },
      results
    });

  } catch (error) {
    console.error('Badge reward error:', error);
    res.status(500).json({ message: 'Badge reward awarding failed: ' + error.message });
  }
});

// Award NFT certificate to student for submission
const awardNftCertificate = asyncHandler(async (req, res) => {
  const { submissionId, metadataUri } = req.body;
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured. Please deploy contracts first.' });
  }

  const certificateAddress = getCertificateAddress();
  if (!certificateAddress) {
    return res.status(503).json({ message: 'Certificate contract not deployed' });
  }

  // Validate request
  if (!submissionId) {
    return res.status(400).json({ message: 'Submission ID required' });
  }

  // Verify teacher is authorized
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can award certificates' });
  }

  try {
    // Find submission and verify student
    const submission = await Submission.findByPk(submissionId, {
      include: [
        { model: Student },
        { model: Assignment, attributes: ['id', 'title'] }
      ]
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const student = submission.Student;
    // Check if student has a valid wallet address
    const walletAddress = student.walletAddress?.trim();
    if (!walletAddress || walletAddress === 'null' || walletAddress === 'undefined') {
      return res.status(400).json({ message: 'Student must link their wallet first to receive NFT certificate' });
    }

    // Check if certificate already exists for this submission
    const existingCertificate = await Certificate.findOne({ 
      where: { submissionId } 
    });
    
    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already awarded for this submission' });
    }

    // Generate metadata if not provided
    const finalMetadataUri = metadataUri || generateCertificateMetadata(submission, student);

    // Mint NFT certificate
    const ethers = await loadEthers();
    
    // Ensure the wallet address has proper checksum
    // Convert to lowercase first to remove any incorrect checksum, then apply proper checksum
    const checksummedAddress = ethers.getAddress(walletAddress.toLowerCase());
    
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const Wallet = ethers.Wallet || ethers.Wallet;
    
    const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
    const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
    const certificate = new ethers.Contract(certificateAddress, certificateAbi, signer);

    const tx = await certificate.mintTo(checksummedAddress, finalMetadataUri);
    const receipt = await tx.wait();
    
    // Extract token ID from transaction logs
    const logs = receipt.logs;
    let tokenId = null;
    
    // Look for Transfer event to get token ID
    for (const log of logs) {
      try {
        if (log.topics[0] === ethers.id('Transfer(address,address,uint256)')) {
          tokenId = ethers.toBigInt(log.topics[3]).toString();
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    // Save certificate record to database
    const certificateRecord = await Certificate.create({
      submissionId,
      studentId: student.id,
      tokenId: tokenId || 'pending',
      tokenUri: finalMetadataUri,
      contractAddress: certificateAddress,
      chain: 'sepolia'
    });
    
    res.json({ 
      message: `Successfully awarded NFT certificate to ${student.name}!`, 
      txHash: receipt?.hash || tx.hash,
      tokenId,
      certificate: certificateRecord,
      student: {
        id: student.id,
        name: student.name,
        walletAddress: checksummedAddress
      }
    });
  } catch (error) {
    console.error('NFT certificate award error:', error);
    res.status(500).json({ message: 'Certificate awarding failed: ' + error.message });
  }
});

// Get student's EVT token balance
const getStudentTokenBalance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured' });
  }

  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.walletAddress) {
      return res.json({ balance: '0', walletLinked: false });
    }

    const ethers = await loadEthers();
    
    // Ensure the wallet address has proper checksum
    // Convert to lowercase first to remove any incorrect checksum, then apply proper checksum
    const checksummedAddress = ethers.getAddress(student.walletAddress.toLowerCase());
    
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
    const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, provider);

    const balance = await token.balanceOf(checksummedAddress);
    const decimals = await token.decimals();
    
    res.json({ 
      balance: balance.toString(),
      balanceFormatted: ethers.formatUnits(balance, decimals),
      walletAddress: checksummedAddress,
      walletLinked: true
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    res.status(500).json({ message: 'Failed to fetch token balance: ' + error.message });
  }
});

// Get student's NFT certificates
const getStudentCertificates = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const certificates = await Certificate.findAll({
      where: { studentId },
      include: [
        {
          model: Submission,
          include: [
            { model: Student, attributes: ['id', 'name'] },
            { model: Assignment, attributes: ['id', 'title'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Failed to fetch certificates: ' + error.message });
  }
});

// Batch award EVT tokens to multiple students
const batchAwardTokens = asyncHandler(async (req, res) => {
  const { awards } = req.body; // Array of { studentId, amount, reason }
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured' });
  }

  if (!Array.isArray(awards) || awards.length === 0) {
    return res.status(400).json({ message: 'Awards array required' });
  }

  // Verify teacher is authorized
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can award tokens' });
  }

  const results = [];
  const ethers = await loadEthers();
  const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
  const Wallet = ethers.Wallet || ethers.Wallet;
  
  const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
  const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
  const token = new ethers.Contract(requireEnv('TOKEN_ADDRESS'), tokenAbi, signer);

  for (const award of awards) {
    try {
      const { studentId, amount, reason } = award;
      
      if (!studentId || !amount || amount <= 0) {
        results.push({ studentId, success: false, error: 'Invalid award data' });
        continue;
      }

      // Find student
      const student = await Student.findByPk(studentId);
      if (!student) {
        results.push({ studentId, success: false, error: 'Student not found' });
        continue;
      }

      if (!student.walletAddress) {
        results.push({ 
          studentId, 
          success: false, 
          error: 'Student wallet not linked',
          studentName: student.name 
        });
        continue;
      }

      // Ensure the wallet address has proper checksum
      // Convert to lowercase first to remove any incorrect checksum, then apply proper checksum
      const checksummedAddress = ethers.getAddress(student.walletAddress.toLowerCase());

      // Mint tokens
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await token.mint(checksummedAddress, amountInWei);
      const receipt = await tx.wait();
      
      results.push({
        studentId,
        studentName: student.name,
        success: true,
        amount: amount.toString(),
        txHash: receipt?.hash || tx.hash,
        reason: reason || 'Academic achievement'
      });
      
    } catch (error) {
      results.push({
        studentId: award.studentId,
        success: false,
        error: error.message
      });
    }
  }

  res.json({
    message: 'Batch token awarding completed',
    results,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  });
});

// Get all available badge tiers
const getBadgeTiers = asyncHandler(async (req, res) => {
  res.json({
    badges: BADGE_TIERS,
    message: 'Available badge tiers for academic performance'
  });
});

// Get badge for specific grade
const getBadgeForGradeEndpoint = asyncHandler(async (req, res) => {
  const { grade } = req.params;
  const gradeNumber = parseFloat(grade);
  
  if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > 100) {
    return res.status(400).json({ message: 'Valid grade between 0-100 required' });
  }
  
  const badge = getBadgeForGrade(gradeNumber);
  
  res.json({
    grade: gradeNumber,
    badge: badge,
    qualifies: badge !== null,
    message: badge ? `Qualifies for ${badge.name}` : 'Does not qualify for any badge (minimum 75% required)'
  });
});

// Get student's earned badges from their graded submissions
const getStudentBadges = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all graded submissions with scores 75% or higher
    const qualifyingSubmissions = await Submission.findAll({
      where: {
        studentId: studentId,
        graded: true,
        score: { [require('sequelize').Op.gte]: 75 }
      },
      include: [
        { model: Student, as: 'Student', attributes: ['id', 'name'] },
        { model: Assignment, as: 'Assignment', attributes: ['id', 'title'] }
      ],
      order: [['gradedDate', 'DESC']]
    });

    // Convert submissions to badges
    const badges = qualifyingSubmissions.map(submission => {
      const badge = getBadgeForGrade(submission.score);
      return {
        id: `badge-${submission.id}`,
        submissionId: submission.id,
        badgeType: badge.type,
        badgeName: badge.name,
        badgeDescription: badge.description,
        badgeColor: badge.color,
        badgeImagePath: badge.imagePath,
        evtTokens: badge.evtTokens,
        score: submission.score,
        assignmentTitle: submission.Assignment?.title || 'Assignment',
        gradedDate: submission.gradedDate,
        minGrade: badge.minGrade,
        maxGrade: badge.maxGrade
      };
    });

    // Get unique badges (student might have earned same badge type multiple times)
    const uniqueBadges = [];
    const seenTypes = new Set();
    
    for (const badge of badges) {
      if (!seenTypes.has(badge.badgeType)) {
        seenTypes.add(badge.badgeType);
        uniqueBadges.push({
          ...badge,
          count: badges.filter(b => b.badgeType === badge.badgeType).length,
          firstEarned: badges.filter(b => b.badgeType === badge.badgeType)
            .sort((a, b) => new Date(a.gradedDate) - new Date(b.gradedDate))[0].gradedDate
        });
      }
    }

    res.json({
      studentId: studentId,
      studentName: student.name,
      totalBadges: badges.length,
      uniqueBadges: uniqueBadges.length,
      badges: uniqueBadges.sort((a, b) => b.evtTokens - a.evtTokens), // Sort by tier (highest first)
      allSubmissions: badges // Include all badge-earning submissions
    });
  } catch (error) {
    console.error('Error fetching student badges:', error);
    res.status(500).json({ message: 'Failed to fetch badges: ' + error.message });
  }
});

// Manual NFT certificate awarding endpoint for teachers - can be used regardless of grade
const awardManualCertificate = asyncHandler(async (req, res) => {
  const { submissionId, reason } = req.body;
  
  if (!isWeb3Available()) {
    return res.status(503).json({ message: 'Web3 not configured. Please deploy contracts first.' });
  }

  const certificateAddress = getCertificateAddress();
  if (!certificateAddress) {
    return res.status(503).json({ message: 'Certificate contract not deployed' });
  }

  // Validate request
  if (!submissionId) {
    return res.status(400).json({ message: 'Submission ID required' });
  }

  // Verify teacher is authorized
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can award certificates' });
  }

  try {
    // Find submission and verify student
    const submission = await Submission.findByPk(submissionId, {
      include: [
        { model: Student },
        { model: Assignment, attributes: ['id', 'title'] }
      ]
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const student = submission.Student;
    
    // Check if student has a valid wallet address
    const walletAddress = student.walletAddress?.trim();
    if (!walletAddress || walletAddress === 'null' || walletAddress === 'undefined') {
      return res.status(400).json({ message: 'Student must link their wallet first to receive NFT certificate' });
    }

    // Check if certificate already exists for this submission
    const existingCertificate = await Certificate.findOne({ 
      where: { submissionId } 
    });
    
    if (existingCertificate) {
      return res.status(400).json({ 
        message: 'Certificate already awarded for this submission',
        existingCertificate: {
          tokenId: existingCertificate.tokenId,
          txHash: existingCertificate.transactionHash
        }
      });
    }

    // Generate metadata with manual award reason
    const badge = getBadgeForGrade(submission.score || 0);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const metadata = {
      name: `Academic Excellence Certificate - ${submission.Assignment?.title || 'Assignment'}`,
      description: `Special recognition certificate manually awarded by teacher to ${student.name} for ${submission.Assignment?.title || 'an assignment'}. ${reason || 'Exceptional work deserving special recognition'}`,
      image: `${baseUrl}/nft-badges/nft_certificate.jpeg`,
      attributes: [
        {
          trait_type: "Student Name",
          value: student.name
        },
        {
          trait_type: "Assignment",
          value: submission.Assignment?.title || 'Assignment'
        },
        {
          trait_type: "Score",
          value: submission.score || 'Not graded'
        },
        {
          trait_type: "Award Type",
          value: "Manual Teacher Award"
        },
        {
          trait_type: "Award Reason",
          value: reason || "Special recognition"
        },
        {
          trait_type: "Badge Type",
          value: badge ? badge.name : 'Special Recognition'
        },
        {
          trait_type: "Date Earned",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "Institution",
          value: "Evalis University"
        },
        {
          trait_type: "Awarded By",
          value: "Teacher Manual Award"
        }
      ],
      external_url: "https://evalis.edu",
      background_color: "4F46E5"
    };
    
    const finalMetadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;

    // Mint NFT certificate
    const ethers = await loadEthers();
    
    // Ensure the wallet address has proper checksum
    const checksummedAddress = ethers.getAddress(walletAddress.toLowerCase());
    
    const Provider = ethers.JsonRpcProvider || ethers.providers.JsonRpcProvider;
    const Wallet = ethers.Wallet || ethers.Wallet;
    
    const provider = new Provider(requireEnv('CHAIN_RPC_URL'));
    const signer = new Wallet(requireEnv('MINTER_PRIVATE_KEY'), provider);
    const certificate = new ethers.Contract(certificateAddress, certificateAbi, signer);

    const tx = await certificate.mintTo(checksummedAddress, finalMetadataUri);
    const receipt = await tx.wait();
    
    // Extract token ID from transaction logs
    const logs = receipt.logs;
    let tokenId = null;
    
    // Look for Transfer event to get token ID
    for (const log of logs) {
      try {
        if (log.topics[0] === ethers.id('Transfer(address,address,uint256)')) {
          tokenId = ethers.toBigInt(log.topics[3]).toString();
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    // Save certificate record to database
    const certificateRecord = await Certificate.create({
      submissionId,
      studentId: student.id,
      tokenId: tokenId || 'pending',
      tokenUri: finalMetadataUri,
      contractAddress: certificateAddress,
      chain: 'sepolia',
      awardReason: reason || 'Manual teacher award'
    });
    
    res.json({ 
      message: `Successfully manually awarded NFT certificate to ${student.name}!`, 
      txHash: receipt?.hash || tx.hash,
      tokenId,
      certificate: certificateRecord,
      student: {
        id: student.id,
        name: student.name,
        walletAddress: checksummedAddress
      },
      reason: reason || 'Special recognition',
      manualAward: true
    });
  } catch (error) {
    console.error('Manual NFT certificate award error:', error);
    res.status(500).json({ message: 'Manual certificate awarding failed: ' + error.message });
  }
});

module.exports = {
  awardEvtTokens,
  awardBadgeBasedRewards,
  awardNftCertificate,
  awardManualCertificate,
  getStudentTokenBalance,
  getStudentCertificates,
  batchAwardTokens,
  getBadgeTiers,
  getBadgeForGrade: getBadgeForGradeEndpoint,
  getStudentBadges
};
