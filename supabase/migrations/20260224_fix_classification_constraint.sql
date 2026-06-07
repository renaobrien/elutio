/*
  # Fix classification constraint after recoverable → positions rename

  1. Changes
    - Migrate existing token rows from 'recoverable' to 'positions'
    - Update CHECK constraint to allow 'positions' instead of 'recoverable'
*/

-- Drop the old constraint first so the UPDATE can proceed
ALTER TABLE tokens DROP CONSTRAINT IF EXISTS tokens_classification_check;

-- Update existing token classifications
UPDATE tokens SET classification = 'positions' WHERE classification = 'recoverable';

-- Add the new constraint
ALTER TABLE tokens ADD CONSTRAINT tokens_classification_check
  CHECK (classification IN ('core', 'positions', 'dust', 'unsafe'));
