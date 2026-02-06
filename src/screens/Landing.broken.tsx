import { useState, useEffect } from 'react';
import { Sun, Moon, Wallet, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { CountUp } from '../components/ui/CountUp';

interface LandingProps {
  onConnect: (address: string) => void;
}

export function Landing({ onConnect }: LandingProps) {
  const { theme, toggleTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [showReadOnlyInfo, setShowReadOnlyInfo] = useState(false);
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

  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // This will trigger MetaMask popup for user confirmation
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          onConnect(accounts[0]);
        }
      } else {
        alert('Please install MetaMask or another web3 wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
    

  co

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="h-12 flex items-center justify-between px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={handleConnectWallet}
            disabled={walletConnecting}
            className="px-4 py-1.5 text-[12px] flex items-center gap-2"
          >
            <Wallet size={14} />
            {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
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
            Treasuries sit on
            <br />
            <span className="font-mono" style={{ color: 'var(--accent)' }}>
              $<CountUp end={treasuryStats} duration={1200} />
            </span>
            <br />
            in unusable assets.
          </div>

          <div className="mb-10 text-[14px] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
            Individually worthless. Collectively recoverable.
          </div>

          {!viewOnlyMode ? (
            <>
              <Button variant="primary" onClick={handleConnectWallet} disabled={walletConnecting} className="px-8 py-3 text-[14px]">
                <Wallet size={16} className="mr-2" />
                {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>

              <div className="mt-4">
                <button
                  onClick={() => setViewOnlyMode(true)}
                  className="text-[12px] hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
          <Button variant="primary" onClick={handleConnectWallet} disabled={walletConnecting} className="px-8 py-3 text-[14px]">
            {walletConnecting ? 'Connecting...' : 'Scan Wallet'}
          </Button></span>
            <button
              onMouseEnter={() => setShowReadOnlyInfo(true)}
              onMouseLeave={() => setShowReadOnlyInfo(false)}
              className="p-1 rounded hover:bg-[var(--elevated)] transition-colors relative"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Info size={14} />
              
              {showReadOnlyInfo && (
                <div
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 p-3 rounded-[8px] text-[11px] leading-[1.5] w-48 z-10 shadow-lg"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  We never touch your assets or approvals. This scan only reads your public blockchain data to classify your holdings and identify recovery opportunities.
                </div>
              )}
            </button>
          </div>
        </div>

        <div
          className="mt-24 transition-all duration-700 delay-300"
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
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Ethereum
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
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/worldcoin-wld-logo.png" alt="" className="w-4 h-4 rounded-full" />
                World Chain
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/avalanche-avax-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Avalanche
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="" className="w-4 h-4 rounded-full" />
                BNB Chain
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/celo-celo-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Celo
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/sei-sei-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Sei
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/uniswap-uni-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Unichain
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Solana
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="" className="w-4 h-4 rounded-full" />
                Bitcoin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
