'use client';

import { useState, useCallback } from 'react';

interface UploadResult {
    cid: string;
    size: number;
    files: number;
}

interface UploadProgress {
    progress: number;
    stage: string;
}

export function useIPFSUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
        setIsUploading(true);
        setError(null);
        setUploadProgress({ progress: 0, stage: 'Initializing IPFS upload...' });

        try {
            // For real Web3.Storage integration, you would get a token from https://web3.storage
            // and set it as NEXT_PUBLIC_WEB3_STORAGE_TOKEN environment variable
            const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

            if (token) {
                // Real Web3.Storage upload
                return await realIPFSUpload(file, token);
            } else {
                // Mock upload for demo
                return await mockUpload(file);
            }

        } catch (err) {
            console.error('Upload failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            setIsUploading(false);
            setUploadProgress(null);
            return null;
        }
    }, []);

    // Real IPFS upload using Web3.Storage API
    const realIPFSUpload = async (file: File, token: string): Promise<UploadResult> => {
        setUploadProgress({ progress: 20, stage: 'Connecting to Web3.Storage...' });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.web3.storage/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Web3.Storage API error: ${response.statusText}`);
        }

        setUploadProgress({ progress: 60, stage: 'Processing upload...' });

        const result = await response.json();

        setUploadProgress({ progress: 80, stage: 'Finalizing IPFS storage...' });

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));

        setUploadProgress({ progress: 100, stage: 'Upload complete!' });

        console.log(`✅ File uploaded to IPFS! CID: ${result.cid}`);

        // Reset after a brief delay
        setTimeout(() => {
            setUploadProgress(null);
            setIsUploading(false);
        }, 1000);

        return {
            cid: result.cid,
            size: file.size,
            files: 1
        };
    };

    // Mock upload for demo purposes when no token is provided
    const mockUpload = async (file: File): Promise<UploadResult> => {
        const stages = [
            'Connecting to IPFS network...',
            'Encrypting file data...',
            'Uploading to distributed storage...',
            'Generating content hash...',
            'Verifying upload integrity...',
            'Finalizing deployment...'
        ];

        for (let i = 0; i < stages.length; i++) {
            setUploadProgress({
                progress: Math.round((i + 1) * 100 / stages.length),
                stage: stages[i] || 'Processing...'
            });

            // Simulate upload time
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        }

        // Generate a mock CID
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let mockCid = 'bafybei';
        for (let i = 0; i < 52; i++) {
            mockCid += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setUploadProgress({ progress: 100, stage: 'Upload complete!' });

        // Reset after a brief delay
        setTimeout(() => {
            setUploadProgress(null);
            setIsUploading(false);
        }, 1000);

        return {
            cid: mockCid,
            size: file.size,
            files: 1
        };
    };

    const uploadDirectory = useCallback(async (files: File[]): Promise<UploadResult | null> => {
        setIsUploading(true);
        setError(null);
        setUploadProgress({ progress: 0, stage: 'Preparing directory upload...' });

        try {
            const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

            if (token) {
                // Real directory upload
                return await realDirectoryUpload(files, token);
            } else {
                // Mock directory upload
                return await mockDirectoryUpload(files);
            }

        } catch (err) {
            console.error('Directory upload failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Directory upload failed';
            setError(errorMessage);
            setIsUploading(false);
            setUploadProgress(null);
            return null;
        }
    }, []);

    // Real directory upload using Web3.Storage API
    const realDirectoryUpload = async (files: File[], token: string): Promise<UploadResult> => {
        setUploadProgress({ progress: 20, stage: 'Preparing directory for Web3.Storage...' });

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`file[${index}]`, file, file.name);
        });

        setUploadProgress({ progress: 40, stage: 'Uploading directory to IPFS...' });

        const response = await fetch('https://api.web3.storage/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Web3.Storage API error: ${response.statusText}`);
        }

        setUploadProgress({ progress: 70, stage: 'Processing directory structure...' });

        const result = await response.json();
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        setUploadProgress({ progress: 100, stage: 'Directory upload complete!' });

        setTimeout(() => {
            setUploadProgress(null);
            setIsUploading(false);
        }, 1000);

        return {
            cid: result.cid,
            size: totalSize,
            files: files.length
        };
    };

    // Mock directory upload for demo
    const mockDirectoryUpload = async (files: File[]): Promise<UploadResult> => {
        const stages = [
            'Scanning directory structure...',
            'Preparing file manifests...',
            'Connecting to IPFS network...',
            'Uploading files to distributed storage...',
            'Creating directory tree...',
            'Generating directory hash...',
            'Verifying upload integrity...',
            'Finalizing deployment...'
        ];

        for (let i = 0; i < stages.length; i++) {
            setUploadProgress({
                progress: Math.round((i + 1) * 100 / stages.length),
                stage: stages[i] || 'Processing...'
            });

            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        }

        // Generate a mock CID for directory
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let mockCid = 'bafybei';
        for (let i = 0; i < 52; i++) {
            mockCid += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        setUploadProgress({ progress: 100, stage: 'Directory upload complete!' });

        setTimeout(() => {
            setUploadProgress(null);
            setIsUploading(false);
        }, 1000);

        return {
            cid: mockCid,
            size: totalSize,
            files: files.length
        };
    };

    const reset = useCallback(() => {
        setIsUploading(false);
        setUploadProgress(null);
        setError(null);
    }, []);

    return {
        uploadFile,
        uploadDirectory,
        isUploading,
        uploadProgress,
        error,
        reset
    };
}
