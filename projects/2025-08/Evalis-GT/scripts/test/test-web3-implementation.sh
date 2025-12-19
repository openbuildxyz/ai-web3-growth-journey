#!/bin/bash

echo "🚀 Testing EVT Token & NFT Certificate Implementation"
echo "=================================================="

# Check if the server is running
echo "1. Checking server status..."
curl -s http://localhost:5000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running on port 5000"
else
    echo "❌ Server is not running. Please start the server first."
    exit 1
fi

# Check web3 endpoints
echo ""
echo "2. Testing Web3 endpoints..."

# Test the web3/me endpoint (should work without authentication for testing)
echo "   - Testing /api/web3/me endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/web3/me)
if [ "$response" -eq 401 ]; then
    echo "   ✅ Web3 endpoint responding (401 expected without auth)"
else
    echo "   ⚠️  Web3 endpoint response: $response"
fi

# Check environment variables
echo ""
echo "3. Checking environment variables..."
if [ -f "../.env" ]; then
    echo "   ✅ .env file exists"
    
    # Check for required web3 variables
    if grep -q "TOKEN_ADDRESS" ../.env; then
        echo "   ✅ TOKEN_ADDRESS configured"
    else
        echo "   ❌ TOKEN_ADDRESS missing in .env"
    fi
    
    if grep -q "CERTIFICATE_ADDRESS" ../.env; then
        echo "   ✅ CERTIFICATE_ADDRESS configured"
    else
        echo "   ⚠️  CERTIFICATE_ADDRESS missing in .env (NFT certificates won't work)"
    fi
    
    if grep -q "MINTER_PRIVATE_KEY" ../.env; then
        echo "   ✅ MINTER_PRIVATE_KEY configured"
    else
        echo "   ❌ MINTER_PRIVATE_KEY missing in .env"
    fi
    
    if grep -q "CHAIN_RPC_URL" ../.env; then
        echo "   ✅ CHAIN_RPC_URL configured"
    else
        echo "   ❌ CHAIN_RPC_URL missing in .env"
    fi
else
    echo "   ❌ .env file not found"
fi

# Check if web3 contracts directory exists
echo ""
echo "4. Checking Web3 contracts..."
if [ -d "../web3" ]; then
    echo "   ✅ Web3 directory exists"
    
    if [ -f "../web3/contracts/EvalisToken.sol" ]; then
        echo "   ✅ EvalisToken contract found"
    else
        echo "   ❌ EvalisToken contract missing"
    fi
    
    if [ -f "../web3/contracts/EvalisCertificate.sol" ]; then
        echo "   ✅ EvalisCertificate contract found"
    else
        echo "   ❌ EvalisCertificate contract missing"
    fi
else
    echo "   ❌ Web3 directory not found"
fi

echo ""
echo "5. Implementation Summary:"
echo "   ✨ Features added:"
echo "   - EVT token awarding during grading"
echo "   - NFT certificate minting for excellent work"
echo "   - Student Web3 rewards portal"
echo "   - Teacher grading interface with token/NFT options"
echo "   - Batch token awarding capabilities"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy contracts to testnet: cd ../web3 && npx hardhat run scripts/deploy.js --network sepolia"
echo "   2. Update .env with deployed contract addresses"
echo "   3. Students should link their wallets in the portal"
echo "   4. Teachers can now award tokens and NFTs during grading!"
echo ""
echo "🎓 How it works:"
echo "   - Teachers grade assignments and can optionally award EVT tokens"
echo "   - For scores ≥80%, teachers can award NFT certificates"
echo "   - Students see their rewards in the new 'Rewards' tab"
echo "   - All rewards are stored on-chain and in the database"

echo ""
echo "Testing complete! 🎉"
