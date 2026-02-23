import { useState, useEffect } from 'react';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { TrendingUp, Shield, Clock, Droplets } from 'lucide-react';

interface LiquidationPolicyProps {
  walletAddress: string | null;
  onNavigate: (screen: string) => void;
  onSwitchWallet?: () => void;
  onDisconnect?: () => void;
}

export function LiquidationPolicy({ walletAddress, onNavigate, onSwitchWallet, onDisconnect }: LiquidationPolicyProps) {
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
        <Sidebar activeScreen="faq" onNavigate={onNavigate} />

        <div className="flex-1 p-4 md:p-7 pb-20 md:pb-16 overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-[20px] md:text-[24px] font-serif mb-1 md:mb-2" style={{ color: 'var(--text)' }}>
              FAQs
            </h1>
            <p className="text-[12px] md:text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Answers to common questions about how Elutio works
            </p>
          </div>

          {/* Trust & Safety */}
          <div
            className="rounded-[10px] p-6 mb-6"
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--accent)',
            }}
          >
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Trust & Safety
            </h2>
            <div className="space-y-5 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text)' }}>Where and how are tokens liquidated?</strong>
                <p className="mt-1">
                  Tokens are batch-liquidated through established DEX infrastructure on each token's native chain.
                  We validate liquidity depth before executing and enforce conservative slippage limits.
                  Liquidation proceeds when batch thresholds are met.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>How do you prevent front-running?</strong>
                <p className="mt-1">
                  We mitigate MEV through batched execution and undisclosed execution parameters.
                  Trades are not per-user or on-demand — exact timing, composition, and routing are not published.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>How is yield managed?</strong>
                <p className="mt-1">
                  All tokens are liquidated to USDC and deployed to stable yield strategies. You earn proportional
                  to your share of the pool. Elutio takes a small percentage of yield generated, not your principal.
                  Gas fees are sponsored by Elutio.
                </p>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div
            className="rounded-[10px] p-6 mb-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Core Principles
            </h2>
            <div className="space-y-4 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex gap-3">
                <Shield size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text)' }}>Conservative Liquidation</strong>
                  <p className="mt-1">
                    Elutio liquidates assets gradually and conservatively. We never promise 100% liquidation of any token.
                    Each asset has daily liquidation limits to prevent market impact.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text)' }}>Batched Execution</strong>
                  <p className="mt-1">
                    Liquidations happen in batches, not per-user. This amortizes gas costs and improves execution quality.
                    Timing depends on pool size, market conditions, and liquidity availability.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Droplets size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text)' }}>Liquidity-Aware</strong>
                  <p className="mt-1">
                    We only liquidate when sufficient liquidity exists. If a token's liquidity drops below thresholds,
                    liquidation is paused until conditions improve.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <TrendingUp size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text)' }}>Yield Maximization</strong>
                  <p className="mt-1">
                    Residual tokens that haven't liquidated yet still count toward your contribution. Once liquidated and
                    deployed, they begin earning yield proportional to your share.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Liquidation Parameters */}
          <div
            className="rounded-[10px] p-6 mb-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Global Parameters
            </h2>
            <div className="grid grid-cols-2 gap-6 text-[13px]">
              <div>
                <div className="text-[11px] uppercase font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Maximum Slippage
                </div>
                <div className="text-[20px] font-semibold" style={{ color: 'var(--accent)' }}>
                  3%
                </div>
                <p className="mt-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  Maximum price impact allowed per liquidation
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Safety Haircut
                </div>
                <div className="text-[20px] font-semibold" style={{ color: 'var(--accent)' }}>
                  2%
                </div>
                <p className="mt-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  Conservative buffer applied to all liquidations
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Max Pool Exposure
                </div>
                <div className="text-[20px] font-semibold" style={{ color: 'var(--accent)' }}>
                  15%
                </div>
                <p className="mt-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  Maximum % of pool in any single asset
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Daily Liquidation Rate
                </div>
                <div className="text-[20px] font-semibold" style={{ color: 'var(--accent)' }}>
                  5-15%
                </div>
                <p className="mt-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  Varies by asset liquidity and market depth
                </p>
              </div>
            </div>
          </div>

          {/* When Liquidation Happens */}
          <div
            className="rounded-[10px] p-6 mb-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              When Liquidation Occurs
            </h2>
            <div className="space-y-3 text-[14px]">
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--accent)' }}>1.</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Batch Threshold Met</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    When aggregate token value across all users exceeds $10,000 or weekly cadence is reached
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--accent)' }}>2.</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Liquidity Validated</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    DEX liquidity checked against minimum thresholds. Liquidation only proceeds if sufficient depth exists
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--accent)' }}>3.</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Execution via Primary DEX</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Swap executed on token's primary DEX (Uniswap v3, Curve, etc.) with slippage protection
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--accent)' }}>4.</span>
                <div>
                  <strong style={{ color: 'var(--text)' }}>USDC Pooled</strong>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Resulting USDC added to pool, shares recalculated, and deployed to yield strategies
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div
            className="rounded-[10px] p-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 text-[14px]">
              <div>
                <strong style={{ color: 'var(--text)' }}>How does Elutio make money?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  We sponsor gas fees and take a small percentage of yield generated from the USDC pool.
                  No deposit fees, no withdrawal fees, no cut of your principal. Our revenue comes only
                  from a share of yield.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>If my tokens are small, how does this work?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Individually, small positions aren't worth the gas to sell. Aggregated across many users,
                  those same tokens form meaningful liquidity that can be batch-liquidated efficiently.
                  Only tokens that pass our viability scoring are accepted — we don't take on positions
                  we can't liquidate.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>Do I give up custody of my tokens?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Yes. You deposit tokens into the Elutio pool. We batch-liquidate them into USDC and
                  deploy to yield strategies. Think of it like depositing into a yield protocol — you
                  earn proportional to your contribution.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>What does "policy" mean here?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This refers to Elutio’s liquidation and custody policy, not governance or voting policy.
                  It describes how assets are handled and when liquidation can occur.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>Where can I see supported tokens?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  View the full allowlist on the Supported Assets page.
                  <button
                    onClick={() => onNavigate('assets')}
                    className="ml-2 text-[12px] underline"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Open Supported Assets
                  </button>
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>What if my token never liquidates?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Residual tokens remain in custody and count toward your contribution. If liquidity improves,
                  liquidation will resume. You still participate in yield from already-liquidated assets.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>Can I choose when to liquidate?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  No. Liquidation is centralized and managed by Elutio. This allows us to optimize execution,
                  reduce gas costs, and prevent adverse market impact.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>Why are daily liquidation rates different per token?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Rates depend on DEX liquidity. High-liquidity tokens (AAVE, UNI) can liquidate faster.
                  Lower-liquidity tokens (GTC) liquidate slower to prevent price impact.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text)' }}>What happens to bridged assets?</strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Elutio does not bridge assets. Tokens are liquidated on their native chain where you transferred them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
