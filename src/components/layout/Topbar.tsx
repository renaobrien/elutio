import { Sun, Moon, Wallet, Settings, ChevronDown, LogOut, Repeat2, Bell } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { resolveEnsName } from '../../services/walletService';

interface TopbarProps {
  walletAddress: string | null;
  onConnectWallet?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onDisconnectWallet?: () => void;
  onSwitchWallet?: () => void;
  onGoHome?: () => void;
}

export function Topbar({ walletAddress, onConnectWallet, onOpenSettings, onOpenNotifications, onDisconnectWallet, onSwitchWallet, onGoHome }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    onOpenSettings?.();
  };

  const handleDisconnect = () => {
    setDropdownOpen(false);
    onDisconnectWallet?.();
  };

  return (
    <div
      className="h-14 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      <button onClick={onGoHome} className="cursor-pointer hover:opacity-80 transition-opacity">
        <Logo />
      </button>

      <div className="flex items-center gap-4">
        {walletAddress ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-[8px] transition-colors"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--elevated)',
              }}
              title="Notifications"
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Bell size={16} />
            </button>

            <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-[8px] transition-all"
              style={{
                color: 'var(--accent)',
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
              }}
            >
              <Wallet size={14} />
              <span className="text-[12px] font-mono max-w-[120px] truncate">
                {ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </span>
              <ChevronDown size={12} style={{ opacity: 0.6 }} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-48 rounded-[10px] shadow-lg overflow-hidden"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2">
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    Connected Wallet
                  </div>
                  <div className="text-[12px] font-mono mt-1 break-all" style={{ color: 'var(--text)' }}>
                    {walletAddress}
                  </div>
                </div>

                <button
                  onClick={handleSettingsClick}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[13px] transition-colors"
                  style={{ 
                    color: 'var(--text)',
                    background: 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} />
                  Settings
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onSwitchWallet?.();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[13px] transition-colors"
                  style={{ 
                    color: 'var(--text)',
                    background: 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Repeat2 size={14} />
                  Switch Wallet
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[13px] transition-colors"
                  style={{ 
                    color: 'var(--error)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            )}
            </div>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            onClick={onConnectWallet}
            className="px-3 py-2 text-[12px] flex items-center gap-2"
          >
            <Wallet size={14} />
            Connect
          </Button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-[8px] transition-colors"
          style={{ 
            color: 'var(--text-secondary)',
            background: 'var(--elevated)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
