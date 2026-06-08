'use strict';

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const doctorCommand = new Command('doctor')
  .description('Run health checks on your oh-see-flow installation')
  .option('-v, --verbose', 'Show detailed information')
  .action((options) => {
    console.log('');
    console.log(chalk.cyan('╔═══════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.white.bold('        oh-see-flow doctor              '));
    console.log(chalk.cyan('║') + chalk.gray('    Health check                        '));
    console.log(chalk.cyan('╚═══════════════════════════════════════╝'));
    console.log('');

    const results = {
      passed: 0,
      warnings: 0,
      failed: 0,
      checks: []
    };

    function check(name, fn, { required = true, fix = null } = {}) {
      try {
        const result = fn();
        if (result === true) {
          console.log(chalk.green('  ✓') + chalk.white(` ${name}`));
          results.passed++;
          results.checks.push({ name, status: 'pass' });
        } else if (result === null) {
          console.log(chalk.yellow('  ⚠') + chalk.white(` ${name}`) + chalk.gray(' (skipped)'));
          results.warnings++;
          results.checks.push({ name, status: 'warn', message: 'skipped' });
        } else {
          console.log(chalk.yellow('  ⚠') + chalk.white(` ${name}`) + chalk.gray(` (${result})`));
          results.warnings++;
          results.checks.push({ name, status: 'warn', message: result });
        }
      } catch (error) {
        if (required) {
          console.log(chalk.red('  ✗') + chalk.white(` ${name}`) + chalk.gray(` (${error.message})`));
          results.failed++;
          results.checks.push({ name, status: 'fail', message: error.message, fix });
        } else {
          console.log(chalk.yellow('  ⚠') + chalk.white(` ${name}`) + chalk.gray(` (${error.message})`));
          results.warnings++;
          results.checks.push({ name, status: 'warn', message: error.message });
        }
      }
    }

    // System checks
    console.log(chalk.white.bold('System'));
    console.log('');

    check('Node.js >= 18', () => {
      const version = execSync('node --version', { stdio: 'pipe' }).toString().trim();
      const major = parseInt(version.replace('v', '').split('.')[0]);
      return major >= 18 ? true : `v${major} (need >= 18)`;
    }, { fix: 'Install Node.js 18+ from https://nodejs.org' });

    check('npm', () => {
      execSync('npm --version', { stdio: 'pipe' });
      return true;
    }, { fix: 'Install Node.js from https://nodejs.org' });

    check('git', () => {
      execSync('git --version', { stdio: 'pipe' });
      return true;
    }, { fix: 'Install git from https://git-scm.com' });

    console.log('');

    // opencode checks
    console.log(chalk.white.bold('opencode'));
    console.log('');

    check('opencode installed', () => {
      try {
        execSync('which opencode', { stdio: 'pipe' });
        return true;
      } catch {
        throw new Error('not found in PATH');
      }
    }, { fix: 'Install opencode from https://opencode.ai' });

    check('opencode.json exists', () => {
      return fs.existsSync('opencode.json');
    }, { fix: 'Run oh-see-flow install' });

    if (fs.existsSync('opencode.json')) {
      check('opencode.json is valid JSON', () => {
        try {
          JSON.parse(fs.readFileSync('opencode.json', 'utf-8'));
          return true;
        } catch (e) {
          throw new Error(`Invalid JSON: ${e.message}`);
        }
      }, { fix: 'Fix the JSON syntax in opencode.json' });

      const config = JSON.parse(fs.readFileSync('opencode.json', 'utf-8'));

      check('$schema is set', () => {
        return config.$schema === 'https://opencode.ai/config.json';
      }, { required: false });

      check('instructions array exists', () => {
        return Array.isArray(config.instructions);
      }, { required: false });
    }

    console.log('');

    // Agent checks
    console.log(chalk.white.bold('Agents'));
    console.log('');

    const agentsDir = fs.existsSync('.opencode/agents') ? '.opencode/agents' : 
                      fs.existsSync(path.join(process.env.HOME, '.config/opencode/agents')) ? 
                      path.join(process.env.HOME, '.config/opencode/agents') : null;

    if (agentsDir) {
      const requiredAgents = ['orchestrator', 'coder', 'tester', 'researcher', 'reviewer', 'debugger', 'verifier', 'vision', 'context-builder', 'code-runner'];
      
      for (const agent of requiredAgents) {
        check(`Agent: ${agent}`, () => {
          const agentPath = path.join(agentsDir, `${agent}.md`);
          if (!fs.existsSync(agentPath)) {
            throw new Error('not found');
          }
          const content = fs.readFileSync(agentPath, 'utf-8');
          if (!content.includes('---')) {
            throw new Error('missing frontmatter');
          }
          return true;
        }, { required: false, fix: `Run oh-see-flow install to download ${agent}` });
      }
    } else {
      console.log(chalk.yellow('  ⚠') + chalk.white(' No agents directory found'));
      console.log(chalk.gray('    Run oh-see-flow install'));
    }

    console.log('');

    // Skill checks
    console.log(chalk.white.bold('Skills'));
    console.log('');

    const skillsDir = fs.existsSync('.opencode/skills') ? '.opencode/skills' : 
                      fs.existsSync(path.join(process.env.HOME, '.config/opencode/skills')) ? 
                      path.join(process.env.HOME, '.config/opencode/skills') : null;

    if (skillsDir) {
      const requiredSkills = [
        'osf-debug', 'osf-review', 'osf-tdd', 'osf-spark', 'osf-blueprint', 'osf-forge',
        'osf-ask-review', 'osf-handle-review', 'osf-preflight', 'osf-swarm', 'osf-isolate',
        'osf-ui-designer', 'osf-ux-expert', 'osf-tester', 'osf-backend', 'osf-frontend',
        'osf-devops', 'osf-data', 'osf-design-system', 'osf-engram', 'osf-seo', 'osf-create-skill'
      ];

      let foundSkills = 0;
      for (const skill of requiredSkills) {
        const skillPath = path.join(skillsDir, skill, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          foundSkills++;
        }
      }

      check(`Skills installed: ${foundSkills}/${requiredSkills.length}`, () => {
        if (foundSkills === requiredSkills.length) return true;
        if (foundSkills > 0) return `missing ${requiredSkills.length - foundSkills} skills`;
        throw new Error('no skills found');
      }, { required: false, fix: 'Run oh-see-flow install' });

      // Check skill format
      let skillFormatIssues = 0;
      const skillDirs = fs.readdirSync(skillsDir).filter(d => 
        fs.statSync(path.join(skillsDir, d)).isDirectory()
      );

      for (const skillDir of skillDirs) {
        const skillFile = path.join(skillsDir, skillDir, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          const content = fs.readFileSync(skillFile, 'utf-8');
          if (!content.includes('name:')) {
            skillFormatIssues++;
            if (options.verbose) {
              console.log(chalk.gray(`    ⚠ ${skillDir}: missing name in frontmatter`));
            }
          }
          if (!content.includes('description:')) {
            skillFormatIssues++;
            if (options.verbose) {
              console.log(chalk.gray(`    ⚠ ${skillDir}: missing description in frontmatter`));
            }
          }
        }
      }

      if (skillFormatIssues > 0) {
        check(`Skill format: ${skillFormatIssues} issues`, () => skillFormatIssues > 0 ? `${skillFormatIssues} issues found` : true, { required: false });
      } else {
        check('Skill format', () => true, { required: false });
      }
    } else {
      console.log(chalk.yellow('  ⚠') + chalk.white(' No skills directory found'));
      console.log(chalk.gray('    Run oh-see-flow install'));
    }

    console.log('');

    // MCP checks
    console.log(chalk.white.bold('MCP Servers'));
    console.log('');

    if (fs.existsSync('opencode.json')) {
      const config = JSON.parse(fs.readFileSync('opencode.json', 'utf-8'));
      const mcps = config.mcp || {};
      const mcpEntries = Object.entries(mcps);

      if (mcpEntries.length === 0) {
        console.log(chalk.gray('  No MCPs configured'));
      } else {
        for (const [name, mcp] of mcpEntries) {
          check(`MCP: ${name}`, () => {
            if (!mcp.type) throw new Error('missing type');
            if (mcp.type === 'local' && !mcp.command) throw new Error('missing command');
            if (mcp.type === 'remote' && !mcp.url) throw new Error('missing url');
            return true;
          }, { required: false });
        }
      }
    }

    console.log('');

    // Capability models
    console.log(chalk.white.bold('Capability Models'));
    console.log('');

    check('capability-models.json', () => {
      if (!fs.existsSync('.osf/capability-models.json')) {
        throw new Error('not found');
      }
      const models = JSON.parse(fs.readFileSync('.osf/capability-models.json', 'utf-8'));
      if (!models.vision) throw new Error('missing vision model');
      if (!models.large_context) throw new Error('missing large_context model');
      if (!models.code_execution) throw new Error('missing code_execution model');
      return true;
    }, { required: false, fix: 'Run oh-see-flow install' });

    if (fs.existsSync('.osf/capability-models.json')) {
      const models = JSON.parse(fs.readFileSync('.osf/capability-models.json', 'utf-8'));
      if (options.verbose) {
        console.log(chalk.gray(`    Vision: ${models.vision}`));
        console.log(chalk.gray(`    Context: ${models.large_context}`));
        console.log(chalk.gray(`    Code: ${models.code_execution}`));
      }
    }

    console.log('');

    // Plugin checks
    console.log(chalk.white.bold('Plugins'));
    console.log('');

    const pluginsDir = fs.existsSync('.opencode/plugins') ? '.opencode/plugins' : null;

    if (pluginsDir) {
      const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.ts'));
      
      check(`Plugins: ${pluginFiles.length} available`, () => {
        return true;
      }, { required: false });

      // Check if plugins are enabled in config
      if (fs.existsSync('opencode.json')) {
        const config = JSON.parse(fs.readFileSync('opencode.json', 'utf-8'));
        const enabledPlugins = config.plugin || [];
        
        if (enabledPlugins.length > 0) {
          console.log(chalk.yellow('  ⚠') + chalk.white(' Plugins are enabled') + chalk.gray(' (may cause startup issues)'));
          console.log(chalk.gray('    If opencode fails to start, disable plugins in opencode.json'));
        } else {
          console.log(chalk.green('  ✓') + chalk.white(' Plugins disabled (default)'));
        }
      }
    } else {
      console.log(chalk.gray('  No plugins directory'));
    }

    console.log('');

    // Summary
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log('');

    const total = results.passed + results.warnings + results.failed;
    
    if (results.failed === 0 && results.warnings === 0) {
      console.log(chalk.green.bold('  All checks passed! ✓'));
    } else if (results.failed === 0) {
      console.log(chalk.yellow.bold(`  ${results.passed} passed, ${results.warnings} warnings`));
    } else {
      console.log(chalk.red.bold(`  ${results.passed} passed, ${results.warnings} warnings, ${results.failed} failed`));
    }

    console.log('');

    // Show fixes if any failures
    if (results.failed > 0) {
      console.log(chalk.white.bold('Suggested fixes:'));
      console.log('');
      
      const failedChecks = results.checks.filter(c => c.status === 'fail' && c.fix);
      for (const check of failedChecks) {
        console.log(chalk.gray(`  • ${check.name}: ${check.fix}`));
      }
      console.log('');
    }

    process.exit(results.failed > 0 ? 1 : 0);
  });

module.exports = doctorCommand;
