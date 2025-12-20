import { Web3StorageUploader } from './web3-storage'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

async function testUploader() {
    console.log('🧪 Testing Web3.Storage Uploader...')

    // Create a test directory with sample files
    const testDir = path.join(os.tmpdir(), 'modelforge-test')

    // Clean up any existing test directory
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true })
    }

    fs.mkdirSync(testDir, { recursive: true })

    // Create sample files
    const files = [
        { name: 'model.h5', content: 'Mock Keras model data' },
        { name: 'README.md', content: '# Test Model\nThis is a test model for ModelForge.' },
        { name: 'config.json', content: '{"model_type": "classification", "version": "1.0.0"}' },
        { name: 'requirements.txt', content: 'tensorflow==2.12.0\nnumpy==1.24.0' }
    ]

    console.log('📁 Creating test files...')
    for (const file of files) {
        const filePath = path.join(testDir, file.name)
        fs.writeFileSync(filePath, file.content)
        console.log(`  ✓ ${file.name}`)
    }

    // Create subdirectory with more files
    const subDir = path.join(testDir, 'models')
    fs.mkdirSync(subDir)
    fs.writeFileSync(path.join(subDir, 'weights.pkl'), 'Mock pickle weights')
    fs.writeFileSync(path.join(subDir, 'tokenizer.json'), '{"vocab_size": 50000}')

    try {
        // Test with mock token (in real usage, set WEB3_STORAGE_TOKEN env var)
        const uploader = new Web3StorageUploader('mock-token-for-testing')

        console.log('\n🚀 Testing directory upload...')
        const result = await uploader.putDirectory(testDir, {
            onProgress: (progress) => {
                console.log(`  📊 Upload progress: ${progress}%`)
            }
        })

        console.log(`\n✅ Directory upload successful!`)
        console.log(`  📦 CID: ${result.cid}`)
        console.log(`  📏 Size: ${result.size} bytes`)
        console.log(`  📄 Files: ${result.files}`)

        // Test single file upload
        console.log('\n🚀 Testing single file upload...')
        const singleFileResult = await uploader.putFile(path.join(testDir, 'model.h5'), {
            onProgress: (progress) => {
                console.log(`  📊 File upload progress: ${progress}%`)
            }
        })

        console.log(`\n✅ File upload successful!`)
        console.log(`  📦 CID: ${singleFileResult.cid}`)
        console.log(`  📏 Size: ${singleFileResult.size} bytes`)

    } catch (error) {
        console.error('❌ Test failed:', error)
    } finally {
        // Clean up
        console.log('\n🧹 Cleaning up test files...')
        fs.rmSync(testDir, { recursive: true })
        console.log('✅ Cleanup complete!')
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testUploader().catch(console.error)
}

export { testUploader }
