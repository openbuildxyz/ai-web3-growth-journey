import { use0G } from './use0G.js';

const { uploadFile, verifyFile, getTransactionInfo, verifyByTxHash, connectWallet, switchNetwork } = use0G();

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const switchNetworkBtn = document.getElementById('switchNetworkBtn');
const uploadBtn = document.getElementById('uploadBtn');
const verifyBtn = document.getElementById('verifyBtn');
const queryTxBtn = document.getElementById('queryTxBtn');
const compareHashBtn = document.getElementById('compareHashBtn');
const fileInput = document.getElementById('fileInput');
const verifyFileInput = document.getElementById('verifyFileInput');
const verifyTxFileInput = document.getElementById('verifyTxFileInput');
const hashInput = document.getElementById('hashInput');
const txHashInput = document.getElementById('txHashInput');
const statusDiv = document.getElementById('status');
const resultDiv = document.getElementById('result');
const verifyResultDiv = document.getElementById('verifyResult');
const txInfoDiv = document.getElementById('txInfo');

let walletConnected = false;
let txInfo = null; // Store transaction info for comparison

// Verify DOM elements are loaded
console.log('DOM Elements Check:');
console.log('compareHashBtn:', compareHashBtn);
console.log('queryTxBtn:', queryTxBtn);
console.log('txInfoDiv:', txInfoDiv);
console.log('verifyResultDiv:', verifyResultDiv);

if (!compareHashBtn) {
    console.error('ERROR: compareHashBtn not found!');
}
if (!queryTxBtn) {
    console.error('ERROR: queryTxBtn not found!');
}
if (!verifyResultDiv) {
    console.error('ERROR: verifyResultDiv not found!');
}


// Connect Wallet
connectBtn.addEventListener('click', async () => {
    try {
        statusDiv.textContent = 'Connecting wallet...';
        statusDiv.className = 'status info';

        const signer = await connectWallet();
        const address = await signer.getAddress();

        walletConnected = true;
        connectBtn.textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
        connectBtn.disabled = true;

        statusDiv.textContent = 'Wallet connected successfully!';
        statusDiv.className = 'status success';
        statusDiv.style.display = 'block';

        uploadBtn.disabled = false;
        verifyBtn.disabled = false;
    } catch (error) {
        console.error('Connection error:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status error';
    }
});

// Switch Network
switchNetworkBtn.addEventListener('click', async () => {
    try {
        statusDiv.textContent = 'Switching to 0G Galileo Testnet...';
        statusDiv.className = 'status info';

        await switchNetwork();

        statusDiv.textContent = 'Network switched successfully!';
        statusDiv.className = 'status success';
    } catch (error) {
        console.error('Network switch error:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status error';
    }
});

// Upload File (Notarization)
uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        statusDiv.textContent = 'Please select a file first';
        statusDiv.className = 'status error';
        return;
    }

    if (!walletConnected) {
        statusDiv.textContent = 'Please connect wallet first';
        statusDiv.className = 'status error';
        return;
    }

    try {
        statusDiv.textContent = 'Uploading file for notarization...';
        statusDiv.className = 'status info';
        resultDiv.innerHTML = '';

        const result = await uploadFile(file);

        statusDiv.textContent = 'File notarized successfully!';
        statusDiv.className = 'status success';

        resultDiv.innerHTML = `
            <h3>Notarization Record</h3>
            <div class="record-item"><strong>File Name:</strong> ${result.fileName}</div>
            <div class="record-item"><strong>File Size:</strong> ${result.fileSize} bytes</div>
            <div class="record-item"><strong>Root Hash:</strong> <code>${result.rootHash}</code></div>
            <div class="record-item"><strong>Transaction Hash:</strong> <code>${result.txHash}</code></div>
            <div class="record-item"><strong>Block Number:</strong> ${result.blockNumber}</div>
            <div class="record-item"><strong>Timestamp:</strong> ${new Date(result.timestamp).toLocaleString()}</div>
            <div class="record-item">
                <a href="https://chainscan-galileo.0g.ai/tx/${result.txHash}" target="_blank">View on Explorer</a>
            </div>
            <div class="note">
                <strong>Note:</strong> Save the Root Hash to verify this file later!
            </div>
        `;
    } catch (error) {
        console.error('Upload error:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status error';
    }
});

// Verify File
verifyBtn.addEventListener('click', async () => {
    const file = verifyFileInput.files[0];
    const expectedHash = hashInput.value.trim();

    if (!file) {
        statusDiv.textContent = 'Please select a file to verify';
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        return;
    }

    if (!expectedHash) {
        statusDiv.textContent = 'Please enter the expected hash';
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        return;
    }

    try {
        statusDiv.textContent = 'Verifying file...';
        statusDiv.className = 'status info';
        verifyResultDiv.innerHTML = '';

        const result = await verifyFile(file, expectedHash);

        if (result.isValid) {
            statusDiv.textContent = 'Verification successful!';
            statusDiv.className = 'status success';

            verifyResultDiv.innerHTML = `
                <h3>✅ Verification Passed</h3>
                <div class="verify-success">
                    <p><strong>${result.message}</strong></p>
                    <div class="record-item"><strong>Calculated Hash:</strong> <code>${result.calculatedHash}</code></div>
                    <div class="record-item"><strong>Expected Hash:</strong> <code>${result.expectedHash}</code></div>
                    <p class="note">This file matches the blockchain record and has not been modified.</p>
                </div>
            `;
        } else {
            statusDiv.textContent = 'Verification failed!';
            statusDiv.className = 'status error';

            verifyResultDiv.innerHTML = `
                <h3>❌ Verification Failed</h3>
                <div class="verify-fail">
                    <p><strong>${result.message}</strong></p>
                    <div class="record-item"><strong>Calculated Hash:</strong> <code>${result.calculatedHash}</code></div>
                    <div class="record-item"><strong>Expected Hash:</strong> <code>${result.expectedHash}</code></div>
                    <p class="note">This file does NOT match the blockchain record. It may have been modified or is not the original file.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Verification error:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status error';
    }
});


// Query Transaction Info (Step 1)
queryTxBtn.addEventListener('click', async () => {
    const txHash = txHashInput.value.trim();

    if (!txHash) {
        statusDiv.textContent = 'Please enter the transaction hash';
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        return;
    }

    try {
        statusDiv.textContent = 'Querying blockchain...';
        statusDiv.className = 'status info';
        statusDiv.style.display = 'block';
        txInfoDiv.innerHTML = '';
        verifyResultDiv.innerHTML = '';

        txInfo = await getTransactionInfo(txHash);

        statusDiv.textContent = 'Transaction info retrieved successfully!';
        statusDiv.className = 'status success';

        txInfoDiv.innerHTML = `
            <h3>📋 Blockchain Record</h3>
            <div class="tx-info-display">
                <div class="record-item"><strong>Transaction Hash:</strong> <code>${txInfo.txHash}</code></div>
                <div class="record-item"><strong>Upload Time:</strong> ${txInfo.uploadTime.toLocaleString()}</div>
                <div class="record-item"><strong>Block Number:</strong> ${txInfo.blockNumber}</div>
                <div class="record-item"><strong>File Hash:</strong> <code id="blockchainHash">${txInfo.fileHash}</code></div>
                <div class="record-item"><strong>File Size:</strong> ${txInfo.fileSize} bytes</div>
                <div class="record-item"><strong>From:</strong> <code>${txInfo.from}</code></div>
                <div class="record-item"><strong>Contract:</strong> <code>${txInfo.to}</code></div>
                <div class="record-item"><strong>Gas Used:</strong> ${txInfo.gasUsed}</div>
                <div class="record-item">
                    <a href="https://chainscan-galileo.0g.ai/tx/${txInfo.txHash}" target="_blank">View on Explorer</a>
                </div>
                <p class="note">Now upload your file below to compare its hash with the blockchain record.</p>
            </div>
        `;

        // Enable compare button
        console.log('Enabling compareHashBtn, element:', compareHashBtn);
        compareHashBtn.disabled = false;

    } catch (error) {
        console.error('Query error:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        txInfo = null;
        compareHashBtn.disabled = true;
    }
});

// Compare File Hash with Transaction (Step 2)
compareHashBtn.addEventListener('click', async () => {
    console.log('🔵 Compare button clicked!');
    console.log('txInfo:', txInfo);
    console.log('file:', verifyTxFileInput.files[0]);

    const file = verifyTxFileInput.files[0];

    if (!file) {
        statusDiv.textContent = 'Please select a file to compare';
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        return;
    }

    if (!txInfo) {
        statusDiv.textContent = 'Please query transaction info first';
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        return;
    }

    try {
        statusDiv.textContent = 'Calculating file hash and comparing...';
        statusDiv.className = 'status info';
        statusDiv.style.display = 'block';
        verifyResultDiv.innerHTML = '';

        // Calculate file hash
        const { Blob: ZgBlob } = await import('@0glabs/0g-ts-sdk');
        const zgFile = new ZgBlob(file);
        const [tree, treeErr] = await zgFile.merkleTree();

        if (treeErr) {
            throw new Error("File hash calculation failed: " + treeErr.message);
        }

        const calculatedHash = tree.rootHash();
        const currentSize = file.size;

        // Compare
        const hashMatch = calculatedHash.toLowerCase() === txInfo.fileHash.toLowerCase();
        const sizeMatch = currentSize === txInfo.fileSize;
        const isValid = hashMatch && sizeMatch;

        if (isValid) {
            console.log('✅ Verification successful!');
            console.log('Setting verifyResultDiv.innerHTML, element:', verifyResultDiv);
            statusDiv.textContent = 'Verification successful!';
            statusDiv.className = 'status success';

            verifyResultDiv.innerHTML = `
                <h3>✅ File Verification Passed</h3>
                <div class="verify-success">
                    <p><strong>File matches blockchain record perfectly!</strong></p>
                    <div class="record-item"><strong>File Name:</strong> ${file.name}</div>
                    <div class="record-item"><strong>Upload Time:</strong> ${txInfo.uploadTime.toLocaleString()}</div>
                    <div class="record-item"><strong>Blockchain Hash:</strong> <code>${txInfo.fileHash}</code></div>
                    <div class="record-item"><strong>Calculated Hash:</strong> <code>${calculatedHash}</code></div>
                    <div class="record-item"><strong>Hash Match:</strong> ✅ Yes</div>
                    <div class="record-item"><strong>Blockchain Size:</strong> ${txInfo.fileSize} bytes</div>
                    <div class="record-item"><strong>Current Size:</strong> ${currentSize} bytes</div>
                    <div class="record-item"><strong>Size Match:</strong> ✅ Yes</div>
                    <p class="note">This file is authentic and has not been modified since it was notarized on ${txInfo.uploadTime.toLocaleDateString()}.</p>
                </div>
            `;
        } else {
            console.log('❌ Verification failed!');
            console.log('Setting verifyResultDiv.innerHTML for failure, element:', verifyResultDiv);
            statusDiv.textContent = 'Verification failed!';
            statusDiv.className = 'status error';

            verifyResultDiv.innerHTML = `
                <h3>❌ File Verification Failed</h3>
                <div class="verify-fail">
                    <p><strong>File does NOT match blockchain record!</strong></p>
                    <div class="record-item"><strong>File Name:</strong> ${file.name}</div>
                    <div class="record-item"><strong>Upload Time:</strong> ${txInfo.uploadTime.toLocaleString()}</div>
                    <div class="record-item"><strong>Blockchain Hash:</strong> <code>${txInfo.fileHash}</code></div>
                    <div class="record-item"><strong>Calculated Hash:</strong> <code>${calculatedHash}</code></div>
                    <div class="record-item"><strong>Hash Match:</strong> ${hashMatch ? '✅ Yes' : '❌ No'}</div>
                    <div class="record-item"><strong>Blockchain Size:</strong> ${txInfo.fileSize} bytes</div>
                    <div class="record-item"><strong>Current Size:</strong> ${currentSize} bytes</div>
                    <div class="record-item"><strong>Size Match:</strong> ${sizeMatch ? '✅ Yes' : '❌ No'}</div>
                    <p class="note">${!hashMatch ? 'The file content has been modified.' : 'The file size has changed.'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Comparison error:', error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
    }
});

// Enable verify button on page load (doesn't need wallet)
verifyBtn.disabled = false;

// Enable upload button when file is selected AND wallet is connected
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0 && walletConnected) {
        uploadBtn.disabled = false;
    }
});

console.log('0G Notarization System initialized ✨');
