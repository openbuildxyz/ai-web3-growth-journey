// api/explainContract.js

export default async function explainContractHandler(req, res) {
    const { contractAddress } = req.body;
    if (!contractAddress) {
      return res.status(400).json({ message: "Contract address is required." });
    }
  
    // Load both API keys from your .env file
    const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
  
    try {
      // --- STEP 1: Fetch Contract Source Code from Etherscan ---
      const etherscanUrl = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
      const etherscanResponse = await fetch(etherscanUrl);
      const etherscanData = await etherscanResponse.json();
  
      if (etherscanData.status !== "1" || !etherscanData.result[0].SourceCode) {
        throw new Error("Could not fetch verified source code from Etherscan. The contract may be unverified or the address is incorrect.");
      }
      const sourceCode = etherscanData.result[0].SourceCode;
  
      // --- STEP 2: Send Source Code to Gemini for Analysis ---
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      const prompt = `
        You are a world-class blockchain security expert named ClaritySign.
        Your job is to analyze the following Solidity smart contract source code and explain its potential risks in simple terms.
  
        Respond ONLY with a JSON object with three keys:
        1. "whoCanCall": A summary of the contract's main function permissions (e.g., "Public can mint, only owner can withdraw").
        2. "adminPowers": A description of any special powers the contract owner or admin has (e.g., "Owner can pause all transfers").
        3. "rugPullRisks": An analysis of potential "rug-pull" risks, vulnerabilities, or other red flags (e.g., "A 'withdrawAll' function poses a risk").
  
        Here is the contract source code:
        ${sourceCode}
      `;
  
      const geminiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
  
      if (!geminiResponse.ok) {
        throw new Error(`Gemini API call failed with status: ${geminiResponse.status}`);
      }
  
      const geminiData = await geminiResponse.json();
      const aiResponseText = geminiData.candidates[0].content.parts[0].text;
      const aiJson = JSON.parse(aiResponseText.replace(/```json|```/g, '').trim());
  
      res.status(200).json(aiJson);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        whoCanCall: "Error analyzing contract.",
        adminPowers: "Could not retrieve contract details.",
        rugPullRisks: error.message // Send the actual error message to the frontend for better debugging
      });
    }
  }