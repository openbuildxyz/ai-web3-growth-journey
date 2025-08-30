AI NFT Marketplace 🚀
A full-stack decentralized application (DApp) that allows users to generate unique AI-created images from text prompts and instantly mint them as NFTs on the Ethereum blockchain. These NFTs can then be listed and sold in a simple, decentralized marketplace.

✨ Core Features
Wallet Integration: Connects to MetaMask for seamless blockchain interaction.
AI Image Generation: Utilizes the Stable Diffusion model via the Hugging Face API to create art from text prompts.
Decentralized Storage: All NFT assets (images and metadata) are uploaded to IPFS via Pinata, ensuring permanence and decentralization.
NFT Minting: Mint unique ERC721 tokens on the Sepolia testnet.
Marketplace Functionality: List your newly minted NFTs for sale with a set price.

🛠️ Technology Stack
This project combines a modern Web3 frontend, a powerful backend for AI and IPFS operations, and secure Solidity smart contracts.

Category
Technology
Description
Blockchain
Solidity, Hardhat, OpenZeppelin
Smart contracts for the NFT (ERC721) and Marketplace, developed and deployed using the Hardhat environment.
Decentralized Storage
IPFS, Pinata
For storing NFT images and metadata off-chain in a decentralized and permanent way.
Backend
Node.js, Express.js
A server to securely handle API requests to the Hugging Face AI and Pinata IPFS services.
Frontend
HTML, Tailwind CSS, Vanilla JavaScript
A lightweight, fast, and accessible user interface for interacting with the application.
Web3 Interaction
Ethers.js, MetaMask
The bridge connecting the user's browser and wallet to the Ethereum blockchain.
Generative AI
Hugging Face API
Provides API access to the powerful Stable Diffusion model for image generation.

🏗️ Architecture & Workflow
The application follows a modern DApp architecture, separating concerns for scalability and security.

Frontend sends a text prompt to the Backend.
Backend calls the Hugging Face API to generate an image.
Backend uploads the image and its metadata to IPFS via Pinata.
Backend returns the final tokenURI (IPFS link) to the Frontend.
Frontend initiates a mint transaction on the Blockchain using the tokenURI.
The user approves the transaction in MetaMask, and the NFT is created.

🚀 Getting Started
Follow these instructions to get a local copy up and running.

Prerequisites
Node.js (v16 or later)
npm or yarn package manager
A code editor like VS Code
MetaMask browser extension
Installation
Clone the repository:
git clone [https://github.com/your-username/ai-nft-marketplace.git](https://github.com/your-username/ai-nft-marketplace.git)
cd ai-nft-marketplace
Install root dependencies:
npm install
Install backend dependencies:
cd backend
npm install
cd ..
Set up Environment Variables:
Create a .env file in the root directory and another one in the /backend directory. Copy the contents of .env.example into both files and fill in your secret keys. (See below for details).
Compile the Smart Contracts:
npx hardhat compile
Deploy the Smart Contracts:
Deploy to the Sepolia testnet. Make sure your wallet has Sepolia ETH from a faucet.
npx hardhat run scripts/deploy.js --network sepolia
Update Frontend with Addresses & ABIs:
After deployment, copy the deployed contract addresses from the terminal.
Open frontend/index.html.
Paste the AI_NFT and Marketplace contract addresses into their respective variables.
Copy the ABIs from artifacts/contracts/AI_NFT.sol/AI_NFT.json and artifacts/contracts/Marketplace.sol/Marketplace.json and paste them into their respective variables in index.html. Remember to copy ONLY the array [...] part.
Environment Variables (.env)
You will need the following keys.
# For Hardhat deployment & Backend server
SEPOLIA_RPC_URL=[https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY](https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY)
PRIVATE_KEY=0xYOUR_METAMASK_PRIVATE_KEY

# For Backend server ONLY
HF_API_KEY=hf_YOUR_HUGGINGFACE_API_KEY
PINATA_API_KEY=YourPinataApiKey
PINATA_SECRET_KEY=YourPinataSecretKey
SEPOLIA_RPC_URL: Get this from a node provider like Infura or Alchemy.
PRIVATE_KEY: Export this from a development-only MetaMask wallet.
HF_API_KEY: Get this from your Hugging Face Account Settings (use a write role).
PINATA_API_KEY: Get this from your Pinata Account Keys.

▶️ Running the Application
You will need two separate terminals to run the full application.
Start the Backend Server (Terminal 1):

cd backend
node server.js

The server will be running on http://localhost:4000.
Launch the Frontend (Terminal 2 is not needed):
Navigate to the frontend folder in your file explorer.
Double-click the index.html file to open it in your browser.
You can now connect your MetaMask wallet (on the Sepolia network) and begin creating NFTs!
