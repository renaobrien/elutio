import { useState } from 'react';
import { Info } from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { HygieneBar } from '../ui/HygieneBar';
import { WalletMetrics } from '../../types';

interface SummaryCardsProps {
  metrics: WalletMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [dustThreshold, setDustThreshold] = useState<number>(10);
  const cards = [
    {
      label: 'TOTAL BALANCE',
      value: metrics.totalBalanceUsd,
      sub: `${metrics.positions.core + metrics.positions.recoverable + metrics.positions.dust + metrics.positions.unsafe} tokens`,
      accent: false,
      prefix: '$',
      decimals: 2,
      info: null,
    },
    {
      label: 'TOTAL DUST',
      value: metrics.dustUsd || 0,
      sub: `${metrics.positions.dust} positions under $${dustThreshold}`,
      accent: true,
      prefix: '$',
      decimals: 2,
      info: null,
      selector: true,
      thresholdValue: dustThreshold,
      onThresholdChange: setDustThreshold,
    },
    {
      label: 'RECOVERABLE',
      value: metrics.recoverableUsd,
      sub: `${metrics.positions.recoverable} positions`,
      accent: false,
      prefix: '$',
      decimals: 2,
      info: 'Assets eligible for pool deposit and yield generation.',
    },
    {
      label: 'POTENTIAL EARNINGS',
      value: Math.floor(metrics.recoverableUsd * 0.02),
      sub: 'Estimated APY at 2% yield',
      accent: false,
      prefix: '$',
      decimals: 0,
      info: 'Estimated annual earnings from pool deposits.',
    },
    {
      label: 'HYGIENE',
      custom: true,
      score: metrics.hygieneScore,
      info: 'Portfolio health score. Higher is better.',
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
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded-[4px] text-[10px] w-40 z-10 shadow-lg text-center"
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
                {card.prefix}
                <CountUp end={card.value!} decimals={card.decimals || 0} />
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
                    <option value={5}>$5</option>
                    <option value={10}>$10</option>
                    <option value={25}>$25</option>
                    <option value={50}>$50</option>
                    <option value={100}>$100</option>
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
