'use client';

import { useState } from 'react';
import GoalInputForm from '@/components/goal-input-form';
import AIChatInterface from '@/components/ai-chat-interface';

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSave = () => {
        // TODO: 实现保存对话逻辑
        console.log('对话已保存');
    };

    return (
        <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="max-w-4xl mx-auto space-y-8">
                <GoalInputForm />
                <AIChatInterface messages={messages} onSave={handleSave} />
            </div>
        </main>
    );
}
