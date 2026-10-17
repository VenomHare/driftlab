# DriftLab

**See what changes when an AI agent’s tool calls are checked before they run.** DriftLab is an interactive security demo that compares an unprotected agent workflow with one guarded by ArmorIQ.

## Live demo

- **App:** [driftlab-pages.pages.dev](https://driftlab-pages.pages.dev/)
- **API:** [driftlab-api.sarthakkadam147.workers.dev](https://driftlab-api.sarthakkadam147.workers.dev/)
- **MCP endpoint:** [driftlab-mcp.sarthakkadam147.workers.dev/mcp](https://driftlab-mcp.sarthakkadam147.workers.dev/mcp)

Open the app, choose a workflow and model provider, then run both paths to compare their results. Select graph nodes to inspect prompts, tool calls, and outputs. The sandbox view shows the files available to the selected workflow.

## What it demonstrates

DriftLab runs the same workflow in two modes:

1. **Unprotected:** the model can request tools directly through the MCP server.
2. **ArmorIQ-protected:** the API checks the planned tool calls against ArmorIQ policy before forwarding them to MCP.

The demo makes policy decisions visible in the workflow graph and event log. For the sample workflow, reading an allowed file succeeds while attempts to read a secret, send email, or export CRM data are blocked in the protected run. The unprotected run illustrates what those tool calls can do without the policy check.

All sample data is fictional. Email and other external actions are simulated; email writes to a test outbox and is not delivered.

## Architecture

```text
Browser (React + Vite)
  └─ Cloudflare Pages
       └─ API (Hono Worker, streaming events, ArmorIQ policy checks)
            ├─ MCP server (Hono Worker, tool execution)
            └─ Cloudflare D1 (workflow files and execution records)
```

The frontend streams workflow progress from the API over server-sent events. The API coordinates model requests, optional ArmorIQ checks, and MCP tool calls. The API and MCP workers use D1 for the demo sandbox and records.

| Directory | Contents |
|---|---|
| `frontend/` | React and Vite application, deployed to Cloudflare Pages |
| `backend/` | Hono API Worker and D1 migrations |
| `mcp/` | Hono MCP Worker and D1 migrations |

## Run locally

Requirements: [Bun](https://bun.sh/), a Cloudflare account with access to the configured D1 database, and Wrangler authentication. The Workers use remote D1 bindings; configure your database IDs in both Worker configurations before applying migrations.

Install each package’s dependencies from the repository root:

```bash
bun install --cwd frontend
bun install --cwd backend
bun install --cwd mcp
```

For model access, copy `backend/.env.example` to `backend/.dev.vars` and add credentials for a supported provider. Protected runs also require ArmorIQ credentials and identity values (`ARMORIQ_API_KEY`, `ARMORIQ_USER_ID`, `ARMORIQ_USER_EMAIL`, `ARMORIQ_AGENT_ID`, and `ARMORIQ_MCP_NAME`). Configure the corresponding agent, MCP identity, and policies in ArmorIQ. Keep secrets private and do not commit `.dev.vars`.

Authenticate and apply the D1 migrations to both Worker bindings:

```bash
wrangler login
bun run --cwd backend migrate:remote
bun run --cwd mcp migrate:remote
```

Start the API, MCP server, and frontend in separate terminals from the repository root:

```bash
bun run dev:backend
bun run dev:mcp
bun run dev:frontend
```

Open the Vite address printed in the frontend terminal, usually `http://localhost:5173`. In development, the frontend uses the API at `http://localhost:8788` by default. Set `VITE_API_BASE_URL` to use a different API address.

## Deployment

The live application is deployed at the URLs listed above. To deploy your own instance, configure the Cloudflare D1 bindings and required secrets in the Wrangler files, then deploy the Workers and Pages app:

```bash
bun run --cwd backend deploy
bun run --cwd mcp deploy
bun run --cwd frontend build:prod
bun run --cwd frontend deploy
```

`build:prod` points the frontend at the DriftLab API URL. Set `VITE_API_BASE_URL` to your API Worker URL when deploying a separate instance. Protected workflows require valid ArmorIQ configuration; the unprotected demo path requires a configured model provider.

## Tech stack

- React, Vite, and TypeScript
- Cloudflare Pages and Workers
- Hono, server-sent events, and the MCP protocol
- Cloudflare D1
- ArmorIQ policy checks for protected tool execution
