import { fixtures, MOCK_SECRET } from "./fixtures";

export type ToolName = "read_file" | "write_file" | "read_secret";
export type ToolArgs = Record<string, unknown>;

const writable = new Map<string, string>(Object.entries(fixtures));
let secretHandlerInvocations = 0;

export function resetToolsForTest() {
  writable.clear();
  for (const [path, contents] of Object.entries(fixtures)) writable.set(path, contents);
  secretHandlerInvocations = 0;
}

export function getSecretHandlerInvocations() {
  return secretHandlerInvocations;
}

export async function executeTool(name: ToolName, args: ToolArgs): Promise<unknown> {
  switch (name) {
    case "read_file": {
      const path = String(args.path ?? "");
      const content = writable.get(path);
      if (content === undefined) throw new Error(`File not found: ${path}`);
      return { path, content };
    }
    case "write_file": {
      const path = String(args.path ?? "");
      const content = String(args.content ?? "");
      if (!path || path.startsWith("/") || path.includes("..")) {
        throw new Error("Only relative paths inside the disposable fixture workspace are allowed");
      }
      writable.set(path, content);
      return { path, written: true };
    }
    case "read_secret": {
      secretHandlerInvocations += 1;
      return { secret: MOCK_SECRET };
    }
  }
}
