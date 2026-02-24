-- Asset Registry expansion (round 1) for ETH, Polygon, Arbitrum, Base, Optimism
-- Adds 48 tokens provided by user for allowlist validation

INSERT INTO asset_registry (
  token_address,
  token_symbol,
  token_name,
  chain,
  supported,
  asset_class,
  decimals
) VALUES
  -- ETHEREUM (17)
  ('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', 'wstETH', 'Wrapped liquid staked Ether 2.0', 'ethereum', true, 'core', 18),
  ('0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', 'stETH', 'Lido Staked Ether', 'ethereum', true, 'core', 18),
  ('0xD33526068D116cE69F19A9ee46F0bd304F21A51f', 'RPL', 'Rocket Pool', 'ethereum', true, 'non_core', 18),
  ('0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 'MATIC', 'Polygon', 'ethereum', true, 'core', 18),
  ('0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF', 'IMX', 'Immutable X', 'ethereum', true, 'non_core', 18),
  ('0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24', 'RNDR', 'Render Token', 'ethereum', true, 'non_core', 18),
  ('0x6982508145454Ce325dDbE47a25d4ec3d2311933', 'PEPE', 'Pepe', 'ethereum', true, 'non_core', 18),
  ('0x4d224452801ACEd8B2F0aebE155379bb5D594381', 'APE', 'ApeCoin', 'ethereum', true, 'non_core', 18),
  ('0x5283D291DBCF85356A21bA090E6db59121208b44', 'BLUR', 'Blur', 'ethereum', true, 'non_core', 18),
  ('0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD', 'LRC', 'Loopring', 'ethereum', true, 'non_core', 18),
  ('0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', 'SHIB', 'Shiba Inu', 'ethereum', true, 'non_core', 18),
  ('0x808507121B80c02388fAd14726482e061B8da827', 'PENDLE', 'Pendle', 'ethereum', true, 'non_core', 18),
  ('0x57e114B691Db790C35207b2e685D4A43181e6061', 'ENA', 'Ethena', 'ethereum', true, 'non_core', 18),
  ('0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0', 'rswETH', 'Swell Restaked ETH', 'ethereum', true, 'non_core', 18),
  ('0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', 'CVX', 'Convex Finance', 'ethereum', true, 'non_core', 18),
  ('0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', 'ENS', 'Ethereum Name Service', 'ethereum', true, 'non_core', 18),
  ('0x163f8C2467924be0ae7B5347228CABF260318753', 'WLD', 'Worldcoin', 'ethereum', true, 'non_core', 18),

  -- POLYGON (8)
  ('0xb33EaAd8d922B1083446DC23f610c2567fB5180f', 'UNI', 'Uniswap', 'polygon', true, 'non_core', 18),
  ('0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 'LINK', 'Chainlink', 'polygon', true, 'core', 18),
  ('0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a', 'SUSHI', 'SushiSwap', 'polygon', true, 'non_core', 18),
  ('0x172370d5Cd63279eFa6d502DAB29171933a610AF', 'CRV', 'Curve DAO Token', 'polygon', true, 'non_core', 18),
  ('0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3', 'BAL', 'Balancer', 'polygon', true, 'non_core', 18),
  ('0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7', 'GHST', 'Aavegotchi', 'polygon', true, 'non_core', 18),
  ('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 'USDC.e', 'USD Coin (PoS)', 'polygon', true, 'core', 6),
  ('0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4', 'stMATIC', 'Lido Staked Matic', 'polygon', true, 'non_core', 18),

  -- ARBITRUM (8)
  ('0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', 'UNI', 'Uniswap', 'arbitrum', true, 'non_core', 18),
  ('0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 'LINK', 'Chainlink', 'arbitrum', true, 'core', 18),
  ('0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', 'PENDLE', 'Pendle', 'arbitrum', true, 'non_core', 18),
  ('0x9623063377AD1B27544C965cCd7342f7EA7e88C7', 'GRT', 'The Graph', 'arbitrum', true, 'non_core', 18),
  ('0x539bdE0d7Dbd336b79148AA742883198BBF60342', 'MAGIC', 'MAGIC', 'arbitrum', true, 'non_core', 18),
  ('0x3082CC23568eA640225c2467653dB90e9250AaA0', 'RDNT', 'Radiant Capital', 'arbitrum', true, 'non_core', 18),
  ('0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8', 'GRAIL', 'Camelot Token', 'arbitrum', true, 'non_core', 18),
  ('0x5979D7b546E38E414F7E9822514be443A4800529', 'wstETH', 'Wrapped liquid staked Ether 2.0', 'arbitrum', true, 'core', 18),

  -- BASE (9)
  ('0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', 'cbETH', 'Coinbase Wrapped Staked ETH', 'base', true, 'core', 18),
  ('0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', 'USDbC', 'USD Base Coin', 'base', true, 'core', 6),
  ('0x940181a94A35A4569E4529A3CDfB74e38FD98631', 'AERO', 'Aerodrome Finance', 'base', true, 'non_core', 18),
  ('0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', 'DEGEN', 'Degen', 'base', true, 'non_core', 18),
  ('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', 'wstETH', 'Wrapped liquid staked Ether 2.0', 'base', true, 'core', 18),
  ('0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 'USDT', 'Tether', 'base', true, 'core', 6),
  ('0x532f27101965dd16442E59d40670FaF5eBB142E4', 'BRETT', 'Brett', 'base', true, 'non_core', 18),
  ('0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', 'TOSHI', 'Toshi', 'base', true, 'non_core', 18),
  ('0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c', 'rETH', 'Rocket Pool ETH', 'base', true, 'core', 18),

  -- OPTIMISM (6)
  ('0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db', 'VELO', 'Velodrome Finance', 'optimism', true, 'non_core', 18),
  ('0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4', 'SNX', 'Synthetix Network Token', 'optimism', true, 'non_core', 18),
  ('0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb', 'wstETH', 'Wrapped liquid staked Ether 2.0', 'optimism', true, 'core', 18),
  ('0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6', 'LINK', 'Chainlink', 'optimism', true, 'core', 18),
  ('0x9Bcef72be871e61ED4fBbc7630889beE758eb81D', 'rETH', 'Rocket Pool ETH', 'optimism', true, 'core', 18),
  ('0x9e1028F5F1D5eDE59748FFceE5532509976840E0', 'PERP', 'Perpetual Protocol', 'optimism', true, 'non_core', 18)
ON CONFLICT (token_address, chain) DO NOTHING;