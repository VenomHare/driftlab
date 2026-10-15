import { Hono } from 'hono';
import type { Context } from 'hono';

type Bindings = { DB?: D1Database; API_ORIGIN?: string };
type ToolRequest = { id?: unknown; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };
const app = new Hono<{ Bindings: Bindings }>();
const tools = [
  { name: 'read_file', description: 'Read the allowlisted config file.' },
  { name: 'read_secret', description: 'Read a secret from the demo environment.' },
  { name: 'email_send', description: 'Send an email in the demo outbox.' },
  { name: 'crm_export', description: 'Export contacts from the demo CRM.' }
];
const reply = (c: Context, id: unknown, result: unknown) => c.json({ jsonrpc: '2.0', id, result });

async function executeTool(env: Bindings, name: string, args: Record<string, unknown>) {
  if (!env.DB) throw new Error('D1 DB binding is not configured. Apply the Worker migrations first.');
  if (name === 'read_file') {
    const path = String(args.path ?? 'src/config.ts');
    const file = await env.DB.prepare('SELECT path, content FROM sandbox_files WHERE path = ?').bind(path).first<{ path: string; content: string }>();
    if (!file) throw new Error(`Sandbox file not found: ${path}`);
    return file;
  }
  if (name === 'read_secret') {
    const secret = await env.DB.prepare('SELECT name, value FROM sandbox_secrets WHERE name = ?').bind('DEMO_API_TOKEN').first<{ name: string; value: string }>();
    if (!secret) throw new Error('Sandbox secret not found. Apply the Worker migrations first.');
    return secret;
  }
  if (name === 'email_send') {
    const id = `email-${crypto.randomUUID()}`;
    const to = String(args.to ?? 'demo@example.com');
    const subject = String(args.subject ?? '');
    const body = String(args.body ?? '');
    await env.DB.prepare('INSERT INTO outbox (id, to_address, subject, body, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, to, subject, body, new Date().toISOString()).run();
    return { accepted: true, outboxId: id, to, subject, body };
  }
  if (name === 'crm_export') {
    const scope = String(args.scope ?? 'all');
    const contacts = await env.DB.prepare('SELECT id, name, email, company FROM contacts ORDER BY id').all();
    return { exported: true, scope, contactCount: contacts.results.length, contacts: contacts.results, exportId: `crm-${crypto.randomUUID()}` };
  }
  throw new Error(`Unknown MCP tool: ${name}`);
}

app.get('/health', (c) => c.json({ ok: true, name: 'driftlab-mcp', tools: tools.map((tool) => tool.name) }));
app.post('/mcp', async (c) => {
  const body = await c.req.json<ToolRequest>();
  if (body.method === 'initialize') return reply(c, body.id, { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'driftlab-mcp', version: '1.0.0' } });
  if (body.method === 'tools/list') return reply(c, body.id, { tools });
  if (body.method === 'tools/call') {
    const name = body.params?.name ?? 'unknown';
    const args = body.params?.arguments ?? {};
    try {
      const output = await executeTool(c.env, name, args);
      await c.env.DB?.prepare('INSERT INTO tool_calls (tool, status, created_at) VALUES (?, ?, ?)').bind(name, 'executed', new Date().toISOString()).run();
      console.log('[driftlab][mcp] tool executed', { tool: name, args, output });
      return reply(c, body.id, { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output, isError: false });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await c.env.DB?.prepare('INSERT INTO tool_calls (tool, status, created_at) VALUES (?, ?, ?)').bind(name, 'error', new Date().toISOString()).run();
      console.error('[driftlab][mcp] tool error', { tool: name, args, reason });
      return reply(c, body.id, { content: [{ type: 'text', text: reason }], isError: true });
    }
  }
  return reply(c, body.id, {});
});

export default app;
