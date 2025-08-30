'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DeployPage() {
    const [isDeploying, setIsDeploying] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');

    const startDeployment = async () => {
        if (!selectedModel) {
            alert('Please select a model to deploy');
            return;
        }
        setIsDeploying(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        setIsDeploying(false);
        alert('🚀 Model deployed successfully to the network!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 cyber-grid">
            <div className="fixed inset-0 pointer-events-none">
                <div className="data-stream" style={{left: '10%', animationDelay: '0s'}}></div>
                <div className="data-stream" style={{left: '50%', animationDelay: '1s'}}></div>
                <div className="data-stream" style={{left: '90%', animationDelay: '2s'}}></div>
                <div className="scan-line" style={{animationDelay: '5s'}}></div>
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
                        style={{color: 'var(--neon-green)', letterSpacing: '3px'}}>
                        [DEPLOY.EXECUTE]
                    </h1>
                    <div className="terminal-text text-lg max-w-2xl mx-auto font-mono">
                        <span className="text-green-400">&gt;</span> NEURAL_DEPLOYMENT.INIT()
                    </div>
                    <p className="text-gray-300 mt-4 font-mono text-sm uppercase tracking-wider">
                        [SYSTEM] Launch AI models to distributed compute network
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="cyber-card rounded-lg p-6 neon-border hologram">
                        <h2 className="text-2xl font-bold mb-6 font-mono tracking-wider" 
                            style={{color: 'var(--neon-blue)'}}>
                            [CONFIG] DEPLOYMENT_PARAMS
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                       style={{color: 'var(--neon-blue)'}}>
                                    SELECT_MODEL.TARGET
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                    style={{borderColor: 'var(--neon-blue)'}}
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                >
                                    <option value="">SELECT_NEURAL_NETWORK...</option>
                                    <option value="gpt4-text-gen">GPT-4 Text Generator v1.0.0</option>
                                    <option value="image-classifier">Image Classifier Pro v2.1.0</option>
                                    <option value="sentiment-analyzer">Sentiment Analyzer v1.5.0</option>
                                    <option value="object-detector">Object Detection V3 v3.0.1</option>
                                    <option value="neural-translator">Neural Translator v2.0.0</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                           style={{color: 'var(--neon-pink)'}}>
                                        REPLICA_COUNT
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        defaultValue="3"
                                        className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                        style={{borderColor: 'var(--neon-pink)'}}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider" 
                                           style={{color: 'var(--neon-green)'}}>
                                        SCALING_MODE
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                        style={{borderColor: 'var(--neon-green)'}}
                                        defaultValue="auto"
                                    >
                                        <option value="auto">AUTO_SCALE</option>
                                        <option value="manual">MANUAL_SCALE</option>
                                        <option value="fixed">FIXED_SCALE</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={startDeployment}
                            disabled={isDeploying || !selectedModel}
                            className="w-full py-4 cyber-button rounded-none font-mono text-lg tracking-wider uppercase neon-glow-green transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeploying ? '[DEPLOYING] NEURAL_NETWORK...' : '> LAUNCH_DEPLOYMENT'}
                        </button>

                        {isDeploying && (
                            <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded">
                                <p className="font-mono text-lg uppercase tracking-wider mb-2" style={{color: 'var(--neon-blue)'}}>
                                    [STATUS] DEPLOYMENT_IN_PROGRESS
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" 
                                         style={{width: '60%'}}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
