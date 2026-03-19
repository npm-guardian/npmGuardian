#!/usr/bin/env node

import { Command } from 'commander';
import { scanCommand } from './commands/scan';
import { treeCommand } from './commands/tree';
import { loginCommand } from './commands/login';

const program = new Command();

program
  .name('npm-guardian')
  .description('🛡️ Open Source npm Supply Chain Security Platform')
  .version('1.0.0');

// Register subcommands
program.addCommand(scanCommand);
program.addCommand(treeCommand);
program.addCommand(loginCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
