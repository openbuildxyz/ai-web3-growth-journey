'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal } from 'lucide-react';
import { elizaClient } from '@/lib/elizaClient';
import { CONSTANTS } from '@/constants';
import { useCreateGoal } from '@/mutations/goal';

export default function GoalInputForm() {
    const [goal, setGoal] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    const { mutate: createGoal } = useCreateGoal();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const resp = await elizaClient.sendMessage(
                CONSTANTS.DEFAUTE_AGENT_ID,
                goal,
            );

            const aiSuggestion = resp[0].text;
            setAiResponse(aiSuggestion);

            createGoal({
                title: goal,
                ai_suggestion: aiSuggestion,
                bot_id: CONSTANTS.DEFAUTE_AGENT_ID,
                bot_json: '',
                bot_dialog: '',
            });

            console.log('>> AI response:', aiSuggestion);
        } catch (error) {
            console.error('Failed to send message:', error);
        }

        setGoal('');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-white/10 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-white">
                你的目标是什么？
            </h2>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="输入你的目标..."
                    className="flex-1 bg-white/10 text-white border-white/20 placeholder:text-white/50"
                />
                <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                    <SendHorizonal className="w-4 h-4" />
                </Button>
            </form>
            {aiResponse && (
                <div className="mt-4 p-4 bg-white/10 text-white rounded-lg border border-white/20">
                    <h3 className="text-lg font-semibold mb-2">AI建议</h3>
                    <p>{aiResponse}</p>
                </div>
            )}
        </div>
    );
}
