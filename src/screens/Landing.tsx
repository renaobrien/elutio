import { useState, useEffect } from 'react';
import { Sun, Moon, Wallet, X, ArrowLeft, Shield } from 'lucide-react';
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
  { address: '0xde21f729137c5af1b01d73af1dc21effa2b8a0d6', label: 'Gitcoin Matching Pool' },
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
          <div className="mb-4 text-[48px] leading-[1.2] font-serif" style={{ color: 'var(--text)' }}>
            <span className="font-mono" style={{ color: 'var(--accent)' }}>
              $<CountUp end={treasuryStats} duration={1200} />
            </span>
            <br />
            in active positions is sitting idle across Web3 wallets.
          </div>

          <div className="mb-3 text-[18px] font-serif" style={{ color: 'var(--text)' }}>
            Turn forgotten tokens into real yield.
          </div>

          <div className="mb-8 text-[14px] leading-[1.6] max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Scan any wallet to find dust, dormant positions, and stranded value across 11 chains.
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} className="px-8 py-3 text-[14px]">
            Scan Your Wallet
          </Button>
          <div className="mt-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Read-only. No private keys needed.
          </div>
        </div>

        <div
          className="mt-12 transition-all duration-700 delay-300"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <div className="flex items-center justify-center gap-3 md:gap-6 text-center max-w-xl mx-auto">
            {[
              { step: '1', title: 'Scan', desc: 'Read-only scan across 11 chains' },
              { step: '2', title: 'Deposit', desc: 'Deposit qualifying tokens to the pool' },
              { step: '3', title: 'Earn', desc: 'We batch-liquidate to USDC, you earn yield' },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold mb-2"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {item.step}
                </div>
                <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text)' }}>
                  {item.title}
                </div>
                <div className="text-[11px] leading-[1.4]" style={{ color: 'var(--text-tertiary)' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-8 max-w-xl mx-auto rounded-[10px] p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-[12px] font-semibold mb-3" style={{ color: 'var(--text)' }}>
              How we protect your assets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex gap-2">
                <Shield size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <span>Batched execution mitigates MEV exposure</span>
              </div>
              <div className="flex gap-2">
                <Shield size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <span>Conservative slippage and liquidity validation on all trades</span>
              </div>
              <div className="flex gap-2">
                <Shield size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <span>Only score-qualified tokens accepted into the pool</span>
              </div>
              <div className="flex gap-2">
                <Shield size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <span>Gas sponsored by Elutio — we take a small % of yield</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Elutio sponsors gas fees and takes a small percentage of yield. You keep the rest.
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
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
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preview any wallet (read-only)</label>
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
