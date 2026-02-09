import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from monorepo root (turbo runs from packages/gateway/)
config({ path: resolve(__dirname, '..', '..', '..', '.env.local') });
// Fallback: also try standard .env in cwd
config();
import { makeApp } from './server';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { JSONDatabase } from './json';
import { SupabaseDatabase } from './supabase';
const program = new Command();
program
  .option(
    '-k --private-key <key>',
    'Private key to sign responses with. Prefix with @ to read from a file'
  )
  .option('-d --data <file>', 'JSON file to read data from')
  .option(
    '--backend <mode>',
    'Backend to use: auto, json, supabase',
    'auto'
  )
  .option('--parent-domain <name>', 'ENS parent domain', 'uniforum.eth')
  .option('--app-url <url>', 'Public app URL for url text records')
  .option('-t --ttl <number>', 'TTL for signatures', '300')
  .option('-p --port <number>', 'Port number to serve on', '8080');
program.parse(process.argv);
const options = program.opts();
const ttl = parseInt(options.ttl, 10);
let privateKey =
  options.privateKey ||
  process.env.ENS_CCIP_SIGNER_PRIVATE_KEY ||
  process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error(
    'Missing private key. Provide --private-key or set ENS_CCIP_SIGNER_PRIVATE_KEY.'
  );
}
if (privateKey.startsWith('@')) {
  privateKey = ethers.utils.arrayify(
    readFileSync(privateKey.slice(1), { encoding: 'utf-8' })
  );
}
const address = ethers.utils.computeAddress(privateKey);
const signer = new ethers.utils.SigningKey(privateKey);
const parentDomain =
  options.parentDomain || process.env.ENS_PARENT_DOMAIN || 'uniforum.eth';
const backend = (options.backend || 'auto').toLowerCase();

let db;
if (
  backend === 'supabase' ||
  (backend === 'auto' &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY)
) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for supabase backend.'
    );
  }
  db = new SupabaseDatabase({
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    parentDomain,
    ttl,
    appUrl:
      options.appUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL,
  });
} else {
  if (!options.data) {
    throw new Error('Missing --data. Required for json backend.');
  }
  db = JSONDatabase.fromFilename(options.data, ttl);
}
const app = makeApp(signer, '/', db);
console.log(`Serving on port ${options.port} with signing address ${address}`);
app.listen(parseInt(options.port));

module.exports = app;
