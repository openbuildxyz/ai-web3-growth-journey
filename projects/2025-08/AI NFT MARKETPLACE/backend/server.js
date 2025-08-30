const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Helper function to upload a file buffer to Pinata (IPFS)
const uploadToIpfs = async (buffer, fileName) => {
    // ... (This function is correct and has no changes)
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    const stream = Readable.from(buffer);
    data.append('file', stream, { filename: fileName });

    const response = await axios.post(url, data, {
        maxBodyLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
        }
    });
    return response.data.IpfsHash;
};

// Helper function to upload JSON metadata to Pinata (IPFS)
const uploadJsonToIpfs = async (jsonData) => {
    // ... (This function is correct and has no changes)
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const response = await axios.post(url, jsonData, {
        headers: {
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
        }
    });
    return response.data.IpfsHash;
};

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // --- 1. Generate Image from Hugging Face ---
        console.log(`Generating image for prompt: "${prompt}"`);
        const hfResponse = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                method: "POST",
                headers: {
                    // THE FIX IS HERE: We explicitly set the Content-Type to application/json
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HF_API_KEY}`
                },
                body: JSON.stringify({ inputs: prompt }),
            }
        );
        if (!hfResponse.ok) throw new Error(`Hugging Face API Error: ${await hfResponse.text()}`);
        const imageBuffer = await hfResponse.buffer();

        // --- 2. Upload Image to IPFS ---
        console.log("Uploading image to IPFS...");
        const imageCid = await uploadToIpfs(imageBuffer, 'nft-image.png');
        console.log(`Image uploaded to IPFS with CID: ${imageCid}`);

        // --- 3. Create and Upload Metadata to IPFS ---
        console.log("Creating and uploading metadata to IPFS...");
        const metadata = {
            name: `AI Art: ${prompt.substring(0, 20)}...`,
            description: `An AI-generated image based on the prompt: "${prompt}"`,
            image: `ipfs://${imageCid}`
        };
        const metadataCid = await uploadJsonToIpfs(metadata);
        console.log(`Metadata uploaded to IPFS with CID: ${metadataCid}`);

        // --- 4. Send Response to Frontend ---
        const tokenUri = `ipfs://${metadataCid}`;
        const imageBase64 = imageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${imageBase64}`;

        res.json({
            tokenUri: tokenUri,       // The IPFS link for the smart contract
            imageUrl: dataUrl         // The base64 image for previewing on the frontend
        });

    } catch (error) {
        console.error('Error in /api/generate:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

