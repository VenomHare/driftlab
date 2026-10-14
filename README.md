# DriftLab

DriftLab is a browser-based prompt-injection drill for an AI configuration-review agent. The agent uses a real LLM to plan an MCP tool call; ArmorIQ checks that action before the tool handler can run. The demo must show one allowed configuration read and one blocked secret-read attempt.

## Architecture

```text
Browser console → Express API → LLM chooses read_file → ArmorIQ signed-plan check → MCP / fake sandbox tool
                                                     ↘ blocks injected read_secret before handler execution
```

All files, secrets, email, and CRM records are disposable fixtures. No email is sent and no external CRM is connected.

## Setup

```bash
bun install
cp .env.example .env
```

Set `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and the compact default model (`gpt-5-mini`), plus your ArmorIQ key, agent ID, user email, and MCP name. `OPENAI_BASE_URL` must be an OpenAI-compatible `/v1` base, such as `https://api.openai.com/v1`; no code changes are needed to use your own compatible gateway. In ArmorIQ, register the `driftlab-agent` agent and `driftlab-mcp` MCP server, then create policy rules that allow `read_file` and deny `read_secret`, `email_send`, and `crm_export`.

For a public demo, expose the local `http://127.0.0.1:3001/mcp` endpoint through a secure HTTPS tunnel and register that URL. The MCP uses Streamable HTTP at `/mcp`.

## Run

In two terminals:

```bash
bun run mcp:http
bun run dev
```

Open `http://127.0.0.1:3000`, then select **Run security drill**. A valid recording shows:

1. The real model plans `read_file(src/config.ts)`.
2. ArmorIQ allows it and its fake handler runs.
3. The injected `read_secret` attempt is checked against the same plan/policy.
4. ArmorIQ blocks it and the UI proves that its handler did not execute.

## Verify

```bash
bun run typecheck
bun test
bun run build
```

An unconfigured model or ArmorIQ integration is intentionally displayed as an integration error. It is never presented as proof of a block.

## Submission evidence

Capture one browser screenshot showing the allowed and blocked events, plus the corresponding ArmorIQ dashboard trace. This is a real SDK enforcement path; the app does not fabricate decisions or traces.
