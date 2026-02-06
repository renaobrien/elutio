import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MOCK_EXECUTION_HISTORY, MOCK_PAYOUTS } from '../data/mockData';

interface HistoryProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

export function History({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: HistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <Sidebar activeScreen="history" onNavigate={onNavigate} />

        <div className="flex-1 p-7 pb-16 overflow-auto">
          <div className="mb-8">
            <h1 className="text-[24px] font-serif mb-2" style={{ color: 'var(--text)' }}>
              Payout History
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Automatic payouts from your pool contributions.
            </p>
          </div>

          {/* Payout History */}
          <div className="rounded-[10px] overflow-hidden mb-8" style={{ border: '1px solid var(--border)' }}>
            <div
              className="grid px-4 py-[10px] text-[9px] font-semibold tracking-[0.06em] uppercase"
              style={{
                gridTemplateColumns: '90px 100px 100px 100px 180px 60px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-tertiary)',
              }}
            >
              <div>Date</div>
              <div className="text-right">Amount Sent</div>
              <div className="text-right">Yield</div>
              <div className="text-right">Payout</div>
              <div>Transaction</div>
              <div>Status</div>
            </div>

            {MOCK_PAYOUTS.map((payout, i) => (
              <div
                key={payout.id}
                className="grid px-4 py-[12px] text-[13px] items-center"
                style={{
                  gridTemplateColumns: '90px 100px 100px 100px 180px 60px',
                  background: i % 2 === 0 ? 'var(--bg)' : 'var(--surface)',
                  borderBottom: i < MOCK_PAYOUTS.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {payout.date}
                </div>
                <div className="text-right font-mono" style={{ color: 'var(--text)' }}>
                  ${payout.amountSent.toLocaleString()}
                </div>
                <div className="text-right font-mono" style={{ color: 'var(--text)' }}>
                  ${payout.yield.toLocaleString()}
                </div>
                <div className="text-right font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                  ${payout.expectedPayout.toLocaleString()}
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {payout.txHash.slice(0, 10)}...
                  <a
                    href={`https://etherscan.io/tx/${payout.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--accent)] transition-colors"
                    style={{ marginLeft: '4px', color: 'var(--text-secondary)' }}
                  >
                    ↗
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  {payout.status === 'paid' ? (
                    <>
                      <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--success)', fontSize: '11px' }}>Paid</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} style={{ color: 'var(--warning)' }} />
                      <span style={{ color: 'var(--warning)', fontSize: '11px' }}>Pending</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-[24px] font-serif mb-2" style={{ color: 'var(--text)' }}>
              Execution History
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              All consolidation and pool transactions.
            </p>
          </div>

          <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div
              className="grid px-4 py-[10px] text-[9px] font-semibold tracking-[0.06em] uppercase"
              style={{
                gridTemplateColumns: '90px 90px 70px 120px 120px 100px 40px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-tertiary)',
              }}
            >
              <div>Date</div>
              <div>Type</div>
              <div>Tokens</div>
              <div className="text-right">Input</div>
              <div className="text-right">Output</div>
              <div>Status</div>
              <div></div>
            </div>

            {MOCK_EXECUTION_HISTORY.map((item, i) => {
              const isExpanded = expandedId === item.id;
              const statusColor =
                item.status === 'complete'
                  ? 'var(--success)'
                  : item.status === 'in_progress'
                  ? 'var(--warning)'
                  : 'var(--danger)';
              const statusBg =
                item.status === 'complete'
                  ? 'var(--success-dim)'
                  : item.status === 'in_progress'
                  ? 'var(--warning-dim)'
                  : 'var(--danger-dim)';
              const statusBorder =
                item.status === 'complete'
                  ? 'var(--success-border)'
                  : item.status === 'in_progress'
                  ? 'var(--warning-border)'
                  : 'var(--danger-border)';

              return (
                <div key={item.id}>
                  <div
                    className="grid px-4 py-[12px] text-[13px] items-center cursor-pointer hover:bg-[var(--elevated)] transition-colors"
                    style={{
                      gridTemplateColumns: '90px 90px 70px 120px 120px 100px 40px',
                      background: i % 2 === 0 ? 'var(--bg)' : 'var(--surface)',
                      borderBottom:
                        isExpanded || i < MOCK_EXECUTION_HISTORY.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {item.date}
                    </div>
                    <div style={{ color: 'var(--text)' }}>{item.type}</div>
                    <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {item.tokensCount}
                    </div>
                    <div className="text-right font-mono" style={{ color: 'var(--text)' }}>
                      ${item.inputUsd.toLocaleString()}
                    </div>
                    <div className="text-right font-mono" style={{ color: 'var(--text)' }}>
                      {item.outputUsd ? `$${item.outputUsd.toLocaleString()} ${item.outputAsset}` : 'pending'}
                    </div>
                    <div>
                      <span
                        className="inline-block px-2 py-[2px] rounded-[3px] text-[9px] font-bold tracking-[0.08em] uppercase border"
                        style={{
                          background: statusBg,
                          borderColor: statusBorder,
                          color: statusColor,
                        }}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-end" style={{ color: 'var(--text-tertiary)' }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      className="px-4 py-4"
                      style={{
                        background: 'var(--elevated)',
                        borderBottom: i < MOCK_EXECUTION_HISTORY.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div
                        className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-3"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Token Breakdown
                      </div>
                      <div className="space-y-2">
                        {item.tokens.map((token, j) => (
                          <div key={j} className="flex justify-between text-[12px]">
                            <span style={{ color: 'var(--text)' }}>
                              {token.symbol} <span className="font-mono ml-2" style={{ color: 'var(--text-secondary)' }}>{token.amount}</span>
                            </span>
                            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                              ${token.usd.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
