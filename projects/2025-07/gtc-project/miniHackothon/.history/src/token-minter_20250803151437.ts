import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import * as dotenv from 'dotenv';

dotenv.config();

// 代币配置常量 - 可以在这里修改代币参数
export const TOKEN_CONFIG = {
  name: 'TEST_TOKEN',
  symbol: 'TEST',
  decimals: 9, // Solana标准精度
  description: 'Test token for minting',
  image: '',
  website: '',
  twitter: '',
  telegram: '',
};

// 代币元数据接口
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export class TokenMinter {
  private connection: Connection;
  private payer: Keypair;
  private mint: PublicKey | null = null;
  private tokenMetadata: TokenMetadata | null = null;

  constructor(existingMintAddress?: string, metadata?: TokenMetadata) {
    // 使用HTTP连接并优化配置
    this.connection = new Connection('https://api.devnet.solana.com', {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 120000, // 增加超时时间到2分钟
      disableRetryOnRateLimit: false,
      httpHeaders: {
        'Content-Type': 'application/json',
      },
    });
    
    // 从环境变量加载私钥
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }
    
    const privateKeyArray = process.env.PRIVATE_KEY.split(',').map((num: string) => parseInt(num.trim()));
    this.payer = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    
    // 如果提供了现有的mint地址，则使用它
    if (existingMintAddress) {
      this.mint = new PublicKey(existingMintAddress);
      console.log(`Using existing mint address: ${this.mint.toBase58()}`);
    }
    
    // 设置token元数据
    this.tokenMetadata = metadata || TOKEN_CONFIG;
    
    console.log(`Payer address: ${this.payer.publicKey.toBase58()}`);
  }

  /**
   * 创建新的代币mint
   */
  async createToken(customMetadata?: TokenMetadata): Promise<PublicKey> {
    try {
      // 使用自定义元数据或默认元数据
      const metadata = customMetadata || this.tokenMetadata || TOKEN_CONFIG;
      this.tokenMetadata = metadata;
      
      console.log('Creating new token mint...');
      console.log('Token metadata:', metadata);
      
      // 创建mint
      this.mint = await createMint(
        this.connection,
        this.payer,           // 付费账户
        this.payer.publicKey, // mint authority
        this.payer.publicKey, // freeze authority
        metadata.decimals     // 小数位数
      );

      console.log(`Token mint created: ${this.mint.toBase58()}`);
      console.log(`Token config:`, metadata);
      
      return this.mint;
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  /**
   * 向指定地址铸造代币
   * @param toAddress 接收代币的地址
   * @param amount 铸造数量 (不包含小数位，例如传入1表示1个代币)
   */
  async mintTokens(toAddress: string, amount: number): Promise<string> {
    if (!this.mint) {
      throw new Error('Token mint not created yet. Call createToken() first.');
    }

    try {
      console.log(`Minting ${amount} ${this.tokenMetadata?.symbol || 'TOKEN'} to ${toAddress}...`);
      
      const toPublicKey = new PublicKey(toAddress);
      
      // 获取或创建关联代币账户
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.payer,
        this.mint,
        toPublicKey
      );

      // 计算实际铸造数量 (考虑小数位)
      const mintAmount = amount * Math.pow(10, this.tokenMetadata?.decimals || 9);

      // 铸造代币
      const signature = await mintTo(
        this.connection,
        this.payer,
        this.mint,
        toTokenAccount.address,
        this.payer.publicKey, // mint authority
        mintAmount
      );

      console.log(`Successfully minted ${amount} ${this.tokenMetadata?.symbol || 'TOKEN'} to ${toAddress}`);
      console.log(`Transaction signature: ${signature}`);
      console.log(`Token account: ${toTokenAccount.address.toBase58()}`);
      
      return signature;
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  /**
   * 获取代币mint地址
   */
  getMintAddress(): PublicKey | null {
    return this.mint;
  }

  /**
   * 获取账户余额 (带重试机制)
   */
  async getBalance(address?: string): Promise<number> {
    const publicKey = address ? new PublicKey(address) : this.payer.publicKey;
    
    for (let i = 0; i < 3; i++) {
      try {
        const balance = await this.connection.getBalance(publicKey);
        return balance / 1e9; // 转换为SOL
      } catch (error) {
        console.log(`Balance check attempt ${i + 1} failed, retrying...`);
        if (i === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Failed to get balance after 3 attempts');
  }

  /**
   * 生成临时测试地址
   */
  static generateTestAddress(): { publicKey: string; secretKey: number[] } {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Array.from(keypair.secretKey)
    };
  }
}
