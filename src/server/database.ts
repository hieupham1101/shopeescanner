import { Pool, type PoolClient } from 'pg';
const schema = process.env.PACK_CHECK_DB_SCHEMA || 'pack_check';
if (!/^[a-z][a-z0-9_]*$/.test(schema)) throw new Error('Invalid database schema');
const globals = globalThis as unknown as { packPool?: Pool; packInit?: Promise<void> };
export function pool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  const url = new URL(process.env.DATABASE_URL);
  if (url.searchParams.get('sslmode') === 'require') url.searchParams.set('sslmode', 'verify-full');
  return globals.packPool ??= new Pool({ connectionString: url.toString(), max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000, statement_timeout: 30000 });
}
export function table(name: 'workspace' | 'orders' | 'accepted' | 'history' | 'operations') { return `"${schema}"."${name}"`; }
export async function initializeDatabase() {
  globals.packInit ??= (async () => {
    const client = await pool().connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['pack-check-schema-' + schema]);
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";
        CREATE TABLE IF NOT EXISTS ${table('workspace')} (id integer PRIMARY KEY CHECK (id=1), metadata jsonb, counters jsonb NOT NULL, revision bigint NOT NULL DEFAULT 0);
        INSERT INTO ${table('workspace')} (id,counters) VALUES (1,'{"ACCEPTED":0,"DUPLICATE":0,"CANCELLED":0,"PICKED_UP":0,"UNKNOWN":0}') ON CONFLICT DO NOTHING;
        CREATE TABLE IF NOT EXISTS ${table('orders')} (tracking_code text PRIMARY KEY, data jsonb NOT NULL);
        CREATE TABLE IF NOT EXISTS ${table('accepted')} (tracking_code text PRIMARY KEY, data jsonb NOT NULL);
        CREATE TABLE IF NOT EXISTS ${table('history')} (id uuid PRIMARY KEY, scanned_at bigint NOT NULL, data jsonb NOT NULL);
        CREATE INDEX IF NOT EXISTS history_time ON ${table('history')} (scanned_at DESC,id DESC);
        CREATE TABLE IF NOT EXISTS ${table('operations')} (id uuid PRIMARY KEY, kind text NOT NULL, response jsonb NOT NULL);
      `);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  })().catch(error => { globals.packInit = undefined; throw error; });
  await globals.packInit;
}
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await initializeDatabase();
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    // One operator workspace: serialize imports, resets and scans across devices.
    await client.query(`SELECT id FROM ${table('workspace')} WHERE id=1 FOR UPDATE`);
    const value = await fn(client);
    await client.query('COMMIT'); return value;
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
