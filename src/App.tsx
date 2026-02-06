import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Landing } from './screens/Landing';
import { Connect } from './screens/Connect';
import { Scanning } from './screens/Scanning';
import { Overview } from './screens/Overview';
import { Deposit } from './screens/Deposit';
import { Earnings } from './screens/Earnings';
import { SupportedAssets } from './screens/SupportedAssets';
import { LiquidationPolicy } from './screens/LiquidationPolicy';
import { Alerts } from './screens/Alerts';
import { Pool } from './screens/Pool';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { Footer } from './components/layout/Footer';
import { MOCK_TOKENS } from './data/mockData';
import { getTokensByScanId, getScanById, Token as DBToken, WalletScan } from './services/walletService';

// Extend window to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

type Screen = 'landing' | 'connect' | 'scanning' | 'overview' | 'deposit' | 'earnings' | 'alerts' | 'pool' | 'history' | 'settings' | 'assets' | 'faq';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<DBToken[]>([]);
  const [scan, setScan] = useState<WalletScan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartScan = () => {
    setScreen('connect');
  };

  const handleConnectWallet = () => {
    setScreen('connect');
  };

  const handleViewExample = (address: string) => {
    // Auto-scan the example wallet immediately
    setWalletAddress(address);
    setScanId(`example-${Date.now()}`); // Temporary ID for demo
    setScreen('overview');
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setScreen('scanning');
  };

  const handleScanComplete = (newScanId: string) => {
    setScanId(newScanId);
    setScreen('overview');
  };

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    Promise.all([
      getTokensByScanId(scanId),
      getScanById(scanId)
    ])
      .then(([tokensData, scanData]) => {
        setTokens(tokensData);
        setScan(scanData);
      })
      .catch(err => {
        console.error('Failed to load scan data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scanId]);
  const handleNavigate = (destination: string) => {
    if (destination === 'docs' || destination === 'help') {
      return;
    }
    setScreen(destination as Screen);
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setScanId(null);
    setTokens([]);
    setScan(null);
    setScreen('landing');
    // Clear MetaMask connection
    localStorage.removeItem('walletConnected');
  };

  const handleSwitchWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask not found');
        return;
      }

      // Show MetaMask popup to switch accounts
      const accounts = await window.ethereum.request({ 
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {}
        }]
      }).catch(() => {
        // Fallback if wallet_requestPermissions not supported
        return window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
      });

      // If we got here, get the actual accounts
      const allAccounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (allAccounts && allAccounts.length > 0) {
        const newAddress = allAccounts[0];
        
        // Only proceed if it's a different wallet
        if (newAddress.toLowerCase() !== walletAddress?.toLowerCase()) {
          setScanId(null);
          setTokens([]);
          setScan(null);
          setWalletAddress(newAddress);
          setScreen('scanning');
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        console.log('User cancelled wallet switch');
      } else {
        console.error('Failed to switch wallet:', error);
      }
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          {screen === 'landing' && <Landing onConnectWallet={handleConnectWallet} onViewExample={handleViewExample} />}

          {screen === 'connect' && (
            <Connect onConnect={handleWalletConnect} onBack={() => setScreen('landing')} />
          )}

          {screen === 'scanning' && walletAddress && (
            <Scanning
              walletAddress={walletAddress}
              onComplete={handleScanComplete}
              onWalletChange={setWalletAddress}
            />
          )}

          {screen === 'overview' && (
            <Overview
              walletAddress={walletAddress}
              onNavigate={handleNavigate}
              onSwitchWallet={handleSwitchWallet}
              onDisconnect={handleDisconnect}
              tokens={tokens}
              scan={scan}
              loading={loading}
            />
          )}

          {screen === 'deposit' && (
            <Deposit
              walletAddress={walletAddress}
              onNavigate={handleNavigate}
              onSwitchWallet={handleSwitchWallet}
              onDisconnect={handleDisconnect}
            />
          )}

          {screen === 'alerts' && (
            <Alerts walletAddress={walletAddress} onNavigate={handleNavigate} onSwitchWallet={handleSwitchWallet} onDisconnect={handleDisconnect} />
          )}

          {screen === 'pool' && (
            <Earnings walletAddress={walletAddress} onNavigate={handleNavigate} onSwitchWallet={handleSwitchWallet} onDisconnect={handleDisconnect} />
          )}

          {screen === 'history' && (
            <History walletAddress={walletAddress} onNavigate={handleNavigate} onSwitchWallet={handleSwitchWallet} onDisconnect={handleDisconnect} />
          )}

          {screen === 'settings' && (
            <Settings walletAddress={walletAddress} onNavigate={handleNavigate} onSwitchWallet={handleSwitchWallet} onDisconnect={handleDisconnect} scan={scan} />
          )}

          {screen === 'assets' && (
            <SupportedAssets walletAddress={walletAddress} onNavigate={handleNavigate} onSwitchWallet={handleSwitchWallet} onDisconnect={handleDisconnect} />
          )}

          {screen === 'faq' && (
            <LiquidationPolicy walletAddress={walletAddress} onNavigate={handleNavigate} onSwitchWallet={handleSwitchWallet} onDisconnect={handleDisconnect} />
          )}
        </div>
        
        <Footer onNavigate={handleNavigate} />
      </div>
    </ThemeProvider>
  );
}

export default App;
