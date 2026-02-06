import { useState, useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { TokenTable } from '../components/dashboard/TokenTable';
import { OpportunityCost } from '../components/dashboard/OpportunityCost';
import { AlertCards } from '../components/dashboard/AlertCards';
import { Button } from '../components/ui/Button';
import { MOCK_TOKENS, MOCK_METRICS, MOCK_ALERTS } from '../data/mockData';
import { Token as DBToken, WalletScan } from '../services/walletService';
import { Token, WalletMetrics } from '../types';

interface OverviewProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
  tokens?: DBToken[];
  scan?: WalletScan | null;
  loading?: boolean;
}

export function Overview({ walletAddress, onNavigate, onSwitchWallet, onDisconnect, tokens: dbTokens, scan, loading }: OverviewProps) {
  const tokens: Token[] = useMemo(() => {
    if (!dbTokens || dbTokens.length === 0) return MOCK_TOKENS;

    return dbTokens.map(t => ({
      symbol: t.symbol,
      name: t.name,
      balance: t.balance,
      balanceUsd: Number(t.balance_usd),
      classification: t.classification as Token['classification'],
      chain: t.chain,
      hasUnlimitedApproval: t.has_unlimited_approval,
      contractAddress: t.contract_address,
      liquidityUsd: Number((t as any).liquidity_usd || 0),
      assetClass: (t as any).asset_class,
    }));
  }, [dbTokens]);

  const metrics: WalletMetrics = useMemo(() => {
    // Calculate from tokens if scan data is missing or incomplete
    if (!dbTokens || dbTokens.length === 0) return MOCK_METRICS;

    const totalBalanceUsd = dbTokens.reduce((sum, t) => sum + Number(t.balance_usd), 0);
    const dustTokens = dbTokens.filter(t => t.classification === 'dust');
    const dustUsd = dustTokens.reduce((sum, t) => sum + Number(t.balance_usd), 0);
    const recoverableTokens = dbTokens.filter(t => t.classification === 'recoverable' || t.classification === 'dust');
    const recoverableUsd = recoverableTokens.reduce((sum, t) => sum + Number(t.balance_usd), 0);

    return {
      totalBalanceUsd,
      recoverableUsd,
      dustUsd,
      manualCleanupCostUsd: 1247,
      hygieneScore: scan?.hygiene_score || 100,
      opportunityCostUsd: 1065,
      alertCount: scan?.alert_count || 0,
      positions: {
        core: dbTokens.filter(t => t.classification === 'core').length,
        recoverable: dbTokens.filter(t => t.classification === 'recoverable').length,
        dust: dustTokens.length,
        unsafe: dbTokens.filter(t => t.classification === 'unsafe').length,
      },
    };
  }, [dbTokens, scan]);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    return new Set(
      tokens
        .map((token, i) => ({ token, i }))
        .filter(({ token }) => token.classification === 'recoverable' || token.classification === 'dust')
        .map(({ i }) => i)
    );
  });

  const toggleSelection = (index: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = (indices: number[]) => {
    setSelectedIds(prev => new Set([...prev, ...indices]));
  };

  const handleClearAll = (indices: number[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      indices.forEach(i => next.delete(i));
      return next;
    });
  };

  const selectedTokens = Array.from(selectedIds)
    .map(i => tokens[i])
    .filter(token => token && (token.classification === 'recoverable' || token.classification === 'dust'));

  const selectedValue = selectedTokens.reduce((sum, token) => sum + token.balanceUsd, 0);

  const handleShare = () => {
    if (!walletAddress) return;
    const text = `Check out what Elutio found in my wallet: $${Math.floor(metrics.recoverableUsd).toLocaleString()} in recoverable assets across ${metrics.positions.recoverable} positions.`;
    const url = `${window.location.origin}?wallet=${walletAddress}`;
    
    // Try native share first
    if (navigator.share) {
      navigator.share({ title: 'Elutio', text, url });
    } else {
      // Fallback to copy URL
      const shareText = `${text}\n\n${url}`;
      navigator.clipboard.writeText(shareText);
      alert('Link copied! Share with your team.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-14" style={{ background: 'var(--bg)' }}>
      <Topbar
        walletAddress={walletAddress}
        onOpenSettings={() => onNavigate('settings')}
        onOpenNotifications={() => onNavigate('alerts')}
        onSwitchWallet={onSwitchWallet}
        onDisconnectWallet={onDisconnect}
      />

      <div className="flex flex-1">
        <Sidebar activeScreen="overview" onNavigate={onNavigate} />

        <div className="flex-1 p-7 pb-16 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 style={{ color: 'var(--text)', fontSize: '24px', fontWeight: 600 }}>Wallet Analysis</h1>
            {walletAddress && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Share2 size={16} />
                <span className="text-[13px]">Share</span>
              </button>
            )}
          </div>

          <SummaryCards metrics={metrics} />

          <TokenTable
            tokens={tokens}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />

          <AlertCards alerts={MOCK_ALERTS} />

          <OpportunityCost
            currentValue={metrics.recoverableUsd}
            opportunityCost={metrics.opportunityCostUsd}
          />

          {selectedTokens.length > 0 && (
            <div
              className="rounded-[10px] p-5 flex justify-between items-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text)' }}>{selectedTokens.length} tokens</strong> available
                  {' · '}
                  <span className="font-mono">~${Math.floor(selectedValue).toLocaleString()}</span>
                </span>
              </div>
              <Button variant="primary" onClick={() => onNavigate('deposit')}>
                Deposit to Pool
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
