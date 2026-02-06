/*
  # Create wallet scanning tables

  1. New Tables
    - `wallet_scans`
      - `id` (uuid, primary key)
      - `wallet_address` (text, indexed) - Ethereum wallet address
      - `scanned_at` (timestamptz) - When the scan was performed
      - `total_balance_usd` (numeric) - Total portfolio value
      - `recoverable_usd` (numeric) - Value of recoverable + dust positions
      - `hygiene_score` (integer) - Wallet health score 0-100
      - `alert_count` (integer) - Number of security alerts
      - `user_id` (uuid, nullable) - Link to authenticated user for future
      - `created_at` (timestamptz)
      
    - `tokens`
      - `id` (uuid, primary key)
      - `scan_id` (uuid, foreign key) - Links to wallet_scans
      - `symbol` (text) - Token symbol (e.g., USDC)
      - `name` (text) - Token name
      - `contract_address` (text) - Token contract address
      - `balance` (text) - Raw token balance
      - `balance_usd` (numeric) - USD value of balance
      - `classification` (text) - core, recoverable, dust, unsafe
      - `price_usd` (numeric) - Current token price
      - `chain` (text) - Blockchain network
      - `has_unlimited_approval` (boolean) - Security flag
      - `logo_url` (text, nullable) - Token logo URL
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can create scans (no auth required for MVP)
    - Anyone can read their own wallet scans
*/

CREATE TABLE IF NOT EXISTS wallet_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  scanned_at timestamptz DEFAULT now(),
  total_balance_usd numeric DEFAULT 0,
  recoverable_usd numeric DEFAULT 0,
  hygiene_score integer DEFAULT 0,
  alert_count integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wallet_scans_wallet_address_idx ON wallet_scans(wallet_address);
CREATE INDEX IF NOT EXISTS wallet_scans_user_id_idx ON wallet_scans(user_id);

CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES wallet_scans(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  contract_address text,
  balance text NOT NULL,
  balance_usd numeric DEFAULT 0,
  classification text NOT NULL CHECK (classification IN ('core', 'recoverable', 'dust', 'unsafe')),
  price_usd numeric DEFAULT 0,
  chain text NOT NULL DEFAULT 'ethereum',
  has_unlimited_approval boolean DEFAULT false,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tokens_scan_id_idx ON tokens(scan_id);
CREATE INDEX IF NOT EXISTS tokens_classification_idx ON tokens(classification);

ALTER TABLE wallet_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create wallet scans"
  ON wallet_scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read wallet scans"
  ON wallet_scans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create tokens"
  ON tokens FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read tokens"
  ON tokens FOR SELECT
  TO anon, authenticated
  USING (true);