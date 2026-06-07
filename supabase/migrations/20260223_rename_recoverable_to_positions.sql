/*
  # Rename recoverable to positions

  1. Changes
    - Rename wallet_scans.recoverable_usd to positions_usd
    - Update tokens.classification CHECK constraint to use 'positions' instead of 'recoverable'
    - Migrate existing token rows from 'recoverable' to 'positions'
    - "Positions" are token balances above the dust threshold
*/

-- Rename the column
ALTER TABLE wallet_scans
  RENAME COLUMN recoverable_usd TO positions_usd;

-- Update existing token classifications
UPDATE tokens SET classification = 'positions' WHERE classification = 'recoverable';

-- Replace the CHECK constraint to allow 'positions' instead of 'recoverable'
ALTER TABLE tokens DROP CONSTRAINT IF EXISTS tokens_classification_check;
ALTER TABLE tokens ADD CONSTRAINT tokens_classification_check
  CHECK (classification IN ('core', 'positions', 'dust', 'unsafe'));
