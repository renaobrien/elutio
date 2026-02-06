-- Add asset_class column to distinguish CORE vs NON-CORE assets
-- CORE: Never auto-liquidated (stables, WETH, WBTC, major L1s, LSTs)
-- NON-CORE: Eligible for managed liquidation (DeFi governance, airdrops, etc.)

ALTER TABLE asset_registry 
ADD COLUMN asset_class TEXT DEFAULT 'non_core' CHECK (asset_class IN ('core', 'non_core'));

-- Add decimals column for token metadata
ALTER TABLE asset_registry 
ADD COLUMN decimals INTEGER DEFAULT 18;

-- Update existing records to CORE classification
UPDATE asset_registry 
SET asset_class = 'core' 
WHERE token_symbol IN (
  'USDC', 'USDT', 'DAI', 'FRAX',  -- Stablecoins
  'WETH', 'WBTC',                 -- Wrapped natives
  'LINK', 'MATIC'                 -- Major L1 infrastructure
);

-- Update decimals for stablecoins (6 decimals)
UPDATE asset_registry 
SET decimals = 6 
WHERE token_symbol IN ('USDC', 'USDT');

-- Add index for asset_class queries
CREATE INDEX IF NOT EXISTS idx_asset_registry_class ON asset_registry(asset_class);
