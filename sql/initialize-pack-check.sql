-- Run in Neon SQL Editor after selecting the database/branch used by the app.
-- Safe to rerun: creates missing objects; does not clear existing data.
-- This creates the structure only. Real order data comes from Excel import.
BEGIN;

CREATE SCHEMA IF NOT EXISTS pack_check;

CREATE TABLE IF NOT EXISTS pack_check.workspace (
  id integer PRIMARY KEY CHECK (id = 1),
  metadata jsonb,
  counters jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 0
);

INSERT INTO pack_check.workspace (id, counters)
VALUES (1, '{"ACCEPTED":0,"DUPLICATE":0,"CANCELLED":0,"PICKED_UP":0,"UNKNOWN":0}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS pack_check.orders (
  tracking_code text PRIMARY KEY,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS pack_check.accepted (
  tracking_code text PRIMARY KEY,
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS pack_check.history (
  id uuid PRIMARY KEY,
  scanned_at bigint NOT NULL,
  data jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS history_time
ON pack_check.history (scanned_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS pack_check.operations (
  id uuid PRIMARY KEY,
  kind text NOT NULL,
  response jsonb NOT NULL
);

COMMIT;

-- Check the tables and current row counts.
SELECT 'orders' AS table_name, count(*) AS row_count FROM pack_check.orders
UNION ALL SELECT 'accepted', count(*) FROM pack_check.accepted
UNION ALL SELECT 'history', count(*) FROM pack_check.history
UNION ALL SELECT 'workspace', count(*) FROM pack_check.workspace
UNION ALL SELECT 'operations', count(*) FROM pack_check.operations;
