import { useState, useMemo } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { MOCK_TOKENS } from '../data/mockData';
import { Token as DBToken, WalletScan } from '../services/walletService';
import { Token } from '../types';

interface DepositProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
  tokens?: DBToken[];
  scan?: WalletScan | null;
}

export function Deposit({ walletAddress, onNavigate, onSwitchWallet, onDisconnect, tokens: dbTokens }: DepositProps) {
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

  // Filter to positions + dust tokens only (handle both old 'recoverable' and new 'positions' classifications)
  const depositableTokens = tokens.filter(t => 
    t.classification === 'positions' || t.classification === 'recoverable' || t.classification === 'dust'
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    return new Set(
      depositableTokens
        .map((token, i) => ({ token, i }))
        .filter(({ token }) => token.classification === 'positions' || token.classification === 'recoverable' || token.classification === 'dust')
        .map(({ i }) => i)
    );
  });

  const [amounts, setAmounts] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    depositableTokens.forEach((_, i) => {
      initial[i] = '1'; // Default to 1 of each token
    });
    return initial;
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

  const updateAmount = (index: number, value: string) => {
    // Allow empty string for clearing, but validate positive numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmounts(prev => ({
        ...prev,
        [index]: value,
      }));
    }
  };

  const selectedTokens = depositableTokens
    .map((token, i) => ({ token, i }))
    .filter(({ i }) => selectedIds.has(i));

  const totalValue = selectedTokens.reduce((sum, { token, i }) => {
    const amount = parseFloat(amounts[i]) || 0;
    return sum + (token.balanceUsd * amount / parseFloat(token.balance || '1'));
  }, 0);

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
        <Sidebar activeScreen="pool" onNavigate={onNavigate} />

        <div className="flex-1 p-4 md:p-7 pb-20 md:pb-16 overflow-y-auto w-full">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-[20px] md:text-[24px] font-serif mb-1 md:mb-2" style={{ color: 'var(--text)' }}>
                Transfer Dust for Liquidation
              </h1>
              <p className="text-[12px] md:text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                Select dust tokens to transfer. These will be liquidated and you won't get them back.
              </p>
            </div>

            {/* Summary */}
            <div
              className="rounded-[10px] p-4 md:p-5 mb-6 grid grid-cols-2 gap-4"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <p className="text-[11px] md:text-[12px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Selected Tokens
                </p>
                <p className="text-[16px] md:text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
                  {selectedTokens.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] md:text-[12px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Total Value
                </p>
                <p className="text-[16px] md:text-[18px] font-semibold" style={{ color: 'var(--accent)' }}>
                  ${Math.floor(totalValue).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Token List */}
            <div
              className="rounded-[10px] p-4 md:p-6 mb-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="mb-4">
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
                  Select Tokens
                </h3>
              </div>

              <div className="space-y-3">
                {depositableTokens.length === 0 ? (
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                    No tokens available to deposit
                  </p>
                ) : (
                  depositableTokens.map((token, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: 'var(--elevated)',
                        border: selectedIds.has(i) ? '1px solid var(--accent)' : '1px solid var(--border)',
                      }}
                    >
                      <input
                        type="checkbox"
                        className="w-[13px] h-[13px] cursor-pointer"
                        style={{ accentColor: 'var(--accent)' }}
                        checked={selectedIds.has(i)}
                        onChange={() => toggleSelection(i)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                              {token.symbol}
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                              Balance: {parseFloat(token.balance || '0').toFixed(2)} {token.symbol}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px]" style={{ color: 'var(--text)' }}>
                              ${token.balanceUsd.toLocaleString()}
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                              {token.classification === 'dust' ? 'Dust' : 'Position'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Amount Adjustments */}
            {selectedTokens.length > 0 && (
              <div
                className="rounded-[10px] p-4 md:p-6 mb-6"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="mb-4">
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
                    Adjust Amounts
                  </h3>
                </div>

                <div className="space-y-3">
                  {selectedTokens.map(({ token, i }) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                          {token.symbol}
                        </label>
                      </div>
                      <input
                        type="number"
                        value={amounts[i]}
                        onChange={(e) => updateAmount(i, e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1 rounded text-[12px] text-right"
                        style={{
                          background: 'var(--elevated)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                        min="0"
                        step="0.01"
                      />
                      <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                        {token.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div
              className="rounded-[10px] p-6 mb-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--text)' }}>
                How It Works
              </h3>
              <ul className="space-y-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)' }}>1.</span>
                  <span>You transfer dust tokens to Elutio</span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)' }}>2.</span>
                  <span>We batch liquidate your dust with others to save gas</span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)' }}>3.</span>
                  <span>Proceeds go to treasury - you won't get tokens back</span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)' }}>4.</span>
                  <span>Your wallet is cleaner and more hygienic</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => onNavigate('overview')}
                className="flex-1 md:flex-none"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => onNavigate('earnings')}
                disabled={selectedTokens.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
