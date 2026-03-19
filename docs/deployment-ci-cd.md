# npm-Guardian Deployment & CI/CD Architecture

This guide covers how to deploy the npm-Guardian platform for production and how users integrate npm-Guardian into their own CI/CD pipelines.

## 1. Platform Deployment Architecture
The platform is designed to scale horizontally using Kubernetes (K8s).

### Kubernetes Configuration
- **API Gateway (Ingress)**: Handles SSL termination and routes traffic to the Node.js backend replicas.
- **Frontend Pods**: Next.js instances running behind a CDN caching layer.
- **Scanner Engine & AI Pods**: Computationally heavy microservices separated via node-selectors to specialized high-CPU node pools.
- **Sandbox Environment**: Security requires strict isolation. Kubernetes `RuntimeClass` utilizing **gVisor** or **Kata Containers** should be used for the behavioral sandbox pods to prevent container escape exploits.

### Infrastructure as Code (Terraform)
The repository (in a future iteration) will provide Terraform scripts to spin up:
- Managed PostgreSQL (AWS RDS / GCP Cloud SQL).
- Managed Redis (AWS ElastiCache / GCP MemoryStore).
- EKS/GKE Kubernetes clusters.

## 2. End-User CI/CD Integration
Developers can secure their repositories by integrating the CLI into GitHub Actions or GitLab CI.

### GitHub Actions Integration

Create a workflow file in `.github/workflows/npm-guardian.yml`:

```yaml
name: npm-Guardian Security Scan

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci

      - name: Install npm-guardian
        run: npm install -g npm-guardian
        
      - name: Run Guardian Supply Chain Scan
        env:
          NPM_GUARDIAN_TOKEN: ${{ secrets.NPM_GUARDIAN_TOKEN }}
        run: |
          npm-guardian scan . --fail-on-high-risk --format json > security-report.json
          
      - name: Archive Security Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: npm-guardian-report
          path: security-report.json
```

### Gitlab CI Integration
Place this in `.gitlab-ci.yml`:

```yaml
npm-guardian-scan:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm install -g npm-guardian
    - npm-guardian scan . --fail-on-high-risk
  artifacts:
    when: always
    paths:
      - npm-guardian-report.json
```

### Risk Enforcement Policies
The `--fail-on-high-risk` flag ensures that if any developer imports a new dependency that resolves to a known malicious package, the pipeline instantly fails, preventing supply chain attacks from reaching the production deployment.
