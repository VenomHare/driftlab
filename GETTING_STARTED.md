# Getting Started

## Try the deployed app

1. Open the [DriftLab Pages site](https://driftlab-pages.pages.dev). If the deployment uses a custom domain, use that URL instead.
2. Choose a workflow from **Workflow**.
3. Choose a configured model provider. OpenRouter is selected by default and uses `openrouter/free`.
4. Click **Execute both** to run the workflow without protection and with ArmorIQ protection. You can also run either path on its own.
5. Compare the graph and event log. Select a node to inspect its prompt, tool call, or result. **View Sandbox** shows the files available to the selected workflow.

The deployed backend must have ArmorIQ credentials, identities, and policies configured for protected runs. The toolbar shows **ArmorIQ missing** if it is not configured.

The sample workflows and data are demonstrations. Email and other external actions are simulated.

## Run locally with your own provider key and ArmorIQ

You need Bun, Wrangler, and access to the configured Cloudflare D1 database. The Workers use a remote D1 binding; use your own database by updating the database IDs in both Worker configs.

1. Install dependencies from the repository root:

   ```bash
   bun install --cwd frontend
   bun install --cwd backend
   bun install --cwd mcp
   ```

2. Create the backend's local environment file from its example. Add a model provider key and the ArmorIQ values for your account:

   ```dotenv
   # backend/.dev.vars
   OPENROUTER_API_KEY=your-openrouter-api-key
   ARMORIQ_API_KEY=your-armoriq-api-key
   ARMORIQ_USER_ID=your-armoriq-user-id
   ARMORIQ_USER_EMAIL=your-authorized-user-email
   ARMORIQ_AGENT_ID=your-configured-agent-id
   ARMORIQ_MCP_NAME=your-configured-mcp-name
   ```

   Start from the full template with `cp backend/.env.example backend/.dev.vars`.

   The app uses OpenRouter's `openrouter/free` model by default. You can also add `GEMINI_API_KEY` or `GROQ_API_KEY` and select that provider in the UI. In the ArmorIQ dashboard, configure an agent and MCP matching the IDs above and attach policies for the tools. Protected runs fail closed if ArmorIQ is missing or its policy check fails. Keep this file private; do not commit keys.

3. Authenticate Wrangler and apply the D1 migrations to the API and MCP bindings:

   ```bash
   wrangler login
   bun run --cwd backend migrate:remote
   bun run --cwd mcp migrate:remote
   ```

4. Start each service in a separate terminal from the repository root:

   ```bash
   bun run dev:mcp
   ```

   ```bash
   bun run dev:backend
   ```

   ```bash
   bun run dev:frontend
   ```

5. Open the Vite URL, usually `http://localhost:5173`. The frontend defaults to the local API at `http://localhost:8788`. To override it, copy `frontend/.env.example` to `frontend/.env` and edit `VITE_API_BASE_URL`.
6. Select the provider with a key configured in `backend/.dev.vars`; its status should show **configured** before you run a workflow. Baseline runs only require the model provider; protected runs also require a configured ArmorIQ session and live policies.

For a deployed backend, set the same values as Worker secrets (or non-secret vars) before deploying. The protected workflow needs `ARMORIQ_API_KEY`, `ARMORIQ_USER_ID`, `ARMORIQ_USER_EMAIL`, `ARMORIQ_AGENT_ID`, and `ARMORIQ_MCP_NAME`.

Local Ollama is available in development. It is hidden for production builds and when `ENV=prod` is set for the frontend build.
