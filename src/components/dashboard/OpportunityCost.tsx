interface OpportunityCostProps {
  currentValue: number;
  opportunityCost: number;
}

export function OpportunityCost({ currentValue, opportunityCost }: OpportunityCostProps) {
  const consolidatedValue = currentValue + opportunityCost;

  return (
    <div
      className="rounded-[10px] p-[20px] mb-5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="text-[9px] font-semibold tracking-[0.08em] uppercase mb-[14px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Lost to Entropy (90 Days)
      </div>

      <div className="flex gap-8 items-baseline">
        <div>
          <div className="text-[11px] mb-[3px]" style={{ color: 'var(--text-secondary)' }}>
            Current
          </div>
          <div className="text-[18px] font-mono font-medium" style={{ color: 'var(--text)' }}>
            ${currentValue.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[11px] mb-[3px]" style={{ color: 'var(--text-secondary)' }}>
            If consolidated
          </div>
          <div className="text-[18px] font-mono font-medium" style={{ color: 'var(--text)' }}>
            ${consolidatedValue.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[11px] mb-[3px]" style={{ color: 'var(--text-secondary)' }}>
            Left behind
          </div>
          <div className="text-[18px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
            +${opportunityCost.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
