# DriftLab

DriftLab is a small security demo for AI agents.

It shows the same prompt moving through two agent loops:

1. **Without ArmorIQ** — the LLM can call MCP tools directly.
2. **With ArmorIQ** — ArmorIQ checks the tool plan before MCP can run a tool.

The canvas shows:

```text
Prompt → LLM → MCP → tools → Output → LLM
```

The protected loop adds ArmorIQ between the LLM and MCP.

All demo data is fictional. The email tool writes to a test outbox. It does not send real email.

## Project layout

| Path | Purpose |
|---|---|
| `frontend/` | React + Vite Pages frontend, with its own package/config |
| `backend/` | Hono API Worker, with its own package/config |
| `mcp/` | Hono MCP Worker, with its own package/config |
| `backend/migrations/` | Cloudflare D1 schema |
| `frontend/wrangler.toml` | Pages configuration |
| `backend/wrangler.toml` | API Worker configuration |
| `mcp/wrangler.toml` | MCP Worker configuration |

Each package owns its readable source, config, and dependencies. Generated bundles stay inside the package `dist/` directories and should not be edited directly.

## Install

```bash
cd frontend && bun install
cd ../backend && bun install
cd ../mcp && bun install
```

Wrangler can be installed globally, or run from the local dependency:

```bash
wrangler --version
```

## Run locally with React, Vite, and Workers

Use three terminals.

### 1. Start the API Worker

```bash
bun run dev:backend
```

The API Worker runs at `http://localhost:8788`.

For local LLM calls, put `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` in `backend/.env.dev`. The backend dev script starts Wrangler with `--env dev`, so this file is loaded by the API Worker. The key is read only by the API Worker and must not be committed.

### 2. Start the MCP Worker

```bash
bun run dev:mcp
```

The MCP Worker runs at `http://localhost:8787`.

### 3. Start the React frontend

The frontend defaults to the local API Worker at `http://localhost:8788` during Vite development:

```bash
bun run dev:frontend
```

If the API Worker uses another port, override it with `VITE_API_BASE_URL`.

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## What happens when you click “Execute workflow”

1. React opens an `EventSource` connection to `GET /api/demo/run-stream`.
2. The Hono API Worker starts the demo run.
3. The Worker sends `event: step` messages as each node runs.
4. React updates each matching node:
   - yellow: running
   - green: allowed or successful
   - red: blocked or unsafe
5. The unprotected loop sends tool calls through MCP without a policy check. The secret, email, and CRM actions reach their handlers.
6. The protected loop sends the same attempts through ArmorIQ:
   - `read_file` is allowed
   - `read_secret` is blocked
   - `email_send` is blocked
   - `crm_export` is blocked
7. The Worker writes the execution record to D1.
8. The Worker sends `event: complete`. React updates the execution bar and closes the stream.

The API also keeps `POST /api/demo/run` for non-streaming clients.

## D1 setup

Create the database once:

```bash
wrangler d1 create driftlab
```

Copy the returned database ID into both `backend/wrangler.toml` and `mcp/wrangler.toml`.

Local backend and MCP development both connect to this remote D1 database. Authenticate with Wrangler, then apply migrations to both Worker bindings:

```bash
bun run --cwd backend migrate:remote
bun run --cwd mcp migrate:remote
```

The schema stores execution records and MCP tool-call records.

The MCP tools use D1 as the Cloudflare-compatible sandbox. Migration `0002_seed_worker_sandbox.sql` creates the initial sandbox files, a demo secret, an email outbox, and CRM contacts. Migration `0003_workflow_sandbox_files.sql` scopes files by workflow and adds each workflow's sample files. The View Sandbox drawer lists and reads files through the API Worker; the selected workflow ID is part of every query, so another workflow's files are not returned. The MCP `read_file` tool uses that same workflow scope. Files live in D1 rather than a Worker filesystem, which a deployed Worker cannot browse.

Apply migration `0003_workflow_sandbox_files.sql` to both Worker bindings using the remote migration commands above before using the drawer or `read_file` tool. Local development writes to the shared remote database, so its changes persist there.

After changing a migration, apply it to both Worker bindings:

```bash
bun run --cwd backend migrate:remote
bun run --cwd mcp migrate:remote
```

## Deploy to Cloudflare

```bash
wrangler login
wrangler deploy --config backend/wrangler.toml
wrangler deploy --config mcp/wrangler.toml
```

Build and deploy the Pages frontend with the deployed API URL:

```bash
VITE_API_BASE_URL=https://driftlab-api.<your-subdomain>.workers.dev bun run build
wrangler pages deploy frontend/dist --project-name driftlab-pages
```

For Git-connected Pages use:

```text
Build command: bun run build
Build output directory: frontend/dist
Environment variable: VITE_API_BASE_URL=<deployed API Worker URL>
```

Set the model and ArmorIQ Worker secrets before deploying. The protected workflow also needs the ArmorIQ user, agent, and MCP identity values configured in the ArmorIQ dashboard:

```bash
wrangler secret put OPENAI_API_KEY --config backend/wrangler.toml
wrangler secret put OPENROUTER_API_KEY --config backend/wrangler.toml
wrangler secret put ARMORIQ_API_KEY --config backend/wrangler.toml
wrangler secret put ARMORIQ_USER_ID --config backend/wrangler.toml
wrangler secret put ARMORIQ_USER_EMAIL --config backend/wrangler.toml
wrangler secret put ARMORIQ_AGENT_ID --config backend/wrangler.toml
wrangler secret put ARMORIQ_MCP_NAME --config backend/wrangler.toml
```

The API Worker is configured for Groq with `OPENAI_BASE_URL=https://api.groq.com/openai/v1` and `OPENAI_MODEL=qwen/qwen3.8-27b`.

## Checks

```bash
bun run typecheck
bun run build
```

`bun run build` creates the React/Vite bundle in `frontend/dist`.

The Cloudflare Worker implementation is the only backend path. It uses Hono, SSE, and D1.
