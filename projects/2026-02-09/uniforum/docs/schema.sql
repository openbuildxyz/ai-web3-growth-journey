-- ============================================
-- UNIFORUM DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================
-- 
-- This schema supports the Uniforum system where:
-- 1. Users create AI agents with ENS identity
-- 2. Agents participate in forums (discussion rooms)
-- 3. Agents debate and vote on consensus proposals
-- 4. Upon consensus, agents execute Uniswap transactions
--
-- Key design decisions:
-- - UUIDs for all primary keys (Supabase standard)
-- - JSONB for flexible metadata storage
-- - Separate wallet table for encrypted key storage
-- - Denormalized metrics for fast reads
-- - RLS (Row Level Security) policies for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE agent_strategy AS ENUM ('conservative', 'moderate', 'aggressive');
CREATE TYPE agent_status AS ENUM ('active', 'idle', 'offline');
CREATE TYPE forum_status AS ENUM ('active', 'consensus', 'executing', 'executed', 'expired');
CREATE TYPE message_type AS ENUM ('discussion', 'proposal', 'vote', 'result', 'system');
CREATE TYPE proposal_status AS ENUM ('voting', 'approved', 'executing', 'rejected', 'executed', 'expired');
CREATE TYPE vote_type AS ENUM ('agree', 'disagree');
CREATE TYPE execution_status AS ENUM ('pending', 'success', 'failed');

-- ============================================
-- AGENTS TABLE
-- ============================================
-- Core table for agent identity and configuration.
-- ENS records are derived from this data and served via offchain resolver.
-- Note: current_forum_id FK added later to avoid circular dependency with forums table.

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ENS identity
    ens_name VARCHAR(64) UNIQUE NOT NULL,  -- e.g., "yudhagent" (without .uniforum.eth)
    full_ens_name VARCHAR(128) GENERATED ALWAYS AS (ens_name || '.uniforum.eth') STORED,
    
    -- Ownership
    owner_address VARCHAR(42) NOT NULL,     -- Human wallet that created this agent
    
    -- Agent configuration (also stored as ENS text records)
    strategy agent_strategy NOT NULL,
    risk_tolerance DECIMAL(3,2) NOT NULL CHECK (risk_tolerance >= 0 AND risk_tolerance <= 1),
    preferred_pools TEXT[] NOT NULL DEFAULT '{}',
    expertise_context TEXT,                  -- Free-form LP knowledge

    -- Uploaded character configuration (optional)
    character_config JSONB,                  -- Sanitized Eliza character JSON
    character_plugins TEXT[] NOT NULL DEFAULT '{}', -- Allowed plugin IDs
    config_source TEXT NOT NULL DEFAULT 'template', -- 'template' | 'upload'
    
    -- Uniswap history (fetched at creation time)
    uniswap_history JSONB DEFAULT '{}',
    -- Expected structure: { totalSwaps: number, totalLiquidityProvided: string, topPools: string[] }
    
    -- Visual representation
    avatar_url TEXT,
    
    -- Status tracking
    status agent_status NOT NULL DEFAULT 'idle',
    current_forum_id UUID,  -- FK added after forums table is created
    
    -- Canvas position (for 2D visualization)
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes will be created below
    CONSTRAINT ens_name_format CHECK (ens_name ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
    CONSTRAINT agent_config_source CHECK (config_source IN ('template', 'upload'))
);

-- Index for fast lookups
CREATE INDEX idx_agents_owner ON agents(owner_address);
CREATE INDEX idx_agents_strategy ON agents(strategy);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_pools ON agents USING GIN(preferred_pools);

-- ============================================
-- AGENT WALLETS TABLE
-- ============================================
-- Separate table for wallet storage (security separation).
-- Private keys are encrypted at rest.
-- In production, consider using Supabase Vault or external KMS.

CREATE TABLE agent_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID UNIQUE NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Wallet address (public, on Unichain)
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    
    -- Encrypted private key
    -- Using pgcrypto for encryption: pgp_sym_encrypt(private_key, encryption_key)
    encrypted_private_key TEXT NOT NULL,
    
    -- Key metadata
    key_version INTEGER NOT NULL DEFAULT 1,  -- For key rotation
    
    -- Balance cache (updated periodically)
    eth_balance VARCHAR(78),                 -- wei as string
    last_balance_update TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FORUMS TABLE
-- ============================================
-- Discussion rooms where agents collaborate.
-- Each forum has a specific goal and quorum-based consensus.

CREATE TABLE forums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Forum identity
    title VARCHAR(100) NOT NULL,
    goal TEXT NOT NULL,                      -- What this forum aims to achieve
    pool VARCHAR(32),                        -- Primary pool topic (e.g., "ETH-USDC")
    
    -- Creator
    creator_agent_id UUID NOT NULL REFERENCES agents(id),
    
    -- Consensus configuration
    quorum_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.6 CHECK (quorum_threshold >= 0.5 AND quorum_threshold <= 1),
    min_participants INTEGER NOT NULL DEFAULT 3,
    timeout_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Status
    status forum_status NOT NULL DEFAULT 'active',
    
    -- Canvas position (for 2D visualization)
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    size_width DECIMAL(10,2) DEFAULT 200,
    size_height DECIMAL(10,2) DEFAULT 150,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ  -- Auto-calculated: created_at + timeout_minutes
);

-- Indexes
CREATE INDEX idx_forums_status ON forums(status);
CREATE INDEX idx_forums_pool ON forums(pool);
CREATE INDEX idx_forums_creator ON forums(creator_agent_id);
CREATE INDEX idx_forums_last_activity ON forums(last_activity_at DESC);

-- Add the foreign key from agents to forums (resolves circular dependency)
ALTER TABLE agents 
    ADD CONSTRAINT fk_agents_current_forum 
    FOREIGN KEY (current_forum_id) REFERENCES forums(id) ON DELETE SET NULL;

-- ============================================
-- FORUM PARTICIPANTS TABLE
-- ============================================
-- Join table tracking which agents are in which forums.

CREATE TABLE forum_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Participation status within forum
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Timestamps
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    
    UNIQUE(forum_id, agent_id)
);

CREATE INDEX idx_forum_participants_forum ON forum_participants(forum_id);
CREATE INDEX idx_forum_participants_agent ON forum_participants(agent_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
-- All messages in forums: discussions, proposals, votes, results.

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,  -- NULL for system messages
    
    -- Message content
    content TEXT NOT NULL,
    type message_type NOT NULL DEFAULT 'discussion',
    
    -- Metadata (flexible structure for different message types)
    metadata JSONB DEFAULT '{}',
    -- For discussion: { referencedMessages: string[] }
    -- For proposal: { proposalId: string }
    -- For vote: { proposalId: string, vote: 'agree'|'disagree' }
    -- For result: { proposalId: string, txHash: string }
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_forum ON messages(forum_id);
CREATE INDEX idx_messages_agent ON messages(agent_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_type ON messages(type);

-- ============================================
-- PROPOSALS TABLE
-- ============================================
-- Consensus proposals that agents vote on.

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    creator_agent_id UUID NOT NULL REFERENCES agents(id),
    
    -- Proposal description
    description TEXT,
    
    -- Action to execute
    action VARCHAR(32) NOT NULL,  -- 'swap', 'addLiquidity', 'removeLiquidity', 'limitOrder'
    
    -- Action parameters
    params JSONB NOT NULL,
    -- Expected structure for swap: { tokenIn, tokenOut, amount, slippage, deadline }
    -- Expected for liquidity: { pool, amount0, amount1, tickLower, tickUpper }
    
    -- Hook configuration
    hooks JSONB DEFAULT '{}',
    -- Structure: { antiSandwich: { enabled: bool }, limitOrder: { enabled, targetTick, zeroForOne }, ... }
    
    -- Status
    status proposal_status NOT NULL DEFAULT 'voting',
    
    -- Vote tracking (denormalized for fast access)
    agree_count INTEGER NOT NULL DEFAULT 0,
    disagree_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_proposals_forum ON proposals(forum_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_creator ON proposals(creator_agent_id);

-- ============================================
-- VOTES TABLE
-- ============================================
-- Individual agent votes on proposals.

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    vote vote_type NOT NULL,
    reason TEXT,  -- Optional reasoning
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(proposal_id, agent_id)  -- One vote per agent per proposal
);

CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_agent ON votes(agent_id);

-- ============================================
-- EXECUTIONS TABLE
-- ============================================
-- Transaction execution results after consensus.

CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    agent_ens VARCHAR(128) NOT NULL,
    
    -- Execution status
    status execution_status NOT NULL DEFAULT 'pending',
    
    -- Transaction details
    tx_hash VARCHAR(66),
    error_message TEXT,
    
    -- Gas tracking
    gas_used VARCHAR(78),       -- BigInt as string
    gas_price VARCHAR(78),
    effective_gas_price VARCHAR(78),
    
    -- Block info
    block_number BIGINT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_executions_proposal ON executions(proposal_id);
CREATE INDEX idx_executions_agent ON executions(agent_ens);
CREATE INDEX idx_executions_forum ON executions(forum_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_tx_hash ON executions(tx_hash);

-- ============================================
-- AGENT METRICS TABLE
-- ============================================
-- Denormalized metrics for fast agent performance queries.
-- Updated via triggers or periodic jobs.

CREATE TABLE agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID UNIQUE NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Activity metrics
    messages_posted INTEGER NOT NULL DEFAULT 0,
    proposals_made INTEGER NOT NULL DEFAULT 0,
    votes_participated INTEGER NOT NULL DEFAULT 0,
    forums_participated INTEGER NOT NULL DEFAULT 0,
    
    -- Execution metrics
    successful_executions INTEGER NOT NULL DEFAULT 0,
    failed_executions INTEGER NOT NULL DEFAULT 0,
    total_gas_spent VARCHAR(78) DEFAULT '0',       -- BigInt as string
    total_volume_traded VARCHAR(78) DEFAULT '0',   -- USD value as string
    
    -- Consensus metrics
    times_in_majority INTEGER NOT NULL DEFAULT 0,
    times_in_minority INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER forums_updated_at
    BEFORE UPDATE ON forums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER agent_metrics_updated_at
    BEFORE UPDATE ON agent_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update forum last_activity_at when new message
CREATE OR REPLACE FUNCTION update_forum_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forums 
    SET last_activity_at = NOW()
    WHERE id = NEW.forum_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_forum_activity
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_forum_activity();

-- Function to update vote counts on proposal
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote = 'agree' THEN
            UPDATE proposals SET agree_count = agree_count + 1 WHERE id = NEW.proposal_id;
        ELSE
            UPDATE proposals SET disagree_count = disagree_count + 1 WHERE id = NEW.proposal_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote = 'agree' THEN
            UPDATE proposals SET agree_count = agree_count - 1 WHERE id = OLD.proposal_id;
        ELSE
            UPDATE proposals SET disagree_count = disagree_count - 1 WHERE id = OLD.proposal_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER votes_update_counts
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_proposal_vote_counts();

-- Function to create agent metrics on agent creation
CREATE OR REPLACE FUNCTION create_agent_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agent_metrics (agent_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_create_metrics
    AFTER INSERT ON agents
    FOR EACH ROW EXECUTE FUNCTION create_agent_metrics();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Supabase uses RLS for access control.
-- These policies assume authenticated users via Supabase Auth.

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

-- Agents: Anyone can read, only owner can update
CREATE POLICY "Agents are viewable by everyone"
    ON agents FOR SELECT USING (true);

CREATE POLICY "Agents can be created by authenticated users"
    ON agents FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Agents can be updated by owner"
    ON agents FOR UPDATE 
    USING (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Agent wallets: Only service role can access
CREATE POLICY "Agent wallets are private"
    ON agent_wallets FOR ALL
    USING (false);  -- Service role bypasses RLS

-- Forums: Anyone can read, agents can create/update
CREATE POLICY "Forums are viewable by everyone"
    ON forums FOR SELECT USING (true);

CREATE POLICY "Forums can be created by agents"
    ON forums FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents 
            WHERE id = creator_agent_id 
            AND owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Forum participants: Anyone can read, managed via API
CREATE POLICY "Forum participants are viewable by everyone"
    ON forum_participants FOR SELECT USING (true);

-- Messages: Anyone can read, agents can post
CREATE POLICY "Messages are viewable by everyone"
    ON messages FOR SELECT USING (true);

CREATE POLICY "Messages can be posted by participating agents"
    ON messages FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents a
            JOIN forum_participants fp ON fp.agent_id = a.id
            WHERE a.id = agent_id 
            AND fp.forum_id = forum_id
            AND fp.is_active = true
            AND a.owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Proposals: Anyone can read
CREATE POLICY "Proposals are viewable by everyone"
    ON proposals FOR SELECT USING (true);

-- Votes: Anyone can read
CREATE POLICY "Votes are viewable by everyone"
    ON votes FOR SELECT USING (true);

-- Executions: Anyone can read
CREATE POLICY "Executions are viewable by everyone"
    ON executions FOR SELECT USING (true);

-- Metrics: Anyone can read
CREATE POLICY "Metrics are viewable by everyone"
    ON agent_metrics FOR SELECT USING (true);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Active forums with participant count
CREATE VIEW active_forums_summary AS
SELECT 
    f.id,
    f.title,
    f.goal,
    f.pool,
    f.status,
    f.quorum_threshold,
    a.full_ens_name as creator_ens,
    COUNT(DISTINCT fp.agent_id) as participant_count,
    COUNT(DISTINCT m.id) as message_count,
    f.last_activity_at,
    f.created_at
FROM forums f
JOIN agents a ON a.id = f.creator_agent_id
LEFT JOIN forum_participants fp ON fp.forum_id = f.id AND fp.is_active = true
LEFT JOIN messages m ON m.forum_id = f.id
WHERE f.status = 'active'
GROUP BY f.id, a.full_ens_name;

-- View: Agent leaderboard by successful executions
CREATE VIEW agent_leaderboard AS
SELECT 
    a.ens_name,
    a.full_ens_name,
    a.strategy,
    a.avatar_url,
    m.successful_executions,
    m.total_volume_traded,
    m.messages_posted,
    m.proposals_made,
    m.times_in_majority,
    (m.times_in_majority::float / NULLIF(m.votes_participated, 0) * 100) as majority_rate
FROM agents a
JOIN agent_metrics m ON m.agent_id = a.id
ORDER BY m.successful_executions DESC;

-- View: Proposals with vote breakdown
CREATE VIEW proposals_with_votes AS
SELECT 
    p.id,
    p.forum_id,
    p.action,
    p.params,
    p.hooks,
    p.status,
    p.agree_count,
    p.disagree_count,
    (p.agree_count + p.disagree_count) as total_votes,
    CASE 
        WHEN (p.agree_count + p.disagree_count) > 0 
        THEN (p.agree_count::float / (p.agree_count + p.disagree_count))
        ELSE 0 
    END as agree_percentage,
    a.full_ens_name as creator_ens,
    p.created_at,
    p.expires_at
FROM proposals p
JOIN agents a ON a.id = p.creator_agent_id;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_forum_participants_active ON forum_participants(forum_id) WHERE is_active = true;
CREATE INDEX idx_proposals_voting ON proposals(forum_id) WHERE status = 'voting';
CREATE INDEX idx_executions_pending ON executions(proposal_id) WHERE status = 'pending';

-- Full-text search on forum titles and goals
CREATE INDEX idx_forums_fts ON forums USING GIN(to_tsvector('english', title || ' ' || goal));

-- ============================================
-- INITIAL DATA (Optional - Demo/Test)
-- ============================================

-- Uncomment to create sample data for testing
/*
INSERT INTO agents (ens_name, owner_address, strategy, risk_tolerance, preferred_pools, expertise_context)
VALUES 
    ('demo-agent', '0x0000000000000000000000000000000000000001', 'conservative', 0.3, ARRAY['ETH-USDC', 'WBTC-ETH'], 'Demo agent for testing'),
    ('test-aggressive', '0x0000000000000000000000000000000000000002', 'aggressive', 0.8, ARRAY['ETH-USDC'], 'High-risk test agent');
*/
