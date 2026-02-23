import { useState, useEffect } from 'react';
import { CountUp } from '../components/ui/CountUp';
import { scanWallet, scanWalletAllChains } from '../services/walletService';

interface ScanningProps {
  walletAddress: string;
  onComplete: (scanId: string) => void;
  onWalletChange?: (address: string) => void;
  autoStart?: boolean;
}

const SAMPLE_WALLETS = [
  { id: 'elutio', name: 'Elutio Treasury', address: '0x3c90b2F1bD4E8D2a6a2F1f7C5a6a7E0a9d4f2b3C' },
  { id: 'aave', name: 'Aave Grants', address: '0x2a3D9B0c5E7E2D4f2a9E6E9b9c0d3f6b2C1a5e7F' },
  { id: 'uni', name: 'Uniswap Multisig', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  { id: 'op', name: 'Optimism Foundation', address: '0x4200000000000000000000000000000000000042' },
  { id: 'arb', name: 'Arbitrum DAO', address: '0x912CE59144191C1204E64559FE8253a0e49E6548' },
];

export function Scanning({ walletAddress, onComplete, onWalletChange, autoStart = false }: ScanningProps) {
  const [progress, setProgress] = useState(0);
  const [tokensFound, setTokensFound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>(walletAddress);
  const [isScanning, setIsScanning] = useState(autoStart);
  const [showWalletSelector] = useState(!autoStart); // Hide selector when autoStart is true

  useEffect(() => {
    if (!isScanning) return;
    let mounted = true;
    const totalDuration = 3000;
    const startTime = Date.now();

    const animate = () => {
      if (!mounted) return;

      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / totalDuration, 1);

      setProgress(p * 100);
      
      // Simulate token discovery during scan (removed when real count arrives)
      if (tokensFound === 0) {
        setTokensFound(Math.floor(p * 104)); // Estimate based on Gitcoin wallet
      }

      if (p < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    scanWalletAllChains(selectedWallet)
      .then(result => {
        if (!mounted) return;
        setScanId(result.scanId);
        // Robust tokensCount extraction - check all possible naming conventions
        const count =
          result?.metrics?.tokensCount ??
          result?.metrics?.tokens_count ??
          result?.tokensCount ??
          result?.tokens_count ??
          result?.tokens?.length ??
          0;
        setTokensFound(count);

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalDuration - elapsed);
        setTimeout(() => {
          if (mounted) onComplete(result.scanId);
        }, remaining + 300);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to scan wallet');
        setIsScanning(false);
      });

    return () => {
      mounted = false;
    };
  }, [isScanning, selectedWallet, onComplete]);

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
            Scan Failed
          </div>
          <div className="text-[12px] mb-6" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-8 text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
          {isScanning ? `Scanning ${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}` : 'Select a wallet to scan'}
        </div>

        {!scanId && showWalletSelector && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'connected', name: 'Connected Wallet', address: walletAddress },
              ...SAMPLE_WALLETS,
            ].map(wallet => (
              <button
                key={wallet.id}
                onClick={() => {
                  setSelectedWallet(wallet.address);
                  onWalletChange?.(wallet.address);
                }}
                className="px-3 py-1.5 text-[11px] rounded-md transition-all"
                style={{
                  background: selectedWallet === wallet.address ? 'var(--accent)' : 'var(--surface)',
                  color: selectedWallet === wallet.address ? 'var(--bg)' : 'var(--text-secondary)',
                  border: `1px solid ${selectedWallet === wallet.address ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {wallet.name}
              </button>
            ))}
          </div>
        )}

        {!isScanning && !scanId && showWalletSelector && (
          <button
            onClick={() => {
              setError(null);
              setTokensFound(0);
              setProgress(0);
              setIsScanning(true);
            }}
            className="px-4 py-2 rounded-lg text-[12px] font-medium"
            style={{
              background: 'var(--accent)',
              color: 'var(--bg)',
            }}
            disabled={!selectedWallet}
          >
            Scan Address
          </button>
        )}

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Tokens found
          </div>
          <div className="text-[28px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
            {tokensFound > 0 ? tokensFound : '...'}
          </div>
        </div>

        <div className="mb-6 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <div className="mb-2">Wallet: {selectedWallet.slice(0, 6)}...{selectedWallet.slice(-4)}</div>
          <div>{scanId ? 'Classifying positions...' : isScanning ? 'Fetching balances...' : 'Ready to scan'}</div>
        </div>

        <div
          className="relative h-[2px] rounded-full overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: 'var(--accent)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
