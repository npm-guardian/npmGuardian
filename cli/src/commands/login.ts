import { Command } from 'commander';
import chalk from 'chalk';

export const loginCommand = new Command('login')
  .description('Authenticate the CLI using GitHub OAuth for higher rate limits')
  .action(() => {
    console.log(chalk.blue('Redirecting to OAuth Authorization...\n'));
    console.log(`Please visit: ${chalk.underline('http://localhost:3005/api/v1/auth/github/login')}`);
    console.log('\nOnce authenticated, run:');
    console.log(chalk.cyan('npm-guardian auth --token <API_TOKEN>'));
  });
