-- CREATE DATABASE agent_market TEMPLATE template1 ENCODING 'UTF8';
-- CREATE SCHEMA agent_hub;
-- SET search_path TO agent_hub;

-- 枚举
CREATE TYPE user_role AS ENUM ('buyer','seller','dao','admin');
CREATE TYPE kyc_status AS ENUM ('pending','verified','rejected');
CREATE TYPE task_status AS ENUM ('created','accepted','in_progress','pending_review','completed','disputed','arbitrated','cancelled');
CREATE TYPE task_event_type AS ENUM ('created','accepted','delivered','refund_requested','dispute_opened','arbitrated','completed','cancelled');
CREATE TYPE escrow_status AS ENUM ('locked','released','refunded','frozen');
CREATE TYPE payment_type AS ENUM ('deposit','withdraw','payment','refund','reward','fee');
CREATE TYPE payment_status AS ENUM ('pending','completed','failed');
CREATE TYPE arbitration_status AS ENUM ('voting','resolved_buyer','resolved_seller','cancelled');
CREATE TYPE vote_support AS ENUM ('buyer','seller');
CREATE TYPE reputation_source AS ENUM ('task_completion','arbitration_vote','penalty','bonus');
CREATE TYPE notification_type AS ENUM ('task_update','arbitration','payment','system');
ALTER TYPE task_event_type ADD VALUE 'agent_registered';
ALTER TYPE task_event_type ADD VALUE 'agent_invocation_started';
ALTER TYPE task_event_type ADD VALUE 'agent_invocation_completed';
ALTER TYPE task_event_type ADD VALUE 'agent_invocation_failed';
ALTER TYPE task_event_type ADD VALUE 'agent_callback_received';

CREATE TYPE agent_auth_type AS ENUM (
  'platform_hmac',   -- 平台基于共享密钥的HMAC签名
  'platform_jwt'     -- 平台使用JWT方式进行鉴权
);
-- Agent API 鉴权方式枚举
COMMENT ON TYPE agent_auth_type IS 'Agent API鉴权方式，平台调用Agent时使用';


CREATE TYPE agent_status AS ENUM  (
  'draft',     -- 草稿状态，尚未完成运行时配置
  'active',    -- 已激活状态，平台可正常调用
  'disabled'   -- 已禁用状态，不允许被调用
);

-- Agent 状态枚举
COMMENT ON TYPE agent_status IS 'Agent当前状态，用于控制平台是否允许调用该Agent';

CREATE TYPE agent_invocation_status AS ENUM (
  'pending',   -- 等待执行
  'running',   -- 执行中
  'success',   -- 执行成功
  'failed',    -- 执行失败（业务错误）
  'timeout'    -- 执行超时
);

-- Agent 调用执行状态枚举
COMMENT ON TYPE agent_invocation_status IS 'Agent调用执行状态，用于记录一次Agent API调用的执行结果';


-- users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  email TEXT,
  role user_role NOT NULL,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  reputation_score NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS '用户基础表，买家/卖家/DAO';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.wallet_address IS '链上钱包地址，唯一';
COMMENT ON COLUMN users.email IS '邮箱（可选）';
COMMENT ON COLUMN users.role IS '角色：buyer/seller/dao/admin';
COMMENT ON COLUMN users.kyc_status IS 'KYC 状态';
COMMENT ON COLUMN users.reputation_score IS '声誉积分累计';
COMMENT ON COLUMN users.created_at IS '创建时间';

-- agents
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  base_url VARCHAR(512),
  invoke_path VARCHAR(255),
  timeout_ms INTEGER DEFAULT 30000,
  auth_type agent_auth_type,
  auth_secret_hash VARCHAR(255) NOT NULL,
  supports_callback BOOLEAN DEFAULT false,
  status agent_status DEFAULT 'draft',
  display_name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  price_per_task NUMERIC(12,2),
  response_time TEXT,
  tags TEXT[],
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE agents IS 'Agent 资料';
COMMENT ON COLUMN agents.id IS 'Agent ID';
COMMENT ON COLUMN agents.user_id IS '关联的用户ID';
COMMENT ON COLUMN agents.display_name IS '展示名';
COMMENT ON COLUMN agents.avatar IS '头像/表情';
COMMENT ON COLUMN agents.bio IS '简介';
COMMENT ON COLUMN agents.price_per_task IS '单任务报价（Q）';
COMMENT ON COLUMN agents.response_time IS '平均响应时间';
COMMENT ON COLUMN agents.tags IS '技能/标签数组';
COMMENT ON COLUMN agents.is_online IS '是否在线';
COMMENT ON COLUMN agents.completed_tasks IS '完成任务数';
COMMENT ON COLUMN agents.rating IS '平均评分';
COMMENT ON COLUMN agents.created_at IS '创建时间';
COMMENT ON COLUMN agents.base_url IS 'Agent对外提供服务的基础URL，例如：https://agent.example.com';
COMMENT ON COLUMN agents.invoke_path IS 'Agent执行接口路径，例如：/run 或 /execute';
COMMENT ON COLUMN agents.timeout_ms IS '平台调用Agent接口的超时时间（毫秒）';
COMMENT ON COLUMN agents.auth_type IS '平台调用Agent接口时使用的鉴权方式';
COMMENT ON COLUMN agents.auth_secret_hash IS 'Agent API鉴权密钥（当前为明文存储）';
COMMENT ON COLUMN agents.supports_callback IS 'Agent是否支持异步回调执行结果';
COMMENT ON COLUMN agents.status IS 'Agent当前状态：draft草稿、active可用、disabled禁用';

CREATE TABLE agent_tag_dict (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE agent_tag_dict IS 'Agent标签字典表，用于统一管理平台允许使用的Agent标签';

COMMENT ON COLUMN agent_tag_dict.id IS '标签ID';
COMMENT ON COLUMN agent_tag_dict.name IS '标签名称，例如：LLM、爬虫、自动化';
COMMENT ON COLUMN agent_tag_dict.created_at IS '标签创建时间';

CREATE TABLE agent_tags (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES agent_tag_dict(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (agent_id, tag_id)
);


COMMENT ON TABLE agent_tags IS 'Agent与标签的关联表，用于描述某个Agent具备哪些能力标签';

COMMENT ON COLUMN agent_tags.agent_id IS 'Agent ID';
COMMENT ON COLUMN agent_tags.tag_id IS '标签ID';
COMMENT ON COLUMN agent_tags.created_at IS '标签关联创建时间';

CREATE INDEX idx_agent_tags_agent_id
  ON agent_tags(agent_id);

COMMENT ON INDEX idx_agent_tags_agent_id IS '用于根据Agent ID快速查询其标签';

CREATE INDEX idx_agent_tags_tag_id
  ON agent_tags(tag_id);

COMMENT ON INDEX idx_agent_tags_tag_id IS '用于根据标签查询关联的Agent';

-- tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  title TEXT NOT NULL,
  description TEXT,
  budget_usd NUMERIC(12,2) NOT NULL,
  platform_fee NUMERIC(12,2),
  token_symbol TEXT NOT NULL DEFAULT 'Q',
  chain_id BIGINT,
  chain_task_id BIGINT,
  create_tx_hash VARCHAR(66) UNIQUE,
  buyer_wallet_address VARCHAR(66),
  agent_wallet_address VARCHAR(66),
  status task_status NOT NULL DEFAULT 'created',
  progress INTEGER CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  review_deadline TIMESTAMPTZ,
  arbitration_deadline TIMESTAMPTZ
);
COMMENT ON TABLE tasks IS '任务主表';
COMMENT ON COLUMN tasks.id IS '任务ID';
COMMENT ON COLUMN tasks.buyer_id IS '买家用户ID';
COMMENT ON COLUMN tasks.agent_id IS '接单Agent ID（可为空，待分配）';
COMMENT ON COLUMN tasks.title IS '任务标题';
COMMENT ON COLUMN tasks.description IS '任务描述';
COMMENT ON COLUMN tasks.budget_usd IS '任务预算（Q计价）';
COMMENT ON COLUMN tasks.platform_fee IS '平台费用金额';
COMMENT ON COLUMN tasks.token_symbol IS '托管Token符号';
COMMENT ON COLUMN tasks.chain_id IS '链ID';
COMMENT ON COLUMN tasks.chain_task_id IS '链上任务ID，由智能合约生成，初始为空，监听解析后更新';
COMMENT ON COLUMN tasks.create_tx_hash IS '创建任务的链上交易Hash，创建时的唯一索引';
COMMENT ON COLUMN tasks.buyer_wallet_address IS
'任务创建者(Buyer)的钱包地址';
COMMENT ON COLUMN tasks.agent_wallet_address IS
'任务雇员(Seller)的钱包地址。';
COMMENT ON COLUMN tasks.status IS '任务状态机';
COMMENT ON COLUMN tasks.progress IS '执行进度百分比';
COMMENT ON COLUMN tasks.created_at IS '创建时间';
COMMENT ON COLUMN tasks.accepted_at IS '接单时间';
COMMENT ON COLUMN tasks.delivered_at IS '交付时间';
COMMENT ON COLUMN tasks.review_deadline IS '验收截止时间';
COMMENT ON COLUMN tasks.arbitration_deadline IS '仲裁截止时间';

-- task_deliverables
CREATE TABLE task_deliverables (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT,
  content_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, version)
);
COMMENT ON TABLE task_deliverables IS '任务交付物版本记录';
COMMENT ON COLUMN task_deliverables.id IS '交付物ID';
COMMENT ON COLUMN task_deliverables.task_id IS '关联任务ID';
COMMENT ON COLUMN task_deliverables.version IS '版本号（递增）';
COMMENT ON COLUMN task_deliverables.title IS '交付标题';
COMMENT ON COLUMN task_deliverables.content_url IS '交付内容链接/存储地址';
COMMENT ON COLUMN task_deliverables.notes IS '备注';
COMMENT ON COLUMN task_deliverables.created_at IS '提交时间';

-- task_events
CREATE TABLE task_events (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type task_event_type NOT NULL,
  actor_id UUID REFERENCES users(id),
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE task_events IS '任务时间线/事件日志';
COMMENT ON COLUMN task_events.id IS '事件ID';
COMMENT ON COLUMN task_events.task_id IS '关联任务ID';
COMMENT ON COLUMN task_events.type IS '事件类型';
COMMENT ON COLUMN task_events.actor_id IS '触发人用户ID';
COMMENT ON COLUMN task_events.data IS '额外元数据（JSON）';
COMMENT ON COLUMN task_events.created_at IS '事件时间';
CREATE INDEX idx_task_events_task_time ON task_events (task_id, created_at);

-- escrows
CREATE TABLE escrows (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status escrow_status NOT NULL DEFAULT 'locked',
  locked_amount_snapshot NUMERIC(38, 18),
  onchain_tx_hash TEXT,
  released_tx_hash TEXT,
  refund_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE escrows IS '托管资金记录';
COMMENT ON COLUMN escrows.id IS '托管ID';
COMMENT ON COLUMN escrows.task_id IS '关联任务ID（唯一1:1）';
COMMENT ON COLUMN escrows.amount IS '托管金额';
COMMENT ON COLUMN escrows.status IS '托管状态';
COMMENT ON COLUMN escrows.locked_amount_snapshot IS
'Agent执行前Escrow中已锁定的金额快照，用于校验是否满足Agent执行的支付条件';
COMMENT ON COLUMN escrows.onchain_tx_hash IS '锁定资金交易Hash';
COMMENT ON COLUMN escrows.released_tx_hash IS '放款交易Hash';
COMMENT ON COLUMN escrows.refund_tx_hash IS '退款交易Hash';
COMMENT ON COLUMN escrows.created_at IS '创建时间';
COMMENT ON COLUMN escrows.updated_at IS '更新时间';

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  type payment_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  token_symbol TEXT NOT NULL DEFAULT 'Q',
  chain_id INTEGER,
  tx_hash TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE payments IS '资金流水台账（充值/提现/付款/退款/奖励/手续费）';
COMMENT ON COLUMN payments.id IS '流水ID';
COMMENT ON COLUMN payments.user_id IS '所属用户ID';
COMMENT ON COLUMN payments.task_id IS '关联任务ID（可空）';
COMMENT ON COLUMN payments.type IS '流水类型';
COMMENT ON COLUMN payments.amount IS '金额（可正负）';
COMMENT ON COLUMN payments.token_symbol IS 'Token符号';
COMMENT ON COLUMN payments.chain_id IS '链ID';
COMMENT ON COLUMN payments.tx_hash IS '链上交易Hash';
COMMENT ON COLUMN payments.status IS '流水状态';
COMMENT ON COLUMN payments.description IS '描述';
COMMENT ON COLUMN payments.created_at IS '创建时间';
CREATE INDEX idx_payments_user_time ON payments (user_id, created_at DESC);

-- wallet_balances
CREATE TABLE wallet_balances (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  available NUMERIC(14,2) NOT NULL DEFAULT 0,
  locked NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE wallet_balances IS '用户钱包余额视图（可用/锁定）';
COMMENT ON COLUMN wallet_balances.user_id IS '用户ID';
COMMENT ON COLUMN wallet_balances.available IS '可用余额';
COMMENT ON COLUMN wallet_balances.locked IS '锁定余额（托管中）';
COMMENT ON COLUMN wallet_balances.updated_at IS '更新时间';

-- arbitrations
CREATE TABLE arbitrations (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  reason TEXT,
  status arbitration_status NOT NULL DEFAULT 'voting',
  opened_by UUID NOT NULL REFERENCES users(id),
  amount_disputed NUMERIC(12,2),
  evidence_links TEXT[],
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT
);
COMMENT ON TABLE arbitrations IS '仲裁案件';
COMMENT ON COLUMN arbitrations.id IS '仲裁ID';
COMMENT ON COLUMN arbitrations.task_id IS '关联任务ID（1:1）';
COMMENT ON COLUMN arbitrations.reason IS '仲裁原因';
COMMENT ON COLUMN arbitrations.status IS '仲裁状态';
COMMENT ON COLUMN arbitrations.opened_by IS '发起人用户ID';
COMMENT ON COLUMN arbitrations.amount_disputed IS '争议金额';
COMMENT ON COLUMN arbitrations.evidence_links IS '证据链接数组';
COMMENT ON COLUMN arbitrations.opened_at IS '开启时间';
COMMENT ON COLUMN arbitrations.resolved_at IS '裁决时间';
COMMENT ON COLUMN arbitrations.resolution_note IS '裁决备注';

-- arbitration_votes
CREATE TABLE arbitration_votes (
  id UUID PRIMARY KEY,
  arbitration_id UUID NOT NULL REFERENCES arbitrations(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id),
  support vote_support NOT NULL,
  weight NUMERIC(18,4) NOT NULL DEFAULT 1,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (arbitration_id, voter_id)
);
COMMENT ON TABLE arbitration_votes IS '仲裁投票记录';
COMMENT ON COLUMN arbitration_votes.id IS '投票ID';
COMMENT ON COLUMN arbitration_votes.arbitration_id IS '关联仲裁ID';
COMMENT ON COLUMN arbitration_votes.voter_id IS '投票人用户ID';
COMMENT ON COLUMN arbitration_votes.support IS '支持买家或卖家';
COMMENT ON COLUMN arbitration_votes.weight IS '投票权重';
COMMENT ON COLUMN arbitration_votes.tx_hash IS '链上投票交易Hash';
COMMENT ON COLUMN arbitration_votes.created_at IS '投票时间';

-- dao_members
CREATE TABLE dao_members (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  voting_power NUMERIC(18,4) NOT NULL DEFAULT 0,
  staked_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE dao_members IS 'DAO 成员表';
COMMENT ON COLUMN dao_members.id IS '成员记录ID';
COMMENT ON COLUMN dao_members.user_id IS '用户ID（唯一）';
COMMENT ON COLUMN dao_members.voting_power IS '当前投票权重';
COMMENT ON COLUMN dao_members.staked_amount IS '质押数量';
COMMENT ON COLUMN dao_members.joined_at IS '加入时间';

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID NOT NULL REFERENCES agents(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE reviews IS '任务评价';
COMMENT ON COLUMN reviews.id IS '评价ID';
COMMENT ON COLUMN reviews.task_id IS '关联任务ID（唯一一条）';
COMMENT ON COLUMN reviews.reviewer_id IS '评价人用户ID';
COMMENT ON COLUMN reviews.agent_id IS '被评Agent ID';
COMMENT ON COLUMN reviews.rating IS '评分 1-5';
COMMENT ON COLUMN reviews.feedback IS '文字反馈';
COMMENT ON COLUMN reviews.created_at IS '评价时间';

-- reputation_logs
CREATE TABLE reputation_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source reputation_source NOT NULL,
  delta NUMERIC(12,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE reputation_logs IS '声誉变更日志';
COMMENT ON COLUMN reputation_logs.id IS '日志ID';
COMMENT ON COLUMN reputation_logs.user_id IS '用户ID';
COMMENT ON COLUMN reputation_logs.source IS '声誉来源';
COMMENT ON COLUMN reputation_logs.delta IS '变动值';
COMMENT ON COLUMN reputation_logs.reason IS '原因说明';
COMMENT ON COLUMN reputation_logs.created_at IS '记录时间';
CREATE INDEX idx_reputation_logs_user_time ON reputation_logs (user_id, created_at);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notifications IS '通知消息';
COMMENT ON COLUMN notifications.id IS '通知ID';
COMMENT ON COLUMN notifications.user_id IS '目标用户ID';
COMMENT ON COLUMN notifications.type IS '通知类型';
COMMENT ON COLUMN notifications.title IS '标题';
COMMENT ON COLUMN notifications.content IS '内容';
COMMENT ON COLUMN notifications.read IS '是否已读';
COMMENT ON COLUMN notifications.created_at IS '创建时间';
CREATE INDEX idx_notifications_user_read_time ON notifications (user_id, read, created_at DESC);

-- 辅助索引
CREATE INDEX idx_tasks_buyer_status_time ON tasks (buyer_id, status, created_at DESC);
CREATE INDEX idx_tasks_agent_status_time ON tasks (agent_id, status, created_at DESC);
CREATE INDEX idx_agents_tags_gin ON agents USING GIN (tags);
CREATE INDEX idx_arbitrations_status_time ON arbitrations (status, opened_at DESC);



-- agent-infocation agent调用表
CREATE TABLE agent_invocations (
  id BIGSERIAL PRIMARY KEY,

  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,


  status agent_invocation_status NOT NULL DEFAULT 'pending',

  request_hash VARCHAR(255) NOT NULL,
  response_hash VARCHAR(255),
  result JSONB,
  requester_wallet_address VARCHAR(66) NOT NULL,
  task_status_snapshot VARCHAR(32),

  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,

  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE agent_invocations IS 'Agent调用执行记录表，用于记录平台调用Agent API的全过程，作为任务交付与DAO仲裁的重要证据';
COMMENT ON COLUMN agent_invocations.id IS 'Agent调用记录主键ID';
COMMENT ON COLUMN agent_invocations.task_id IS '关联的任务ID，表示此次Agent调用属于哪个任务';
COMMENT ON COLUMN agent_invocations.agent_id IS '被调用的Agent ID';
COMMENT ON COLUMN agent_invocations.status IS 'Agent调用执行状态';
COMMENT ON COLUMN agent_invocations.request_hash IS '调用Age nt时请求内容的Hash，用于审计与仲裁，不存原文';
COMMENT ON COLUMN agent_invocations.response_hash IS 'Agent返回结果内容的Hash，用于审计与仲裁，不存原文';
COMMENT ON COLUMN agent_invocations.result IS 'Agent返回结果内容（JSON）';
COMMENT ON COLUMN agent_invocations.started_at IS 'Agent调用开始时间';
COMMENT ON COLUMN agent_invocations.finished_at IS 'Agent调用结束时间';
COMMENT ON COLUMN agent_invocations.error_message IS 'Agent调用失败或超时的错误信息';
COMMENT ON COLUMN agent_invocations.created_at IS 'Agent调用记录创建时间';
COMMENT ON COLUMN agent_invocations.requester_user_id IS
'触发本次Agent调用的用户ID(链下用户)，用于审计与权限追溯';
COMMENT ON COLUMN agent_invocations.requester_wallet_address IS
'触发本次Agent调用的用户钱包地址，用于DAO仲裁时校验是否为Task的合法Buyer';
COMMENT ON COLUMN agent_invocations.task_status_snapshot IS
'触发Agent调用时的任务状态快照，用于事后审计和争议仲裁';
CREATE INDEX idx_agent_invocations_task_id
  ON agent_invocations(task_id);

COMMENT ON INDEX idx_agent_invocations_task_id IS '用于根据任务ID快速查询该任务关联的Agent调用记录';

CREATE INDEX idx_agent_invocations_agent_id
  ON agent_invocations(agent_id);

COMMENT ON INDEX idx_agent_invocations_agent_id IS '用于根据Agent ID查询其历史调用记录';

CREATE INDEX idx_agent_invocations_status
  ON agent_invocations(status);

COMMENT ON INDEX idx_agent_invocations_status IS '用于按调用状态筛选Agent执行记录（如失败、超时）';

-- 同一条链上，task_id 唯一
CREATE UNIQUE INDEX uniq_tasks_chain_task
ON tasks(chain_id, chain_task_id);

COMMENT ON INDEX uniq_tasks_chain_task IS '保证同一条链上chain_task_id的唯一性';

-- 创建交易唯一
CREATE UNIQUE INDEX uniq_tasks_create_tx_hash
ON tasks(create_tx_hash);

COMMENT ON INDEX uniq_tasks_create_tx_hash IS '保证任务创建交易Hash唯一，防止重复入库';


CREATE TABLE agent_api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  key_id VARCHAR(64) NOT NULL,
  secret_hash VARCHAR(255) NOT NULL,

  status VARCHAR(32) NOT NULL DEFAULT 'active',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,

  UNIQUE (agent_id, key_id)
);

COMMENT ON TABLE agent_api_credentials IS
'Agent API 鉴权凭证表，用于管理平台与Agent之间的调用密钥，仅用于平台级调用鉴权';

COMMENT ON COLUMN agent_api_credentials.agent_id IS
'所属Agent ID';

COMMENT ON COLUMN agent_api_credentials.key_id IS
'平台分配给Agent的公开Key标识，用于X-Platform-Key请求头';

COMMENT ON COLUMN agent_api_credentials.secret_hash IS
'Agent API Secret的Hash值，平台不存储明文Secret';

COMMENT ON COLUMN agent_api_credentials.status IS
'凭证状态：active / revoked / expired';

COMMENT ON COLUMN agent_api_credentials.created_at IS
'凭证创建时间';

COMMENT ON COLUMN agent_api_credentials.revoked_at IS
'凭证吊销时间';
