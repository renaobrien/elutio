import { TokenClassification } from '../../types';

interface PillProps {
  classification: TokenClassification;
}

const pillStyles: Record<TokenClassification, { label: string; className: string; help: string }> = {
  core: {
    label: 'CORE',
    className: 'bg-[var(--elevated)] border-[var(--border)] text-[var(--text-tertiary)]',
    help: 'Core assets are strategic holdings and not auto-liquidated.',
  },
  positions: {
    label: 'POSITIONS',
    className: 'bg-[var(--accent-dim)] border-[var(--accent-border)] text-[var(--accent)]',
    help: 'Positions are balances at or above your threshold.',
  },
  dust: {
    label: 'DUST',
    className: 'bg-[var(--elevated)] border-[var(--border)] text-[var(--text-secondary)]',
    help: 'Dust assets are small balances that can be batched.',
  },
  unsafe: {
    label: 'UNSAFE',
    className: 'bg-[var(--danger-dim)] border-[var(--danger-border)] text-[var(--danger)]',
    help: 'Unsafe assets are locked due to risk or insufficient liquidity.',
  },
};

export function Pill({ classification }: PillProps) {
  const { label, className, help } = pillStyles[classification];

  return (
    <span
      className={`inline-block px-[7px] py-[2px] rounded-[3px] text-[9px] font-bold tracking-[0.08em] border ${className}`}
      title={help}
    >
      {label}
    </span>
  );
}
