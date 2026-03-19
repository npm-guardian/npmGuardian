# npm-Guardian Codebase Structure

The npm-Guardian platform is maintained as a monorepo utilizing npm Workspaces or Turborepo to manage dependencies across services written in Next.js, Node.js, Rust, and Python.

## Monorepo Layout

```text
npm-guardian/
├── ai-detection/          # Python 3.10+ (PyTorch, scikit-learn)
│   ├── models/            # Pre-trained models for obfuscation GNNs
│   ├── trainers/          # Scripts to fine-tune AI on new malware
│   ├── api/               # FastAPI layer to interface with Node backend
│   └── requirements.txt
├── backend/               # Node.js 20+ (TypeScript, Express)
│   ├── src/
│   │   ├── api/           # REST Controllers and Routes
│   │   ├── services/      # Business logic (Scan orchestration, OAuth)
│   │   ├── db/            # TypeORM or Prisma schemas and migrations
│   │   └── workers/       # BullMQ Bull queues for background tasks
│   ├── package.json
│   └── tsconfig.json
├── cli/                   # Node.js (TypeScript, Commander.js)
│   ├── src/
│   │   ├── commands/      # CLI sub-commands (scan, tree, login)
│   │   ├── utils/         # Local lockfile parsing logic
│   │   └── index.ts       # Entry point
│   └── package.json
├── docker/                # Behavioral Sandbox Environment
│   ├── sandbox/           # Ephemeral Alpine/Node images
│   ├── monitor/           # eBPF / Sysdig tracing scripts
│   └── docker-compose.yml # Local development orchestration
├── docs/                  # Platform documentation (You are here)
│   ├── architecture.md
│   ├── api-specification.md
│   ├── database-schema.md
│   └── ...
├── frontend/              # Next.js 14+ (App Router, TailwindCSS)
│   ├── src/
│   │   ├── app/           # Pages and routing
│   │   ├── components/    # Reusable UI (Dependency Graphs, Risk Cards)
│   │   └── lib/           # Utility functions and API clients
│   └── package.json
├── scanner-engine/        # Rust (High Performance AST & Graph parsing)
│   ├── src/
│   │   ├── ast_visitor/   # SWC-based tree parsing finding eval/exec calls
│   │   ├── deps_graph/    # Lockfile resolver
│   │   └── lib.rs         # FFI bindings or HTTP server interface
│   └── Cargo.toml
├── .github/               # CI/CD and Issue Templates
│   └── workflows/
├── turbo.json             # Turborepo configuration
├── package.json           # Root workspace config
└── README.md
```

## Service Communication
- `frontend` talks strictly to `backend`.
- `backend` manages the Postgres DB.
- `backend` calls `scanner-engine` via HTTP or gRPC for immediate static analysis.
- `backend` places heavy behavioral jobs into Redis, picked up by the `docker` worker node.
- `backend` queries the `ai-detection` microservice for probability scoring on obfuscated snippets.
