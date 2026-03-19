# npm-Guardian CLI Design

The `npm-guardian` CLI is a Node.js-based command-line interface tool that developers can use locally on their machines or directly integrate into CI/CD pipelines to audit dependencies before deployment.

## Installation

```bash
npm install -g npm-guardian
# or use via npx
npx npm-guardian scan .
```

## Authentication
To use advanced features and increase rate limits, you must authenticate the CLI.

```bash
npm-guardian login
```
*This command will open a browser window to complete the OAuth flow.*

```bash
npm-guardian auth --token <API_TOKEN>
```
*For headless CI/CD environments.*

---

## Commands

### 1. Local Project Scan
Scans the local repository by locally analyzing `package.json`, `package-lock.json`, `yarn.lock`, etc., and cross-referencing against the npm-Guardian Threat DB.

```bash
npm-guardian scan .
```
**Options:**
- `--fail-on-high-risk` : Exit with a non-zero code (`exit 1`) if high-risk packages are found (Perfect for CI/CD bridging).
- `--fail-on-medium-risk` : Stricter policy enforcing medium risks.
- `--format json` : Output the report in JSON format instead of human-readable text.

### 2. Individual Package Scan
Audits a single npm package before you install it to ensure it is safe.

```bash
npm-guardian scan <package_name>
```

**Example output:**
```
$ npm-guardian scan suspicious-utils
[+] Fetching package metadata for suspicious-utils...
[+] Analyzing dependency tree...
[+] Retrieving threat intelligence from npm-Guardian Engine...

🚨 HIGH RISK DETECTED 🚨
Package: suspicious-utils
Risk Score: 85/100

Detected Issues:
- [CRITICAL] postinstall script executes hidden shell commands.
- [HIGH] Source code contains high-entropy base64 obfuscation mapped to an eval() function.
- [MEDIUM] Suspicious maintainer change registered 2 hours ago.

Recommendation: DO NOT INSTALL.
```

### 3. Dependency Graph Visualization
Outputs a risk-colored dependency tree to the terminal.

```bash
npm-guardian tree
```
This maps the deep nested layers of dependencies pointing out exactly *where* the malicious package is inherited.

```
project-root
 └─┬ web3@1.0.0
   └─┬ utils-library@2.1.0
     └── [🚨 HIGH RISK] malicious-package@0.0.1
```

## Behind the Scenes
When a developer runs `npm-guardian scan .`:
1. The CLI parses the lockfile locally to extract the flattened dependency tree.
2. It hashes the tree and bulk-queries `GET /api/packages/risk/{package_name}`.
3. Rapid results are returned from the Redis cache on the server.
4. If a previously unknown package is found, the CLI requests a deep scan (`POST /api/scan/package`) and streams the server's analysis status to the terminal.
