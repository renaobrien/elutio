import { useState, useEffect } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Search, Filter } from 'lucide-react';

interface Asset {
  id: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  chain: string;
  supported: boolean;
  max_liquidation_rate_daily: number;
  min_liquidity_usd: number;
  haircut_pct: number;
  max_pool_exposure_pct: number;
  max_slippage_pct: number;
  primary_dex: string;
  notes: string;
}

interface SupportedAssetsProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

const CHAINS = ['All', 'ethereum', 'polygon', 'arbitrum', 'optimism', 'base'];

export function SupportedAssets({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: SupportedAssetsProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedChain, setSelectedChain] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, search, selectedChain]);

  const fetchAssets = async () => {
    try {
      const env = import.meta as any;
      const supabaseUrl = env.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const anonKey = env.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-asset-registry`,
        {
          headers: {
            'Authorization': `Bearer ${anonKey}`,
          },
        }
      );

      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = assets;

    if (selectedChain !== 'All') {
      filtered = filtered.filter(a => a.chain === selectedChain);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.token_symbol.toLowerCase().includes(searchLower) ||
        a.token_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssets(filtered);
  };

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
        <Sidebar activeScreen="assets" onNavigate={onNavigate} />

        <div className="flex-1 p-4 md:p-7 pb-20 md:pb-16 overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-[20px] md:text-[24px] font-serif mb-1 md:mb-2" style={{ color: 'var(--text)' }}>
                  Supported Assets
                </h1>
                <p className="text-[12px] md:text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                  Tokens accepted by Elutio for managed custody and yield generation
                </p>
              </div>
              <a
                href="mailto:help@elut.io?subject=Token%20or%20chain%20request"
                className="px-3 py-2 rounded-[8px] text-[12px] border"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                Request token/chain
              </a>
            </div>
          </div>

          {/* Filters */}
          <div
            className="rounded-[10px] p-5 mb-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="text-[12px] font-semibold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Search
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by symbol or name..."
                    className="w-full pl-9 pr-3 py-2 rounded text-[14px]"
                    style={{
                      background: 'var(--input)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              </div>

              {/* Chain Filter */}
              <div>
                <label className="text-[12px] font-semibold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  <Filter size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Network
                </label>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="w-full px-3 py-2 rounded text-[14px]"
                  style={{
                    background: 'var(--input)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {CHAINS.map(chain => (
                    <option key={chain} value={chain}>
                      {chain === 'All' ? 'All Networks' : chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
          </div>

          {/* Assets Table */}
          {loading ? (
            <div
              className="rounded-[10px] p-8 text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                Loading assets...
              </p>
            </div>
          ) : (
            <div
              className="rounded-[10px] overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Asset
                      </th>
                      <th className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Network
                      </th>
                      <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Max Daily Liq.
                      </th>
                      <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Min Liquidity
                      </th>
                      <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Max Slippage
                      </th>
                      <th className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Primary DEX
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset, idx) => (
                      <tr
                        key={asset.id}
                        style={{
                          borderBottom: idx < filteredAssets.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <td className="px-5 py-4">
                          <div>
                            <strong style={{ color: 'var(--text)' }}>{asset.token_symbol}</strong>
                            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                              {asset.token_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-2 py-1 rounded text-[11px] font-semibold"
                            style={{
                              background: 'var(--accent-dim)',
                              color: 'var(--accent)',
                            }}
                          >
                            {asset.chain}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right" style={{ color: 'var(--text)' }}>
                          {(asset.max_liquidation_rate_daily * 100).toFixed(0)}%
                        </td>
                        <td className="px-5 py-4 text-right font-mono" style={{ color: 'var(--text)' }}>
                          ${(asset.min_liquidity_usd / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-5 py-4 text-right" style={{ color: 'var(--text)' }}>
                          {(asset.max_slippage_pct * 100).toFixed(1)}%
                        </td>
                        <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>
                          {asset.primary_dex}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredAssets.length === 0 && !loading && (
            <div
              className="rounded-[10px] p-8 text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                No assets found matching your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
