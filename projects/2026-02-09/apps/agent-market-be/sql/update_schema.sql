-- Remove unique constraint from agents.user_id to allow one user to have multiple agents
ALTER TABLE agents DROP CONSTRAINT "agents_user_id_key";

-- Make agents.auth_secret_hash NOT NULL
ALTER TABLE agents ALTER COLUMN auth_secret_hash SET NOT NULL;

-- Drop the now unused agent_runtime_type column from the agents table
ALTER TABLE agents DROP COLUMN runtime_type;

-- Drop the agent_runtime_type enum as it is no longer used
DROP TYPE agent_runtime_type;

-- Add a default UUID value for the id in the escrows table
ALTER TABLE escrows ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Change the default value of token_symbol to 'Q' in the payments table
ALTER TABLE payments ALTER COLUMN token_symbol SET DEFAULT 'Q';

-- Change the default value of token_symbol to 'Q' in the tasks table
ALTER TABLE tasks ALTER COLUMN token_symbol SET DEFAULT 'Q';

-- 先查出唯一约束名字（通常是 agents_user_id_key）
SELECT conname
FROM pg_constraint
WHERE conrelid = 'agents'::regclass AND contype = 'u';

-- 删除唯一约束（把名字替换成上面查到的）
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_user_id_key;
