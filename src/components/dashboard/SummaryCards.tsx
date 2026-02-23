import { useState } from 'react';
import { Info } from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { HygieneBar } from '../ui/HygieneBar';
import { WalletMetrics } from '../../types';

interface SummaryCardsProps {
  metrics: WalletMetrics;
  dustThreshold: number;
  onDustThresholdChange: (value: number) => void;
}

export function SummaryCards({ metrics, dustThreshold, onDustThresholdChange }: SummaryCardsProps) {
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const dustUsd = metrics.dustUsd || 0;
  const dustCount = metrics.positions.dust;
  const positionsUsd = metrics.positionsUsd;
  const positionsCount = metrics.positions.positions;
  
  const cards = [
    {
      label: 'TOTAL BALANCE',
      value: metrics.totalBalanceUsd,
      sub: `${metrics.positions.positions + metrics.positions.dust + metrics.positions.unsafe} tokens`,
      accent: false,
      prefix: '$',
      decimals: 2,
      info: null,
    },
    {
      label: 'TOTAL DUST',
      value: dustUsd,
      sub: `${dustCount} positions`,
      accent: true,
      prefix: '$',
      decimals: 2,
      info: null,
      selector: true,
      thresholdValue: dustThreshold,
      onThresholdChange: onDustThresholdChange,
    },
    {
      label: 'POSITIONS',
      value: positionsUsd,
      sub: (() => {
        const pricedCount = positionsCount - (metrics.positionsUnpricedCount || 0);
        if (positionsUsd > 0 && metrics.positionsUnpricedCount > 0) {
          return `${pricedCount} priced + ${metrics.positionsUnpricedCount} unpriced`;
        }
        if (positionsUsd === 0 && metrics.positionsUnpricedCount > 0) {
          return `${metrics.positionsUnpricedCount} unpriced positions`;
        }
        return `${positionsCount} positions`;
      })(),
      accent: false,
      prefix: '$',
      decimals: 2,
      info: 'Positions are balances at or above your dust threshold.',
    },
    {
      label: 'POTENTIAL EARNINGS',
      value: metrics.opportunityCostUsd,
      sub: metrics.unpricedCount > 0
        ? `Est. annual yield at 7% APY (includes $1 floor for ${metrics.unpricedCount} unpriced)`
        : 'Estimated annual yield at 7% APY',
      accent: false,
      prefix: '$',
      decimals: 0,
      info: 'Estimated yearly yield after consolidation at 7% APY. This is earnings, not principal to be claimed.',
    },
    {
      label: 'HYGIENE',
      custom: true,
      score: metrics.hygieneScore,
      info: `${metrics.dormantCount} positions lost to entropy. ${metrics.unpricedCount} assets lack pricing data.`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-7">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-[10px] p-[18px] relative group"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${card.accent ? 'var(--accent-border)' : 'var(--border)'}`,
          }}
        >
          <div className="flex items-center justify-between mb-[10px]">
            <div
              className="text-[9px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {card.label}
            </div>
            {card.info && (
              <div
                onMouseEnter={() => setHoveredInfo(card.label)}
                onMouseLeave={() => setHoveredInfo(null)}
                className="relative"
              >
                <Info
                  size={12}
                  className="cursor-help"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                {hoveredInfo === card.label && (
                  <div
                    className="absolute bottom-full right-0 mb-2 p-2 rounded-[4px] text-[10px] w-48 z-10 shadow-lg"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {card.info}
                  </div>
                )}
              </div>
            )}
          </div>

          {card.custom ? (
            <>
              <div
                className="text-[22px] font-mono font-medium mb-[6px]"
                style={{ color: 'var(--warning)' }}
              >
                {card.score}
              </div>
              <HygieneBar score={card.score!} />
            </>
          ) : (
            <>
              <div
                className="text-[22px] font-mono font-medium leading-[1.1] mb-1"
                style={{ color: card.accent ? 'var(--accent)' : 'var(--text)' }}
              >
                {(card as any).valueDisplay !== undefined ? (
                  // Show custom display (e.g., "57 Assets")
                  <>
                    {(card as any).valueDisplay}
                    <span className="text-[14px] ml-1" style={{ color: 'var(--text-secondary)' }}>
                      {(card as any).valueUnit}
                    </span>
                  </>
                ) : (
                  // Show default CountUp
                  <>
                    {card.prefix}
                    <CountUp end={card.value!} decimals={card.decimals || 0} />
                  </>
                )}
              </div>
              {(card as any).selector ? (
                <div className="flex items-center gap-2">
                  <select
                    value={(card as any).thresholdValue}
                    onChange={(e) => (card as any).onThresholdChange(Number(e.target.value))}
                    className="px-2 py-1 rounded text-[9px] outline-none"
                    style={{
                      background: 'var(--elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <option value={1000}>$1K</option>
                    <option value={5000}>$5K</option>
                    <option value={10000}>$10K</option>
                    <option value={20000}>$20K</option>
                    <option value={50000}>$50K</option>
                  </select>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    threshold
                  </span>
                </div>
              ) : (
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {card.sub}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
