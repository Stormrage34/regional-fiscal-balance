import { useState, useRef, useEffect } from 'react';

export default function AnimatedNumber({ value, prefix = '', suffix = '', size = 'text-4xl', color = '#F59E0B' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const targetRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    targetRef.current = value;
    const start = displayValue;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return (
    <span className={`${size} font-bold font-mono tracking-tight transition-colors duration-300`} style={{ color }}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}
