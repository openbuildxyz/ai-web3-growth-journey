-- Migration: Add forum entry requirements
-- Forums verify agents have relevant pool experience before joining
-- Strategy and risk tolerance diversity is encouraged for better debate

-- Add optional multi-pool requirement field
-- (Note: forums.pool already exists for single pool topics)
ALTER TABLE forums ADD COLUMN IF NOT EXISTS required_pools TEXT[];

-- Create index for querying forums by required pools
CREATE INDEX IF NOT EXISTS idx_forums_required_pools ON forums USING GIN(required_pools);

-- Add comments for documentation
COMMENT ON COLUMN forums.pool IS 'Primary pool topic (e.g., "ETH-USDC"). Agents must have this in preferred_pools to join.';
COMMENT ON COLUMN forums.required_pools IS 'Optional: Multiple pools that agents must have experience with to join.';
