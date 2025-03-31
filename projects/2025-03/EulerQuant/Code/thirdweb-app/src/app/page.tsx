"use client";

import Image from "next/image";
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";

// Define Monad Testnet chain
const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  rpc: "https://testnet-rpc.monad.xyz",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com/",
    },
    {
      name: "Socialscan",
      url: "https://monad-testnet.socialscan.io/",
    },
  ],
});

export default function Home() {
  const account = useActiveAccount();
  const [isMinted, setIsMinted] = useState(false);

  // Initialize contract
  const contract = getContract({
    client: client,
    chain: monadTestnet,
    address: "0x40Bd58dA380a1248C62f70393cEf40D0050B3780"
  });

  // Read contract data
  const { data: contractMetadata, isLoading: isMetadataLoading } = useReadContract(getContractMetadata, { contract });
  const { data: claimedSupply, isLoading: isClaimedLoading } = useReadContract(getTotalClaimedSupply, { contract });
  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(nextTokenIdToMint, { contract });
  const { data: claimCondition, isLoading: isClaimConditionLoading } = useReadContract(getActiveClaimCondition, { contract });

  // Calculate price in MON
  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };

  // Check if user has already claimed
  const hasClaimed = claimedSupply && account?.address ? claimedSupply > BigInt(0) : false;

  // Add NFT to wallet
  const addToWallet = async () => {
    if (!account?.address || !contractMetadata || !account.watchAsset) return;

    try {
      // Note: watchAsset is not fully supported for ERC721 in all wallets
      // This is a simplified version that may not work in all cases
      await account.watchAsset({
        type: "ERC20",
        options: {
          address: contract.address,
          symbol: "NFT",
          decimals: 0,
          image: "https://maroon-solid-gull-448.mypinata.cloud/ipfs/bafybeif37svyonjvjs4tkdl6roldcltg2qpmzvtqkt3amyx6hdwkgkbqua",
        },
      });
    } catch (error) {
      console.error("Error adding NFT to wallet:", error);
    }
  };

  const isLoading = isMetadataLoading || isClaimedLoading || isTotalSupplyLoading || isClaimConditionLoading;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              NFT Creator Station
            </h1>
            <p className="mt-2 text-gray-400">Mint your unique NFT on Monad Testnet</p>
          </div>
          <div className="bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105">
            <ConnectButton 
              client={client} 
              chain={monadTestnet}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* NFT Preview */}
            <div className="space-y-6">
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-xl">
                <Image
                  src="https://maroon-solid-gull-448.mypinata.cloud/ipfs/bafybeif37svyonjvjs4tkdl6roldcltg2qpmzvtqkt3amyx6hdwkgkbqua"
                  alt="NFT Preview"
                  fill
                  className="object-cover transform transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-300">Collection Details</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-300">
                    Contract: <a href={`https://testnet.monadexplorer.com/address/${contract.address}`} target="_blank" className="text-purple-400 hover:text-purple-300">{contract.address.slice(0, 6)}...{contract.address.slice(-4)}</a>
                  </p>
                  <p className="text-sm text-gray-300">Network: Monad Testnet</p>
                </div>
              </div>
            </div>

            {/* Minting Interface */}
            <div className="space-y-8">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-purple-900/30 rounded w-3/4"></div>
                  <div className="h-20 bg-purple-900/30 rounded"></div>
                  <div className="h-8 bg-purple-900/30 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                      {contractMetadata?.name || "Loading..."}
                    </h2>
                    <p className="mt-4 text-gray-300 leading-relaxed">
                      {contractMetadata?.description || "Loading..."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-900/30 rounded-lg p-4">
                      <p className="text-sm text-purple-300">Total Supply</p>
                      <p className="text-2xl font-bold">{totalNFTSupply?.toString() || "0"}</p>
                    </div>
                    <div className="bg-purple-900/30 rounded-lg p-4">
                      <p className="text-sm text-purple-300">Claimed</p>
                      <p className="text-2xl font-bold">{claimedSupply?.toString() || "0"}</p>
                    </div>
                  </div>

                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <p className="text-sm text-purple-300">Price per NFT</p>
                    <p className="text-2xl font-bold">{getPrice(1)} MON</p>
                  </div>

                  {!account?.address ? (
                    <p className="text-yellow-400 text-center py-4 bg-yellow-400/10 rounded-lg">
                      Please connect your wallet to mint
                    </p>
                  ) : hasClaimed ? (
                    <div className="space-y-4">
                      <p className="text-green-400 text-center py-4 bg-green-400/10 rounded-lg">
                        You have already claimed your NFT!
                      </p>
                      <button
                        onClick={addToWallet}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        Add NFT to Wallet
                      </button>
                    </div>
                  ) : (
                    <TransactionButton
                      transaction={() => claimTo({
                        contract: contract,
                        to: account.address,
                        quantity: BigInt(1),
                      })}
                      onTransactionConfirmed={() => {
                        setIsMinted(true);
                        alert("NFT Claimed Successfully!");
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      {`Mint NFT (${getPrice(1)} MON)`}
                    </TransactionButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
