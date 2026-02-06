import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ScanResult {
  success: boolean;
  scanId: string;
  metrics: {
    totalBalanceUsd: number;
    recoverableUsd: number;
    hygieneScore: number;
    tokensCount: number;
  };
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  contract_address: string;
  balance: string;
  balance_usd: number;
  classification: 'core' | 'recoverable' | 'dust' | 'unsafe';
  price_usd: number;
  chain: string;
  has_unlimited_approval: boolean;
  logo_url: string | null;
  liquidity_usd?: number;
  asset_class?: 'core' | 'non_core';
}

export interface WalletScan {
  id: string;
  wallet_address: string;
  scanned_at: string;
  total_balance_usd: number;
  recoverable_usd: number;
  hygiene_score: number;
  alert_count: number;
}

export async function scanWallet(walletAddress: string, chain: string = 'ethereum'): Promise<ScanResult> {
  const response = await fetch(`${supabaseUrl}/functions/v1/scan-wallet`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress, chain }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scan wallet');
  }

  return await response.json();
}

// Scan all supported chains in parallel
const SUPPORTED_CHAINS_LIST = [
  'ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 
  'bnb', 'celo', 'worldchain', 'sei', 'unichain'
];

export async function scanWalletAllChains(walletAddress: string): Promise<ScanResult> {
  // Send all chains in ONE request to the backend
  const response = await fetch(`${supabaseUrl}/functions/v1/scan-wallet`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      walletAddress, 
      chains: SUPPORTED_CHAINS_LIST 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scan wallet');
  }

  return await response.json();
}

export async function getScanById(scanId: string): Promise<WalletScan | null> {
  const { data, error } = await supabase
    .from('wallet_scans')
    .select('*')
    .eq('id', scanId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTokensByScanId(scanId: string): Promise<Token[]> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('scan_id', scanId)
    .order('balance_usd', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getLatestScanForWallet(walletAddress: string): Promise<WalletScan | null> {
  const { data, error } = await supabase
    .from('wallet_scans')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function resolveEnsName(address: string): Promise<string | null> {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return null;
  try {
    const res = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
    const data = await res.json();
    return data?.name || null;
  } catch {
    return null;
  }
}
