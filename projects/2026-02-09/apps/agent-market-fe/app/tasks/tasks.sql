/*
 Navicat Premium Dump SQL

 Source Server         : testbase
 Source Server Type    : PostgreSQL
 Source Server Version : 170006 (170006)
 Source Host           : learnbase.ccv8mg2cu3bo.us-east-1.rds.amazonaws.com:5432
 Source Catalog        : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170006 (170006)
 File Encoding         : 65001

 Date: 24/01/2026 14:12:59
*/


-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS "public"."tasks";
CREATE TABLE "public"."tasks" (
  "id" uuid NOT NULL,
  "buyer_id" uuid NOT NULL,
  "agent_id" uuid,
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "budget_usd" numeric(12,2) NOT NULL,
  "platform_fee" numeric(12,2),
  "token_symbol" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Q'::text,
  "chain_id" int8,
  "chain_task_id" int8,
  "create_tx_hash" varchar(66) COLLATE "pg_catalog"."default",
  "buyer_wallet_address" varchar(66) COLLATE "pg_catalog"."default",
  "agent_wallet_address" varchar(66) COLLATE "pg_catalog"."default",
  "status" "public"."task_status" NOT NULL DEFAULT 'created'::task_status,
  "progress" int4,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "accepted_at" timestamptz(6),
  "delivered_at" timestamptz(6),
  "review_deadline" timestamptz(6),
  "arbitration_deadline" timestamptz(6)
)
;
ALTER TABLE "public"."tasks" OWNER TO "postgres";
COMMENT ON COLUMN "public"."tasks"."id" IS '任务ID';
COMMENT ON COLUMN "public"."tasks"."buyer_id" IS '买家用户ID';
COMMENT ON COLUMN "public"."tasks"."agent_id" IS '接单Agent ID（可为空，待分配）';
COMMENT ON COLUMN "public"."tasks"."title" IS '任务标题';
COMMENT ON COLUMN "public"."tasks"."description" IS '任务描述';
COMMENT ON COLUMN "public"."tasks"."budget_usd" IS '任务预算（USDT计价）';
COMMENT ON COLUMN "public"."tasks"."platform_fee" IS '平台费用金额';
COMMENT ON COLUMN "public"."tasks"."token_symbol" IS '托管Token符号';
COMMENT ON COLUMN "public"."tasks"."chain_id" IS '链ID';
COMMENT ON COLUMN "public"."tasks"."chain_task_id" IS '链上任务ID，由智能合约生成，初始为空，监听解析后更新';
COMMENT ON COLUMN "public"."tasks"."create_tx_hash" IS '创建任务的链上交易Hash，创建时的唯一索引';
COMMENT ON COLUMN "public"."tasks"."buyer_wallet_address" IS '任务创建者(Buyer)的钱包地址';
COMMENT ON COLUMN "public"."tasks"."agent_wallet_address" IS '任务雇员(Seller)的钱包地址。';
COMMENT ON COLUMN "public"."tasks"."status" IS '任务状态机';
COMMENT ON COLUMN "public"."tasks"."progress" IS '执行进度百分比';
COMMENT ON COLUMN "public"."tasks"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."tasks"."accepted_at" IS '接单时间';
COMMENT ON COLUMN "public"."tasks"."delivered_at" IS '交付时间';
COMMENT ON COLUMN "public"."tasks"."review_deadline" IS '验收截止时间';
COMMENT ON COLUMN "public"."tasks"."arbitration_deadline" IS '仲裁截止时间';
COMMENT ON TABLE "public"."tasks" IS '任务主表';

-- ----------------------------
-- Indexes structure for table tasks
-- ----------------------------
CREATE INDEX "idx_tasks_agent_status_time" ON "public"."tasks" USING btree (
  "agent_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "status" "pg_catalog"."enum_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_tasks_buyer_status_time" ON "public"."tasks" USING btree (
  "buyer_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "status" "pg_catalog"."enum_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamptz_ops" DESC NULLS FIRST
);
CREATE UNIQUE INDEX "uniq_tasks_chain_task" ON "public"."tasks" USING btree (
  "chain_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "chain_task_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."uniq_tasks_chain_task" IS '保证同一条链上chain_task_id的唯一性';
CREATE UNIQUE INDEX "uniq_tasks_create_tx_hash" ON "public"."tasks" USING btree (
  "create_tx_hash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
COMMENT ON INDEX "public"."uniq_tasks_create_tx_hash" IS '保证任务创建交易Hash唯一，防止重复入库';

-- ----------------------------
-- Uniques structure for table tasks
-- ----------------------------
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_create_tx_hash_key" UNIQUE ("create_tx_hash");

-- ----------------------------
-- Checks structure for table tasks
-- ----------------------------
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_progress_check" CHECK (progress >= 0 AND progress <= 100);

-- ----------------------------
-- Primary Key structure for table tasks
-- ----------------------------
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table tasks
-- ----------------------------
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
