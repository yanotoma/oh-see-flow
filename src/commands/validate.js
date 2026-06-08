'use strict';

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const validateCommand = new Command('validate')
  .description('Validate oh-see-flow configuration files')
  .option('-c, --config', 'Validate opencode.json only')
  .option('-a, --agents', 'Validate agents only')
  .option('-s, --skills', 'Validate skills only')
  .option('-p, --plugins', 'Validate plugins only')
  .option('--fix', 'Attempt to fix issues automatically')
  .action((options) => {
    console.log('');
    console.log(chalk.cyan('╔═══════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.white.bold('        oh-see-flow validate            '));
    console.log(chalk.cyan('║') + chalk.gray('    Configuration validator              '));
    console.log(chalk.cyan('╚═══════════════════════════════════════╝'));
    console.log('');

    const results = {
      passed: 0,
      warnings: 0,
      errors: 0,
      fixed: 0
    };

    // Determine what to validate
    const validateAll = !options.config && !options.agents && !options.skills && !options.plugins;
    const validateConfig = validateAll || options.config;
    const validateAgents = validateAll || options.agents;
    const validateSkills = validateAll || options.skills;
    const validatePlugins = validateAll || options.plugins;

    // Validate config
    if (validateConfig) {
      console.log(chalk.white.bold('opencode.json'));
      console.log('');

      if (!fs.existsSync('opencode.json')) {
        console.log(chalk.red('  ✗') + chalk.white(' opencode.json not found'));
        console.log(chalk.gray('    Run oh-see-flow install'));
        results.errors++;
      } else {
        try {
          const content = fs.readFileSync('opencode.json', 'utf-8');
          const config = JSON.parse(content);

          // Check $schema
          if (config.$schema !== 'https://opencode.ai/config.json') {
            console.log(chalk.yellow('  ⚠') + chalk.white(' Missing or incorrect $schema'));
            results.warnings++;
            if (options.fix) {
              config.$schema = 'https://opencode.ai/config.json';
              fs.writeFileSync('opencode.json', JSON.stringify(config, null, 2));
              console.log(chalk.green('    ✓ Fixed: Added $schema'));
              results.fixed++;
            }
          } else {
            console.log(chalk.green('  ✓') + chalk.white(' $schema is correct'));
            results.passed++;
          }

          // Check instructions
          if (!Array.isArray(config.instructions)) {
            console.log(chalk.red('  ✗') + chalk.white(' instructions must be an array'));
            results.errors++;
          } else {
            console.log(chalk.green('  ✓') + chalk.white(' instructions is an array'));
            results.passed++;
          }

          // Check skills
          if (config.skills) {
            if (!Array.isArray(config.skills.paths)) {
              console.log(chalk.red('  ✗') + chalk.white(' skills.paths must be an array'));
              results.errors++;
            } else {
              console.log(chalk.green('  ✓') + chalk.white(' skills.paths is valid'));
              results.passed++;
            }
          }

          // Check agents
          if (config.agent) {
            const agentEntries = Object.entries(config.agent);
            let agentIssues = 0;
            
            for (const [name, agent] of agentEntries) {
              if (!agent.description) {
                console.log(chalk.red('  ✗') + chalk.white(` Agent '${name}' missing description`));
                agentIssues++;
              }
              if (!agent.mode) {
                console.log(chalk.red('  ✗') + chalk.white(` Agent '${name}' missing mode`));
                agentIssues++;
              } else if (!['primary', 'subagent', 'all'].includes(agent.mode)) {
                console.log(chalk.red('  ✗') + chalk.white(` Agent '${name}' invalid mode: ${agent.mode}`));
                agentIssues++;
              }
            }

            if (agentIssues === 0) {
              console.log(chalk.green('  ✓') + chalk.white(` ${agentEntries.length} agents configured correctly`));
              results.passed++;
            } else {
              results.errors += agentIssues;
            }
          }

          // Check MCPs
          if (config.mcp) {
            const mcpEntries = Object.entries(config.mcp);
            let mcpIssues = 0;

            for (const [name, mcp] of mcpEntries) {
              if (!mcp.type) {
                console.log(chalk.red('  ✗') + chalk.white(` MCP '${name}' missing type`));
                mcpIssues++;
              }
              if (mcp.type === 'local' && !mcp.command) {
                console.log(chalk.red('  ✗') + chalk.white(` MCP '${name}' missing command`));
                mcpIssues++;
              }
              if (mcp.type === 'remote' && !mcp.url) {
                console.log(chalk.red('  ✗') + chalk.white(` MCP '${name}' missing url`));
                mcpIssues++;
              }
            }

            if (mcpIssues === 0) {
              console.log(chalk.green('  ✓') + chalk.white(` ${mcpEntries.length} MCPs configured correctly`));
              results.passed++;
            } else {
              results.errors += mcpIssues;
            }
          }

          // Check permissions
          if (config.permission) {
            console.log(chalk.green('  ✓') + chalk.white(' permissions configured'));
            results.passed++;
          }

        } catch (error) {
          console.log(chalk.red('  ✗') + chalk.white(` Invalid JSON: ${error.message}`));
          results.errors++;
        }
      }

      console.log('');
    }

    // Validate agents
    if (validateAgents) {
      console.log(chalk.white.bold('Agents'));
      console.log('');

      const agentsDir = '.opencode/agents';
      if (!fs.existsSync(agentsDir)) {
        console.log(chalk.yellow('  ⚠') + chalk.white(' .opencode/agents not found'));
        results.warnings++;
      } else {
        const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
        let agentIssues = 0;

        for (const file of agentFiles) {
          const filePath = path.join(agentsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const name = file.replace('.md', '');

          // Check frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (!frontmatterMatch) {
            console.log(chalk.red('  ✗') + chalk.white(` ${name}: missing frontmatter`));
            agentIssues++;
            continue;
          }

          const frontmatter = frontmatterMatch[1];
          const fields = {};
          frontmatter.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              fields[match[1]] = match[2].trim();
            }
          });

          // Check required fields
          if (!fields.description) {
            console.log(chalk.red('  ✗') + chalk.white(` ${name}: missing description`));
            agentIssues++;
          }
          if (!fields.mode) {
            console.log(chalk.red('  ✗') + chalk.white(` ${name}: missing mode`));
            agentIssues++;
          }

          // Check prompt length
          const promptBody = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
          if (promptBody.length < 50) {
            console.log(chalk.yellow('  ⚠') + chalk.white(` ${name}: prompt too short (${promptBody.length} chars)`));
            results.warnings++;
          }
        }

        if (agentIssues === 0) {
          console.log(chalk.green('  ✓') + chalk.white(` ${agentFiles.length} agents validated`));
          results.passed++;
        } else {
          results.errors += agentIssues;
        }
      }

      console.log('');
    }

    // Validate skills
    if (validateSkills) {
      console.log(chalk.white.bold('Skills'));
      console.log('');

      const skillsDir = '.opencode/skills';
      if (!fs.existsSync(skillsDir)) {
        console.log(chalk.yellow('  ⚠') + chalk.white(' .opencode/skills not found'));
        results.warnings++;
      } else {
        const skillDirs = fs.readdirSync(skillsDir).filter(d => 
          fs.statSync(path.join(skillsDir, d)).isDirectory()
        );
        let skillIssues = 0;

        for (const skillDir of skillDirs) {
          const skillFile = path.join(skillsDir, skillDir, 'SKILL.md');
          
          if (!fs.existsSync(skillFile)) {
            console.log(chalk.red('  ✗') + chalk.white(` ${skillDir}: missing SKILL.md`));
            skillIssues++;
            continue;
          }

          const content = fs.readFileSync(skillFile, 'utf-8');
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

          if (!frontmatterMatch) {
            console.log(chalk.red('  ✗') + chalk.white(` ${skillDir}: missing frontmatter`));
            skillIssues++;
            continue;
          }

          const frontmatter = frontmatterMatch[1];
          const fields = {};
          frontmatter.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              fields[match[1]] = match[2].trim();
            }
          });

          // Check name matches folder
          if (fields.name !== skillDir) {
            console.log(chalk.red('  ✗') + chalk.white(` ${skillDir}: name '${fields.name}' doesn't match folder`));
            skillIssues++;
          }

          // Check description
          if (!fields.description) {
            console.log(chalk.red('  ✗') + chalk.white(` ${skillDir}: missing description`));
            skillIssues++;
          } else if (!fields.description.startsWith('Use when')) {
            console.log(chalk.yellow('  ⚠') + chalk.white(` ${skillDir}: description should start with 'Use when'`));
            results.warnings++;
          }
        }

        if (skillIssues === 0) {
          console.log(chalk.green('  ✓') + chalk.white(` ${skillDirs.length} skills validated`));
          results.passed++;
        } else {
          results.errors += skillIssues;
        }
      }

      console.log('');
    }

    // Validate plugins
    if (validatePlugins) {
      console.log(chalk.white.bold('Plugins'));
      console.log('');

      const pluginsDir = '.opencode/plugins';
      if (!fs.existsSync(pluginsDir)) {
        console.log(chalk.yellow('  ⚠') + chalk.white(' .opencode/plugins not found'));
        results.warnings++;
      } else {
        const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.ts'));
        let pluginIssues = 0;

        for (const file of pluginFiles) {
          const filePath = path.join(pluginsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');

          // Check for export default
          if (!content.includes('export default')) {
            console.log(chalk.red('  ✗') + chalk.white(` ${file}: missing default export`));
            pluginIssues++;
          }

          // Check for satisfies Plugin
          if (!content.includes('satisfies Plugin')) {
            console.log(chalk.yellow('  ⚠') + chalk.white(` ${file}: missing 'satisfies Plugin' type assertion`));
            results.warnings++;
          }
        }

        if (pluginIssues === 0) {
          console.log(chalk.green('  ✓') + chalk.white(` ${pluginFiles.length} plugins validated`));
          results.passed++;
        } else {
          results.errors += pluginIssues;
        }
      }

      console.log('');
    }

    // Summary
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log('');

    if (results.errors === 0 && results.warnings === 0) {
      console.log(chalk.green.bold('  All validations passed! ✓'));
    } else if (results.errors === 0) {
      console.log(chalk.yellow.bold(`  ${results.passed} passed, ${results.warnings} warnings`));
      if (results.fixed > 0) {
        console.log(chalk.green(`  ${results.fixed} issues auto-fixed`));
      }
    } else {
      console.log(chalk.red.bold(`  ${results.passed} passed, ${results.warnings} warnings, ${results.errors} errors`));
      if (results.fixed > 0) {
        console.log(chalk.green(`  ${results.fixed} issues auto-fixed`));
      }
    }

    console.log('');

    process.exit(results.errors > 0 ? 1 : 0);
  });

module.exports = validateCommand;
