import { MessageCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ContentWithUser } from '@/types/eliza/message';

type Message = {
    id: string;
    sender: 'user' | 'ai';
    content: string | ContentWithUser;
    timestamp: Date;
};

export default function AIChatInterface({
    messages,
    onSave,
}: {
    messages: Message[];
    onSave: () => void;
}) {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">
                        AI目标规划师
                    </h2>
                </div>
                <Button
                    variant="outline"
                    onClick={onSave}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                    <Save className="w-4 h-4 mr-2" />
                    保存对话
                </Button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${
                            message.sender === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                        }`}
                    >
                        {message.sender === 'ai' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/ai-avatar.png" />
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                                message.sender === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-white/10 text-white'
                            }`}
                        >
                            {typeof message.content === 'string'
                                ? message.content
                                : `${message.content.user}: ${message.content.text}`}
                        </div>
                        {message.sender === 'user' && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/user-avatar.png" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
