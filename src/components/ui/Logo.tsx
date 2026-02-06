export function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { dot: 6, text: 15 },
    default: { dot: 8, text: 17 },
    large: { dot: 10, text: 28 },
  };

  const { dot, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full"
        style={{
          width: dot,
          height: dot,
          background: 'var(--accent)',
        }}
      />
      <span
        className="font-serif"
        style={{
          fontSize: text,
          color: 'var(--text)',
        }}
      >
        Elutio
      </span>
    </div>
  );
}
