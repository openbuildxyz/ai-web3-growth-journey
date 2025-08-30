// api/explain.js

export default async function explainHandler(req, res) {
  const { transaction } = req.body;

  if (!transaction) {
    return res.status(400).json({ message: "Transaction data is required." });
  }

  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  // --- IMPROVED PROMPT ---
  const prompt = `
    You are a world-class blockchain security expert named ClaritySign. Your task is to analyze a raw transaction and return a JSON object.
    **Your response must be professional, with perfect spelling and grammar.**

    Analyze the following transaction and provide a clear, concise summary and a risk assessment.

    **Risk Level Guidelines:**
    - **Low Risk**: Standard ETH/token transfers, swaps on major platforms.
    - **Medium Risk**: Broad permissions requests (e.g., permit signatures), interaction with new/unverified contracts.
    - **High Risk**: Unlimited token approvals, interactions with known scam addresses, signatures granting full wallet control.

    **Response Format:**
    Respond ONLY with a valid JSON object. Do not include markdown formatting like \`\`\`json.
    The JSON object must have two keys: "explanation" and "risk".
    The "risk" value MUST start with "Low Risk:", "Medium Risk:", or "High Risk:".

    **Example Response:**
    {
      "explanation": "This transaction sends 0.5 ETH from address 0x... to address 0x.... It is a standard transfer.",
      "risk": "Low Risk: This is a simple and common ETH transfer to a standard address."
    }

    **Transaction to Analyze:** ${transaction}
  `;

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error("API Error:", errorBody);
      throw new Error(`API call failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const aiJson = JSON.parse(aiResponseText.replace(/```json|```/g, '').trim());

    res.status(200).json(aiJson);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      explanation: "Could not analyze the transaction.",
      risk: "An error occurred while communicating with the AI service."
    });
  }
}