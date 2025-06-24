import { ethers } from 'ethers';
import { NFT, Battle, Market } from '../typechain-types';
import { IWalletService } from '../interfaces/IWalletService';

// 合约地址
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || '';
const BATTLE_CONTRACT_ADDRESS = process.env.BATTLE_CONTRACT_ADDRESS || '';
const MARKET_CONTRACT_ADDRESS = process.env.MARKET_CONTRACT_ADDRESS || '';

export class WalletService implements IWalletService {
    private provider: ethers.providers.Web3Provider | null = null;
    private signer: ethers.Signer | null = null;
    private nftContract: NFT | null = null;
    private battleContract: Battle | null = null;
    private marketContract: Market | null = null;

    constructor() {
        // 监听钱包连接状态变化
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', this.handleAccountsChanged);
            window.ethereum.on('chainChanged', this.handleChainChanged);
        }
    }

    private handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            this.disconnect();
        } else {
            this.connect();
        }
    };

    private handleChainChanged = () => {
        window.location.reload();
    };

    async connect(): Promise<string> {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('请安装MetaMask钱包');
        }

        try {
            // 请求连接钱包
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            // 创建provider和signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();

            // 初始化合约实例
            await this.initializeContracts();

            return account;
        } catch (error) {
            console.error('连接钱包失败:', error);
            throw error;
        }
    }

    disconnect(): void {
        this.provider = null;
        this.signer = null;
        this.nftContract = null;
        this.battleContract = null;
        this.marketContract = null;
    }

    getAddress(): string | null {
        return this.signer ? this.signer.getAddress() : null;
    }

    getContracts() {
        if (!this.nftContract || !this.battleContract || !this.marketContract) {
            return null;
        }
        return {
            nft: this.nftContract,
            battle: this.battleContract,
            market: this.marketContract
        };
    }

    private async initializeContracts() {
        if (!this.signer) return;

        // 初始化NFT合约
        this.nftContract = new ethers.Contract(
            NFT_CONTRACT_ADDRESS,
            NFT.abi,
            this.signer
        ) as unknown as NFT;

        // 初始化Battle合约
        this.battleContract = new ethers.Contract(
            BATTLE_CONTRACT_ADDRESS,
            Battle.abi,
            this.signer
        ) as unknown as Battle;

        // 初始化Market合约
        this.marketContract = new ethers.Contract(
            MARKET_CONTRACT_ADDRESS,
            Market.abi,
            this.signer
        ) as unknown as Market;
    }

    async mintNFT(): Promise<string> {
        if (!this.nftContract) throw new Error('请先连接钱包');
        
        try {
            const tx = await this.nftContract.mint({ value: ethers.utils.parseEther('5') });
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('铸造NFT失败:', error);
            throw error;
        }
    }

    async fuseNFT(tokenId1: number, tokenId2: number): Promise<string> {
        if (!this.battleContract) throw new Error('请先连接钱包');
        
        try {
            const tx = await this.battleContract.startFusion(tokenId1, tokenId2, {
                value: ethers.utils.parseEther('0.5')
            });
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('合成NFT失败:', error);
            throw error;
        }
    }

    async startBattle(tokenId1: number, tokenId2: number): Promise<string> {
        if (!this.battleContract) throw new Error('请先连接钱包');
        
        try {
            const tx = await this.battleContract.startBattle(tokenId1, tokenId2, {
                value: ethers.utils.parseEther('0.1')
            });
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('开始对战失败:', error);
            throw error;
        }
    }

    async listNFT(tokenId: number, price: string): Promise<string> {
        if (!this.marketContract) throw new Error('请先连接钱包');
        
        try {
            const tx = await this.marketContract.listNFT(tokenId, ethers.utils.parseEther(price));
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('挂单NFT失败:', error);
            throw error;
        }
    }

    async buyNFT(tokenId: number, price: string): Promise<string> {
        if (!this.marketContract) throw new Error('请先连接钱包');
        
        try {
            const tx = await this.marketContract.buyNFT(tokenId, {
                value: ethers.utils.parseEther(price)
            });
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('购买NFT失败:', error);
            throw error;
        }
    }

    async cancelListing(tokenId: number): Promise<string> {
        if (!this.marketContract) throw new Error('请先连接钱包');
        
        try {
            const tx = await this.marketContract.cancelListing(tokenId);
            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('取消挂单失败:', error);
            throw error;
        }
    }
} 