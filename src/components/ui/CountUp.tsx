import { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  decimals?: number;
}

export function CountUp({ end, duration = 900, prefix = '', decimals = 0 }: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [end, duration]);

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.floor(value).toLocaleString();

  return <span className="font-mono">{prefix}{formatted}</span>;
}
