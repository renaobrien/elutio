import { TokenPosition, WalletMetrics, Alert, PoolContribution, ExecutionHistoryItem } from '../types';

export const MOCK_TOKENS: TokenPosition[] = [
  { symbol: 'ETH', chain: 'Ethereum', balance: '412.3', balanceUsd: 1247000, classification: 'core', liquidityUsd: 500000000, contractAddress: '0x0000000000000000000000000000000000000000' },
  { symbol: 'ENS', chain: 'Ethereum', balance: '18,420', balanceUsd: 245000, classification: 'core', liquidityUsd: 15000000, contractAddress: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72' },
  { symbol: 'USDC', chain: 'Ethereum', balance: '189,000', balanceUsd: 189000, classification: 'core', liquidityUsd: 800000000, contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { symbol: 'UNI', chain: 'Ethereum', balance: '9,234', balanceUsd: 87000, classification: 'core', liquidityUsd: 120000000, contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  { symbol: 'AAVE', chain: 'Ethereum', balance: '521', balanceUsd: 68000, classification: 'core', liquidityUsd: 85000000, contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },

  { symbol: 'GRT', chain: 'Ethereum', balance: '14,200', balanceUsd: 4623, classification: 'recoverable', liquidityUsd: 45000000, contractAddress: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7' },
  { symbol: 'SAFE', chain: 'Ethereum', balance: '890', balanceUsd: 3487, classification: 'recoverable', liquidityUsd: 8000000, contractAddress: '0x5aFE3855358E112B5647B952709E6165e1c1eEEe' },
  { symbol: 'PUSH', chain: 'Ethereum', balance: '22,100', balanceUsd: 3012, classification: 'recoverable', liquidityUsd: 2500000, contractAddress: '0xf418588522d5dd018b425E472991E52EBBeEEEEE' },
  { symbol: 'BAL', chain: 'Ethereum', balance: '310', balanceUsd: 2987, classification: 'recoverable', liquidityUsd: 35000000, contractAddress: '0xba100000625a3754423978a60c9317c58a424e3D' },
  { symbol: 'WETH', chain: 'Arbitrum', balance: '0.28', balanceUsd: 2847, classification: 'recoverable', liquidityUsd: 120000000, contractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
  { symbol: 'LINK', chain: 'Ethereum', balance: '38', balanceUsd: 1532, classification: 'recoverable', liquidityUsd: 95000000, contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  { symbol: 'REQ', chain: 'Ethereum', balance: '4,500', balanceUsd: 1315, classification: 'recoverable', liquidityUsd: 1200000, contractAddress: '0x8f8221aFbB33998d8584A2B05749bA73c37a938a' },
  { symbol: 'LDO', chain: 'Ethereum', balance: '423', balanceUsd: 987, classification: 'recoverable', liquidityUsd: 78000000, contractAddress: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32' },
  { symbol: 'CRV', chain: 'Ethereum', balance: '1,240', balanceUsd: 876, classification: 'recoverable', liquidityUsd: 42000000, contractAddress: '0xD533a949740bb3306d119CC777fa900bA034cd52' },
  { symbol: 'MKR', chain: 'Ethereum', balance: '0.42', balanceUsd: 823, classification: 'recoverable', liquidityUsd: 68000000, contractAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' },
  { symbol: 'SNX', chain: 'Ethereum', balance: '312', balanceUsd: 745, classification: 'recoverable', liquidityUsd: 28000000, contractAddress: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F' },
  { symbol: 'COMP', chain: 'Ethereum', balance: '8.2', balanceUsd: 687, classification: 'recoverable', liquidityUsd: 55000000, contractAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888' },
  { symbol: 'YFI', chain: 'Ethereum', balance: '0.082', balanceUsd: 623, classification: 'recoverable', liquidityUsd: 32000000, contractAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e' },
  { symbol: 'SUSHI', chain: 'Ethereum', balance: '587', balanceUsd: 589, classification: 'recoverable', liquidityUsd: 18000000, contractAddress: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2' },
  { symbol: '1INCH', chain: 'Ethereum', balance: '1,420', balanceUsd: 534, classification: 'recoverable', liquidityUsd: 22000000, contractAddress: '0x111111111117dC0aa78b770fA6A738034120C302' },
  { symbol: 'MASK', chain: 'Ethereum', balance: '234', balanceUsd: 487, classification: 'recoverable', liquidityUsd: 8500000, contractAddress: '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074' },
  { symbol: 'MATIC', chain: 'Polygon', balance: '582', balanceUsd: 445, classification: 'recoverable', liquidityUsd: 125000000, contractAddress: '0x0000000000000000000000000000000000001010' },
  { symbol: 'FXS', chain: 'Ethereum', balance: '187', balanceUsd: 398, classification: 'recoverable', liquidityUsd: 15000000, contractAddress: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0' },
  { symbol: 'CVX', chain: 'Ethereum', balance: '142', balanceUsd: 365, classification: 'recoverable', liquidityUsd: 24000000, contractAddress: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B' },
  { symbol: 'ALCX', chain: 'Ethereum', balance: '18', balanceUsd: 312, classification: 'recoverable', liquidityUsd: 6500000, contractAddress: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF' },
  { symbol: 'TRIBE', chain: 'Ethereum', balance: '923', balanceUsd: 287, classification: 'recoverable', liquidityUsd: 4200000, contractAddress: '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B' },
  { symbol: 'BADGER', chain: 'Ethereum', balance: '89', balanceUsd: 245, classification: 'recoverable', liquidityUsd: 8900000, contractAddress: '0x3472A5A71965499acd81997a54BBA8D852C6E53d' },
  { symbol: 'PERP', chain: 'Ethereum', balance: '234', balanceUsd: 198, classification: 'recoverable', liquidityUsd: 5600000, contractAddress: '0xbC396689893D065F41bc2C6EcbeE5e0085233447' },
  { symbol: 'RBN', chain: 'Ethereum', balance: '1,234', balanceUsd: 167, classification: 'recoverable', liquidityUsd: 2100000, contractAddress: '0x6123B0049F904d730dB3C36a31167D9d4121fA6B' },
  { symbol: 'DYDX', chain: 'Ethereum', balance: '67', balanceUsd: 134, classification: 'recoverable', liquidityUsd: 45000000, contractAddress: '0x92D6C1e31e14520e676a687F0a93788B716BEff5' },
  { symbol: 'IMX', chain: 'Ethereum', balance: '89', balanceUsd: 112, classification: 'recoverable', liquidityUsd: 28000000, contractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF' },
  { symbol: 'ENJ', chain: 'Ethereum', balance: '234', balanceUsd: 98, classification: 'recoverable', liquidityUsd: 19000000, contractAddress: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c' },
  { symbol: 'OCEAN', chain: 'Ethereum', balance: '187', balanceUsd: 87, classification: 'recoverable', liquidityUsd: 12000000, contractAddress: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48' },
  { symbol: 'API3', chain: 'Ethereum', balance: '34', balanceUsd: 67, classification: 'recoverable', liquidityUsd: 7800000, contractAddress: '0x0b38210ea11411557c13457D4dA7dC6ea731B88a' },
  { symbol: 'NMR', chain: 'Ethereum', balance: '4.2', balanceUsd: 54, classification: 'recoverable', liquidityUsd: 8500000, contractAddress: '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671' },
  { symbol: 'RARI', chain: 'Ethereum', balance: '89', balanceUsd: 45, classification: 'recoverable', liquidityUsd: 1200000, contractAddress: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF' },

  { symbol: 'SHIB', chain: 'Ethereum', balance: '24,000,000', balanceUsd: 2.41, classification: 'dust', liquidityUsd: 185000000, contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  { symbol: 'BAT', chain: 'Ethereum', balance: '12.4', balanceUsd: 2.38, classification: 'dust', liquidityUsd: 16000000, contractAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF' },
  { symbol: 'MANA', chain: 'Ethereum', balance: '4.2', balanceUsd: 1.87, classification: 'dust', liquidityUsd: 38000000, contractAddress: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942' },
  { symbol: 'ZRX', chain: 'Ethereum', balance: '8.9', balanceUsd: 1.45, classification: 'dust', liquidityUsd: 24000000, contractAddress: '0xE41d2489571d322189246DaFA5ebDe1F4699F498' },
  { symbol: 'AMP', chain: 'Ethereum', balance: '234', balanceUsd: 0.98, classification: 'dust', liquidityUsd: 9200000, contractAddress: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2' },
  { symbol: 'OMG', chain: 'Ethereum', balance: '1.2', balanceUsd: 0.87, classification: 'dust', liquidityUsd: 12000000, contractAddress: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07' },
  { symbol: 'ANT', chain: 'Ethereum', balance: '0.42', balanceUsd: 0.54, classification: 'dust', liquidityUsd: 4500000, contractAddress: '0xa117000000f279D81A1D3cc75430fAA017FA5A2e' },
  { symbol: 'BNT', chain: 'Ethereum', balance: '2.1', balanceUsd: 0.34, classification: 'dust', liquidityUsd: 7800000, contractAddress: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C' },
  { symbol: 'RLC', chain: 'Ethereum', balance: '0.87', balanceUsd: 0.21, classification: 'dust', liquidityUsd: 5200000, contractAddress: '0x607F4C5BB672230e8672085532f7e901544a7375' },

  { symbol: 'FAKE_DROP', chain: 'Ethereum', balance: '1,000,000', balanceUsd: 0, classification: 'unsafe', liquidityUsd: 0, contractAddress: '0x0000000000000000000000000000000000000001' },
  { symbol: 'SCAM_TOKEN', chain: 'Ethereum', balance: '999,999,999', balanceUsd: 0, classification: 'unsafe', liquidityUsd: 0, contractAddress: '0x0000000000000000000000000000000000000002' },
];

export const MOCK_METRICS: WalletMetrics = {
  totalBalanceUsd: MOCK_TOKENS.reduce((sum, token) => sum + token.balanceUsd, 0),
  recoverableUsd: MOCK_TOKENS.filter(t => t.classification === 'recoverable' || t.classification === 'dust').reduce((sum, token) => sum + token.balanceUsd, 0),
  dustUsd: MOCK_TOKENS.filter(t => t.classification === 'dust').reduce((sum, token) => sum + token.balanceUsd, 0),
  manualCleanupCostUsd: 1247,
  hygieneScore: 72,
  opportunityCostUsd: 1065,
  alertCount: 3,
  positions: {
    core: MOCK_TOKENS.filter(t => t.classification === 'core').length,
    recoverable: MOCK_TOKENS.filter(t => t.classification === 'recoverable').length,
    dust: MOCK_TOKENS.filter(t => t.classification === 'dust').length,
    unsafe: MOCK_TOKENS.filter(t => t.classification === 'unsafe').length,
  },
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'unlimited_approval',
    severity: 'danger',
    title: 'Unlimited Approval Detected',
    description: 'USDC → 0xdead...beef · Unlimited · 2 days ago',
    actions: ['Revoke', 'Ignore'],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: '2',
    type: 'stranded_asset',
    severity: 'warning',
    title: 'Stranded Asset',
    description: '0.003 ETH of USDC on Optimism · No gas token',
    actions: ['Bridge Gas', 'Write Off'],
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: '3',
    type: 'liquidity_dried_up',
    severity: 'warning',
    title: 'Liquidity Dried Up',
    description: 'CULT · Last trade: 45 days ago · Liquidity <$100',
    actions: ['Write Off'],
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
];

export const MOCK_POOL_CONTRIBUTIONS: PoolContribution[] = [
  {
    id: '1',
    date: '2024-01-15',
    tokensCount: 24,
    inputValueUsd: 15800,
    recoveredUsd: 14100,
    pendingUsd: 1200,
    writtenOffUsd: 500,
  },
];

export const MOCK_EXECUTION_HISTORY: ExecutionHistoryItem[] = [
  {
    id: '1',
    date: '2024-02-05',
    type: 'pool',
    tokensCount: 24,
    inputUsd: 21400,
    outputUsd: 20890,
    outputAsset: 'USDC',
    status: 'complete',
    tokens: [
      { symbol: 'GRT', amount: '14,200', usd: 1623 },
      { symbol: 'SAFE', amount: '890', usd: 1487 },
      { symbol: 'PUSH', amount: '22,100', usd: 1012 },
    ],
  },
  {
    id: '2',
    date: '2024-01-15',
    type: 'pool',
    tokensCount: 12,
    inputUsd: 15800,
    outputUsd: null,
    outputAsset: 'pending',
    status: 'in_progress',
    tokens: [
      { symbol: 'BAL', amount: '310', usd: 987 },
      { symbol: 'LINK', amount: '38', usd: 532 },
    ],
  },
];

export const MOCK_PAYOUTS = [
  {
    id: 'payout-1',
    date: '2024-02-05',
    amountSent: 20890,
    yield: 1500,
    expectedPayout: 425,
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'paid' as const,
  },
  {
    id: 'payout-2',
    date: '2024-01-15',
    amountSent: 15800,
    yield: 1200,
    expectedPayout: 320,
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    status: 'pending' as const,
  },
];
