const fs = require('fs');
const path = require('path');
const os = require('os');

// Simple version without imports to test the logic
async function testWeb3StorageUploader() {
    console.log('🧪 Testing Web3.Storage Uploader Logic...');

    class MockWeb3StorageUploader {
        constructor(token = 'mock-token') {
            this.token = token;
        }

        async putDirectory(dirPath, options = {}) {
            if (!fs.existsSync(dirPath)) {
                throw new Error(`Directory does not exist: ${dirPath}`);
            }

            if (!fs.lstatSync(dirPath).isDirectory()) {
                throw new Error(`Path is not a directory: ${dirPath}`);
            }

            try {
                const files = await this.getFilesFromDirectory(dirPath);

                if (files.length === 0) {
                    throw new Error(`No files found in directory: ${dirPath}`);
                }

                // Track progress if callback provided
                if (options.onProgress) {
                    for (let i = 0; i <= 100; i += 10) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        options.onProgress(i);
                    }
                }

                const mockCid = this.generateMockCid();
                const totalSize = files.reduce((sum, file) => sum + file.size, 0);

                return {
                    cid: mockCid,
                    size: totalSize,
                    files: files.length
                };

            } catch (error) {
                throw new Error(`Failed to upload directory: ${error}`);
            }
        }

        async putFile(filePath, options = {}) {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }

            if (!fs.lstatSync(filePath).isFile()) {
                throw new Error(`Path is not a file: ${filePath}`);
            }

            try {
                const stats = fs.statSync(filePath);

                if (options.onProgress) {
                    for (let i = 0; i <= 100; i += 20) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                        options.onProgress(i);
                    }
                }

                const mockCid = this.generateMockCid();

                return {
                    cid: mockCid,
                    size: stats.size,
                    files: 1
                };

            } catch (error) {
                throw new Error(`Failed to upload file: ${error}`);
            }
        }

        async getFilesFromDirectory(dirPath) {
            const files = [];

            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    const subFiles = await this.getFilesFromDirectory(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile()) {
                    const stats = fs.statSync(fullPath);
                    const relativePath = path.relative(dirPath, fullPath);

                    files.push({
                        name: relativePath,
                        size: stats.size,
                        path: fullPath
                    });
                }
            }

            return files;
        }

        generateMockCid() {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = 'bafybei';
            for (let i = 0; i < 52; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    }

    // Create a test directory with sample files
    const testDir = path.join(os.tmpdir(), 'modelforge-test');

    // Clean up any existing test directory
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
    }

    fs.mkdirSync(testDir, { recursive: true });

    // Create sample files
    const files = [
        { name: 'model.h5', content: 'Mock Keras model data' },
        { name: 'README.md', content: '# Test Model\nThis is a test model for ModelForge.' },
        { name: 'config.json', content: '{"model_type": "classification", "version": "1.0.0"}' },
        { name: 'requirements.txt', content: 'tensorflow==2.12.0\nnumpy==1.24.0' }
    ];

    console.log('📁 Creating test files...');
    for (const file of files) {
        const filePath = path.join(testDir, file.name);
        fs.writeFileSync(filePath, file.content);
        console.log(`  ✓ ${file.name}`);
    }

    // Create subdirectory with more files
    const subDir = path.join(testDir, 'models');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, 'weights.pkl'), 'Mock pickle weights');
    fs.writeFileSync(path.join(subDir, 'tokenizer.json'), '{"vocab_size": 50000}');

    try {
        const uploader = new MockWeb3StorageUploader('mock-token-for-testing');

        console.log('\n🚀 Testing directory upload...');
        const result = await uploader.putDirectory(testDir, {
            onProgress: (progress) => {
                console.log(`  📊 Upload progress: ${progress}%`);
            }
        });

        console.log(`\n✅ Directory upload successful!`);
        console.log(`  📦 CID: ${result.cid}`);
        console.log(`  📏 Size: ${result.size} bytes`);
        console.log(`  📄 Files: ${result.files}`);

        // Test single file upload
        console.log('\n🚀 Testing single file upload...');
        const singleFileResult = await uploader.putFile(path.join(testDir, 'model.h5'), {
            onProgress: (progress) => {
                console.log(`  📊 File upload progress: ${progress}%`);
            }
        });

        console.log(`\n✅ File upload successful!`);
        console.log(`  📦 CID: ${singleFileResult.cid}`);
        console.log(`  📏 Size: ${singleFileResult.size} bytes`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Clean up
        console.log('\n🧹 Cleaning up test files...');
        fs.rmSync(testDir, { recursive: true });
        console.log('✅ Cleanup complete!');
    }
}

// Run the test
testWeb3StorageUploader().catch(console.error);
