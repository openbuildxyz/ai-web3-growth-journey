'use client';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@mysten/dapp-kit';
import { Settings } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <svg
                                className="h-8 w-8 text-purple-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="ml-2 text-xl font-bold text-white">
                                AI目标规划师
                            </span>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex justify-center items-center">
                            <ConnectButton />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
