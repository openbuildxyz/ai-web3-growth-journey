import { ethers } from 'ethers';
import { NFT, Battle, Market } from '../typechain-types';

export interface IWalletService {
    // 连接钱包
    connect(): Promise<string>;
    
    // 断开连接
    disconnect(): void;
    
    // 获取当前连接的钱包地址
    getAddress(): string | null;
    
    // 获取合约实例
    getContracts(): {
        nft: NFT;
        battle: Battle;
        market: Market;
    } | null;
    
    // 铸造NFT
    mintNFT(): Promise<string>;
    
    // 合成NFT
    fuseNFT(tokenId1: number, tokenId2: number): Promise<string>;
    
    // 开始对战
    startBattle(tokenId1: number, tokenId2: number): Promise<string>;
    
    // 挂单NFT
    listNFT(tokenId: number, price: string): Promise<string>;
    
    // 购买NFT
    buyNFT(tokenId: number, price: string): Promise<string>;
    
    // 取消挂单
    cancelListing(tokenId: number): Promise<string>;
} 