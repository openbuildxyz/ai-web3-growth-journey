'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        modelType: 'text-generation',
        version: '1.0.0',
        file: null
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        alert('Neural network deployed successfully! 🎉');
        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 cyber-grid">
            <div className="fixed inset-0 pointer-events-none">
                <div className="data-stream" style={{left: '15%', animationDelay: '0s'}}></div>
                <div className="data-stream" style={{left: '85%', animationDelay: '1.5s'}}></div>
                <div className="scan-line" style={{animationDelay: '3s'}}></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="text-center mb-12">
                    <Link href="/">
                        <button className="mb-6 font-mono text-sm uppercase tracking-wider hover:scale-105 transition-transform duration-300" 
                                style={{color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)'}}>
                            &lt; RETURN_TO_MAINFRAME
                        </button>
                    </Link>
                    <h1 className="text-5xl font-bold mb-4 neon-text font-mono tracking-wider" 
                        style={{color: 'var(--neon-blue)', letterSpacing: '3px'}}>
                        [NEURAL_REGISTRY]
                    </h1>
                    <div className="terminal-text text-lg max-w-2xl mx-auto font-mono">
                        <span className="text-green-400">&gt;</span> UPLOAD_PROTOCOL.INIT()
                    </div>
                    <p className="text-gray-300 mt-4 font-mono text-sm uppercase tracking-wider">
                        [SYSTEM] Deploy AI models to distributed IPFS network
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="cyber-card rounded-lg p-8 neon-border hologram">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                       style={{color: 'var(--neon-blue)'}}>
                                    MODEL_NAME.VALUE
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                    style={{borderColor: 'var(--neon-blue)'}}
                                    placeholder="e.g., NEURAL_NET_v4.2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                       style={{color: 'var(--neon-pink)'}}>
                                    DESCRIPTION.METADATA
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                    style={{borderColor: 'var(--neon-pink)'}}
                                    placeholder="Neural network capabilities and deployment parameters..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                           style={{color: 'var(--neon-green)'}}>
                                        NEURAL_TYPE
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                        style={{borderColor: 'var(--neon-green)'}}
                                        value={formData.modelType}
                                        onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                                    >
                                        <option value="text-generation">TEXT_GENERATION</option>
                                        <option value="image-classification">IMAGE_CLASSIFICATION</option>
                                        <option value="object-detection">OBJECT_DETECTION</option>
                                        <option value="sentiment-analysis">SENTIMENT_ANALYSIS</option>
                                        <option value="translation">TRANSLATION</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                           style={{color: 'var(--neon-orange)'}}>
                                        VERSION.ID
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                        style={{borderColor: 'var(--neon-orange)'}}
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-4 cyber-button rounded-none font-mono text-lg tracking-wider uppercase neon-glow-blue transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? '[UPLOADING] IPFS_BLOCKCHAIN...' : '> DEPLOY_TO_NETWORK'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
