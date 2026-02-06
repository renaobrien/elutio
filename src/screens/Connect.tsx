import { useState } from 'react';
import { Wallet, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

interface ConnectProps {
  onConnect: (address: string) => void;
  onBack: () => void;
}

export function Connect({ onConnect, onBack }: ConnectProps) {
  const [viewAddress, setViewAddress] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
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
      setConnecting(false);
    }
  };

  const handleViewAddress = () => {
    const address = viewAddress.trim();
    if (!address) return;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    onConnect(address);
  };

  const exampleAddresses = [
    { label: "Vitalik's Wallet", address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
    { label: 'Example Treasury', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="h-14 flex items-center justify-between px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Logo />
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[12px] hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-[32px] font-serif mb-3" style={{ color: 'var(--text)' }}>
              How would you like to scan?
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Connect your wallet or view any address read-only
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Connect Wallet Card */}
            <div
              className="p-8 rounded-[12px] border-2 transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--accent)', opacity: 0.1 }}
                >
                  <Wallet size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-[20px] font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Connect Wallet
                </h2>
                <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
                  Connect your MetaMask or web3 wallet to scan your holdings and join our pooled yield service.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleConnectWallet}
                disabled={connecting}
                className="w-full py-3 text-[14px]"
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>

              <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }}></div>
                Full access • Can execute transactions
              </div>
            </div>

            {/* View Address Card */}
            <div
              className="p-8 rounded-[12px] border transition-all hover:scale-[1.02]"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--text-tertiary)', opacity: 0.1 }}
                >
                  <Eye size={24} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <h2 className="text-[20px] font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  View Address
                </h2>
                <p className="text-[13px] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
                  Enter any Ethereum address to scan holdings read-only. Perfect for demos and research.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={viewAddress}
                    onChange={(e) => setViewAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleViewAddress()}
                    placeholder="0x..."
                    className="w-full px-4 py-3 rounded-lg text-[13px] font-mono"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={handleViewAddress}
                  className="w-full py-3 text-[14px]"
                >
                  View Address
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Try an example:
                </div>
                {exampleAddresses.map((example) => (
                  <button
                    key={example.address}
                    onClick={() => setViewAddress(example.address)}
                    className="block w-full text-left px-3 py-2 rounded-md text-[11px] font-mono hover:bg-[var(--elevated)] transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    {example.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-tertiary)' }}></div>
                Read-only • No transactions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
