'use client';

import { useState } from 'react';

type NavItem = '冥想' | '勋章' | '我的';

interface BottomNavProps {
    activeTab?: NavItem;
    onTabChange?: (tab: NavItem) => void;
}

export function BottomNav({ activeTab = '冥想', onTabChange }: BottomNavProps) {
    const [currentTab, setCurrentTab] = useState<NavItem>(activeTab);

    const handleTabClick = (tab: NavItem) => {
        setCurrentTab(tab);
        onTabChange?.(tab);
    };

    const navItems: { key: NavItem; icon: string; label: string }[] = [
        { key: '冥想', icon: '🧘‍♀️', label: '冥想' },
        { key: '勋章', icon: '🏆', label: '勋章' },
        { key: '我的', icon: '👤', label: '我的' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* 背景 */}
            <div
                className="h-20 px-4 flex items-center justify-around"
                style={{ backgroundColor: '#2b3c0c' }}
            >
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => handleTabClick(item.key)}
                        className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${currentTab === item.key
                            ? 'text-white bg-white/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* 安全区域底部填充 */}
            <div
                className="h-safe-area-inset-bottom"
                style={{ backgroundColor: '#2b3c0c' }}
            />
        </div>
    );
} 