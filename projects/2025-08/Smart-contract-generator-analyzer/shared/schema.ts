import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  gasOptimizations: jsonb("gas_optimizations").default([]),
  securityIssues: jsonb("security_issues").default([]),
  stats: jsonb("stats").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export interface GasOptimization {
  id: string;
  type: string;
  title: string;
  description: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
  estimatedGasSaving?: number;
}

export interface SecurityIssue {
  id: string;
  type: string;
  title: string;
  description: string;
  line?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface ContractStats {
  linesOfCode: number;
  estimatedGas: number;
  functions: number;
  securityScore: number;
}
