export interface WalletMetrics {
  totalBalanceUsd: number;
  recoverableUsd: number;
  dustUsd?: number;
  manualCleanupCostUsd: number;
  hygieneScore: number;
  opportunityCostUsd: number;
  alertCount: number;
  positions: {
    core: number;
    recoverable: number;
    dust: number;
    unsafe: number;
  };
}

export type TokenClassification = 'core' | 'recoverable' | 'dust' | 'unsafe';
export type AssetClass = 'core' | 'non_core';

export interface TokenPosition {
  symbol: string;
  chain: string;
  balance: string;
  balanceUsd: number;
  classification: TokenClassification;
  liquidityUsd: number;
  contractAddress: string;
  assetClass?: AssetClass;
}

export interface Token extends TokenPosition {
  name?: string;
  hasUnlimitedApproval?: boolean;
}

export type AlertSeverity = 'danger' | 'warning' | 'info';
export type AlertType =
  | 'unlimited_approval'
  | 'unknown_outflow'
  | 'liquidity_dried_up'
  | 'stranded_asset'
  | 'token_unverified';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  actions: string[];
  timestamp: string;
  resolved: boolean;
}

export interface ConsolidationIntent {
  walletAddress: string;
  tokens: TokenPosition[];
  targetAsset: 'USDC' | 'ETH';
  estimatedOutputUsd: number;
  gasEstimateUsd: number;
  manualGasCostUsd: number;
  status: 'preview' | 'signed' | 'executing' | 'complete' | 'failed';
}

export interface PoolContribution {
  id: string;
  date: string;
  tokensCount: number;
  inputValueUsd: number;
  recoveredUsd: number;
  pendingUsd: number;
  writtenOffUsd: number;
}

export interface ExecutionHistoryItem {
  id: string;
  date: string;
  type: 'pool';
  tokensCount: number;
  inputUsd: number;
  outputUsd: number | null;
  outputAsset: string;
  status: 'complete' | 'in_progress' | 'failed';
  tokens: { symbol: string; amount: string; usd: number }[];
}
