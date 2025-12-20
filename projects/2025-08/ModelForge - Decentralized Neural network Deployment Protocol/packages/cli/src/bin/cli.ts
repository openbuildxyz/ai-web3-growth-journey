#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { registerCommand } from '../commands/register.js';
import { listCommand } from '../commands/list.js';
import { downloadCommand } from '../commands/download.js';

const program = new Command();

program
  .name('modelforge')
  .description('CLI tool for ModelForge AI model management')
  .version('0.1.0');

program
  .command('register')
  .description('Register a new AI model')
  .argument('<model-path>', 'Path to the model file or directory')
  .option('-n, --name <name>', 'Model name')
  .option('-d, --description <description>', 'Model description')
  .option(
    '-t, --type <type>',
    'Model type (e.g., text-generation, image-classification)'
  )
  .option('-v, --version <version>', 'Model version', '1.0.0')
  .option('--network <network>', 'Blockchain network', 'localhost')
  .action(registerCommand);

program
  .command('list')
  .description('List all registered models')
  .option('--network <network>', 'Blockchain network', 'localhost')
  .option('--owner <address>', 'Filter by owner address')
  .option('--limit <number>', 'Number of models to show', '10')
  .action(listCommand);

program
  .command('download')
  .description('Download a model by ID')
  .argument('<model-id>', 'Model ID to download')
  .option('-o, --output <path>', 'Output directory', './downloads')
  .option('--network <network>', 'Blockchain network', 'localhost')
  .action(downloadCommand);

program.parse();

process.on('unhandledRejection', error => {
  console.error(chalk.red('Unhandled rejection:'), error);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error(chalk.red('Uncaught exception:'), error);
  process.exit(1);
});
