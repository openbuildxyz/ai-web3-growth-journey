import { useMutation } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { CONSTANTS } from '../constants';
import { useTransactionExecution } from '@/hooks/useTransactionExecution';

interface GoalInfo {
    title: string;
    ai_suggestion: string;
    bot_id: string;
    bot_json: string;
    bot_dialog: string;
}

export interface Goal extends GoalInfo {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    progress?: number;
}

export function useCreateGoal() {
    const account = useCurrentAccount();
    const executeTransaction = useTransactionExecution();

    return useMutation({
        mutationFn: async (info: GoalInfo) => {
            if (!account?.address) {
                throw new Error('You need to connect your wallet first pls!');
            }

            const tx = new Transaction();

            tx.moveCall({
                target: CONSTANTS.TARGET_CREATE_GOAL,
                arguments: [
                    tx.object(CONSTANTS.GOAL_MANAGER_OBJECT_ID),
                    tx.pure.string(info.title),
                    tx.pure.string(info.ai_suggestion),
                    tx.pure.string(info.bot_id),
                    tx.pure.string(info.bot_json),
                    tx.pure.string(info.bot_dialog),
                ],
            });

            return executeTransaction(tx);
        },
        onError: (error) => {
            console.error('Failed to create Goal:', error);
            throw error;
        },
        onSuccess: (data) => {
            console.log('Successfully created Goal:', data);
        },
    });
}
