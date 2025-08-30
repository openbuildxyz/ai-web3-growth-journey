# ClaritySign AI 🤖

ClaritySign AI is a web3 security tool designed to demystify complex blockchain transactions and smart contracts. Using AI, it provides clear, human-readable summaries and risk assessments to help users navigate the world of decentralized applications safely. This project features a futuristic, cyberpunk-themed UI for an immersive user experience.

## ✨ Features

- _Pre-Sign Transaction Analyzer_:

  - Connects to your MetaMask wallet to use your address as the sender.
  - Simulate a transaction by providing a recipient address, an amount of ETH, and optional transaction data.
  - Get an AI-powered analysis of the transaction's purpose and potential risks before you ever have to sign it.
  - _Advanced Data Decoding_: Automatically decodes complex transaction data for smart contract interactions, revealing the exact function and parameters involved.

- _Smart Contract Analyzer_:

  - Paste any verified Ethereum smart contract address.
  - Fetches the contract's source code from Etherscan.
  - Provides an AI-generated summary of key aspects, including:
    - _Function Permissions_: Who is allowed to call critical functions.
    - _Admin Powers_: Any special privileges the contract owner has.
    - _Potential Risks_: Red flags or potential vulnerabilities like "rug-pull" functions.

- _Interactive Cyberpunk UI_:
  - A stunning, futuristic interface with animations, glowing effects, and a custom font.
  - Real-time feedback with loading skeletons and animated text reveals for AI responses.

## 🛠 Tech Stack

- _Frontend_: React, Vite, Tailwind CSS
- _Backend_: Node.js, Express.js
- _Web3_: Ethers.js for wallet interaction and transaction decoding.
- _APIs_:
  - _Google Gemini API_: For AI-powered analysis.
  - _Etherscan API_: To fetch verified smart contract source code and ABIs.

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm
- A browser with the MetaMask extension installed.

### Installation

1.  _Clone the repository:_
    sh
    git clone [https://github.com/akshatchauhan7/claritysign.git](https://github.com/akshatchauhan7/claritysign.git)
    cd claritysign

2.  _Install dependencies:_
    sh
    npm install

3.  _Set up environment variables:_

    - Create a file named .env in the root of the project.
    - Get a free API key from [Google AI Studio](https://ai.google.dev/) for Gemini.
    - Get a free API key from [Etherscan](https://etherscan.io/apis).
    - Add your keys to the .env file:
      env
      VITE_GEMINI_API_KEY=your_gemini_api_key_here
      ETHERSCAN_API_KEY=your_etherscan_api_key_here

4.  _Run the development server:_

    - This command starts both the frontend (Vite) and the backend (Node.js) concurrently.
      sh
      npm run dev

    - Open your browser and navigate to the local URL provided in the terminal (usually http://localhost:5173).

## Usage

### Analyzing a Transaction

1.  _Connect Your Wallet_: Click the "Connect Wallet" button in the header to connect your MetaMask account.
2.  _Fill in Details_:
    - _Recipient Address_: The address you want to send ETH or interact with.
    - _Amount (in ETH)_: The amount of ETH to send (can be 0 for contract interactions).
    - _Transaction Data (optional)_: For smart contract calls, paste the hex data here (e.g., 0xa9059cbb...).
3.  _Analyze_: Click "Analyze Transaction" to get the AI summary and risk assessment.

### Analyzing a Smart Contract

1.  _Paste Address_: In the "Smart Contract Analyzer" panel, paste the address of any verified Ethereum contract.
2.  _Decode_: Click "DECODE" to fetch the source code and receive the AI-powered analysis.
