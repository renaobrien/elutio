import { useState } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { MOCK_ALERTS } from '../data/mockData';
import { Alert } from '../types';

interface AlertsProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

export function Alerts({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: AlertsProps) {
  const [tab, setTab] = useState<'active' | 'resolved'>('active');
  const [alerts] = useState(MOCK_ALERTS);

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);
  const displayAlerts = tab === 'active' ? activeAlerts : resolvedAlerts;

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
        <Sidebar activeScreen="alerts" onNavigate={onNavigate} />

        <div className="flex-1 p-4 md:p-7 pb-20 md:pb-16 overflow-y-auto">
          <div className="mb-4 md:mb-6">
            <h1 className="text-[20px] md:text-[24px] font-serif mb-1 md:mb-2" style={{ color: 'var(--text)' }}>
              Notifications
            </h1>
            <p className="text-[12px] md:text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Security and hygiene notifications for your treasury.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { key: 'active' as const, label: 'Active', count: activeAlerts.length },
              { key: 'resolved' as const, label: 'Resolved', count: resolvedAlerts.length },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-[6px] text-[13px] font-medium transition-all duration-150"
                style={{
                  border: `1px solid ${tab === t.key ? 'var(--border-active)' : 'var(--border)'}`,
                  background: tab === t.key ? 'var(--elevated)' : 'transparent',
                  color: tab === t.key ? 'var(--text)' : 'var(--text-secondary)',
                }}
              >
                {t.label} <span style={{ opacity: 0.4 }}>{t.count}</span>
              </button>
            ))}
          </div>

          {displayAlerts.length === 0 ? (
            <div
              className="text-center py-20 rounded-[10px]"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                {tab === 'active' ? 'No alerts. Your treasury is clean.' : 'No resolved alerts yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayAlerts.map(alert => {
                const borderColor = alert.severity === 'danger' ? 'var(--danger)' : 'var(--warning)';

                return (
                  <div
                    key={alert.id}
                    className="rounded-[8px] p-5"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${borderColor}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div
                          className="text-[14px] font-semibold mb-2"
                          style={{ color: borderColor }}
                        >
                          {alert.title}
                        </div>
                        <div
                          className="text-[12px] font-mono"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {alert.description}
                        </div>
                      </div>
                      <div
                        className="text-[11px] ml-4"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {alert.actions.map((action, i) => (
                        <Button
                          key={i}
                          variant={i === 0 && alert.severity === 'danger' ? 'danger' : 'secondary'}
                          className="text-[11px] px-3 py-1"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
