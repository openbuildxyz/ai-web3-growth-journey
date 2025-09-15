import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { TokenMinter, TOKEN_CONFIG, TokenMetadata } from './token-minter';
import { PublicKey } from '@solana/web3.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, '../mint-config.json');

// 中间件
app.use(cors());
app.use(express.json());

// 配置管理
interface MintConfig {
  mintAddress: string | null;
  tokenConfig: TokenMetadata;
  createdAt: string | null;
}

function loadConfig(): MintConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Failed to load config, using defaults');
  }
  
  return {
    mintAddress: null,
    tokenConfig: TOKEN_CONFIG,
    createdAt: null
  };
}

function saveConfig(config: MintConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('Config saved successfully');
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

let config = loadConfig();
let tokenMinter: TokenMinter;

// 初始化TokenMinter
function initializeTokenMinter() {
  try {
    if (config.mintAddress) {
      tokenMinter = new TokenMinter(config.mintAddress, config.tokenConfig);
      console.log(`✅ TokenMinter initialized with existing mint: ${config.mintAddress}`);
    } else {
      tokenMinter = new TokenMinter();
      console.log('✅ TokenMinter initialized (no mint address yet)');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize TokenMinter:', error);
    return false;
  }
}

// 验证地址格式
function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// =============== API 端点 ===============

// 健康检查和状态
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    hasMintAddress: !!config.mintAddress,
    mintAddress: config.mintAddress,
    tokenConfig: config.tokenConfig,
    payerAddress: tokenMinter?.['payer']?.publicKey?.toBase58() || null,
    serverTime: new Date().toISOString()
  });
});

// 创建新的代币 - POST /create-token
app.post('/create-token', async (req, res) => {
  try {
    if (config.mintAddress) {
      return res.status(400).json({
        error: 'Token already exists',
        message: 'A token mint already exists. Use /reset-token to create a new one.',
        currentMintAddress: config.mintAddress
      });
    }

    // 获取自定义token元数据
    const {
      name,
      symbol,
      decimals = 9,
      description,
      image,
      website,
      twitter,
      telegram,
      attributes
    } = req.body;

    // 构建token元数据
    const tokenMetadata: TokenMetadata = {
      name: name || TOKEN_CONFIG.name,
      symbol: symbol || TOKEN_CONFIG.symbol,
      decimals: decimals,
      description: description || TOKEN_CONFIG.description,
      image: image || TOKEN_CONFIG.image,
      website: website || TOKEN_CONFIG.website,
      twitter: twitter || TOKEN_CONFIG.twitter,
      telegram: telegram || TOKEN_CONFIG.telegram,
      attributes: attributes || []
    };

    if (!tokenMinter) {
      const initialized = initializeTokenMinter();
      if (!initialized) {
        return res.status(500).json({
          error: 'Initialization failed',
          message: 'Failed to initialize token minter'
        });
      }
    }

    console.log('🚀 Creating new token mint with custom metadata...');
    const mintAddress = await tokenMinter.createToken(tokenMetadata);

    // 保存mint地址和元数据到配置
    config.mintAddress = mintAddress.toBase58();
    config.tokenConfig = tokenMetadata;
    config.createdAt = new Date().toISOString();
    saveConfig(config);

    res.json({
      success: true,
      message: 'Token created successfully',
      data: {
        mintAddress: mintAddress.toBase58(),
        tokenConfig: tokenMetadata,
        createdAt: config.createdAt,
        explorerUrl: `https://explorer.solana.com/address/${mintAddress.toBase58()}?cluster=devnet`
      }
    });

  } catch (error: any) {
    console.error('Create token error:', error);
    res.status(500).json({
      error: 'Failed to create token',
      message: error.message
    });
  }
});

// 重置代币 - POST /reset-token
app.post('/reset-token', async (req, res) => {
  try {
    console.log('🔄 Resetting token...');
    
    // 清除配置
    config.mintAddress = null;
    config.createdAt = null;
    saveConfig(config);

    // 重新初始化TokenMinter
    const initialized = initializeTokenMinter();
    if (!initialized) {
      return res.status(500).json({
        error: 'Initialization failed',
        message: 'Failed to reinitialize token minter'
      });
    }

    res.json({
      success: true,
      message: 'Token reset successfully. You can now create a new token.',
      data: {
        mintAddress: null,
        tokenConfig: config.tokenConfig
      }
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to reset token',
      message: error.message
    });
  }
});

// 铸造代币 - POST /mint
app.post('/mint', async (req, res) => {
  try {
    if (!config.mintAddress) {
      return res.status(400).json({
        error: 'No token mint',
        message: 'Please create a token first using POST /create-token'
      });
    }

    const { address, amount } = req.body;

    // 验证参数
    if (!address) {
      return res.status(400).json({
        error: 'Missing address',
        message: 'Address parameter is required'
      });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    if (!isValidSolanaAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'Please provide a valid Solana address'
      });
    }

    console.log(`🪙 Minting ${amount} ${config.tokenConfig.symbol} to ${address}`);

    // 执行铸造
    const signature = await tokenMinter.mintTokens(address, amount);

    res.json({
      success: true,
      message: `Successfully minted ${amount} ${config.tokenConfig.symbol} tokens`,
      data: {
        toAddress: address,
        amount: amount,
        tokenSymbol: config.tokenConfig.symbol,
        transactionSignature: signature,
        mintAddress: config.mintAddress,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    });

  } catch (error: any) {
    console.error('Mint error:', error);
    res.status(500).json({
      error: 'Mint failed',
      message: error.message
    });
  }
});

// 生成测试地址 - GET /generate-test-address
app.get('/generate-test-address', (req, res) => {
  try {
    const testAddress = TokenMinter.generateTestAddress();
    
    res.json({
      success: true,
      message: 'Test address generated successfully',
      data: {
        publicKey: testAddress.publicKey,
        // 在生产环境中，考虑不返回私钥
        secretKey: testAddress.secretKey
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate test address',
      message: error.message
    });
  }
});

// 获取代币信息 - GET /token-info
app.get('/token-info', (req, res) => {
  res.json({
    success: true,
    data: {
      mintAddress: config.mintAddress,
      tokenConfig: config.tokenConfig,
      createdAt: config.createdAt,
      hasToken: !!config.mintAddress,
      payerAddress: tokenMinter?.['payer']?.publicKey?.toBase58() || null
    }
  });
});

// 错误处理
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /status',
      'POST /create-token',
      'POST /reset-token', 
      'POST /mint',
      'GET /generate-test-address',
      'GET /token-info'
    ]
  });
});

// 启动服务器
async function startServer() {
  console.log('🚀 Starting Solana Token Minter API Server (Fixed Token Mode)...');
  
  // 初始化TokenMinter
  const initialized = initializeTokenMinter();
  if (!initialized) {
    console.error('❌ Failed to initialize. Exiting...');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   GET  /status - Server status and token info`);
    console.log(`   POST /create-token - Create new token (once only)`);
    console.log(`   POST /reset-token - Reset token (clear mint address)`);
    console.log(`   POST /mint - Mint tokens to address`);
    console.log(`   GET  /generate-test-address - Generate test address`);
    console.log(`   GET  /token-info - Get token information`);
    
    console.log(`\n🔧 Current Status:`);
    console.log(`   Has Token: ${!!config.mintAddress}`);
    console.log(`   Mint Address: ${config.mintAddress || 'Not created yet'}`);
    console.log(`   Token Symbol: ${config.tokenConfig.symbol}`);
    
    console.log(`\n💡 Usage:`);
    console.log(`   1. First run: curl -X POST http://localhost:${PORT}/create-token`);
    console.log(`   2. Mint tokens: curl -X POST http://localhost:${PORT}/mint -H "Content-Type: application/json" -d '{"address":"ADDRESS","amount":100}'`);
    console.log(`   3. Get test address: curl http://localhost:${PORT}/generate-test-address`);
  });
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export { app, startServer };
