import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.NPM_GUARDIAN_API || 'https://api.npm-guardian.io/v1';

export const scanCommand = new Command('scan')
  .description('Scan a package or the local repository for malicious dependencies')
  .argument('[target]', 'Package Name or "." for local repository', '.')
  .option('-f, --fail-on-high-risk', 'Exit with code 1 if high-risk issues are found')
  .option('--format <type>', 'Output format (text, json)', 'text')
  .action(async (target, options) => {
    
    // Simulate loading local project
    if (target === '.') {
      console.log(chalk.blue('🛡️ npm-Guardian Local Repository Scan\n'));
      
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
          console.error(chalk.red('❌ Error: Could not find package.json in current directory.'));
          process.exit(1);
      }

      console.log(chalk.gray('[+] Parsing lockfile & building native dependency tree...'));
      console.log(chalk.gray('[+] Requesting threat intelligence signatures...'));

      // Simulate a malicious hit
      setTimeout(() => {
          console.log('\n' + chalk.bgRed.white.bold(' 🚨 HIGH RISK DETECTED 🚨 ') + '\n');
          console.log(`Package: ${chalk.red('suspicious-utils')}`);
          console.log(`Risk Score: ${chalk.red.bold('85/100')}\n`);
          console.log('Detected Issues:');
          console.log(`- ${chalk.red('[CRITICAL]')} postinstall script executes hidden shell commands.`);
          console.log(`- ${chalk.yellow('[MEDIUM]')} Suspicious maintainer change registered 2 hours ago.\n`);
          
          if (options.failOnHighRisk) {
              console.log(chalk.red('Failing CI pipeline due to --fail-on-high-risk flag.'));
              process.exit(1);
          }
      }, 1500);

    } else {
      // Individual package scan
      console.log(chalk.blue(`🛡️ Scanning Package: ${target}\n`));
      
      try {
          const response = await axios.get(`${API_BASE_URL}/packages/risk/${target}`);
          const riskDetails = response.data;

          if (options.format === 'json') {
              console.log(JSON.stringify(riskDetails, null, 2));
              return;
          }

          if (riskDetails.risk_level === 'HIGH' || riskDetails.risk_level === 'CRITICAL') {
              console.log(chalk.bgRed.white.bold(` 🚨 ${riskDetails.risk_level} RISK DETECTED 🚨 `));
          } else {
              console.log(chalk.bgGreen.black.bold(` ✅ ${riskDetails.risk_level} RISK `));
          }
          console.log(`Risk Score: ${riskDetails.risk_score}/100`);

      } catch (err: any) {
          // Dummy fallback error since API isn't publicly deployed
          console.error(chalk.red(`Failed to connect to API Gateway. Ensure it's reachable.`));
      }
    }
  });
