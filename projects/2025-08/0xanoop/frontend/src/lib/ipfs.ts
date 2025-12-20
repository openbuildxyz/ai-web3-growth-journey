// WARNING: Using API keys on the client-side is insecure and exposes them to anyone who inspects your site's code.
// For a production application, this logic should be moved to a secure backend server or serverless function.

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export const uploadJsonToIpfs = async (jsonData: object): Promise<string> => {
  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error("Pinata API keys are not configured. Please set them in your .env.local file and rebuild the app.");
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: 'AI_DAO_Creator_Metadata.json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pinata API Error: ${errorData.error?.details || response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};