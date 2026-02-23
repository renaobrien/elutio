import { useState, useMemo, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { TokenTable } from '../components/dashboard/TokenTable';
import { OpportunityCost } from '../components/dashboard/OpportunityCost';
import { AlertCards } from '../components/dashboard/AlertCards';
import { Button } from '../components/ui/Button';
import { MOCK_ALERTS } from '../data/mockData';
import { Token as DBToken, WalletScan } from '../services/walletService';
import { Token, WalletMetrics } from '../types';
import { isDormant } from '../utils/dormancy';

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
  const [dustThreshold, setDustThreshold] = useState<number>(20000);

  const tokens: Token[] = useMemo(() => {
    if (!dbTokens || dbTokens.length === 0) return [];

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
      lastTransferredAt: (t as any).last_transferred_at || undefined,
    }));
  }, [dbTokens]);

  const thresholdedTokens: Token[] = useMemo(() => {
    return tokens.map(token => {
      if (token.classification === 'core' || token.classification === 'unsafe') {
        return token;
      }

      if (token.balanceUsd > 0) {
        return {
          ...token,
          classification: token.balanceUsd < dustThreshold ? 'dust' : 'recoverable',
        };
      }

      return token;
    });
  }, [tokens, dustThreshold]);

  const metrics: WalletMetrics = useMemo(() => {
    // Calculate from tokens if scan data is missing or incomplete
    if (!thresholdedTokens || thresholdedTokens.length === 0) return {
      totalBalanceUsd: 0,
      recoverableUsd: 0,
      dustUsd: 0,
      manualCleanupCostUsd: 0,
      hygieneScore: 0,
      opportunityCostUsd: 0,
      alertCount: 0,
      recoverableUnpricedCount: 0,
      unpricedCount: 0,
      unpricedRecoverableCount: 0,
      unpricedDustCount: 0,
      dormantCount: 0,
      positions: { core: 0, recoverable: 0, dust: 0, unsafe: 0 },
    };

    // === STEP 1: Separate by Price Status ===
    const pricedTokens = thresholdedTokens.filter(t => t.balanceUsd > 0);
    const unpricedTokens = thresholdedTokens.filter(t => !t.balanceUsd || Number(t.balanceUsd) === 0);

    // === STEP 2: Calculate Total Balance (Priced Only) ===
    const totalBalanceUsd = pricedTokens.reduce((sum, t) => sum + Number(t.balanceUsd), 0);
    
    // === STEP 3: Dust Classification (Priced Only) ===
    const dustTokens = pricedTokens.filter(t => t.classification === 'dust');
    const dustUsd = dustTokens.reduce((sum, t) => sum + Number(t.balanceUsd), 0);

    // === STEP 4: Recoverable (Priced Only) ===
    const recoverableTokens = thresholdedTokens.filter(t => t.classification === 'recoverable');
    const pricedRecoverable = recoverableTokens.filter(t => 
      t.balanceUsd !== null && 
      t.balanceUsd !== undefined && 
      Number(t.balanceUsd) > 0
    );
    const unpricedRecoverable = recoverableTokens.filter(t => 
      t.balanceUsd === null || 
      t.balanceUsd === undefined ||
      Number(t.balanceUsd) === 0
    );
    
    const recoverableUsd = pricedRecoverable.reduce((sum, t) => sum + Number(t.balanceUsd), 0);

    // === STEP 5: Unpriced Token Counts ===
    const unpricedRecoverableCount = unpricedRecoverable.length;
    const unpricedDustCount = unpricedTokens.filter(t => t.classification === 'dust').length;

    // === STEP 6: Dormancy Analysis ===
    const dormantTokens = thresholdedTokens.filter(t => {
      try {
        return t.lastTransferredAt && isDormant(t.lastTransferredAt);
      } catch {
        return false;
      }
    });
    const dormantCount = dormantTokens.length;

    // === STEP 7: Opportunity Cost Calculation ===
    // Base: All priced dust + recoverable
    const pricedTransferable = dustUsd + recoverableUsd;

    // Add floor value for unpriced tokens ($1.00 per token conservative estimate)
    const unpricedFloorValue = (unpricedRecoverableCount + unpricedDustCount) * 1.0;

    // Total transferable value (for 7% yield calculation)
    const totalTransferableUsd = pricedTransferable + unpricedFloorValue;

    // Opportunity cost = what they could earn if consolidated
    const opportunityCostUsd = Math.floor(totalTransferableUsd * 0.07);

    return {
      totalBalanceUsd,
      recoverableUsd,
      dustUsd,
      unpricedCount: unpricedTokens.length,
      unpricedRecoverableCount,
      unpricedDustCount,
      dormantCount,
      opportunityCostUsd,
      manualCleanupCostUsd: 1247,
      hygieneScore: scan?.hygiene_score || 100,
      alertCount: scan?.alert_count || 0,
      recoverableUnpricedCount: unpricedRecoverableCount,
      positions: {
        core: thresholdedTokens.filter(t => t.classification === 'core').length,
        recoverable: recoverableTokens.length,
        dust: thresholdedTokens.filter(t => t.classification === 'dust').length,
        unsafe: thresholdedTokens.filter(t => t.classification === 'unsafe').length,
      },
    };
  }, [thresholdedTokens, scan]);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelectedIds(
      new Set(
        thresholdedTokens
          .map((token, i) => ({ token, i }))
          .filter(({ token }) => token.classification === 'recoverable' || token.classification === 'dust')
          .map(({ i }) => i)
      )
    );
  }, [thresholdedTokens]);

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
    .map(i => thresholdedTokens[i])
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
        onGoHome={() => onNavigate('landing')}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeScreen="overview" onNavigate={onNavigate} />

        <div className="flex-1 p-4 md:p-7 pb-20 md:pb-16 overflow-y-auto w-full">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
              <h1 style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 600 }} className="md:text-[24px]">Wallet Analysis</h1>
              {walletAddress && (
                <button
                  onClick={handleShare}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-[13px]"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              )}
            </div>

            <SummaryCards
              metrics={metrics}
              dustThreshold={dustThreshold}
              onDustThresholdChange={setDustThreshold}
            />

          <TokenTable
            tokens={thresholdedTokens}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />

          <AlertCards alerts={MOCK_ALERTS} />

          <OpportunityCost
            dustPrincipalUsd={metrics.dustUsd || 0}
            recoverablePrincipalUsd={metrics.recoverableUsd + (metrics.unpricedCount * 1.0)}
            potentialEarningsUsd={metrics.opportunityCostUsd}
            unpricedCount={metrics.unpricedCount}
            dormantCount={metrics.dormantCount}
          />

          {selectedTokens.length > 0 && (
            <div
              className="rounded-[10px] p-4 md:p-5 flex flex-col md:flex-row justify-between md:items-center gap-3"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <span className="text-sm md:text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text)' }}>{selectedTokens.length} tokens</strong> available
                  {' · '}
                  <span className="font-mono">~${Math.floor(selectedValue).toLocaleString()}</span>
                </span>
              </div>
              <Button variant="primary" onClick={() => onNavigate('deposit')} className="w-full md:w-auto">
                Transfer Dust
              </Button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
