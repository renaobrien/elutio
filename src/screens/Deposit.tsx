import { useState, useEffect } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { ChevronDown, ArrowRight, AlertCircle } from 'lucide-react';

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  assetClass: 'core' | 'non_core';
}

interface DepositProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

export function Deposit({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: DepositProps) {
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [supportedChains, setSupportedChains] = useState<string[]>([]);
  const [tokensByChain, setTokensByChain] = useState<Record<string, TokenInfo[]>>({});
  const [loadingTokens, setLoadingTokens] = useState(true);

  // Fetch supported tokens on mount
  useEffect(() => {
    const fetchSupportedTokens = async () => {
      try {
        const env = import.meta as any;
        const supabaseUrl = env.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const anonKey = env.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        
        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-supported-tokens`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
            },
          }
        );

        const data = await response.json();
        
        if (data.chains && data.tokensByChain) {
          setSupportedChains(data.chains);
          setTokensByChain(data.tokensByChain);
          
          // Set default chain and token if available
          if (data.chains.length > 0) {
            const defaultChain = data.chains.includes('ethereum') ? 'ethereum' : data.chains[0];
            setSelectedChain(defaultChain);
            
            if (data.tokensByChain[defaultChain]?.length > 0) {
              setSelectedToken(data.tokensByChain[defaultChain][0].symbol);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch supported tokens:', err);
        // Fallback to empty state - error will show in UI
      } finally {
        setLoadingTokens(false);
      }
    };

    fetchSupportedTokens();
  }, []);

  const supportedTokens = tokensByChain[selectedChain] || [];

  // Update token if chain changes and current token not supported
  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
    const tokens = tokensByChain[chain];
    if (tokens && tokens.length > 0) {
      const currentTokenSupported = tokens.some(t => t.symbol === selectedToken);
      if (!currentTokenSupported) {
        setSelectedToken(tokens[0].symbol);
      }
    }
    setError(null);
    setSuccess(false);
  };

  const handleDeposit = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Call validate-deposit function
      const env = import.meta as any;
      const supabaseUrl = env.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const anonKey = env.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/validate-deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            chain: selectedChain,
            tokenAddress: '', // Will be resolved by function
            tokenSymbol: selectedToken,
            amount,
            walletAddress,
          }),
        }
      );

      const data = await response.json();

      if (!data.valid) {
        setError(data.reason || 'Deposit validation failed');
        setLoading(false);
        return;
      }

      // TODO: Once transfer infrastructure is ready, execute transfer here
      setSuccess(true);
      setAmount('');
      
      // Simulate processing
      setTimeout(() => {
        onNavigate('overview');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to validate deposit');
    } finally {
      setLoading(false);
    }
  };

  const isValid = amount && parseFloat(amount) > 0 && walletAddress;

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

        <div className="flex-1 p-7 pb-16 overflow-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-[24px] font-serif mb-2" style={{ color: 'var(--text)' }}>
              Deposit to Pool
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Select an asset and amount to deposit. Your funds will be pooled and deployed to yield-generating strategies.
            </p>
          </div>

          <div
            className="rounded-[10px] p-6 mb-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Chain Selection */}
            <div className="mb-6">
              <label className="text-[12px] font-semibold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Network
              </label>
              {loadingTokens ? (
                <div className="w-full px-3 py-2 rounded text-[14px] text-center" style={{
                  background: 'var(--input)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                  Loading chains...
                </div>
              ) : (
                <select
                  value={selectedChain}
                  onChange={(e) => handleChainChange(e.target.value)}
                  className="w-full px-3 py-2 rounded text-[14px]"
                  style={{
                    background: 'var(--input)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                  disabled={loadingTokens || supportedChains.length === 0}
                >
                  {supportedChains.map((chain) => (
                    <option key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Token Selection */}
            <div className="mb-6">
              <label className="text-[12px] font-semibold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Asset
              </label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full px-3 py-2 rounded text-[14px]"
                style={{
                  background: 'var(--input)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                disabled={loadingTokens || supportedTokens.length === 0}
              >
                {supportedTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol} {token.assetClass === 'core' ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="text-[12px] font-semibold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
                className="w-full px-3 py-2 rounded text-[14px]"
                style={{
                  background: 'var(--input)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  opacity: loading ? 0.6 : 1,
                }}
              />
              <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
                You can withdraw anytime
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded px-3 py-2 mb-6 flex items-start gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <AlertCircle size={16} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                <p className="text-[12px]" style={{ color: '#ef4444' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                className="rounded px-3 py-2 mb-6 flex items-start gap-2"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <AlertCircle size={16} style={{ color: '#22c55e', marginTop: '2px', flexShrink: 0 }} />
                <p className="text-[12px]" style={{ color: '#22c55e' }}>
                  Deposit submitted! You'll be redirected in a moment...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => onNavigate('overview')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeposit}
                disabled={!isValid || loading}
                style={{
                  opacity: isValid && !loading ? 1 : 0.6,
                  cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? 'Processing...' : `Deposit ${amount ? parseFloat(amount).toLocaleString() : '0'} ${selectedToken}`}
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div
            className="rounded-[10px] p-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--text)' }}>
              How It Works
            </h3>
            <ul className="space-y-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>1.</span>
                <span>Your deposit is added to the pool</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>2.</span>
                <span>Funds are deployed to yield strategies (currently Aave)</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>3.</span>
                <span>Yield is earned and reinvested daily</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--accent)' }}>4.</span>
                <span>Withdraw your principal + earnings anytime</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
