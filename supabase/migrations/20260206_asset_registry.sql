-- Asset Registry: Tracks which tokens Elutio accepts and liquidation parameters
CREATE TABLE IF NOT EXISTS asset_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_name TEXT NOT NULL,
  chain TEXT NOT NULL,
  supported BOOLEAN DEFAULT true,
  
  -- Liquidation parameters
  max_liquidation_rate_daily NUMERIC DEFAULT 0.10,
  min_liquidity_usd NUMERIC DEFAULT 100000,
  haircut_pct NUMERIC DEFAULT 0.02,
  max_pool_exposure_pct NUMERIC DEFAULT 0.15,
  max_slippage_pct NUMERIC DEFAULT 0.03,
  
  -- Metadata
  logo_url TEXT,
  coingecko_id TEXT,
  primary_dex TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(token_address, chain)
);

CREATE TABLE IF NOT EXISTS incoming_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL UNIQUE,
  user_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  amount TEXT NOT NULL,
  amount_usd NUMERIC DEFAULT 0,
  chain TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  asset_registry_id UUID REFERENCES asset_registry(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS liquidation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  chain TEXT NOT NULL,
  amount_sold TEXT NOT NULL,
  usdc_received NUMERIC NOT NULL,
  slippage_pct NUMERIC,
  execution_price NUMERIC,
  dex_used TEXT,
  tx_hash TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  transfer_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL UNIQUE,
  total_contributed_usd NUMERIC DEFAULT 0,
  share_percentage NUMERIC DEFAULT 0,
  total_received_payouts NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_usdc NUMERIC DEFAULT 0,
  deployed_usdc NUMERIC DEFAULT 0,
  undeployed_usdc NUMERIC DEFAULT 0,
  yield_earned NUMERIC DEFAULT 0,
  last_settlement TIMESTAMPTZ,
  current_apy NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  usdc_amount NUMERIC NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  chain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incoming_transfers_user ON incoming_transfers(user_address);
CREATE INDEX idx_incoming_transfers_status ON incoming_transfers(status);
CREATE INDEX idx_asset_registry_chain ON asset_registry(chain);
CREATE INDEX idx_asset_registry_supported ON asset_registry(supported);
CREATE INDEX idx_payouts_user ON payouts(user_address);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Comprehensive asset allowlist (v1)
INSERT INTO asset_registry (token_address, token_symbol, token_name, chain, supported, max_liquidation_rate_daily, min_liquidity_usd, primary_dex, notes) VALUES
  -- ETHEREUM MAINNET
  -- Stablecoins
  ('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'USDC', 'USD Coin', 'ethereum', true, 1.0, 50000000, 'curve', 'Primary pool asset'),
  ('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'USDT', 'Tether', 'ethereum', true, 0.50, 50000000, 'curve', 'High liquidity stablecoin'),
  ('0x6B175474E89094C44Da98b954EedeAC495271d0F', 'DAI', 'Dai', 'ethereum', true, 0.50, 20000000, 'curve', 'Decentralized stablecoin'),
  ('0x853d955aCEf822Db058eb8505911ED77F175b99e', 'FRAX', 'Frax', 'ethereum', true, 0.30, 5000000, 'curve', 'Algorithmic stablecoin'),
  
  -- Blue Chip DeFi
  ('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', 'AAVE', 'Aave', 'ethereum', true, 0.15, 5000000, 'uniswap-v3', 'Leading lending protocol'),
  ('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 'UNI', 'Uniswap', 'ethereum', true, 0.15, 10000000, 'uniswap-v3', 'Largest DEX token'),
  ('0xc00e94Cb662C3520282E6f5717214004A7f26888', 'COMP', 'Compound', 'ethereum', true, 0.12, 2000000, 'uniswap-v3', 'Lending protocol'),
  ('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 'MKR', 'Maker', 'ethereum', true, 0.10, 3000000, 'uniswap-v3', 'MakerDAO governance'),
  ('0x6810e776880C02933D47DB1b9fc05908e5386b96', 'GNO', 'Gnosis', 'ethereum', true, 0.10, 1000000, 'balancer', 'Prediction market'),
  ('0x0D8775F648430679A709E98d2b0Cb6250d2887EF', 'BAT', 'Basic Attention Token', 'ethereum', true, 0.12, 1500000, 'uniswap-v3', 'Browser rewards'),
  
  -- Liquid Staking
  ('0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', 'LDO', 'Lido DAO', 'ethereum', true, 0.12, 5000000, 'uniswap-v3', 'Liquid staking leader'),
  ('0xae78736Cd615f374D3085123A210448E74Fc6393', 'rETH', 'Rocket Pool ETH', 'ethereum', true, 0.10, 2000000, 'balancer', 'Decentralized liquid staking'),
  ('0xac3E018457B222d93114458476f3E3416Abbe38F', 'sfrxETH', 'Staked Frax Ether', 'ethereum', true, 0.10, 1000000, 'curve', 'Frax liquid staking'),
  
  -- Layer 2 Tokens
  ('0x4200000000000000000000000000000000000042', 'OP', 'Optimism', 'ethereum', true, 0.12, 3000000, 'uniswap-v3', 'Optimism governance'),
  ('0x912CE59144191C1204E64559FE8253a0e49E6548', 'ARB', 'Arbitrum', 'ethereum', true, 0.12, 5000000, 'uniswap-v3', 'Arbitrum governance'),
  ('0x58b6A8A3302369DAEc383334672404Ee733aB239', 'LPT', 'Livepeer', 'ethereum', true, 0.08, 500000, 'uniswap-v3', 'Video streaming'),
  
  -- Established Projects
  ('0x514910771AF9Ca656af840dff83E8264EcF986CA', 'LINK', 'Chainlink', 'ethereum', true, 0.15, 10000000, 'uniswap-v3', 'Oracle network'),
  ('0x2260FAC5E5542a773Aa44fBCfeDd7a96E06c9b93', 'WBTC', 'Wrapped Bitcoin', 'ethereum', true, 0.10, 20000000, 'curve', 'Bitcoin on Ethereum'),
  ('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 'WETH', 'Wrapped Ether', 'ethereum', true, 0.20, 100000000, 'uniswap-v3', 'Wrapped ETH'),
  ('0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', 'YFI', 'yearn.finance', 'ethereum', true, 0.08, 1000000, 'sushiswap', 'Yield aggregator'),
  ('0xD533a949740bb3306d119CC777fa900bA034cd52', 'CRV', 'Curve DAO', 'ethereum', true, 0.12, 3000000, 'curve', 'Stablecoin DEX'),
  ('0xba100000625a3754423978a60c9317c58a424e3D', 'BAL', 'Balancer', 'ethereum', true, 0.10, 1500000, 'balancer', 'Weighted pool AMM'),
  ('0x111111111117dC0aa78b770fA6A738034120C302', '1INCH', '1inch', 'ethereum', true, 0.10, 2000000, 'uniswap-v3', 'DEX aggregator'),
  ('0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', 'SUSHI', 'SushiSwap', 'ethereum', true, 0.10, 2000000, 'sushiswap', 'Community DEX'),
  ('0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 'FXS', 'Frax Share', 'ethereum', true, 0.10, 1000000, 'uniswap-v3', 'Frax protocol'),
  
  -- RWA / Newer Blue Chips
  ('0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', 'SNX', 'Synthetix', 'ethereum', true, 0.10, 1500000, 'uniswap-v3', 'Synthetic assets'),
  ('0x0f5D2fB29fb7d3CFeE444a200298f468908cC942', 'MANA', 'Decentraland', 'ethereum', true, 0.10, 1000000, 'uniswap-v3', 'Virtual world'),
  ('0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c', 'ENJ', 'Enjin', 'ethereum', true, 0.08, 800000, 'uniswap-v3', 'Gaming NFTs'),
  ('0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', 'GTC', 'Gitcoin', 'ethereum', true, 0.08, 500000, 'uniswap-v3', 'Public goods funding'),
  ('0x92D6C1e31e14520e676a687F0a93788B716BEff5', 'DYDX', 'dYdX', 'ethereum', true, 0.10, 2000000, 'uniswap-v3', 'Perpetuals DEX'),
  ('0x3472A5A71965499acd81997a54BBA8D852C6E53d', 'BADGER', 'Badger DAO', 'ethereum', true, 0.08, 500000, 'sushiswap', 'Bitcoin on DeFi'),
  ('0x0AbdAce70D3790235af448C88547603b945604ea', 'DNT', 'district0x', 'ethereum', true, 0.05, 200000, 'uniswap-v3', 'Decentralized markets'),
  
  -- POLYGON
  ('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 'USDC', 'USD Coin', 'polygon', true, 1.0, 10000000, 'quickswap', 'Primary stable'),
  ('0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 'USDT', 'Tether', 'polygon', true, 0.50, 10000000, 'quickswap', 'Stable'),
  ('0x8f3Cf7ad23Cd3CaDbD9735AFF958023D60d8d71F', 'DAI', 'Dai', 'polygon', true, 0.50, 5000000, 'quickswap', 'Stable'),
  ('0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 'WETH', 'Wrapped Ether', 'polygon', true, 0.20, 20000000, 'quickswap', 'ETH on Polygon'),
  ('0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 'WBTC', 'Wrapped Bitcoin', 'polygon', true, 0.10, 5000000, 'quickswap', 'BTC on Polygon'),
  ('0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 'AAVE', 'Aave', 'polygon', true, 0.15, 2000000, 'quickswap', 'Lending'),
  ('0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 'WMATIC', 'Wrapped Matic', 'polygon', true, 0.20, 10000000, 'quickswap', 'Native'),
  
  -- ARBITRUM
  ('0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 'USDC', 'USD Coin', 'arbitrum', true, 1.0, 20000000, 'uniswap-v3', 'Primary stable'),
  ('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 'USDT', 'Tether', 'arbitrum', true, 0.50, 10000000, 'uniswap-v3', 'Stable'),
  ('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 'DAI', 'Dai', 'arbitrum', true, 0.50, 5000000, 'uniswap-v3', 'Stable'),
  ('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 'WETH', 'Wrapped Ether', 'arbitrum', true, 0.20, 50000000, 'uniswap-v3', 'ETH on Arbitrum'),
  ('0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 'WBTC', 'Wrapped Bitcoin', 'arbitrum', true, 0.10, 10000000, 'uniswap-v3', 'BTC on Arbitrum'),
  ('0x912CE59144191C1204E64559FE8253a0e49E6548', 'ARB', 'Arbitrum', 'arbitrum', true, 0.15, 10000000, 'uniswap-v3', 'Native governance'),
  ('0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 'GMX', 'GMX', 'arbitrum', true, 0.10, 2000000, 'uniswap-v3', 'Perpetuals'),
  
  -- OPTIMISM
  ('0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 'USDC', 'USD Coin', 'optimism', true, 1.0, 10000000, 'uniswap-v3', 'Primary stable'),
  ('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 'USDT', 'Tether', 'optimism', true, 0.50, 5000000, 'uniswap-v3', 'Stable'),
  ('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 'DAI', 'Dai', 'optimism', true, 0.50, 3000000, 'uniswap-v3', 'Stable'),
  ('0x4200000000000000000000000000000000000006', 'WETH', 'Wrapped Ether', 'optimism', true, 0.20, 30000000, 'uniswap-v3', 'ETH on Optimism'),
  ('0x68f180fcCe6836688e9084f035309E29Bf00a3Dd', 'WBTC', 'Wrapped Bitcoin', 'optimism', true, 0.10, 5000000, 'uniswap-v3', 'BTC on Optimism'),
  ('0x4200000000000000000000000000000000000042', 'OP', 'Optimism', 'optimism', true, 0.15, 5000000, 'uniswap-v3', 'Native governance'),
  
  -- BASE
  ('0x833589fCD6eDb6E08f4c7C32D4f71b1566469c3d', 'USDC', 'USD Coin', 'base', true, 1.0, 10000000, 'uniswap-v3', 'Primary stable'),
  ('0x4200000000000000000000000000000000000006', 'WETH', 'Wrapped Ether', 'base', true, 0.20, 20000000, 'uniswap-v3', 'ETH on Base'),
  ('0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 'DAI', 'Dai', 'base', true, 0.50, 2000000, 'uniswap-v3', 'Stable')
ON CONFLICT (token_address, chain) DO NOTHING;
