import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface OpportunityCostProps {
  dustPrincipalUsd: number;
  positionsPrincipalUsd: number;
  potentialEarningsUsd: number;
  unpricedCount?: number;
  dormantCount?: number;
}

export function OpportunityCost({ dustPrincipalUsd, positionsPrincipalUsd, potentialEarningsUsd, unpricedCount = 0, dormantCount = 0 }: OpportunityCostProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="rounded-[10px] p-[20px] mb-5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.08em] uppercase mb-[14px] relative"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Consolidation Opportunity
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-1 hover:opacity-75"
          >
            <HelpCircle size={12} style={{ color: 'var(--text-tertiary)' }} />
          </button>
          {showTooltip && (
            <div
              className="absolute left-0 bottom-full mb-2 p-2 rounded-[4px] text-[10px] w-48 z-50 shadow-lg whitespace-normal text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Principal view: dust + positions balances. Potential earnings is estimated yearly yield at 7% APY on transferable principal.{unpricedCount > 0 ? ` Unpriced assets (${unpricedCount}) are shown with $1 floor estimate.` : ''}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8 items-baseline">
        <div>
          <div className="text-[11px] mb-[3px]" style={{ color: 'var(--text-secondary)' }}>
            Dust principal
          </div>
          <div className="text-[18px] font-mono font-medium" style={{ color: 'var(--text)' }}>
            ${dustPrincipalUsd.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[11px] mb-[3px]" style={{ color: 'var(--text-secondary)' }}>
            Positions principal
          </div>
          <div className="text-[18px] font-mono font-medium" style={{ color: 'var(--text)' }}>
            ${positionsPrincipalUsd.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[11px] mb-[3px]" style={{ color: 'var(--text-secondary)' }}>
            Potential earnings
          </div>
          <div className="text-[18px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
            ${potentialEarningsUsd.toLocaleString()}/yr
          </div>
        </div>
      </div>
    </div>
  );
}
