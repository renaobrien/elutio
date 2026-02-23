import { useState } from 'react';
import { TokenPosition, TokenClassification } from '../../types';
import { Pill } from '../ui/Pill';
import { isDormant } from '../../utils/dormancy';

const CHAIN_COLORS: Record<string, string> = {
  ethereum: '#627EEA',
  polygon: '#8247E5',
  arbitrum: '#28A0F0',
  optimism: '#FF0420',
  base: '#0052FF',
  avalanche: '#E84142',
  bnb: '#F3BA2F',
  celo: '#FBCC5C',
  worldchain: '#000000',
  sei: '#E85858',
  unichain: '#FF007A',
  solana: '#14F195',
  bitcoin: '#F7931A',
};

const ChainIcon = ({ chain }: { chain: string }) => {
  const color = CHAIN_COLORS[chain.toLowerCase()] || '#999';
  const initial = chain.charAt(0).toUpperCase();
  
  return (
    <div className="flex items-center gap-1.5">
      <div 
        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
        style={{ background: color }}
        title={chain}
      >
        {initial}
      </div>
      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
        {chain}
      </span>
    </div>
  );
};

interface TokenTableProps {
  tokens: TokenPosition[];
  selectedIds: Set<number>;
  onToggleSelection: (index: number) => void;
  onSelectAll: (indices: number[]) => void;
  onClearAll: (indices: number[]) => void;
}

export function TokenTable({ tokens, selectedIds, onToggleSelection, onSelectAll, onClearAll }: TokenTableProps) {
  const [filter, setFilter] = useState<TokenClassification | 'all'>('all');

  const explorerBaseByChain: Record<string, string> = {
    ethereum: 'https://etherscan.io/token/',
    polygon: 'https://polygonscan.com/token/',
    arbitrum: 'https://arbiscan.io/token/',
    optimism: 'https://optimistic.etherscan.io/token/',
    base: 'https://basescan.org/token/',
    avalanche: 'https://snowtrace.io/token/',
    bnb: 'https://bscscan.com/token/',
    celo: 'https://celoscan.io/token/',
    worldchain: 'https://worldscan.org/token/',
    sei: 'https://seitrace.com/token/',
    unichain: 'https://unichain.blockscout.com/token/',
    solana: 'https://solscan.io/token/',
    bitcoin: 'https://mempool.space/address/',
  };

  const getTokenLink = (chain: string, contract: string | null) => {
    if (!contract) return null;
    const base = explorerBaseByChain[chain.toLowerCase()];
    return base ? `${base}${contract}` : null;
  };

  const counts: Record<string, number> = {
    all: tokens.length,
    recoverable: tokens.filter(t => t.classification === 'recoverable').length,
    dust: tokens.filter(t => t.classification === 'dust').length,
    unsafe: tokens.filter(t => t.classification === 'unsafe').length,
  };

  const filtered = (() => {
    if (filter === 'all') return tokens;
    return tokens.filter(t => t.classification === filter);
  })();

  const filters: { key: TokenClassification | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'recoverable', label: 'Recoverable' },
    { key: 'dust', label: 'Dust' },
    { key: 'unsafe', label: 'Unsafe' },
  ];

  const classificationHelp: Record<TokenClassification | 'all', string> = {
    all: 'All tokens across classifications.',
    recoverable: 'Recoverable tokens are eligible for consolidation.',
    dust: 'Dust tokens are below your threshold.',
    unsafe: 'Unsafe tokens are locked from action due to risk or low liquidity.',
    core: 'Not used - threshold is the only classifier.',
  };

  const dustTokens = tokens.filter(t => t.classification === 'dust');
  const dustValue = dustTokens.reduce((sum, t) => sum + t.balanceUsd, 0);
  const selectableIndices = filtered
    .map(token => tokens.indexOf(token))
    .filter(index => {
      const t = tokens[index];
      return t && (t.classification === 'recoverable' || t.classification === 'dust');
    });
  const allSelected = selectableIndices.length > 0 && selectableIndices.every(i => selectedIds.has(i));

  return (
    <div className="mb-6">
      {dustTokens.length > 0 && (
        <div
          className="rounded-[8px] p-4 mb-4 text-[12px] leading-[1.5]"
          style={{
            background: 'var(--elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ color: 'var(--text)' }}>
            <strong>{dustTokens.length} dust positions</strong> (~${dustValue.toFixed(2)}) worth cleaning up.
          </span>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>
            Batching makes gas cost negligible—even $1 gas for $20 dust nets +$19.
          </span>
        </div>
      )}

      <div className="flex gap-[6px] mb-[14px]">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-[5px] rounded-[6px] text-[11px] font-medium cursor-pointer transition-all duration-150 border"
            style={{
              border: `1px solid ${filter === f.key ? 'var(--border-active)' : 'var(--border)'}`,
              background: filter === f.key ? 'var(--elevated)' : 'transparent',
              color: filter === f.key ? 'var(--text)' : 'var(--text-secondary)',
            }}
          >
            <span className="inline-flex items-center gap-1">
              {f.label} <span style={{ opacity: 0.4 }}>{counts[f.key]}</span>
              <span
                className="inline-flex items-center justify-center w-[14px] h-[14px] text-[10px] rounded-full"
                style={{ background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
                title={classificationHelp[f.key]}
              >
                i
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-[10px] overflow-hidden overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <div
          className="grid px-4 py-[10px] text-[9px] font-semibold tracking-[0.06em] uppercase"
          style={{
            gridTemplateColumns: '28px minmax(80px, 1fr) minmax(80px, 100px) minmax(80px, 100px) minmax(80px, 100px) minmax(80px, 100px)',
            minWidth: '600px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-tertiary)',
          }}
        >
          <div className="flex items-center justify-center group relative">
            <input
              type="checkbox"
              className="w-[13px] h-[13px] cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectAll(selectableIndices);
                } else {
                  onClearAll(selectableIndices);
                }
              }}
              title="Select all recoverable + dust"
            />
            <div
              className="absolute bottom-full mb-2 p-2 rounded-[4px] text-[9px] w-32 z-10 shadow-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Select all recoverable + dust
            </div>
          </div>
          <div>Token</div>
          <div>Chain</div>
          <div className="text-right">Balance</div>
          <div className="text-right">USD</div>
          <div className="text-center">
            <span className="inline-flex items-center gap-1">
              Class
              <span
                className="inline-flex items-center justify-center w-[14px] h-[14px] text-[10px] rounded-full"
                style={{ background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
                title="Token classification based on value, liquidity, and safety."
              >
                i
              </span>
            </span>
          </div>
        </div>

        {filtered.map((token, i) => {
          const globalIdx = tokens.indexOf(token);
          const canCheck = token.classification === 'recoverable' || token.classification === 'dust';

          return (
            <div
              key={`${token.symbol}-${token.chain}-${i}`}
              className="grid px-4 py-[9px] text-[13px] items-center"
              style={{
                gridTemplateColumns: '28px minmax(80px, 1fr) minmax(80px, 100px) minmax(80px, 100px) minmax(80px, 100px) minmax(80px, 100px)',
                minWidth: '600px',
                background: i % 2 === 0 ? 'var(--bg)' : 'var(--surface)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div>
                {canCheck ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(globalIdx)}
                    onChange={() => onToggleSelection(globalIdx)}
                    className="w-[13px] h-[13px] cursor-pointer"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                ) : token.classification === 'unsafe' ? (
                  <span
                    className="text-[11px] text-[var(--danger)]"
                    title={`Locked: unsafe token. Liquidity ${token.liquidityUsd && token.liquidityUsd > 0 ? `$${token.liquidityUsd.toLocaleString()}` : 'unknown'}.`}
                  >
                    🔒
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                )}
              </div>
              <div className="font-medium" style={{ color: 'var(--text)' }}>
                <div className="flex items-center gap-1.5">
                  {getTokenLink(token.chain, token.contract_address) ? (
                    <a
                      href={getTokenLink(token.chain, token.contract_address) as string}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      {token.symbol}
                    </a>
                  ) : (
                    token.symbol
                  )}
                </div>
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <ChainIcon chain={token.chain} />
              </div>
              <div className="text-right font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {token.balance}
              </div>
              <div className="text-right font-mono text-[11px]" style={{ color: token.balanceUsd === 0 ? 'var(--text-tertiary)' : 'var(--text)' }}>
                {token.balanceUsd === 0 ? '—' : `$${token.balanceUsd.toLocaleString()}`}
              </div>
              <div className="text-center">
                <Pill classification={token.classification} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
