#!/usr/bin/env node

// apps/CangjieMagic/sdk/javascript/src/cli.ts
import { Command } from 'commander';
import { SkillRuntimeClient } from './index';

const program = new Command();

program
  .name('skill')
  .description('CangjieMagic Skill Runtime CLI')
  .version('1.0.0');

// Install command
program
  .command('install')
  .description('Install a skill')
  .option('-p, --path <path>', 'Local path to skill')
  .option('-g, --git <url>', 'Git repository URL')
  .option('-b, --branch <branch>', 'Git branch name')
  .option('-t, --tag <tag>', 'Git tag name')
  .option('-c, --commit <commit>', 'Git commit ID')
  .option('-n, --name <name>', 'Skill name')
  .action(async (options) => {
    const client = new SkillRuntimeClient(process.env.SKILL_RUNTIME_API_URL || 'http://localhost:8080');

    const result = await client.installSkill({
      path: options.path,
      git: options.git,
      branch: options.branch,
      tag: options.tag,
      commit: options.commit,
      name: options.name
    });

    if (result.success) {
      console.log(`✓ ${result.message}`);
    } else {
      console.error(`✗ ${result.message}`);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List installed skills')
  .action(async () => {
    const client = new SkillRuntimeClient(process.env.SKILL_RUNTIME_API_URL || 'http://localhost:8080');

    const result = await client.listSkills();

    if (result.success) {
      console.log('Installed skills:');
      result.skills.forEach((skill: any) => {
        console.log(`- ${skill.name} (${skill.version}): ${skill.description}`);
      });
    } else {
      console.error('✗ Failed to list skills');
      process.exit(1);
    }
  });

// Run command
program
  .command('run')
  .description('Run a skill tool')
  .argument('<skill-tool>', 'Skill and tool name in format skill:tool')
  .allowUnknownOption()
  .action(async (skillTool, cmd) => {
    // Parse skill:tool format
    const [skillName, toolName] = skillTool.split(':');
    if (!skillName || !toolName) {
      console.error('✗ Invalid format. Use skill:tool');
      process.exit(1);
    }

    // Parse remaining arguments as key=value pairs
    const args: Record<string, any> = {};
    const rawArgs = process.argv.slice(4); // Skip 'node', script, 'run', and 'skill:tool'

    for (const arg of rawArgs) {
      if (arg.includes('=')) {
        const [key, value] = arg.split('=', 2);
        args[key] = value;
      }
    }

    const client = new SkillRuntimeClient(process.env.SKILL_RUNTIME_API_URL || 'http://localhost:8080');

    const result = await client.runSkillTool(skillName, toolName, args);

    if (result.success) {
      console.log(result.output);
    } else {
      console.error(`✗ ${result.errorMessage}`);
      process.exit(1);
    }
  });

// Search command
program
  .command('search')
  .description('Search for skills')
  .argument('<query>', 'Search query')
  .action(async (query) => {
    const client = new SkillRuntimeClient(process.env.SKILL_RUNTIME_API_URL || 'http://localhost:8080');

    const result = await client.searchSkills(query);

    if (result.success) {
      console.log(`Skills matching "${query}":`);
      result.skills.forEach((skill: any) => {
        console.log(`- ${skill.name} (${skill.version}): ${skill.description}`);
      });
    } else {
      console.error('✗ Failed to search skills');
      process.exit(1);
    }
  });

program.parse();