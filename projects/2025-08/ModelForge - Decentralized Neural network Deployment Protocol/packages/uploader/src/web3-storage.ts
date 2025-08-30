import { Web3Storage, File, getFilesFromPath } from 'web3.storage'
import * as fs from 'fs'
import * as path from 'path'

export interface UploadOptions {
    token?: string
    onProgress?: (progress: number) => void
}

export interface UploadResult {
    cid: string
    size: number
    files: number
}

export class Web3StorageUploader {
    private client: Web3Storage
    private token: string

    constructor(token?: string) {
        this.token = token || process.env.WEB3_STORAGE_TOKEN || ''
        if (!this.token) {
            throw new Error('WEB3_STORAGE_TOKEN environment variable is required. Get a free token from https://web3.storage')
        }

        this.client = new Web3Storage({ token: this.token })
    }

    /**
     * Upload a directory to IPFS via Web3.Storage
     * @param dirPath - Path to the directory to upload
     * @param options - Upload options
     * @returns Promise<UploadResult> - Upload result with CID
     */
    async putDirectory(dirPath: string, options: UploadOptions = {}): Promise<UploadResult> {
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory does not exist: ${dirPath}`)
        }

        if (!fs.lstatSync(dirPath).isDirectory()) {
            throw new Error(`Path is not a directory: ${dirPath}`)
        }

        try {
            // Get all files from the directory
            const files = await getFilesFromPath(dirPath)

            if (files.length === 0) {
                throw new Error(`No files found in directory: ${dirPath}`)
            }

            console.log(`📁 Uploading ${files.length} files to IPFS via Web3.Storage...`)

            // Track progress if callback provided
            const onRootCidReady = (cid: string) => {
                console.log(`🔗 Root CID: ${cid}`)
                if (options.onProgress) {
                    options.onProgress(50) // 50% when we get the CID
                }
            }

            const onStoredChunk = (bytes: number) => {
                console.log(`📊 Stored ${bytes} bytes`)
                if (options.onProgress) {
                    options.onProgress(75) // 75% as chunks are stored
                }
            }

            // Upload to Web3.Storage
            const cid = await this.client.put(files, {
                name: `ModelForge-${Date.now()}`,
                maxRetries: 3,
                onRootCidReady,
                onStoredChunk
            })

            // Calculate total size
            const totalSize = files.reduce((sum: number, file: any) => sum + file.size, 0)

            if (options.onProgress) {
                options.onProgress(100) // Complete
            }

            console.log(`✅ Upload complete! CID: ${cid}`)

            return {
                cid: cid,
                size: totalSize,
                files: files.length
            }

        } catch (error) {
            console.error('❌ Upload failed:', error)
            throw new Error(`Failed to upload directory: ${error}`)
        }
    }

    /**
     * Upload a single file to IPFS via Web3.Storage
     * @param filePath - Path to the file to upload
     * @param options - Upload options
     * @returns Promise<UploadResult> - Upload result with CID
     */
    async putFile(filePath: string, options: UploadOptions = {}): Promise<UploadResult> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`)
        }

        if (!fs.lstatSync(filePath).isFile()) {
            throw new Error(`Path is not a file: ${filePath}`)
        }

        try {
            const fileData = fs.readFileSync(filePath)
            const fileName = path.basename(filePath)

            console.log(`📄 Uploading ${fileName} to IPFS via Web3.Storage...`)

            const file = new File([fileData], fileName, {
                type: this.getMimeType(filePath)
            })

            // Track progress if callback provided
            const onRootCidReady = (cid: string) => {
                console.log(`🔗 File CID: ${cid}`)
                if (options.onProgress) {
                    options.onProgress(50)
                }
            }

            const onStoredChunk = (bytes: number) => {
                console.log(`📊 Stored ${bytes} bytes`)
                if (options.onProgress) {
                    options.onProgress(75)
                }
            }

            const cid = await this.client.put([file], {
                name: `ModelForge-${fileName}-${Date.now()}`,
                maxRetries: 3,
                onRootCidReady,
                onStoredChunk
            })

            if (options.onProgress) {
                options.onProgress(100)
            }

            console.log(`✅ File upload complete! CID: ${cid}`)

            return {
                cid: cid,
                size: file.size,
                files: 1
            }

        } catch (error) {
            console.error('❌ File upload failed:', error)
            throw new Error(`Failed to upload file: ${error}`)
        }
    }

    /**
     * Upload from browser File objects (for frontend use)
     * @param files - Array of File objects
     * @param options - Upload options
     * @returns Promise<UploadResult> - Upload result with CID
     */
    async putFiles(files: File[], options: UploadOptions = {}): Promise<UploadResult> {
        if (!files || files.length === 0) {
            throw new Error('No files provided for upload')
        }

        try {
            console.log(`📁 Uploading ${files.length} files from browser to IPFS...`)

            const onRootCidReady = (cid: string) => {
                console.log(`🔗 Root CID: ${cid}`)
                if (options.onProgress) {
                    options.onProgress(50)
                }
            }

            const onStoredChunk = (bytes: number) => {
                console.log(`📊 Stored ${bytes} bytes`)
                if (options.onProgress) {
                    options.onProgress(75)
                }
            }

            const cid = await this.client.put(files, {
                name: `ModelForge-Browser-${Date.now()}`,
                maxRetries: 3,
                onRootCidReady,
                onStoredChunk
            })

            const totalSize = files.reduce((sum, file) => sum + file.size, 0)

            if (options.onProgress) {
                options.onProgress(100)
            }

            console.log(`✅ Browser upload complete! CID: ${cid}`)

            return {
                cid: cid,
                size: totalSize,
                files: files.length
            }

        } catch (error) {
            console.error('❌ Browser upload failed:', error)
            throw new Error(`Failed to upload files from browser: ${error}`)
        }
    }

    /**
     * Get a Web3.Storage gateway URL for a CID
     * @param cid - The IPFS CID
     * @param path - Optional path within the directory
     * @returns Gateway URL
     */
    getGatewayUrl(cid: string, path?: string): string {
        const baseUrl = `https://${cid}.ipfs.w3s.link`
        return path ? `${baseUrl}/${path}` : baseUrl
    }

    /**
     * Check the status of an upload
     * @param cid - The IPFS CID to check
     * @returns Upload status information
     */
    async getUploadStatus(cid: string) {
        try {
            const status = await this.client.status(cid)
            return status
        } catch (error) {
            console.error('Failed to get upload status:', error)
            throw new Error(`Failed to get status for CID: ${cid}`)
        }
    }

    /**
     * List all uploads for this account
     * @returns List of uploads
     */
    async listUploads() {
        try {
            const uploads = []
            for await (const upload of this.client.list()) {
                uploads.push(upload)
            }
            return uploads
        } catch (error) {
            console.error('Failed to list uploads:', error)
            throw new Error('Failed to list uploads')
        }
    }

    /**
     * Get MIME type for a file based on extension
     */
    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase()
        const mimeTypes: { [key: string]: string } = {
            '.json': 'application/json',
            '.js': 'application/javascript',
            '.py': 'text/x-python',
            '.md': 'text/markdown',
            '.txt': 'text/plain',
            '.h5': 'application/octet-stream',
            '.pkl': 'application/octet-stream',
            '.pickle': 'application/octet-stream',
            '.pt': 'application/octet-stream',
            '.pth': 'application/octet-stream',
            '.onnx': 'application/octet-stream',
            '.tflite': 'application/octet-stream',
            '.zip': 'application/zip',
            '.tar.gz': 'application/gzip',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf'
        }

        return mimeTypes[ext] || 'application/octet-stream'
    }
}
// Simulate progress updates
for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    options.onProgress(i)
}
            }

// Generate a mock CID for now
const mockCid = this.generateMockCid()
const totalSize = files.reduce((sum, file) => sum + file.size, 0)

return {
    cid: mockCid,
    size: totalSize,
    files: files.length
}

        } catch (error) {
    throw new Error(`Failed to upload directory: ${error}`)
}
    }

    /**
     * Upload a single file to IPFS via Web3.Storage
     * @param filePath - Path to the file to upload
     * @param options - Upload options
     * @returns Promise<UploadResult> - Upload result with CID
     */
    async putFile(filePath: string, options: UploadOptions = {}): Promise < UploadResult > {
    if(!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`)
}

if (!fs.lstatSync(filePath).isFile()) {
    throw new Error(`Path is not a file: ${filePath}`)
}

try {
    const stats = fs.statSync(filePath)

    // Track progress if callback provided
    if (options.onProgress) {
        // Simulate progress updates
        for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 50))
            options.onProgress(i)
        }
    }

    // Generate a mock CID for now
    const mockCid = this.generateMockCid()

    return {
        cid: mockCid,
        size: stats.size,
        files: 1
    }

} catch (error) {
    throw new Error(`Failed to upload file: ${error}`)
}
    }

    /**
     * Get all files from a directory recursively
     */
    private async getFilesFromDirectory(dirPath: string): Promise < Array < { name: string; size: number; path: string } >> {
    const files: Array<{ name: string; size: number; path: string }> =[]

const entries = fs.readdirSync(dirPath, { withFileTypes: true })

for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
        // Recursively get files from subdirectories
        const subFiles = await this.getFilesFromDirectory(fullPath)
        files.push(...subFiles)
    } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath)
        const relativePath = path.relative(dirPath, fullPath)

        files.push({
            name: relativePath,
            size: stats.size,
            path: fullPath
        })
    }
}

return files
    }

    /**
     * Generate a mock CID for testing purposes
     */
    private generateMockCid(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'bafybei'
    for (let i = 0; i < 52; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

    /**
     * Get MIME type for a file based on extension
     */
    private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: { [key: string]: string } = {
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.py': 'text/x-python',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
        '.h5': 'application/octet-stream',
        '.pkl': 'application/octet-stream',
        '.pickle': 'application/octet-stream',
        '.pt': 'application/octet-stream',
        '.pth': 'application/octet-stream',
        '.onnx': 'application/octet-stream',
        '.tflite': 'application/octet-stream',
        '.zip': 'application/zip',
        '.tar.gz': 'application/gzip',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf'
    }

    return mimeTypes[ext] || 'application/octet-stream'
}
}

/**
 * Convert CID to Web3.Storage gateway URL
 * @param cid - IPFS CID
 * @param path - Optional path within the directory
 * @returns Gateway URL
 */
export function cidToGatewayUrl(cid: string, path: string = ''): string {
    const basePath = path.startsWith('/') ? path.slice(1) : path
    const fullPath = basePath ? `/${basePath}` : ''
    return `https://w3s.link/ipfs/${cid}${fullPath}`
}

/**
 * Convert CID to alternative gateway URLs
 */
export function cidToGatewayUrls(cid: string, path: string = ''): {
    web3Storage: string
    ipfsIo: string
    cloudflare: string
    pinata: string
} {
    const basePath = path.startsWith('/') ? path.slice(1) : path
    const fullPath = basePath ? `/${basePath}` : ''

    return {
        web3Storage: `https://w3s.link/ipfs/${cid}${fullPath}`,
        ipfsIo: `https://ipfs.io/ipfs/${cid}${fullPath}`,
        cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}${fullPath}`,
        pinata: `https://gateway.pinata.cloud/ipfs/${cid}${fullPath}`
    }
}

/**
 * Utility function to create uploader instance
 */
export function createUploader(token?: string): Web3StorageUploader {
    return new Web3StorageUploader(token)
}

// Export the main functions for convenience
export async function putDirectory(dirPath: string, options: UploadOptions = {}): Promise<UploadResult> {
    const uploader = createUploader(options.token)
    return uploader.putDirectory(dirPath, options)
}

export async function putFile(filePath: string, options: UploadOptions = {}): Promise<UploadResult> {
    const uploader = createUploader(options.token)
    return uploader.putFile(filePath, options)
}
