import { ethers } from 'ethers';
import { Blob as ZgBlob } from '@0glabs/0g-ts-sdk';

// Configuration for 0G Storage
// Turbo mode contract address (Galileo) - lowercase to avoid checksum validation
const FLOW_CONTRACT_ADDR = '0xbd2c3f0e65e3830843a04625ef0786576a96c2e3';

export const use0G = () => {

    /**
     * Logic 1: Check Wallet Environment
     */
    const getProvider = () => {
        if (typeof window === 'undefined') return null;

        // Bitget Wallet often injects as window.bitkeep.ethereum
        if (window.bitkeep && window.bitkeep.ethereum) {
            return window.bitkeep.ethereum;
        }

        // Fallback to standard window.ethereum (Metamask, etc.)
        if (window.ethereum) {
            return window.ethereum;
        }

        return null;
    };

    const checkWallet = () => {
        const provider = getProvider();
        if (!provider) {
            throw new Error('Please install Bitget Wallet or another Web3 wallet.');
        }
        return provider;
    }

    /**
     * Logic 2: Connect Wallet & Get Signer
     */
    const getSigner = async () => {
        const providerInterface = getProvider();
        if (!providerInterface) {
            throw new Error('No wallet found. Please install Bitget Wallet.');
        }
        const provider = new ethers.BrowserProvider(providerInterface);

        // Request accounts first
        await provider.send("eth_requestAccounts", []);

        // Check Network
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        // 16602 is 0G Galileo Testnet
        if (chainId !== 16602n) {
            throw new Error(`Wrong Network detected (Chain ID: ${chainId}). Please switch your wallet to 0G Galileo Testnet (Chain ID: 16602).`);
        }

        const signer = await provider.getSigner();
        return signer;
    };

    /**
     * Logic 2b: Switch Network Helper
     */
    const switchNetwork = async () => {
        const providerInterface = getProvider();
        if (!providerInterface) return;

        const chainId = '0x40da'; // 16602
        try {
            await providerInterface.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await providerInterface.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId,
                            chainName: '0G Galileo Testnet',
                            rpcUrls: ['https://evmrpc-testnet.0g.ai'],
                            nativeCurrency: {
                                name: 'A0GI',
                                symbol: 'A0GI',
                                decimals: 18,
                            },
                            blockExplorerUrls: ['https://chainscan-galileo.0g.ai']
                        }],
                    });
                } catch (addError) {
                    throw new Error('Failed to add 0G Galileo Testnet to wallet: ' + addError.message);
                }
            } else {
                throw new Error('Failed to switch to 0G Galileo Testnet: ' + switchError.message);
            }
        }
    };

    /**
     * Manual Upload - Notarization System
     * Uploads file hash to blockchain for proof of existence
     */
    const uploadFile = async (file) => {
        try {
            if (!window.ethereum) {
                throw new Error("Please install a Web3 wallet");
            }

            // Connect wallet
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            console.log("=== Notarization Upload Starting ===");
            console.log("Account:", address);
            console.log("Contract:", FLOW_CONTRACT_ADDR);

            // Calculate file hash using SDK
            console.log("Calculating file hash...");
            const zgFile = new ZgBlob(file);
            const [tree, treeErr] = await zgFile.merkleTree();

            if (treeErr) {
                throw new Error("File hash calculation failed: " + treeErr.message);
            }

            const rootHash = tree.rootHash();
            const fileSize = file.size;

            console.log("Root Hash:", rootHash);
            console.log("File Size:", fileSize);

            // Manual transaction - direct contract call
            console.log("Building notarization transaction...");

            // Contract ABI: submit(SubmissionNode[] memory submissionNodes)
            const abi = [
                "function submit(tuple(bytes32,uint256)[] memory) payable"
            ];

            const flowContract = new ethers.Contract(FLOW_CONTRACT_ADDR, abi, signer);

            // Fee: 0.002 A0GI (testnet fee)
            const fee = ethers.parseEther("0.002");

            console.log("Sending transaction...");
            console.log("Fee:", ethers.formatEther(fee), "A0GI");

            // Send transaction: [[rootHash, fileSize]]
            const txResponse = await flowContract.submit(
                [[rootHash, fileSize]],
                { value: fee }
            );

            console.log("Transaction sent! Waiting for confirmation...");
            console.log("Tx Hash:", txResponse.hash);

            // Wait for transaction to be mined
            const receipt = await txResponse.wait();

            console.log("=== Notarization Success ===");
            console.log("Block:", receipt.blockNumber);
            console.log("Gas used:", receipt.gasUsed.toString());

            return {
                rootHash: rootHash,
                txHash: txResponse.hash,
                blockNumber: receipt.blockNumber,
                timestamp: Date.now(),
                fileName: file.name,
                fileSize: fileSize
            };

        } catch (error) {
            console.error("=== Notarization Failed ===");
            console.error(error);

            // User-friendly error messages
            let msg = error.message || "Unknown error";
            if (msg.includes("user rejected")) {
                msg = "User cancelled the transaction";
            } else if (msg.includes("insufficient funds")) {
                msg = "Insufficient A0GI balance";
            }

            throw new Error(msg);
        }
    };

    /**
     * Verify file hash against blockchain record
     */
    const verifyFile = async (file, expectedHash) => {
        try {
            console.log("=== Verification Starting ===");

            // Calculate file hash
            const zgFile = new ZgBlob(file);
            const [tree, treeErr] = await zgFile.merkleTree();

            if (treeErr) {
                throw new Error("File hash calculation failed: " + treeErr.message);
            }

            const calculatedHash = tree.rootHash();
            console.log("Calculated Hash:", calculatedHash);
            console.log("Expected Hash:", expectedHash);

            // Compare hashes
            const isValid = calculatedHash.toLowerCase() === expectedHash.toLowerCase();

            console.log("=== Verification Result ===");
            console.log("Valid:", isValid);

            return {
                isValid: isValid,
                calculatedHash: calculatedHash,
                expectedHash: expectedHash,
                message: isValid ? "File is authentic and unchanged" : "File has been modified or is not the original"
            };

        } catch (error) {
            console.error("=== Verification Failed ===");
            console.error(error);
            throw error;
        }
    };

    /**
     * Get transaction information from blockchain
     * Retrieves file hash, size, upload time without file comparison
     */
    const getTransactionInfo = async (txHash) => {
        try {
            console.log("=== Retrieving Transaction Info ===");
            console.log("Transaction Hash:", txHash);

            // Connect to blockchain
            const providerInterface = getProvider();
            if (!providerInterface) {
                throw new Error('No wallet found. Please install a Web3 wallet.');
            }

            const provider = new ethers.BrowserProvider(providerInterface);

            // Get transaction receipt
            const receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) {
                throw new Error("Transaction not found. Please check the transaction hash.");
            }

            console.log("Transaction found in block:", receipt.blockNumber);

            // Get block to retrieve timestamp
            const block = await provider.getBlock(receipt.blockNumber);
            const uploadTime = new Date(block.timestamp * 1000);

            console.log("Upload time:", uploadTime);

            // Get transaction details
            const tx = await provider.getTransaction(txHash);

            // Decode transaction data
            const iface = new ethers.Interface([
                "function submit(tuple(bytes32 rootHash, uint256 fileSize)[] memory submissions) payable"
            ]);

            let decodedData;
            try {
                decodedData = iface.parseTransaction({ data: tx.data });
            } catch (e) {
                throw new Error("Unable to decode transaction data. This may not be a valid notarization transaction.");
            }

            const submissions = decodedData.args[0];
            if (!submissions || submissions.length === 0) {
                throw new Error("No file data found in transaction.");
            }

            // Get the first submission
            const submission = submissions[0];
            const fileHash = submission.rootHash || submission[0];
            const fileSize = submission.fileSize || submission[1];

            console.log("File Hash:", fileHash);
            console.log("File Size:", fileSize.toString());

            return {
                txHash: txHash,
                blockNumber: receipt.blockNumber,
                uploadTime: uploadTime,
                fileHash: fileHash,
                fileSize: Number(fileSize),
                from: tx.from,
                to: tx.to,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error("=== Transaction Info Retrieval Failed ===");
            console.error(error);
            throw error;
        }
    };



    /**
     * Verify file by transaction hash
     * Retrieves blockchain record and compares with file
     */
    const verifyByTxHash = async (file, txHash) => {
        try {
            console.log("=== Blockchain Verification Starting ===");
            console.log("Transaction Hash:", txHash);

            // Connect to blockchain
            const providerInterface = getProvider();
            if (!providerInterface) {
                throw new Error('No wallet found. Please install a Web3 wallet.');
            }

            const provider = new ethers.BrowserProvider(providerInterface);

            // Get transaction receipt
            const receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) {
                throw new Error("Transaction not found. Please check the transaction hash.");
            }

            console.log("Transaction found in block:", receipt.blockNumber);

            // Get block to retrieve timestamp
            const block = await provider.getBlock(receipt.blockNumber);
            const uploadTime = new Date(block.timestamp * 1000);

            console.log("Upload time:", uploadTime);

            // Get transaction details
            const tx = await provider.getTransaction(txHash);

            // Decode transaction data to get file hash and size
            const iface = new ethers.Interface([
                "function submit(tuple(bytes32 rootHash, uint256 fileSize)[] memory submissions) payable"
            ]);

            let decodedData;
            try {
                decodedData = iface.parseTransaction({ data: tx.data });
            } catch (e) {
                throw new Error("Unable to decode transaction data. This may not be a valid notarization transaction.");
            }

            const submissions = decodedData.args[0];
            if (!submissions || submissions.length === 0) {
                throw new Error("No file data found in transaction.");
            }

            // Get the first submission
            const submission = submissions[0];
            const blockchainHash = submission.rootHash || submission[0];
            const blockchainSize = submission.fileSize || submission[1];

            console.log("Blockchain Hash:", blockchainHash);
            console.log("Blockchain Size:", blockchainSize.toString());

            // Calculate current file hash
            const zgFile = new ZgBlob(file);
            const [tree, treeErr] = await zgFile.merkleTree();

            if (treeErr) {
                throw new Error("File hash calculation failed: " + treeErr.message);
            }

            const calculatedHash = tree.rootHash();
            const currentSize = file.size;

            console.log("Calculated Hash:", calculatedHash);
            console.log("Current Size:", currentSize);

            // Compare hashes and sizes
            const hashMatch = calculatedHash.toLowerCase() === blockchainHash.toLowerCase();
            const sizeMatch = currentSize === Number(blockchainSize);
            const isValid = hashMatch && sizeMatch;

            console.log("=== Blockchain Verification Result ===");
            console.log("Hash Match:", hashMatch);
            console.log("Size Match:", sizeMatch);
            console.log("Valid:", isValid);

            return {
                isValid: isValid,
                calculatedHash: calculatedHash,
                blockchainHash: blockchainHash,
                currentSize: currentSize,
                blockchainSize: Number(blockchainSize),
                uploadTime: uploadTime,
                blockNumber: receipt.blockNumber,
                txHash: txHash,
                hashMatch: hashMatch,
                sizeMatch: sizeMatch,
                message: isValid
                    ? "File matches blockchain record perfectly"
                    : !hashMatch
                        ? "File content has been modified"
                        : "File size has changed"
            };

        } catch (error) {
            console.error("=== Blockchain Verification Failed ===");
            console.error(error);
            throw error;
        }
    };

    return {
        uploadFile,
        verifyFile,
        getTransactionInfo,
        verifyByTxHash,
        connectWallet: getSigner,
        checkWallet,
        switchNetwork,
    };
};
