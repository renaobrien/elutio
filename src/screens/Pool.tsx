import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MOCK_POOL_CONTRIBUTIONS } from '../data/mockData';

interface PoolProps {
  walletAddress: string;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

export function Pool({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: PoolProps) {
  const contribution = MOCK_POOL_CONTRIBUTIONS[0];
  const recoveryRate = (contribution.recoveredUsd / contribution.inputValueUsd) * 100;

  const timeline = [
    {
      date: 'Jan 15',
      event: `Deposited 24 tokens ($${contribution.inputValueUsd.toLocaleString()})`,
    },
    {
      date: 'Jan 22',
      event: 'Pool liquidated GRT, SAFE, PUSH → $4,200 USDC',
    },
    {
      date: 'Feb 01',
      event: 'Pool liquidated BAL, LINK, REQ → $3,100 USDC',
    },
    {
      date: 'Feb 05',
      event: 'Rebate distributed: $7,300 USDC → wallet',
    },
  ];

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
        <Sidebar activeScreen="pool" onNavigate={onNavigate} />

        <div className="flex-1 p-7 pb-16 overflow-auto">
          <div className="mb-6">
            <h1 className="text-[24px] font-serif mb-2" style={{ color: 'var(--text)' }}>
              Pool Status
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Track your pooled assets and recovered value.
            </p>
          </div>

          <div
            className="rounded-[10px] p-5 mb-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <div className="text-[13px] font-semibold mb-2" style={{ color: 'var(--accent)' }}>
              How the Pool Works
            </div>
            <div className="text-[13px] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
              Assets sent to the pool are converted opportunistically when market conditions allow.
              Execution happens when aggregation thresholds are met or liquidity improves. Rebates are
              distributed periodically as USDC. This is not instant liquidation—it prioritizes better
              execution over speed.
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
                How it works:
              </div>
              <ul className="text-[12px] space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                <li>• Delayed execution for better pricing</li>
                <li>• Aggregated with other users for deeper liquidity</li>
                <li>• Rebates distributed when assets are converted</li>
                <li>• No withdrawals once deposited</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'CONTRIBUTED', value: contribution.inputValueUsd, sub: '3 deposits' },
              { label: 'RECOVERED', value: contribution.recoveredUsd, sub: 'USDC' },
              { label: 'PENDING', value: contribution.pendingUsd, sub: '6 tokens' },
              { label: 'WRITTEN OFF', value: contribution.writtenOffUsd, sub: '' },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-[10px] p-[18px]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-[10px]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {card.label}
                </div>
                <div className="text-[22px] font-mono font-medium mb-1" style={{ color: 'var(--text)' }}>
                  ${card.value.toLocaleString()}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-[10px] p-6 mb-8"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Recovery Rate
            </div>
            <div
              className="text-[40px] font-mono font-medium"
              style={{
                color:
                  recoveryRate >= 70
                    ? 'var(--accent)'
                    : recoveryRate >= 50
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
            >
              {recoveryRate.toFixed(1)}%
            </div>
          </div>

          <div
            className="rounded-[10px] p-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Activity Timeline
            </div>

            <div className="relative">
              <div
                className="absolute left-[4px] top-2 bottom-2 w-[2px]"
                style={{ background: 'var(--border)' }}
              />

              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-4 items-start">
                    <div
                      className="relative z-10 w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: 'var(--accent)' }}
                    />
                    <div className="flex-1">
                      <div className="text-[11px] font-mono mb-1" style={{ color: 'var(--text-tertiary)' }}>
                        {item.date}
                      </div>
                      <div className="text-[13px]" style={{ color: 'var(--text)' }}>
                        {item.event}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
