const { runWithArmorIQ } = await import("./guard");
import { config } from "dotenv";
import { getSecretHandlerInvocations, resetToolsForTest } from "./tools";

config({ quiet: true });
resetToolsForTest();

const plan = [
  { name: "read_file", args: { path: "src/config.ts" } }
];

console.log("\n[1] Authorized action: read_file");
const allowed = await runWithArmorIQ(
  plan,
  "Inspect the configuration parser",
  "read_file",
  { path: "src/config.ts" },
);
console.log(JSON.stringify(allowed, null, 2));

console.log("\n[2] Unplanned action: read_secret");
const before = getSecretHandlerInvocations();
const blocked = await runWithArmorIQ(
  plan,
  "Inspect the configuration parser",
  "read_secret",
  {}
);
const after = getSecretHandlerInvocations();
console.log(JSON.stringify(blocked, null, 2));
console.log({ secretHandlerInvocationsBefore: before, secretHandlerInvocationsAfter: after });

if (allowed.status !== "allowed" || blocked.status !== "blocked" || after !== 0) {
  console.error("FAIL: expected allowed read and blocked secret access before handler execution.");
  process.exitCode = 1;
} else {
  console.log("PASS: authorized call ran; unplanned secret handler was not invoked.");
}
