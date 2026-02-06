interface HygieneBarProps {
  score: number;
}

export function HygieneBar({ score }: HygieneBarProps) {
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const filledBars = Math.round(score / 10);

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-[5px] rounded-[2px]"
          style={{
            background: i < filledBars ? color : 'var(--elevated)',
          }}
        />
      ))}
    </div>
  );
}
