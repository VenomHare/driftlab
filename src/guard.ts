import { ArmorIQClient, ObservabilityConfig } from "@armoriq/sdk";
import { executeTool, type ToolArgs, type ToolName } from "./tools";

const apiKey = process.env.ARMORIQ_API_KEY;
if (!apiKey) {
  throw new Error("Missing ARMORIQ_API_KEY. Copy .env.example to .env and configure your ArmorIQ API key.");
}

export const armorClient = new ArmorIQClient({ apiKey });

export type GuardResult =
  | { status: "allowed"; tool: ToolName; result: unknown; reason?: string }
  | { status: "blocked"; tool: ToolName; reason: string };

export async function runWithArmorIQ(
  allowedPlan: Array<{ name: string; args: Record<string, unknown> }>,
  goal: string,
  tool: ToolName,
  args: ToolArgs
): Promise<GuardResult> {
  const mode = (process.env.ARMORIQ_MODE ?? "local") as "local" | "sdk" | "proxy";

  const apiKey = process.env.ARMORIQ_API_KEY!;
  const observability = {
    enabled: true,
    endpoint: process.env.BACKEND_ENDPOINT ?? 'https://api.armoriq.ai',
    apiKey,
    product: 'armoriq-sdk',
    maxBufferSize: 1000,
    flushIntervalMs: 5000,
    batchSize: 100,
    durable: false,
  } satisfies ObservabilityConfig;

  const session = armorClient.startSession({
    mode,
    defaultMcpName: "driftlab-mcp",
    observability
  });

  let token: unknown;
  try {
    token = await session.startPlan(allowedPlan, goal);
    const decision = await session.check(tool, args);

    if (!decision.allowed) {
      // Critical security boundary: do not call executeTool after a denial.
      await session.report(tool, args, { blocked: true, reason: decision.reason }, {
        status: "failed",
        errorMessage: decision.reason
      });
      await session.flushObservability();

      return { status: "blocked", tool, reason: decision.reason ?? "" };
    }

    const started = Date.now();
    try {
      const result = await executeTool(tool, args);
      await session.report(tool, args, result, {
        status: "success",
        durationMs: Date.now() - started
      });
      await session.flushObservability();

      return { status: "allowed", tool, result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await session.report(tool, args, { error: message }, {
        status: "failed",
        errorMessage: message,
        durationMs: Date.now() - started
      });
      await session.flushObservability();

      throw error;
    }

  } finally {
    // Session close releases SDK resources. The plan's token is not fabricated.
    await session.close();
    // The token is captured by startPlan for SDK lifecycle purposes; plan completion
    // is explicit in ArmorIQ's client API when a token/plan id is available.
    if (token && typeof token === "object" && "planId" in token) {
      await armorClient.completePlan((token as { planId: string }).planId).catch(() => { });
    }
  }
}
