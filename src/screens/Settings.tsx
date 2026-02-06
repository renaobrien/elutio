import { useEffect, useState } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { WalletScan } from '../services/walletService';
import { resolveEnsName } from '../services/walletService';

interface SettingsProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
  scan?: WalletScan | null;
}

export function Settings({ walletAddress, onNavigate, onSwitchWallet, onDisconnect, scan }: SettingsProps) {
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!walletAddress) {
      setEnsName(null);
      return;
    }

    resolveEnsName(walletAddress).then(name => {
      if (mounted) setEnsName(name);
    });

    return () => {
      mounted = false;
    };
  }, [walletAddress]);

  const lastScan = scan?.scanned_at ? new Date(scan.scanned_at).toLocaleString() : 'Not scanned yet';

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
        <Sidebar activeScreen="settings" onNavigate={onNavigate} />

        <div className="flex-1 p-7 pb-16 overflow-auto">
          <div className="mb-6">
            <h1 className="text-[24px] font-serif mb-2" style={{ color: 'var(--text)' }}>
              Settings
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Wallet preferences and scan defaults.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-[10px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-[13px] font-medium mb-3" style={{ color: 'var(--text)' }}>
                Wallet
              </div>
              <div className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                ENS: <span style={{ color: 'var(--text)' }}>{ensName || 'Not found'}</span>
              </div>
              <div className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Address: <span style={{ color: 'var(--text)' }}>{walletAddress || 'Not connected'}</span>
              </div>
              <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                Last scan: <span style={{ color: 'var(--text)' }}>{lastScan}</span>
              </div>
            </div>

            <div className="rounded-[10px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-[13px] font-medium mb-3" style={{ color: 'var(--text)' }}>
                Real data (current)
              </div>
              <div className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Total balance: <span style={{ color: 'var(--text)' }}>{scan ? `$${Number(scan.total_balance_usd).toLocaleString()}` : '—'}</span>
              </div>
              <div className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Recoverable: <span style={{ color: 'var(--text)' }}>{scan ? `$${Number(scan.recoverable_usd).toLocaleString()}` : '—'}</span>
              </div>
              <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                Hygiene score: <span style={{ color: 'var(--text)' }}>{scan ? scan.hygiene_score : '—'}</span>
              </div>
            </div>

            <div className="rounded-[10px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-[13px] font-medium mb-3" style={{ color: 'var(--text)' }}>
                Scan defaults
              </div>
              <div className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Default chain
              </div>
              <select
                className="w-full text-[12px] px-3 py-2 rounded-[6px]"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                disabled
              >
                <option>Ethereum (coming soon)</option>
              </select>

              <div className="text-[12px] mt-4 mb-2" style={{ color: 'var(--text-secondary)' }}>
                Dust threshold
              </div>
              <input
                className="w-full text-[12px] px-3 py-2 rounded-[6px]"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                placeholder="$10 (coming soon)"
                disabled
              />
            </div>

            <div className="rounded-[10px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-[13px] font-medium mb-3" style={{ color: 'var(--text)' }}>
                Notifications
              </div>
              <div className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email for alerts
              </div>
              <input
                className="w-full text-[12px] px-3 py-2 rounded-[6px]"
                style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                placeholder="you@company.com (coming soon)"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
