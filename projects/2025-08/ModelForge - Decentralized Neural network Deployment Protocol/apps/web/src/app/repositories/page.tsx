'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIPFSUpload } from '@/hooks/useIPFSUpload';
import { useWallet } from '@/hooks/useWallet';

interface Repository {
    id: string;
    name: string;
    description: string;
    type: 'model' | 'dataset' | 'space';
    visibility: 'public' | 'private';
    createdAt: string;
    files: number;
    size: string;
    ipfsCid?: string;
}

export default function RepositoriesPage() {
    const { isConnected, address } = useWallet();
    const { uploadFile, uploadDirectory, isUploading, uploadProgress, error: uploadError, reset } = useIPFSUpload();
    const [repositories, setRepositories] = useState<Repository[]>([
        {
            id: '1',
            name: 'neural-sentiment-v2',
            description: 'Advanced sentiment analysis model trained on social media data',
            type: 'model',
            visibility: 'public',
            createdAt: '2024-01-15',
            files: 8,
            size: '245 MB',
            ipfsCid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku'
        },
        {
            id: '2',
            name: 'image-classifier-mobilenet',
            description: 'Lightweight image classification for edge devices',
            type: 'model',
            visibility: 'public',
            createdAt: '2024-01-10',
            files: 12,
            size: '89 MB',
            ipfsCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRepo, setNewRepo] = useState({
        name: '',
        description: '',
        type: 'model' as 'model' | 'dataset' | 'space',
        visibility: 'public' as 'public' | 'private',
        files: [] as File[]
    });

    const handleCreateRepository = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first to create a repository.');
            return;
        }

        try {
            let ipfsCid = '';

            // Upload files to IPFS if any are selected
            if (newRepo.files.length > 0) {
                const result = newRepo.files.length === 1 && newRepo.files[0]
                    ? await uploadFile(newRepo.files[0])
                    : await uploadDirectory(newRepo.files);

                if (result) {
                    ipfsCid = result.cid;
                } else {
                    alert('Failed to upload files to IPFS. Please try again.');
                    return;
                }
            }

            const repository: Repository = {
                id: Date.now().toString(),
                name: newRepo.name,
                description: newRepo.description,
                type: newRepo.type,
                visibility: newRepo.visibility,
                createdAt: new Date().toISOString().split('T')[0] || new Date().toDateString(),
                files: newRepo.files.length,
                size: newRepo.files.length > 0
                    ? `${(newRepo.files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)} MB`
                    : '0 MB',
                ipfsCid: ipfsCid || undefined
            };

            setRepositories([repository, ...repositories]);
            setShowCreateModal(false);
            setNewRepo({ name: '', description: '', type: 'model', visibility: 'public', files: [] });
            reset();

            alert(`🎉 Repository "${newRepo.name}" created successfully!${ipfsCid ? `\n\nIPFS CID: ${ipfsCid}` : ''}`);
        } catch (error) {
            console.error('Failed to create repository:', error);
            alert('Failed to create repository. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 cyber-grid">
            {/* Cyberpunk Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="data-stream" style={{ left: '20%', animationDelay: '0s' }}></div>
                <div className="data-stream" style={{ left: '80%', animationDelay: '2s' }}></div>
                <div className="scan-line" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <Link href="/">
                        <button className="mb-6 font-mono text-sm uppercase tracking-wider hover:scale-105 transition-transform duration-300"
                            style={{ color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>
                            &lt; RETURN_TO_MAINFRAME
                        </button>
                    </Link>
                    <h1 className="text-5xl font-bold mb-4 neon-text font-mono tracking-wider"
                        style={{ color: 'var(--neon-blue)', letterSpacing: '3px' }}>
                        [NEURAL_REPOSITORIES]
                    </h1>
                    <div className="terminal-text text-lg max-w-2xl mx-auto font-mono">
                        <span className="text-green-400">&gt;</span> REPO_MANAGER.INTERFACE()
                    </div>
                    <p className="text-gray-300 mt-4 font-mono text-sm uppercase tracking-wider">
                        [SYSTEM] Manage AI models, datasets, and deployments on decentralized storage
                    </p>
                </div>

                {/* Action Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-mono tracking-wider"
                            style={{ color: 'var(--neon-green)' }}>
                            MY_REPOSITORIES
                        </h2>
                        <span className="cyber-card px-3 py-1 text-sm font-mono">
                            {repositories.length} REPOS
                        </span>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="cyber-button px-6 py-3 rounded-none font-mono uppercase tracking-wider neon-glow-green transform transition-all duration-300 hover:scale-105"
                    >
                        + CREATE_REPOSITORY
                    </button>
                </div>

                {/* Repository Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {repositories.map((repo) => (
                        <div key={repo.id} className="cyber-card rounded-lg p-6 neon-border hologram hover:scale-105 transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-mono font-bold mb-2"
                                        style={{ color: 'var(--neon-blue)' }}>
                                        {repo.name}
                                    </h3>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={`px-2 py-1 text-xs font-mono rounded-none ${repo.type === 'model' ? 'bg-blue-600' :
                                            repo.type === 'dataset' ? 'bg-green-600' : 'bg-purple-600'
                                            }`}>
                                            {repo.type.toUpperCase()}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-mono rounded-none ${repo.visibility === 'public' ? 'bg-green-700' : 'bg-gray-700'
                                            }`}>
                                            {repo.visibility.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-gray-400">
                                        {repo.createdAt}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-300 text-sm mb-4 font-mono">
                                {repo.description}
                            </p>

                            <div className="flex justify-between items-center text-xs font-mono text-gray-400 mb-4">
                                <span>{repo.files} files</span>
                                <span>{repo.size}</span>
                            </div>

                            {repo.ipfsCid && (
                                <div className="mb-4 p-2 bg-gray-800 rounded-none">
                                    <div className="text-xs font-mono text-gray-400 mb-1">IPFS_CID:</div>
                                    <div className="text-xs font-mono text-green-400 break-all">
                                        {repo.ipfsCid}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <Link href={`/repositories/${repo.id}`}>
                                    <button className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-none font-mono text-sm uppercase tracking-wider transition-colors">
                                        VIEW_REPO
                                    </button>
                                </Link>
                                <Link href={`/repositories/${repo.id}/edit`}>
                                    <button className="py-2 px-4 cyber-button rounded-none font-mono text-sm uppercase tracking-wider neon-glow-blue">
                                        EDIT
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Repository Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="cyber-card rounded-lg p-8 max-w-2xl w-full mx-4 neon-border">
                            <h2 className="text-3xl font-mono font-bold mb-6 tracking-wider"
                                style={{ color: 'var(--neon-green)' }}>
                                [CREATE_REPOSITORY]
                            </h2>

                            <form onSubmit={(e) => { e.preventDefault(); handleCreateRepository(); }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                        style={{ color: 'var(--neon-blue)' }}>
                                        REPOSITORY_NAME
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                        style={{ borderColor: 'var(--neon-blue)' }}
                                        placeholder="e.g., my-awesome-model"
                                        value={newRepo.name}
                                        onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                        style={{ color: 'var(--neon-pink)' }}>
                                        DESCRIPTION
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                        style={{ borderColor: 'var(--neon-pink)' }}
                                        placeholder="Describe your model or dataset..."
                                        value={newRepo.description}
                                        onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                            style={{ color: 'var(--neon-green)' }}>
                                            TYPE
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                            style={{ borderColor: 'var(--neon-green)' }}
                                            value={newRepo.type}
                                            onChange={(e) => setNewRepo({ ...newRepo, type: e.target.value as any })}
                                        >
                                            <option value="model">MODEL</option>
                                            <option value="dataset">DATASET</option>
                                            <option value="space">SPACE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                            style={{ color: 'var(--neon-orange)' }}>
                                            VISIBILITY
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                            style={{ borderColor: 'var(--neon-orange)' }}
                                            value={newRepo.visibility}
                                            onChange={(e) => setNewRepo({ ...newRepo, visibility: e.target.value as any })}
                                        >
                                            <option value="public">PUBLIC</option>
                                            <option value="private">PRIVATE</option>
                                        </select>
                                    </div>
                                </div>

                                {/* File Upload Section */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                        style={{ color: 'var(--neon-purple)' }}>
                                        UPLOAD_FILES (Optional)
                                    </label>
                                    <div className="border-2 border-dashed rounded-none p-6 text-center hover:border-opacity-80 transition-colors cyber-card"
                                        style={{ borderColor: 'var(--neon-purple)' }}>
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="repo-file-upload"
                                            multiple
                                            accept=".h5,.pkl,.pickle,.pt,.pth,.onnx,.tflite,.zip,.tar.gz,.json,.py,.md,.txt"
                                            onChange={(e) => {
                                                const files = e.target.files ? Array.from(e.target.files) : [];
                                                setNewRepo({ ...newRepo, files });
                                            }}
                                        />
                                        <label htmlFor="repo-file-upload" className="cursor-pointer">
                                            <div className="text-4xl mb-2" style={{ color: 'var(--neon-purple)' }}>📁</div>
                                            <p className="text-gray-300 font-mono text-sm uppercase tracking-wider">
                                                DRAG_DROP || CLICK_UPLOAD
                                            </p>
                                            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--neon-purple)' }}>
                                                .h5, .pkl, .pt, .onnx, .py, .md files supported
                                            </p>
                                        </label>
                                        {newRepo.files.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="font-mono text-sm" style={{ color: 'var(--neon-green)' }}>
                                                    [LOADED] {newRepo.files.length} files
                                                </p>
                                                <div className="max-h-32 overflow-y-auto">
                                                    {newRepo.files.map((file, index) => (
                                                        <div key={index} className="text-xs font-mono text-gray-400 flex justify-between">
                                                            <span>{file.name}</span>
                                                            <span>{(file.size / 1024).toFixed(1)}KB</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Progress */}
                                {uploadProgress && (
                                    <div className="space-y-4">
                                        <div className="cyber-card p-4 rounded-none">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm uppercase tracking-wider"
                                                    style={{ color: 'var(--neon-green)' }}>
                                                    [IPFS_UPLOAD_PROGRESS]
                                                </span>
                                                <span className="font-mono text-sm" style={{ color: 'var(--neon-blue)' }}>
                                                    {uploadProgress.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-none h-2 mb-2">
                                                <div
                                                    className="h-full rounded-none transition-all duration-300 neon-glow-green"
                                                    style={{
                                                        width: `${uploadProgress.progress}%`,
                                                        backgroundColor: 'var(--neon-green)'
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="font-mono text-xs uppercase tracking-wider text-gray-300">
                                                {uploadProgress.stage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Error */}
                                {uploadError && (
                                    <div className="cyber-card p-4 rounded-none border-red-500">
                                        <h3 className="font-mono text-sm uppercase tracking-wider mb-2 text-red-400">
                                            [UPLOAD_ERROR]
                                        </h3>
                                        <p className="font-mono text-xs text-red-300">{uploadError}</p>
                                    </div>
                                )}

                                {/* Wallet Connection Warning */}
                                {!isConnected && (
                                    <div className="cyber-card p-4 rounded-none border-yellow-500">
                                        <h3 className="font-mono text-sm uppercase tracking-wider mb-2 text-yellow-400">
                                            [WALLET_REQUIRED]
                                        </h3>
                                        <p className="font-mono text-xs text-yellow-300">
                                            Connect your wallet to create repositories on the blockchain
                                        </p>
                                    </div>
                                )}

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-none font-mono uppercase tracking-wider transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading || !isConnected}
                                        className="flex-1 py-3 cyber-button rounded-none font-mono uppercase tracking-wider neon-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? (
                                            <span className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"
                                                    style={{ borderColor: 'var(--neon-green)' }}></div>
                                                UPLOADING_TO_IPFS...
                                            </span>
                                        ) : !isConnected ? (
                                            'CONNECT_WALLET_FIRST'
                                        ) : (
                                            'CREATE_REPO'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
