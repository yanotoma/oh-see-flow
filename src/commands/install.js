'use strict';

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_URL = 'https://raw.githubusercontent.com/yanotoma/oh-see-flow/main';

const installCommand = new Command('install')
  .description('Install oh-see-flow to current project or globally')
  .option('-g, --global', 'Install to global config (~/.config/opencode/)')
  .option('-p, --project', 'Install to current project (.opencode/)')
  .option('--skip-mcps', 'Skip MCP selection')
  .option('--skip-models', 'Skip capability model configuration')
  .action(async (options) => {
    console.log('');
    console.log(chalk.cyan('╔═══════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.white.bold('        oh-see-flow installer          '));
    console.log(chalk.cyan('║') + chalk.gray('    pronounced: oh-see-flow             '));
    console.log(chalk.cyan('╚═══════════════════════════════════════╝'));
    console.log('');

    try {
      // Step 1: Install location
      let installDir;
      if (options.global) {
        installDir = path.join(process.env.HOME, '.config', 'opencode');
        console.log(chalk.white('Installing to: ') + chalk.cyan('~/.config/opencode/'));
      } else if (options.project) {
        installDir = '.opencode';
        console.log(chalk.white('Installing to: ') + chalk.cyan('.opencode/'));
      } else {
        const { location } = await inquirer.prompt([
          {
            type: 'list',
            name: 'location',
            message: 'Where do you want to install?',
            choices: [
              { name: 'Project-local (.opencode/ in current directory)', value: 'project' },
              { name: 'Global (~/.config/opencode/)', value: 'global' }
            ]
          }
        ]);
        installDir = location === 'global' 
          ? path.join(process.env.HOME, '.config', 'opencode')
          : '.opencode';
        console.log(chalk.white('Installing to: ') + chalk.cyan(installDir));
      }

      // Step 2: Capability models
      let visionModel = 'anthropic/claude-sonnet-4-6';
      let contextModel = 'anthropic/claude-sonnet-4-6';
      let codeModel = 'openai/gpt-4o';

      if (!options.skipModels) {
        console.log('');
        console.log(chalk.white.bold('Capability Models'));
        console.log(chalk.gray('Configure which models handle specific capabilities.'));
        console.log('');

        const models = await inquirer.prompt([
          {
            type: 'input',
            name: 'vision',
            message: 'Model for vision/images:',
            default: visionModel
          },
          {
            type: 'input',
            name: 'context',
            message: 'Model for large context:',
            default: contextModel
          },
          {
            type: 'input',
            name: 'code',
            message: 'Model for code execution:',
            default: codeModel
          }
        ]);

        visionModel = models.vision;
        contextModel = models.context;
        codeModel = models.code;
      }

      // Step 3: MCP selection
      let selectedMcps = [];

      if (!options.skipMcps) {
        console.log('');
        console.log(chalk.white.bold('MCP Servers'));
        console.log(chalk.gray('Select MCPs to configure.'));
        console.log('');

        const mcpChoices = [
          { name: 'Playwright - Browser automation', value: 'playwright' },
          { name: 'GitHub - Issues, PRs, repos', value: 'github' },
          { name: 'Sentry - Error monitoring', value: 'sentry' },
          { name: 'n8n - Workflow automation', value: 'n8n' },
          { name: 'Railway - Infrastructure', value: 'railway' },
          { name: 'Context7 - Documentation lookup', value: 'context7' },
          { name: 'Engram - Persistent memory (recommended)', value: 'engram', checked: true },
          { name: 'Stitch - Design systems', value: 'stitch' },
          { name: 'Cloudflare - Workers, DNS, CDN', value: 'cloudflare' }
        ];

        const { mcps } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'mcps',
            message: 'Select MCPs to configure:',
            choices: mcpChoices
          }
        ]);

        selectedMcps = mcps;
      }

      // Step 4: Prerequisites check
      console.log('');
      console.log(chalk.white.bold('Prerequisites'));
      console.log('');

      const checks = [
        { name: 'Node.js', check: () => execSync('node --version', { stdio: 'pipe' }).toString().trim() },
        { name: 'npm', check: () => execSync('npm --version', { stdio: 'pipe' }).toString().trim() },
        { name: 'git', check: () => execSync('git --version', { stdio: 'pipe' }).toString().trim() }
      ];

      if (selectedMcps.includes('engram')) {
        checks.push({ name: 'Engram', check: () => execSync('engram --version', { stdio: 'pipe' }).toString().trim() });
      }

      let missingPrereqs = [];

      for (const check of checks) {
        try {
          const version = check.check();
          console.log(chalk.green('  ✓') + chalk.white(` ${check.name}`) + chalk.gray(` (${version})`));
        } catch (e) {
          console.log(chalk.red('  ✗') + chalk.white(` ${check.name}`) + chalk.gray(' (not found)'));
          missingPrereqs.push(check.name);
        }
      }

      if (missingPrereqs.length > 0) {
        console.log('');
        console.log(chalk.yellow('  ⚠ Missing: ') + missingPrereqs.join(', '));
        
        const { continueAnyway } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueAnyway',
            message: 'Continue anyway?',
            default: true
          }
        ]);

        if (!continueAnyway) {
          console.log(chalk.red('  Aborted.'));
          process.exit(1);
        }
      } else {
        console.log(chalk.green('  ✓ All prerequisites satisfied'));
      }

      // Step 5: Install
      console.log('');
      console.log(chalk.white.bold('Installing'));
      console.log('');

      const spinner = ora('Creating directories...').start();

      // Create directories
      const dirs = ['agents', 'skills', 'plugins'];
      for (const dir of dirs) {
        fs.mkdirSync(path.join(installDir, dir), { recursive: true });
      }
      fs.mkdirSync('.osf', { recursive: true });
      fs.mkdirSync('scripts', { recursive: true });
      spinner.succeed('Directories created');

      // Download agents
      spinner.start('Downloading agents...');
      const agents = ['orchestrator', 'coder', 'tester', 'researcher', 'reviewer', 'debugger', 'verifier', 'vision', 'context-builder', 'code-runner'];
      for (const agent of agents) {
        const content = await fetchFile(`${REPO_URL}/.opencode/agents/${agent}.md`);
        fs.writeFileSync(path.join(installDir, 'agents', `${agent}.md`), content);
      }
      spinner.succeed(`${agents.length} agents installed`);

      // Download skills
      spinner.start('Downloading skills...');
      const skills = [
        'osf-debug', 'osf-review', 'osf-tdd', 'osf-spark', 'osf-blueprint', 'osf-forge',
        'osf-ask-review', 'osf-handle-review', 'osf-preflight', 'osf-swarm', 'osf-isolate',
        'osf-ui-designer', 'osf-ux-expert', 'osf-tester', 'osf-backend', 'osf-frontend',
        'osf-devops', 'osf-data', 'osf-design-system', 'osf-engram', 'osf-seo', 'osf-create-skill'
      ];
      for (const skill of skills) {
        const skillDir = path.join(installDir, 'skills', skill);
        fs.mkdirSync(skillDir, { recursive: true });
        const content = await fetchFile(`${REPO_URL}/.opencode/skills/${skill}/SKILL.md`);
        fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content);
      }
      spinner.succeed(`${skills.length} skills installed`);

      // Download plugins
      spinner.start('Downloading plugins...');
      const plugins = ['engram-context.ts', 'task-logger.ts', 'result-collector.ts', 'env-guard.ts', 'model-stats.ts', 'perf-monitor.ts', 'capability-router.ts'];
      for (const plugin of plugins) {
        const content = await fetchFile(`${REPO_URL}/.opencode/plugins/${plugin}`);
        fs.writeFileSync(path.join(installDir, 'plugins', plugin), content);
      }
      spinner.succeed(`${plugins.length} plugins downloaded (disabled by default)`);

      // Download AGENTS.md
      spinner.start('Downloading AGENTS.md...');
      const agentsMd = await fetchFile(`${REPO_URL}/AGENTS.md`);
      fs.writeFileSync('AGENTS.md', agentsMd);
      spinner.succeed('AGENTS.md installed');

      // Download validation scripts
      spinner.start('Downloading validation scripts...');
      const scripts = ['validate-skills.js', 'validate-agents.js', 'validate-config.js', 'validate-plugins.js'];
      for (const script of scripts) {
        const content = await fetchFile(`${REPO_URL}/scripts/${script}`);
        fs.writeFileSync(path.join('scripts', script), content);
      }
      spinner.succeed(`${scripts.length} validation scripts installed`);

      // Save capability models
      spinner.start('Configuring capability models...');
      fs.writeFileSync('.osf/capability-models.json', JSON.stringify({
        vision: visionModel,
        large_context: contextModel,
        code_execution: codeModel
      }, null, 2));
      spinner.succeed('Capability models configured');

      // Build MCP config
      const mcpConfig = {};
      const mcpCommands = {
        playwright: ['npx', '-y', '@playwright/mcp'],
        github: ['npx', '-y', '@modelcontextprotocol/server-github'],
        sentry: ['npx', '-y', '@sentry/mcp'],
        n8n: ['npx', '-y', '@n8n/mcp'],
        railway: ['npx', '-y', '@railway/mcp'],
        context7: ['npx', '-y', '@context7/mcp'],
        engram: ['engram', 'mcp'],
        stitch: ['npx', '-y', '@stitch/mcp'],
        cloudflare: ['npx', '-y', '@cloudflare/mcp']
      };

      for (const mcp of selectedMcps) {
        if (mcpCommands[mcp]) {
          mcpConfig[mcp] = {
            type: 'local',
            command: mcpCommands[mcp],
            enabled: true
          };
        }
      }

      // Generate opencode.json
      spinner.start('Generating opencode.json...');
      const opencodeConfig = {
        $schema: 'https://opencode.ai/config.json',
        instructions: ['AGENTS.md'],
        skills: { paths: [path.join(installDir, 'skills')] },
        agent: {
          orchestrator: { description: 'Primary orchestrator — plans, decomposes, and delegates tasks to specialized subagents.', mode: 'primary' },
          coder: { description: 'Implements code changes following project conventions and TDD practices.', mode: 'subagent' },
          tester: { description: 'Writes and runs tests, reports coverage and quality.', mode: 'subagent' },
          researcher: { description: 'Explores codebase, documentation, and web to gather context.', mode: 'subagent' },
          reviewer: { description: 'Reviews code for quality, style, and potential issues.', mode: 'subagent' },
          debugger: { description: 'Systematic debugging agent for diagnosing issues.', mode: 'subagent' },
          verifier: { description: 'Validates that subagents completed their tasks correctly.', mode: 'subagent' },
          vision: { description: 'Processes images, screenshots, diagrams, and visual content.', mode: 'subagent' },
          'context-builder': { description: 'Handles large documents and files that exceed normal context limits.', mode: 'subagent' },
          'code-runner': { description: 'Executes code, runs scripts, and manages code execution tasks.', mode: 'subagent' }
        },
        command: {
          'osf:grill': { description: 'Ask clarifying questions before planning', prompt: 'Ask clarifying questions to understand what the user wants to build. One question at a time. After understanding, suggest creating a plan with osf:plan.' },
          'osf:plan': { description: 'Create an implementation plan', prompt: 'Create a detailed implementation plan. Break work into independent subtasks. For each subtask, specify which subagent should handle it.' },
          'osf:execute': { description: 'Execute the plan via subagents', prompt: 'Ask the user which execution mode they want (auto, review-plan, step-by-step, dry-run, direct), then execute the plan accordingly.' },
          'osf:review': { description: 'Review current changes', prompt: 'Review the current git diff for bugs, style issues, and improvements. Be specific about file and line numbers.' },
          'osf:test': { description: 'Run tests and report', prompt: 'Run the project\'s tests and report results. If tests fail, suggest debugging with osf:debug.' },
          'osf:debug': { description: 'Start systematic debugging', prompt: 'Use the osf-debug skill to systematically diagnose the issue.' },
          'osf:deploy': { description: 'Deploy (requires explicit user confirmation)', prompt: 'Ask the user where they want to deploy (platform, project, environment) and how. Never deploy without explicit confirmation.' },
          'osf:spec': { description: 'Generate a spec from requirements', prompt: 'Generate a specification document from the user\'s requirements. Include interfaces, contracts, and acceptance criteria.' },
          'osf:ship': { description: 'Full flow: test → review → merge → deploy', prompt: 'Run the full flow: test, review, then ask user about merge/deploy. Never deploy without explicit confirmation.' },
          'osf:finish': { description: 'Finish branch — merge/PR/keep/discard', prompt: 'All tasks complete. Present options: merge to main, create PR, keep branch, or discard. Let user choose.' },
          'osf:refresh-registry': { description: 'Refresh skill discovery registry', prompt: 'Scan for skills in all known locations and regenerate the skill registry.' }
        },
        mcp: mcpConfig,
        plugin: [],
        permission: {
          bash: { 'git *': 'allow', 'npm *': 'allow', 'rm *': 'ask', '*': 'ask' },
          external_directory: { '~/**': 'ask', '*': 'ask' }
        }
      };

      fs.writeFileSync('opencode.json', JSON.stringify(opencodeConfig, null, 2));
      spinner.succeed('opencode.json generated');

      // Create package.json if needed
      if (!fs.existsSync('package.json')) {
        spinner.start('Creating package.json...');
        fs.writeFileSync('package.json', JSON.stringify({
          name: 'oh-see-flow',
          version: '0.1.0',
          scripts: {
            validate: 'node scripts/validate-config.js && node scripts/validate-agents.js && node scripts/validate-skills.js && node scripts/validate-plugins.js',
            'validate:config': 'node scripts/validate-config.js',
            'validate:agents': 'node scripts/validate-agents.js',
            'validate:skills': 'node scripts/validate-skills.js',
            'validate:plugins': 'node scripts/validate-plugins.js'
          },
          license: 'MIT'
        }, null, 2));
        spinner.succeed('package.json created');
      }

      // Done
      console.log('');
      console.log(chalk.green('╔═══════════════════════════════════════╗'));
      console.log(chalk.green('║') + chalk.white.bold('        Installation Complete!          '));
      console.log(chalk.green('╚═══════════════════════════════════════╝'));
      console.log('');
      console.log(chalk.white('Installed:'));
      console.log(chalk.gray('  • 10 agents (orchestrator + 9 subagents)'));
      console.log(chalk.gray('  • 22 skills (12 workflow + 10 role)'));
      console.log(chalk.gray('  • 7 plugins (disabled by default)'));
      console.log(chalk.gray('  • 4 validation scripts'));
      console.log('');
      console.log(chalk.white('Next steps:'));
      console.log(chalk.gray('  1. ') + chalk.cyan('Restart opencode') + chalk.gray(' to load the new config'));
      console.log(chalk.gray('  2. Run ') + chalk.cyan('oh-see-flow doctor') + chalk.gray(' to verify installation'));
      console.log(chalk.gray('  3. Run ') + chalk.cyan('oh-see-flow validate') + chalk.gray(' to check configuration'));
      console.log(chalk.gray('  4. Try ') + chalk.cyan('osf:grill') + chalk.gray(' in opencode to start brainstorming'));
      console.log('');
      console.log(chalk.white('Documentation: ') + chalk.cyan('https://github.com/yanotoma/oh-see-flow'));
      console.log('');

    } catch (error) {
      console.error(chalk.red('Error: ') + error.message);
      process.exit(1);
    }
  });

// Helper function to fetch files
async function fetchFile(url) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

module.exports = installCommand;
