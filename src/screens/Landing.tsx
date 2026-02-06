import { useState, useEffect } from 'react';
import { Sun, Moon, Wallet, X, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { CountUp } from '../components/ui/CountUp';

interface LandingProps {
  onConnectWallet: () => void;
  onViewExample: (address: string) => void;
}

const EXAMPLE_WALLETS = [
  { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37AA96045', label: 'Vitalik Buterin' },
  { address: '0x1f573d6b32cf0d1d2c90d2eb362f0394f47738e4', label: 'Bancor Treasury' },
  { address: '0xf977814e90da44bfa03b6295a0616a897441863a', label: 'Binance Wallet' },
];

export function Landing({ onConnectWallet, onViewExample }: LandingProps) {
  const { theme, toggleTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [showBrandingTooltip, setShowBrandingTooltip] = useState(false);
  const [treasuryStats, setTreasuryStats] = useState(3200000000); // Default fallback

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    
    // Fetch real treasury stats
    fetch('https://lecsyaajqqomutfjmmhx.supabase.co/functions/v1/treasury-stats')
      .then(res => res.json())
      .then(data => {
        if (data.estimatedTotal) {
          setTreasuryStats(data.estimatedTotal);
        }
      })
      .catch(err => {
        console.error('Failed to fetch treasury stats:', err);
      });
  }, []);

  const handleManualViewAddress = () => {
    if (manualAddress.trim()) {
      onViewExample(manualAddress.trim());
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="h-12 flex items-center justify-between px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--elevated)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div
          className="text-center max-w-2xl transition-all duration-500"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <div className="mb-6 text-[48px] leading-[1.2] font-serif" style={{ color: 'var(--text)' }}>
            There are
            <br />
            <span className="font-mono" style={{ color: 'var(--accent)' }}>
              $<CountUp end={treasuryStats} duration={1200} />
            </span>
            <br />
            in unusable assets in Web3 right now.
          </div>

          <div className="mb-10 text-[14px] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
            Individually worthless. Collectively recoverable.
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} className="px-8 py-3 text-[14px]">
            Try It Out
          </Button>
        </div>

        <div
          className="mt-12 transition-all duration-700 delay-300"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <div className="text-[14px] text-center" style={{ color: 'var(--text-secondary)' }}>
            Scan Holdings <span style={{ color: 'var(--text-tertiary)' }}>•</span> Classify Recovery <span style={{ color: 'var(--text-tertiary)' }}>•</span> Allocate
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              Supported chains:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] relative group" 
                onMouseEnter={() => setShowBrandingTooltip(true)}
                onMouseLeave={() => setShowBrandingTooltip(false)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Ethereum
                {showBrandingTooltip && (
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 rounded-[8px] text-[11px] w-56 z-10 shadow-lg text-center"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                    }}
                  >
                    🎯 Recover lost value across Ethereum mainnet
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Polygon
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/arbitrum-arb-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Arbitrum
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/optimism-ethereum-op-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Optimism
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/base-base-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Base
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-[var(--elevated)] rounded-lg max-w-md w-full p-6" style={{ border: '1px solid var(--border)' }}>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center gap-2 text-[14px] font-medium transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>

            <h2 className="text-[18px] font-medium mb-6" style={{ color: 'var(--text)' }}>How would you like to scan?</h2>

            <div className="space-y-4">
              {/* Connect Wallet */}
              <button
                onClick={() => {
                  onConnectWallet();
                  setShowModal(false);
                }}
                className="w-full p-4 rounded-lg border-2 transition-all hover:border-[var(--accent)]"
                style={{ 
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Wallet size={20} style={{ color: 'var(--accent)' }} />
                  <div className="text-left">
                    <div className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>Connect Wallet</div>
                    <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Use MetaMask or another provider</div>
                  </div>
                </div>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3" style={{ background: 'var(--elevated)', color: 'var(--text-tertiary)' }}>or</span>
                </div>
              </div>

              {/* View Address */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>View Address</label>
                <input
                  type="text"
                  placeholder="Enter wallet address"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualViewAddress()}
                  className="w-full px-3 py-2 rounded-lg text-[14px] mb-3 outline-none focus:ring-1"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    focusRingColor: 'var(--accent)',
                  }}
                />
                <button
                  onClick={handleManualViewAddress}
                  disabled={!manualAddress.trim()}
                  className="w-full py-2 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: manualAddress.trim() ? 'var(--accent)' : 'var(--surface)',
                    color: manualAddress.trim() ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  View Address
                </button>
              </div>

              {/* Example Wallets */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Try Example</label>
                <div className="space-y-2">
                  {EXAMPLE_WALLETS.map((wallet, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onViewExample(wallet.address);
                        setShowModal(false);
                      }}
                      className="w-full p-2 rounded-lg text-[12px] text-left transition-colors"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {wallet.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
