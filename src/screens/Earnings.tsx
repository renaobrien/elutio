import { useState } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { TrendingUp, Wallet, Send } from 'lucide-react';

interface PoolPosition {
  id: string;
  chain: string;
  asset: string;
  depositedAmount: number;
  currentValue: number;
  yieldEarned: number;
  yieldPercent: number;
  depositDate: string;
  apy: number;
}

interface EarningsProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

// Mock pool positions - in production, fetch from Supabase
const MOCK_POOL_POSITIONS: PoolPosition[] = [
  {
    id: '1',
    chain: 'ethereum',
    asset: 'USDC',
    depositedAmount: 10000,
    currentValue: 10142,
    yieldEarned: 142,
    yieldPercent: 1.42,
    depositDate: '2025-01-15',
    apy: 5.2,
  },
  {
    id: '2',
    chain: 'polygon',
    asset: 'USDC',
    depositedAmount: 5000,
    currentValue: 5058,
    yieldEarned: 58,
    yieldPercent: 1.16,
    depositDate: '2025-01-20',
    apy: 4.8,
  },
];

export function Earnings({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: EarningsProps) {
  const [selectedPosition, setSelectedPosition] = useState<PoolPosition | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const totalDeposited = MOCK_POOL_POSITIONS.reduce((sum, p) => sum + p.depositedAmount, 0);
  const totalCurrent = MOCK_POOL_POSITIONS.reduce((sum, p) => sum + p.currentValue, 0);
  const totalYield = totalCurrent - totalDeposited;
  const averageAPY = MOCK_POOL_POSITIONS.length > 0
    ? MOCK_POOL_POSITIONS.reduce((sum, p) => sum + p.apy, 0) / MOCK_POOL_POSITIONS.length
    : 0;

  const handleWithdraw = () => {
    // TODO: Execute withdrawal transaction
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

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

        <div className="flex-1 p-7 pb-16 overflow-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-[24px] font-serif mb-2" style={{ color: 'var(--text)' }}>
              Earnings Dashboard
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Track your pool deposits and earned yield across all networks
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div
              className="rounded-[10px] p-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-[12px] uppercase font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <Wallet size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Total Deposited
              </div>
              <div className="text-[20px] font-semibold" style={{ color: 'var(--text)' }}>
                ${totalDeposited.toLocaleString()}
              </div>
            </div>

            <div
              className="rounded-[10px] p-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-[12px] uppercase font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Current Value
              </div>
              <div className="text-[20px] font-semibold" style={{ color: 'var(--text)' }}>
                ${totalCurrent.toLocaleString()}
              </div>
            </div>

            <div
              className="rounded-[10px] p-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-[12px] uppercase font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Yield Earned
              </div>
              <div className="text-[20px] font-semibold" style={{ color: 'var(--accent)' }}>
                ${totalYield.toLocaleString()}
              </div>
            </div>

            <div
              className="rounded-[10px] p-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-[12px] uppercase font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Average APY
              </div>
              <div className="text-[20px] font-semibold" style={{ color: 'var(--accent)' }}>
                {averageAPY.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Pool Positions Table */}
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
                      Deposited
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Current
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Yield
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      APY
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_POOL_POSITIONS.map((position, idx) => (
                    <tr
                      key={position.id}
                      onClick={() => setSelectedPosition(position)}
                      style={{
                        borderBottom: idx < MOCK_POOL_POSITIONS.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        background: selectedPosition?.id === position.id ? 'var(--accent-dim)' : 'transparent',
                      }}
                    >
                      <td className="px-5 py-4">
                        <strong style={{ color: 'var(--text)' }}>{position.asset}</strong>
                      </td>
                      <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>
                        {position.chain}
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: 'var(--text)' }}>
                        ${position.depositedAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: 'var(--text)' }}>
                        ${position.currentValue.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-mono" style={{ color: 'var(--accent)' }}>
                        +${position.yieldEarned.toLocaleString()} ({position.yieldPercent.toFixed(2)}%)
                      </td>
                      <td className="px-5 py-4 text-right" style={{ color: 'var(--accent)' }}>
                        {position.apy.toFixed(2)}%
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPosition(position);
                            setShowWithdrawModal(true);
                          }}
                          className="text-[12px] px-2 py-1 rounded"
                          style={{
                            background: 'var(--accent-dim)',
                            color: 'var(--accent)',
                          }}
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {MOCK_POOL_POSITIONS.length === 0 && (
            <div
              className="rounded-[10px] p-8 text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                No active pool positions yet
              </p>
              <Button
                variant="primary"
                onClick={() => onNavigate('deposit')}
                style={{ marginTop: '16px' }}
              >
                Make Your First Deposit
              </Button>
            </div>
          )}

          {/* Withdraw Modal */}
          {showWithdrawModal && selectedPosition && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}
              onClick={() => setShowWithdrawModal(false)}
            >
              <div
                className="rounded-[10px] p-6 w-full max-w-sm"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-[18px] font-serif mb-4" style={{ color: 'var(--text)' }}>
                  Withdraw {selectedPosition.asset}
                </h2>

                <div className="mb-4">
                  <label className="text-[12px] font-semibold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    Amount
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: ${selectedPosition.currentValue}`}
                    className="w-full px-3 py-2 rounded text-[14px]"
                    style={{
                      background: 'var(--input)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  />
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    Current value: ${selectedPosition.currentValue.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
