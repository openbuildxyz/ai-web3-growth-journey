'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Model {
    id: string;
    name: string;
    description: string;
    type: string;
    version: string;
    downloads: number;
    owner: string;
    createdAt: string;
}

export default function DiscoverPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);

    // Mock data
    useEffect(() => {
        setTimeout(() => {
            setModels([
                {
                    id: '1',
                    name: 'GPT-4 Text Generator',
                    description: 'Advanced language model for text generation, completion, and conversation',
                    type: 'text-generation',
                    version: '1.0.0',
                    downloads: 1250,
                    owner: '0x1234...5678',
                    createdAt: '2025-08-28'
                },
                {
                    id: '2',
                    name: 'Image Classifier Pro',
                    description: 'High-accuracy image classification model trained on millions of images',
                    type: 'image-classification',
                    version: '2.1.0',
                    downloads: 890,
                    owner: '0xabcd...efgh',
                    createdAt: '2025-08-27'
                },
                {
                    id: '3',
                    name: 'Sentiment Analyzer',
                    description: 'Real-time sentiment analysis for social media and customer feedback',
                    type: 'sentiment-analysis',
                    version: '1.5.0',
                    downloads: 567,
                    owner: '0x9876...5432',
                    createdAt: '2025-08-26'
                },
                {
                    id: '4',
                    name: 'Object Detection V3',
                    description: 'Real-time object detection and tracking for autonomous systems',
                    type: 'object-detection',
                    version: '3.0.1',
                    downloads: 1890,
                    owner: '0xdef0...1234',
                    createdAt: '2025-08-25'
                },
                {
                    id: '5',
                    name: 'Neural Translator',
                    description: 'Multi-language translation with context awareness and cultural adaptation',
                    type: 'translation',
                    version: '2.0.0',
                    downloads: 1456,
                    owner: '0xfeed...beef',
                    createdAt: '2025-08-24'
                }
            ]);
            setLoading(false);
        }, 1500);
    }, []);

    const filteredModels = models.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || model.type === selectedType;
        return matchesSearch && matchesType;
    });

    const getTypeColor = (type: string) => {
        const colors = {
            'text-generation': 'var(--neon-blue)',
            'image-classification': 'var(--neon-pink)',
            'sentiment-analysis': 'var(--neon-green)',
            'object-detection': 'var(--neon-orange)',
            'translation': 'var(--neon-purple)'
        };
        return colors[type as keyof typeof colors] || 'var(--neon-blue)';
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
                        style={{ color: 'var(--neon-pink)', letterSpacing: '3px' }}>
                        [DATABASE.QUERY]
                    </h1>
                    <div className="terminal-text text-lg max-w-2xl mx-auto font-mono">
                        <span className="text-green-400">&gt;</span> NEURAL_NETWORK_SEARCH.INIT()
                    </div>
                    <p className="text-gray-300 mt-4 font-mono text-sm uppercase tracking-wider">
                        [SYSTEM] Browse distributed AI models across IPFS nodes
                    </p>
                </div>

                {/* Search and Filter Controls */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="cyber-card rounded-lg p-6 neon-border hologram">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                    style={{ color: 'var(--neon-blue)' }}>
                                    SEARCH_QUERY.STRING
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search neural networks..."
                                    className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                    style={{ borderColor: 'var(--neon-blue)' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 font-mono uppercase tracking-wider"
                                    style={{ color: 'var(--neon-green)' }}>
                                    FILTER_TYPE.ENUM
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-800 border rounded-none font-mono text-gray-100 focus:ring-2 transition-all"
                                    style={{ borderColor: 'var(--neon-green)' }}
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="all">ALL_TYPES</option>
                                    <option value="text-generation">TEXT_GENERATION</option>
                                    <option value="image-classification">IMAGE_CLASSIFICATION</option>
                                    <option value="object-detection">OBJECT_DETECTION</option>
                                    <option value="sentiment-analysis">SENTIMENT_ANALYSIS</option>
                                    <option value="translation">TRANSLATION</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Models Grid */}
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="cyber-card rounded-lg p-12 neon-border text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                                style={{ borderColor: 'var(--neon-blue)' }}></div>
                            <p className="font-mono text-lg uppercase tracking-wider" style={{ color: 'var(--neon-blue)' }}>
                                [SCANNING] BLOCKCHAIN_NODES...
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModels.map((model) => (
                                <div key={model.id} className="cyber-card rounded-lg p-6 neon-border hologram hover:scale-105 transition-transform duration-300">
                                    {/* Model Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold font-mono tracking-wider"
                                                style={{ color: getTypeColor(model.type) }}>
                                                {model.name}
                                            </h3>
                                            <p className="text-sm font-mono uppercase tracking-wider mt-1"
                                                style={{ color: 'var(--neon-orange)' }}>
                                                v{model.version}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono" style={{ color: 'var(--neon-green)' }}>
                                                ↓ {model.downloads.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Model Description */}
                                    <p className="text-gray-300 text-sm mb-4 font-mono leading-relaxed">
                                        {model.description}
                                    </p>

                                    {/* Model Metadata */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-gray-400 uppercase tracking-wider">TYPE:</span>
                                            <span style={{ color: getTypeColor(model.type) }}>
                                                {model.type.toUpperCase().replace('-', '_')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-gray-400 uppercase tracking-wider">OWNER:</span>
                                            <span style={{ color: 'var(--neon-purple)' }}>{model.owner}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-gray-400 uppercase tracking-wider">DEPLOYED:</span>
                                            <span className="text-gray-300">{model.createdAt}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="cyber-button py-2 rounded-none font-mono text-sm tracking-wider uppercase neon-glow-blue transition-all duration-300 hover:scale-105">
                                            &gt; ACCESS
                                        </button>
                                        <button className="cyber-button py-2 rounded-none font-mono text-sm tracking-wider uppercase neon-glow-pink transition-all duration-300 hover:scale-105">
                                            &gt; FORK
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredModels.length === 0 && (
                        <div className="cyber-card rounded-lg p-12 neon-border text-center">
                            <div className="text-4xl mb-4" style={{ color: 'var(--neon-orange)' }}>🔍</div>
                            <p className="font-mono text-lg uppercase tracking-wider mb-2" style={{ color: 'var(--neon-orange)' }}>
                                [NO_RESULTS] SEARCH_QUERY_EMPTY
                            </p>
                            <p className="text-gray-400 font-mono text-sm">
                                Try adjusting your search parameters or filters
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
