#!/usr/bin/env node

'use strict';

const { Command } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('oh-see-flow')
  .description('Custom workflow configuration for opencode')
  .version(packageJson.version, '-v, --version', 'Display version number');

// Import commands
const installCommand = require('../src/commands/install');
const doctorCommand = require('../src/commands/doctor');
const validateCommand = require('../src/commands/validate');

// Register commands
program.addCommand(installCommand);
program.addCommand(doctorCommand);
program.addCommand(validateCommand);

// Help
program
  .command('help')
  .description('Display help information')
  .action(() => {
    console.log('');
    console.log(chalk.cyan('╔═══════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.white.bold('        oh-see-flow                   '));
    console.log(chalk.cyan('║') + chalk.gray('    pronounced: oh-see-flow             '));
    console.log(chalk.cyan('╚═══════════════════════════════════════╝'));
    console.log('');
    program.help();
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  console.log('');
  console.log(chalk.cyan('╔═══════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.white.bold('        oh-see-flow                   '));
  console.log(chalk.cyan('║') + chalk.gray('    pronounced: oh-see-flow             '));
  console.log(chalk.cyan('║') + chalk.gray('    Custom workflow for opencode        '));
  console.log(chalk.cyan('╚═══════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.white('Usage:'));
  console.log(chalk.gray('  $ oh-see-flow <command>'));
  console.log('');
  console.log(chalk.white('Commands:'));
  console.log(chalk.gray('  install    Install oh-see-flow to current project or globally'));
  console.log(chalk.gray('  doctor     Run health checks on your installation'));
  console.log(chalk.gray('  validate   Validate configuration files'));
  console.log('');
  console.log(chalk.white('Options:'));
  console.log(chalk.gray('  -v, --version  Display version number'));
  console.log(chalk.gray('  -h, --help     Display help'));
  console.log('');
}
