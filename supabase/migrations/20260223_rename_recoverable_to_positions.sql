/*
  # Rename recoverable to positions
  
  1. Changes
    - Rename wallet_scans.recoverable_usd to positions_usd
    - Update column to reflect semantic change from "recoverable" to "positions"
    - "Positions" are token balances above the dust threshold
*/

-- Rename the column
ALTER TABLE wallet_scans 
  RENAME COLUMN recoverable_usd TO positions_usd;
