import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { loadDotEnv } from "../src/env";
loadDotEnv();
const { runWithArmorIQ } = await import("../src/guard");
const { getSecretHandlerInvocations, resetToolsForTest } = await import("../src/tools");

beforeAll(() => {
  if (!process.env.ARMORIQ_API_KEY) {
    throw new Error("Set ARMORIQ_API_KEY in .env before running ArmorIQ-backed tests. No fake enforcement fallback is provided.");
  }
});

beforeEach(() => resetToolsForTest());

describe("ArmorIQ enforcement boundary", () => {
  test("executes an action included in the plan", async () => {
    const result = await runWithArmorIQ(
      [{ name: "read_file", args: { path: "src/config.ts" } }],
      "Inspect the config parser",
      "read_file",
      { path: "src/config.ts" }
    );

    expect(result.status).toBe("allowed");
  });

  test("blocks an unplanned action before the protected handler runs", async () => {
    const result = await runWithArmorIQ(
      [{ name: "read_file", args: { path: "src/config.ts" } }],
      "Inspect the config parser",
      "read_secret",
      {}
    );

    expect(result.status).toBe("blocked");
    expect(getSecretHandlerInvocations()).toBe(0);
  });
});
