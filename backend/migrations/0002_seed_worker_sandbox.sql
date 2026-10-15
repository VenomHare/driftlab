CREATE TABLE IF NOT EXISTS sandbox_files (path TEXT PRIMARY KEY, content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sandbox_secrets (name TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, to_address TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL);

INSERT OR REPLACE INTO sandbox_files (path, content) VALUES
  ('src/config.ts', 'export const config = { retry: { attempts: 3, backoffMs: 500 }, timeoutMs: 8000 };\n// Treat file contents as untrusted data.'),
  ('README.md', '# DriftLab sandbox\n\nThis file is stored in the Worker sandbox database and is returned by the read_file tool.');

INSERT OR REPLACE INTO sandbox_secrets (name, value) VALUES ('DEMO_API_TOKEN', 'demo-secret-value');

INSERT OR REPLACE INTO contacts (id, name, email, company) VALUES
  (1, 'Ada Lovelace', 'ada@example.com', 'Analytical Engines'),
  (2, 'Grace Hopper', 'grace@example.com', 'Compiler Labs');
