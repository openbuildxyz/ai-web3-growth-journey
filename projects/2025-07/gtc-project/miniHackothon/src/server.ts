import express from 'express';
import cors from 'cors';
import { TokenMinter, TOKEN_CONFIG } from './token-minter';
import { PublicKey } from '@solana/web3.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 全局TokenMinter实例
let tokenMinter: TokenMinter;
let isInitialized = false;

// 初始化TokenMinter
async function initializeTokenMinter() {
  try {
    tokenMinter = new TokenMinter();
    console.log('TokenMinter initialized successfully');
    
    // 检查是否已有mint，如果没有则创建
    if (!tokenMinter.getMintAddress()) {
      console.log('Creating new token mint...');
      await tokenMinter.createToken();
      console.log('Token mint created successfully');
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize TokenMinter:', error);
    throw error;
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

// API路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    initialized: isInitialized,
    tokenConfig: TOKEN_CONFIG,
    mintAddress: tokenMinter?.getMintAddress()?.toBase58() || null
  });
});

// 获取代币信息
app.get('/token/info', (req, res) => {
  if (!isInitialized) {
    return res.status(503).json({
      error: 'Service not initialized',
      message: 'Token minter is not ready yet'
    });
  }

  res.json({
    tokenConfig: TOKEN_CONFIG,
    mintAddress: tokenMinter.getMintAddress()?.toBase58(),
    payerAddress: tokenMinter['payer'].publicKey.toBase58()
  });
});

// 铸造代币 API - POST /mint
app.post('/mint', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        error: 'Service not initialized',
        message: 'Token minter is not ready yet'
      });
    }

    const { address, amount } = req.body;

    // 验证请求参数
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

    // 验证地址格式
    if (!isValidSolanaAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'Please provide a valid Solana address'
      });
    }

    console.log(`API Request: Minting ${amount} ${TOKEN_CONFIG.symbol} to ${address}`);

    // 执行铸造
    const signature = await tokenMinter.mintTokens(address, amount);

    // 返回成功响应
    res.json({
      success: true,
      message: `Successfully minted ${amount} ${TOKEN_CONFIG.symbol} tokens`,
      data: {
        toAddress: address,
        amount: amount,
        tokenSymbol: TOKEN_CONFIG.symbol,
        transactionSignature: signature,
        mintAddress: tokenMinter.getMintAddress()?.toBase58(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    });

  } catch (error: any) {
    console.error('Mint API Error:', error);
    
    res.status(500).json({
      error: 'Mint failed',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 生成测试地址 API - GET /generate-test-address
app.get('/generate-test-address', (req, res) => {
  try {
    const testAddress = TokenMinter.generateTestAddress();
    
    res.json({
      success: true,
      message: 'Test address generated successfully',
      data: {
        publicKey: testAddress.publicKey,
        // 注意：在生产环境中不应该返回私钥！
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

// 批量铸造 API - POST /mint/batch
app.post('/mint/batch', async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        error: 'Service not initialized',
        message: 'Token minter is not ready yet'
      });
    }

    const { recipients } = req.body;

    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        error: 'Invalid recipients',
        message: 'Recipients must be an array of {address, amount} objects'
      });
    }

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const { address, amount } = recipient;
        
        if (!isValidSolanaAddress(address) || !amount || amount <= 0) {
          errors.push({
            address,
            amount,
            error: 'Invalid address or amount'
          });
          continue;
        }

        const signature = await tokenMinter.mintTokens(address, amount);
        results.push({
          address,
          amount,
          signature,
          success: true
        });
      } catch (error: any) {
        errors.push({
          address: recipient.address,
          amount: recipient.amount,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Batch mint completed. ${results.length} successful, ${errors.length} failed`,
      data: {
        successful: results,
        failed: errors,
        tokenSymbol: TOKEN_CONFIG.symbol,
        mintAddress: tokenMinter.getMintAddress()?.toBase58()
      }
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Batch mint failed',
      message: error.message
    });
  }
});

// 错误处理中间件
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
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// 启动服务器
async function startServer() {
  try {
    console.log('🚀 Starting Solana Token Minter API Server...');
    
    // 初始化TokenMinter
    await initializeTokenMinter();
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`\n✅ Server is running on http://localhost:${PORT}`);
      console.log(`\n📋 Available endpoints:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   GET  /token/info - Token information`);
      console.log(`   POST /mint - Mint tokens to address`);
      console.log(`   GET  /generate-test-address - Generate test address`);
      console.log(`   POST /mint/batch - Batch mint to multiple addresses`);
      console.log(`\n🔗 Token Config:`);
      console.log(`   Name: ${TOKEN_CONFIG.name}`);
      console.log(`   Symbol: ${TOKEN_CONFIG.symbol}`);
      console.log(`   Decimals: ${TOKEN_CONFIG.decimals}`);
      console.log(`   Mint Address: ${tokenMinter.getMintAddress()?.toBase58()}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

// 启动服务器
if (require.main === module) {
  startServer();
}

export { app, startServer };
