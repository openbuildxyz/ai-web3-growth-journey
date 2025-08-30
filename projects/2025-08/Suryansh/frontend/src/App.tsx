import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ethers } from "ethers";


interface ContractData {
  contract: string;
  explanation: string;
  prompt: string;
}

interface DeployedContract {
  address: string;
  network: string;
  time: string;
  contractName: string;
  gasUsed: string;
}

interface CompilationResult {
  success: boolean;
  abi: any[];
  bytecode: string;
  contractName: string;
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [network, setNetwork] = useState("sepolia");
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [wallet, setWallet] = useState("");
  const [history, setHistory] = useState<DeployedContract[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compiledData, setCompiledData] = useState<CompilationResult | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const [gasPrice, setGasPrice] = useState<string>("");
  const [totalCost, setTotalCost] = useState<string>("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load history from localStorage
  useEffect(() => {
    if (wallet) {
      const saved = JSON.parse(localStorage.getItem("contracts") || '{}');
      setHistory(saved[wallet] || []);
    }
  }, [wallet]);

  const addMessage = (type: 'user' | 'ai', content: string) => {
    setMessages(prev => [...prev, { type, content }]);
  };

  const generateContract = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    addMessage('user', prompt);
    
    try {
      const response = await axios.post("http://localhost:3001/api/generate-contract", {
        prompt: prompt
      });
      
      if (response.data.success) {
        setContractData(response.data);
        addMessage('ai', `✅ Contract generated successfully!\n\n**Solidity Code:**\n\`\`\`solidity\n${response.data.contract || ''}\n\`\`\`\n\n**Explanation:**\n${response.data.explanation || ''}`);
      } else {
        addMessage('ai', `❌ Error: ${response.data.error}`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to generate contract';
      addMessage('ai', `❌ Error: ${errorMsg}`);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  const compileContract = async () => {
    if (!contractData?.contract) {
      alert('❌ No contract data to compile!');
      return;
    }
    
    console.log('🔨 Compile button clicked!');
    console.log('📄 Contract data:', contractData);
    
    // Validate contract data
    if (typeof contractData.contract !== 'string' || contractData.contract.trim().length === 0) {
      alert('❌ Invalid contract data!');
      console.error('Invalid contract data:', contractData.contract);
      return;
    }
    
    // Check if contract contains basic Solidity syntax
    if (!contractData.contract.includes('pragma solidity') || !contractData.contract.includes('contract')) {
      alert('❌ Contract does not appear to be valid Solidity code!');
      console.error('Invalid Solidity code:', contractData.contract);
      return;
    }
    
    setIsCompiling(true);
    console.log('🔨 Starting compilation...');
    
    try {
      console.log('📤 Sending compilation request...');
      console.log('📄 Contract code being sent:', contractData.contract);
      
      const requestData = {
        contractCode: contractData.contract,
        contractName: "GeneratedContract"
      };
      console.log('📦 Request payload:', requestData);
      
      const response = await axios.post("http://localhost:3001/api/compile-contract", requestData, {
        timeout: 30000 // 30 second timeout
      });
      
      console.log('📥 Compilation response:', response.data);
      console.log('📊 Response status:', response.status);
      
              if (response.data.success) {
          setCompiledData(response.data);
          console.log('✅ Compilation successful, setting compiled data');
          
          // Show success message to user
          alert(`✅ Contract compiled successfully!\n\nABI: ${response.data.abi.length} functions\nBytecode: ${response.data.bytecode.length} characters\n\nReady for deployment!`);
          
          // Auto-estimate gas if wallet is connected
          if (provider) {
            console.log('⛽ Auto-estimating gas...');
            estimateGas(response.data);
          } else {
            console.log('⚠️ No provider, skipping gas estimation');
          }
        } else {
          console.log('❌ Compilation failed:', response.data.error);
          alert(`❌ Compilation failed: ${response.data.error}`);
        }
    } catch (error: any) {
      console.error('💥 Compilation error:', error);
      
      let errorMsg = 'Unknown compilation error';
      
      if (error.response) {
        // Server responded with error
        console.log('📡 Server error response:', error.response);
        errorMsg = error.response.data?.error || error.response.data?.details || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response
        console.log('📡 No response received:', error.request);
        errorMsg = 'No response from server. Check if backend is running.';
      } else {
        // Something else happened
        console.log('📡 Other error:', error);
        errorMsg = error.message || 'Network or connection error';
      }
      
      console.log('❌ Final error message:', errorMsg);
      alert(`❌ Compilation error: ${errorMsg}\n\nCheck browser console for details.`);
    } finally {
      setIsCompiling(false);
      console.log('🏁 Compilation process finished');
    }
  };

  const estimateGas = async (contractData: CompilationResult) => {
    if (!provider || !contractData) return;
    
    try {
      addMessage('ai', '⛽ Estimating gas costs...');
      
      // Get current gas price with fallback to reasonable values
      const feeData = await provider.getFeeData();
      let currentGasPrice;
      
      // For Sepolia, always use at least 25 gwei to ensure deployment works
      if (network === 'sepolia') {
        currentGasPrice = ethers.parseUnits("25", "gwei");
        console.log('⛽ Using fixed 25 gwei for Sepolia');
      } else {
        // For other networks, use fee data or fallback
        currentGasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
        console.log('⛽ Using network fee data:', ethers.formatUnits(currentGasPrice, "gwei"), 'gwei');
      }
      
      // Estimate gas for deployment
      const factory = new ethers.ContractFactory(
        contractData.abi,
        contractData.bytecode,
        await provider.getSigner()
      );
      
      const deploymentData = factory.interface.encodeDeploy();
      const estimatedGas = await provider.estimateGas({
        data: deploymentData
      });
      
      // Calculate costs with gas buffer (add 20% buffer to ensure enough gas)
      const gasBuffer = estimatedGas * 120n / 100n; // Add 20% buffer
      const gasEstimateStr = gasBuffer.toString();
      const gasPriceStr = ethers.formatUnits(currentGasPrice, "gwei");
      const totalCostWei = gasBuffer * currentGasPrice;
      const totalCostEth = ethers.formatEther(totalCostWei);
      
      setGasEstimate(gasEstimateStr);
      setGasPrice(gasPriceStr);
      setTotalCost(totalCostEth);
      
      addMessage('ai', `⛽ Gas estimation complete!\n\n**Estimated Gas:** ${gasEstimateStr} units\n**Gas Price:** ${gasPriceStr} gwei\n**Total Cost:** ${totalCostEth} ETH`);
      
    } catch (error: any) {
      addMessage('ai', `❌ Gas estimation failed: ${error.message}`);
      
      // Set default values to allow deployment (higher values to ensure success)
      setGasEstimate("100000"); // Default gas limit (higher)
      setGasPrice("25"); // Default 25 gwei (reasonable for Sepolia)
      setTotalCost("0.0025"); // Default cost (100k * 25 gwei)
      
      addMessage('ai', `⚠️ Using default gas values to allow deployment. You can adjust these manually.`);
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask is required! Please install MetaMask.");
      return;
    }
    
    try {
      const newProvider = new ethers.BrowserProvider((window as any).ethereum);
      await newProvider.send("eth_requestAccounts", []);
      const signer = await newProvider.getSigner();
      const addr = await signer.getAddress();
      
      setWallet(addr);
      setProvider(newProvider);
      addMessage('ai', `🔗 Wallet connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
      
      // Auto-estimate gas if contract is already compiled
      if (compiledData) {
        estimateGas(compiledData);
      }
      
    } catch (error) {
      addMessage('ai', '❌ Failed to connect wallet');
    }
  };

  const deployContract = async () => {
    console.log('🔍 Deploy function called with:', {
      compiledData: !!compiledData,
      wallet: !!wallet,
      provider: !!provider,
      gasEstimate,
      totalCost
    });
    
    if (!compiledData || !wallet || !provider) {
      addMessage('ai', '❌ Please compile the contract and connect your wallet first');
      return;
    }
    
    if (!gasEstimate || !totalCost) {
      addMessage('ai', '❌ Please wait for gas estimation to complete');
      return;
    }
    
    // Confirm deployment with user
    const confirmDeploy = window.confirm(
      `Deploy contract?\n\nGas: ${gasEstimate} units\nGas Price: ${gasPrice} gwei\nTotal Cost: ${totalCost} ETH\n\nClick OK to proceed with MetaMask.`
    );
    
    if (!confirmDeploy) return;
    
    setIsDeploying(true);
    addMessage('ai', '🚀 Deploying contract...');
    
    try {
      console.log('🔍 Getting signer...');
      const signer = await provider.getSigner();
      console.log('✅ Signer obtained:', await signer.getAddress());
      
      console.log('🔍 Creating contract factory...');
      const factory = new ethers.ContractFactory(
        compiledData.abi,
        compiledData.bytecode,
        signer
      );
      console.log('✅ Contract factory created');

      // Use the correct deploy method with overrides
      const gasPriceWei = ethers.parseUnits(gasPrice, "gwei");
      console.log('🚀 Deployment parameters:', {
        gasLimit: gasEstimate,
        gasPrice: gasPriceWei.toString(),
        gasPriceGwei: gasPrice
      });
      
      console.log('🔍 Starting deployment...');
      
      // Try deployment with explicit error handling
      let contract;
      try {
        // Deploy with overrides - this is the correct way in ethers v6
        contract = await factory.deploy(undefined, {
          gasLimit: BigInt(gasEstimate),
          gasPrice: gasPriceWei
        });
        console.log('🔧 Contract deployed with overrides...');
      } catch (deployError) {
        console.error('💥 Deployment failed:', deployError);
        
        // Try alternative deployment method
        console.log('🔄 Trying alternative deployment method...');
        contract = await factory.deploy();
        console.log('🔧 Contract deployed with default method...');
      }
      
      addMessage('ai', '⏳ Waiting for transaction confirmation...');
      
      // Wait for deployment
      const deployedAddr = await contract.getAddress();
      
      // Get deployment transaction details
      const deploymentTx = contract.deploymentTransaction();
      if (deploymentTx) {
        const receipt = await deploymentTx.wait();
        
        // Get actual gas used
        const actualGasUsed = receipt?.gasUsed?.toString() || gasEstimate;
        const actualCost = ethers.formatEther(
          BigInt(actualGasUsed) * (await provider.getFeeData()).gasPrice!
        );

        addMessage('ai', `🎉 Contract deployed successfully!\n\n**Address:** ${deployedAddr}\n**Network:** ${network}\n**Gas Used:** ${actualGasUsed}\n**Actual Cost:** ${actualCost} ETH\n**Transaction Hash:** ${deploymentTx.hash}`);
        
        // Save to history with gas info
        const all = JSON.parse(localStorage.getItem("contracts") || '{}');
        if (!all[wallet]) all[wallet] = [];
        all[wallet].push({
          address: deployedAddr,
          network,
          time: new Date().toISOString(),
          contractName: compiledData.contractName,
          gasUsed: actualGasUsed
        });
        localStorage.setItem("contracts", JSON.stringify(all));
        setHistory(all[wallet]);
      } else {
        addMessage('ai', `🎉 Contract deployed successfully!\n\n**Address:** ${deployedAddr}\n**Network:** ${network}\n**Gas Used:** ${gasEstimate} (estimated)`);
        
        // Save to history with estimated gas
        const all = JSON.parse(localStorage.getItem("contracts") || '{}');
        if (!all[wallet]) all[wallet] = [];
        all[wallet].push({
          address: deployedAddr,
          network,
          time: new Date().toISOString(),
          contractName: compiledData.contractName,
          gasUsed: gasEstimate
        });
        localStorage.setItem("contracts", JSON.stringify(all));
        setHistory(all[wallet]);
      }

              // Reset states
        setContractData(null);
        setCompiledData(null);
        setGasEstimate("");
        setGasPrice("");
        setTotalCost("");
      
    } catch (error: any) {
      addMessage('ai', `❌ Deployment failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateContract();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {/* Main White Card - 40% width, 60% height */}
      <div className="bg-white w-[40%] h-[60%] p-6 rounded-2xl shadow-lg flex flex-col">
        {/* Header with Connect Wallet in top right */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-black">AI ContractForge</h1>
          {!wallet ? (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          ) : (
            <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </span>
          )}
        </div>

        {/* Contract Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">
            Describe Contract (Plain English)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your smart contract in plain English..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            disabled={isGenerating}
          />
          <button
            className={`mt-4 px-4 py-2 rounded font-semibold transition-colors ${
              isGenerating || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            onClick={generateContract}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Contract'}
          </button>
        </div>

        {/* Generated Solidity Section */}
        {contractData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-3">Generated Solidity</h2>
            
            {/* Debug Info */}
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>Debug Info:</strong> Contract length: {contractData.contract?.length || 0} characters
              <br />
              <strong>Contains 'pragma':</strong> {contractData.contract?.includes('pragma') ? '✅' : '❌'}
              <br />
              <strong>Contains 'contract':</strong> {contractData.contract?.includes('contract') ? '✅' : '❌'}
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">{contractData.contract}</pre>
            </div>
            
            {/* Compile Button */}
            <button
              className={`mt-4 px-4 py-2 rounded font-semibold transition-colors ${
                isCompiling
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
              onClick={compileContract}
              disabled={isCompiling}
            >
              {isCompiling ? '🔨 Compiling...' : '🔨 Compile Contract'}
            </button>
            
            {/* Test Compile Button */}
            <button
              className="mt-2 ml-2 px-4 py-2 rounded font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={() => {
                console.log('🧪 Testing compilation with hardcoded contract...');
                const testContract = {
                  contract: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract TestCounter {\n    uint256 public count;\n    \n    function increment() public {\n        count++;\n    }\n}", 
                  explanation: "Test contract for debugging",
                  prompt: "Create a test counter contract"
                };
                setContractData(testContract);
                alert('🧪 Test contract loaded! Now try compiling.');
              }}
            >
              🧪 Load Test Contract
            </button>
            
            {/* Test Backend Connection */}
            <button
              className="mt-2 ml-2 px-4 py-2 rounded font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              onClick={async () => {
                try {
                  console.log('🔗 Testing backend connection...');
                  const response = await axios.get("http://localhost:3001/health", { timeout: 5000 });
                  console.log('✅ Backend connection successful:', response.data);
                  alert('✅ Backend is reachable!\n\nStatus: ' + response.data.message);
                } catch (error) {
                  console.error('❌ Backend connection failed:', error);
                  alert('❌ Backend connection failed!\n\nCheck if backend is running on port 3001.');
                }
              }}
            >
              🔗 Test Backend
            </button>
            
            {/* Compilation Status */}
            {isCompiling && (
              <div className="mt-2 text-sm text-orange-600">
                ⏳ Compiling contract... Please wait
              </div>
            )}
          </div>
        )}

        {/* Plain-English Explanation Section */}
        {contractData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-3">Plain-English Explanation</h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-black leading-relaxed text-sm">{contractData.explanation}</p>
            </div>
          </div>
        )}

        {/* Compilation Status Section */}
        {compiledData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-3">✅ Compilation Successful</h2>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ABI Functions:</span>
                  <span className="ml-2 font-mono text-green-800 font-bold">{compiledData.abi.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bytecode Length:</span>
                  <span className="ml-2 font-mono text-green-800 font-bold">{compiledData.bytecode.length}</span>
                </div>
              </div>
              <p className="text-green-800 mt-3 text-sm">🎉 Contract is ready for deployment!</p>
            </div>
          </div>
        )}

        {/* Gas Estimation & Deployment Section */}
        {compiledData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-3">Ready to Deploy</h2>
            
            {/* Gas Information */}
            {gasEstimate && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">Gas Estimation</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Estimated Gas:</span>
                    <span className="ml-2 font-mono text-blue-800">{gasEstimate} units</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gas Price:</span>
                    <span className="ml-2 font-mono text-blue-800">{gasPrice} gwei</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="ml-2 font-mono text-blue-800 font-bold">{totalCost} ETH</span>
                  </div>
                </div>
              </div>
            )}

            {/* Gas Estimation Status */}
            {!gasEstimate && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm mb-2">⛽ Gas estimation needed for deployment</p>
                {provider ? (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    onClick={() => estimateGas(compiledData)}
                  >
                    🔄 Estimate Gas
                  </button>
                ) : (
                  <p className="text-yellow-700 text-sm">Connect your wallet to estimate gas costs</p>
                )}
              </div>
            )}

            {/* Manual Gas Adjustment */}
            {gasEstimate && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm mb-2">⚙️ Gas Settings (adjust if deployment fails)</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-yellow-700 text-sm">Gas Limit:</label>
                    <input
                      type="number"
                      value={gasEstimate}
                      onChange={(e) => {
                        const newGas = e.target.value;
                        setGasEstimate(newGas);
                        // Recalculate total cost
                        if (gasPrice && newGas) {
                          const gasPriceWei = ethers.parseUnits(gasPrice, "gwei");
                          const totalCostWei = BigInt(newGas) * gasPriceWei;
                          const totalCostEth = ethers.formatEther(totalCostWei);
                          setTotalCost(totalCostEth);
                        }
                      }}
                      className="w-24 px-2 py-1 text-sm border border-yellow-300 rounded"
                      min="50000"
                      step="1000"
                    />
                    <span className="text-yellow-600 text-xs">units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-yellow-700 text-sm">Gas Price:</label>
                    <input
                      type="number"
                      value={gasPrice}
                      onChange={(e) => {
                        const newGasPrice = e.target.value;
                        setGasPrice(newGasPrice);
                        // Recalculate total cost
                        if (gasEstimate && newGasPrice) {
                          const gasPriceWei = ethers.parseUnits(newGasPrice, "gwei");
                          const totalCostWei = BigInt(gasEstimate) * gasPriceWei;
                          const totalCostEth = ethers.formatEther(totalCostWei);
                          setTotalCost(totalCostEth);
                        }
                      }}
                      className="w-24 px-2 py-1 text-sm border border-yellow-300 rounded"
                      min="20"
                      step="1"
                    />
                    <span className="text-yellow-600 text-xs">gwei</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    onClick={() => estimateGas(compiledData)}
                  >
                    🔄 Re-estimate Gas
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    onClick={() => {
                      setGasPrice("25");
                      setGasEstimate("100000");
                      setTotalCost("0.0025");
                    }}
                  >
                    🚀 Set Safe Values
                  </button>
                </div>
                <p className="text-yellow-600 text-xs mt-2">💡 Increase gas price to 25+ gwei if deployment fails</p>
              </div>
            )}
            
            {/* Deployment Controls */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 mb-3">✅ Contract compiled successfully! Ready for deployment.</p>
              <div className="flex space-x-4">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  <option value="sepolia">Sepolia (ETH)</option>
                  <option value="mumbai">Polygon Mumbai</option>
                  <option value="polygon">Polygon Mainnet</option>
                </select>
                <button
                  className={`px-6 py-2 rounded font-semibold transition-colors ${
                    isDeploying || !gasEstimate
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  onClick={deployContract}
                  disabled={isDeploying || !gasEstimate}
                >
                  {isDeploying ? 'Deploying...' : '🚀 Deploy Contract'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contract History */}
        {wallet && history.length > 0 && (
          <div className="border-t pt-6 mt-auto">
            <h2 className="text-lg font-semibold text-black mb-4">Deployment History</h2>
            <div className="space-y-3 max-h-32 overflow-y-auto contract-history">
              {history.map((contract, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-mono text-sm text-blue-600">{contract.address}</span>
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">{contract.network}</span>
                    <span className="ml-2 text-xs text-gray-500">Gas: {contract.gasUsed}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(contract.time).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
