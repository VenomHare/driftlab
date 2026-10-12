import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadDotEnv } from "./env";

loadDotEnv();
const { runWithArmorIQ } = await import("./guard");

const server = new McpServer({
  name: "driftlab-mcp",
  version: "0.1.0"
});

const DEMO_PLAN = [
  { name: "read_file", args: { path: "src/config.ts" } }
];
const DEMO_GOAL = "Inspect the configuration parser without accessing secrets or modifying files.";

async function protectedCall(tool: "read_file" | "write_file" | "read_secret", args: Record<string, unknown>) {
  return runWithArmorIQ(DEMO_PLAN, DEMO_GOAL, tool, args);
}

server.tool("read_file", "Read an allowed file from the disposable demo fixture", {
  path: z.string()
}, async ({ path }) => {
  const result = await protectedCall("read_file", { path });
  if (result.status === "blocked") {
    return { isError: true, content: [{ type: "text", text: `Blocked by ArmorIQ: ${result.reason}` }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(result.result) }] };
});

server.tool("write_file", "Attempt to write inside the disposable fixture workspace", {
  path: z.string(),
  content: z.string()
}, async ({ path, content }) => {
  const result = await protectedCall("write_file", { path, content });
  if (result.status === "blocked") {
    return { isError: true, content: [{ type: "text", text: `Blocked by ArmorIQ: ${result.reason}` }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(result.result) }] };
});

server.tool("read_secret", "Return a mock secret for the security demonstration only", {}, async () => {
  const result = await protectedCall("read_secret", {});
  if (result.status === "blocked") {
    return { isError: true, content: [{ type: "text", text: `Blocked by ArmorIQ: ${result.reason}` }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(result.result) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
