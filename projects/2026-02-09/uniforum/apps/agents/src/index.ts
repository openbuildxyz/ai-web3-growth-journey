/**
 * Uniforum Agents Service
 *
 * This service manages all AI agents in the Uniforum ecosystem.
 * It loads agent configurations from Supabase and runs Eliza instances
 * for each active agent.
 *
 * Key responsibilities:
 * - Load agent configs from database on startup
 * - Create and manage Eliza agent instances
 * - Handle inter-agent communication via forums
 * - Execute consensus-approved transactions
 * - Listen for new agent registrations
 */

import { AgentManager } from './manager';
import { createSupabaseClient } from './lib/supabase';
import sqlPlugin, { createDatabaseAdapter } from '@elizaos/plugin-sql';

async function ensureElizaDatabase() {
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || undefined;
  let dataDir =
    process.env.PGLITE_DATA_DIR ||
    process.env.ELIZA_DATABASE_DIR ||
    process.env.ELIZA_DATA_DIR ||
    undefined;

  const sqlPluginDisabled =
    process.env.ELIZA_DISABLE_SQL_PLUGIN === '1' ||
    process.env.ELIZA_DISABLE_SQL_PLUGIN === 'true';

  // If plugin-sql is disabled, skip migrations entirely.
  if (sqlPluginDisabled) {
    console.log('[agents] ELIZA_DISABLE_SQL_PLUGIN is set — skipping Eliza DB migrations');
    return;
  }

  // If no Postgres URL or PGlite data dir is configured, default to an
  // in-memory PGlite instance so plugin-sql always has a valid schema.
  // Without this, plugin-sql still loads and falls back to an empty PGlite,
  // causing "relation 'agents' does not exist" errors.
  if (!postgresUrl && !dataDir) {
    console.log(
      '[agents] No POSTGRES_URL or PGLITE_DATA_DIR set — using default PGlite data dir for Eliza DB'
    );
    dataDir = '.eliza-data';
  }

  const adapter = createDatabaseAdapter(
    {
      postgresUrl,
      dataDir,
    },
    '00000000-0000-0000-0000-000000000000'
  );

  if (!(await adapter.isReady())) {
    await adapter.init();
  }

  await adapter.runPluginMigrations([sqlPlugin], {
    verbose: true,
    force: process.env.ELIZA_ALLOW_DESTRUCTIVE_MIGRATIONS === 'true',
  });

  // Do not close here: plugin-sql uses a global singleton for PGlite.
  // Closing it here marks the DB as shutting down and breaks runtime init.
}

async function main() {
  console.log('[agents] Starting Uniforum Agents Service...');
  await ensureElizaDatabase();

  // Initialize Supabase client
  const supabase = createSupabaseClient();

  // Sanity check: verify Supabase is reachable before proceeding
  console.log(`[agents] Supabase URL: ${process.env.SUPABASE_URL ?? 'not set'}`);
  const start = Date.now();
  const { error: pingError } = await supabase
    .from('agents')
    .select('id', { count: 'exact', head: true });
  const latency = Date.now() - start;

  if (pingError) {
    console.error(`[agents] Supabase connection FAILED (${latency}ms):`, pingError.message);
    throw new Error(`Supabase unreachable: ${pingError.message}`);
  }
  console.log(`[agents] Supabase connection OK (${latency}ms)`);

  // Initialize agent manager
  const manager = new AgentManager(supabase);

  // Load existing agents from database
  await manager.loadAgents();

  // Subscribe to new agent registrations
  manager.subscribeToNewAgents();

  // Subscribe to forum events
  manager.subscribeToForumEvents();

  // Scan for already-approved proposals and execute
  await manager.scanApprovedProposals();

  console.log('[agents] Service is running');
  console.log(`[agents] Managing ${manager.getAgentCount()} agents`);

  // Keep the process alive
  process.on('SIGINT', async () => {
    console.log('\n[agents] Shutting down...');
    await manager.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n[agents] Shutting down...');
    await manager.shutdown();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('[agents] Failed to start:', error);
  process.exit(1);
});
