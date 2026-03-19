# npm-Guardian Security Detection Algorithms

The platform employs a multi-tiered security pipeline to detect various stages of Remote Code Execution (RCE), Obfuscation, and Supply Chain threats.

## 1. Metadata & Threat Intelligence (Heuristics Layer)
Calculates a baseline trust score based on the npm registry metadata.

**Indicators of Compromise (IoCs):**
- Account takeover behavior: A package changes maintainers after 2+ years of dormancy.
- Publish velocity anomaly: A package receives 10 patch versions in a single hour.
- Brandjacking/Typosquatting: Levenshtein distance calculation between the target package and the top 1000 npm libraries (e.g., `reqeust` vs `request`).

## 2. Static Application Security Testing (Rust AST Engine)
The Rust engine parses JavaScript/TypeScript files into an Abstract Syntax Tree (AST) using `swc`. It prevents regex-bypass attacks by understanding actual code structure.

**Detection Rules:**
- `Sink Detection`: Locates variables mapped to dangerous sinks (`eval()`, `Function()`, `child_process.exec()`, `vm.runInContext()`).
- `Exfiltration Detection`: Scans for unexpected network usages (e.g., `http.get`, `fetch` transmitting `process.env`).
- `Install Script Abuse`: Heavily scrutinizes `scripts.postinstall` or `scripts.preinstall` in `package.json` for bash commands passing to `/dev/tcp`, `curl | bash`, etc.

## 3. Obfuscation & Entropy Analysis (Python AI Layer)
Attackers hide payloads using encryption, packed arrays, or string splitting.

**Algorithms Used:**
1. **Shannon Entropy Calculation**: Measures the randomness of strings. A randomly generated base64 string exhibits much higher entropy than normal English variable names.
2. **Abstract Syntax Tree GNN (Graph Neural Network)**:
   - Converts the AST structure into a graph.
   - A trained PyTorch model evaluates the topological structure to identify "packer" or "decrypter" stub signatures, even if the specific variable names are randomized.
3. **Hex/Base64 Heuristics**: Detects sequences consisting purely of hexadecimal values mapped to mathematical operations (e.g., `_0x1a2b * 0x3`).

## 4. Behavioral Sandbox (Dynamic Execution)
The package is installed dynamically inside an isolated Docker container configured with restricted Kernel capabilities.

**Runtime Monitoring via eBPF:**
- **Filesystem Constraints**: Alerts on any write attempt outside the package's working directory (`/home/node/app`). Prevents modifications to `/etc/shadow`, `~/.ssh/authorized_keys`, or `/etc/hosts`.
- **Network Profiling**: Logs and blocks unapproved egress traffic. If a `postinstall` script attempts DNS queries to known malicious C2 (Command and Control) domains, it triggers a Critical Risk flag.
- **Process Trees**: Detects if Node.js heavily forks child processes or drops into bash/sh unexpectedly.

## 5. Dependency Graph Resolution
If an application imports a benign library `X`, and `X` imports `Y`, and `Y` imports a malicious package `Z`, the system flags the entire chain.
The Rust engine constructs a directed acyclic graph (DAG) and recursively aggregates the maximum risk score of all child nodes up to the root project.
