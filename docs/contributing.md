# npm-Guardian Contribution & Developer Guidelines

Welcome to the `npm-Guardian` open-source project! As a community-driven cybersecurity platform, we value your contributions to help secure the JavaScript supply chain.

## 1. Local Developer Setup

### Prerequisites
To run the full stack locally, you need:
- Node.js (v20+)
- Rust (latest stable) & Cargo
- Python (3.10+)
- Docker & Docker Compose (for Redis and Sandbox only)
- A free [Supabase](https://supabase.com) project (replaces self-hosted PostgreSQL)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/npm-guardian.git
   cd npm-guardian
   ```
2. Install dependencies via workspace:
   ```bash
   npm install
   ```
3. Set up Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Run `backend/supabase_schema.sql` in the Supabase SQL Editor
   - Copy `backend/.env.example` to `backend/.env` and fill in your Supabase URL and keys
4. Boot Redis via Docker Compose:
   ```bash
   cd docker
   docker-compose up -d redis
   ```
5. Start the Turborepo development pipeline:
   ```bash
   npm run dev
   ```

## 2. Architecture & Tech Debt Policy
- Ensure all Node.js and Next.js code is written in **Strict TypeScript**.
- Add unit tests for every new API endpoint or Rust scanning rule.
- Do not store any plaintext Github/Gitlab OAuth secrets. They must be loaded via `.env` files.

## 3. Creating a Pull Request
1. Fork the repository and create a feature branch (`git checkout -b feature/awesome-detection`).
2. Write tests covering your feature.
3. Make sure all linters pass (`npm run lint`, `cargo fmt`, `cargo clippy`).
4. Submit the PR with a detailed description of the threat vector your update solves or the performance it improves.

## 4. Submitting Malware Samples
If you discover a novel piece of obfuscated npm malware that our engine completely misses:
1. Do **not** upload the malicious package to GitHub directly.
2. Open an Issue with the tag `malware-sample`.
3. Provide the SHA-256 hash, the package name, and the version. Our AI researchers will safely acquire the package and update the PyTorch heuristics.

## 5. Security Vulnerability in npm-Guardian
If you find a security vulnerability within `npm-Guardian` itself (e.g., a sandbox escape zero-day), **DO NOT create a public issue**.
Please email us securely at `security@npm-guardian.io`. We will establish a secure transmission channel for the proof-of-concept.
