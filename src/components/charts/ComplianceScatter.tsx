import { useState, useEffect, useRef } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { NET_FISCAL, getMuniName } from '../../data/fiscalData.js';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function jitter(id: string, magX: number, magY: number): { dx: number; dy: number } {
  const h = hashCode(id);
  const dx = ((h % 100) / 100 - 0.5) * 2 * magX;
  const dy = (((h >> 8) % 100) / 100 - 0.5) * 2 * magY;
  return { dx, dy };
}

function niceTicks(maxVal, targetCount = 5) {
  if (maxVal <= 0) return [0];
  const roughStep = maxVal / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let step;
  if (residual <= 1.5) step = 1 * magnitude;
  else if (residual <= 3.5) step = 2 * magnitude;
  else if (residual <= 7.5) step = 5 * magnitude;
  else step = 10 * magnitude;
  const ticks = [];
  for (let v = 0; v <= maxVal + step * 0.5; v += step) {
    ticks.push(Math.round(v));
  }
  return ticks;
}

export default function ComplianceScatter({ data, onMuniClick, focusedId }) {
  const { t, locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const margin = { top: 20, right: 20, bottom: 56, left: 72 };
  const width = Math.max(containerWidth, 320);
  const height = Math.max(420, width * 0.6);
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const maxLeak = Math.ceil(Math.max(...data.map(d => d.uncollectedLeakage)) / 50) * 50;
  const maxComp = 100;

  // Jitter magnitude: small enough to preserve trends, large enough to separate clusters
  const magX = maxComp * 0.06; // ±6 compliance points
  const magY = maxLeak * 0.06; // ±6% of leakage range

  const points = data.map(m => {
    const { dx, dy } = jitter(m.id, magX, magY);
    return {
      ...m,
      x: m.adjustedCompliance + dx,
      y: m.uncollectedLeakage + dy,
      origX: m.adjustedCompliance,
      origY: m.uncollectedLeakage,
      isGainer: NET_FISCAL[m.id] && (NET_FISCAL[m.id].revenueInflow - NET_FISCAL[m.id].budgetOutflow) > 0,
    };
  });

  // Losers first (bottom), gainers on top; within each group larger dots first so small dots aren't buried
  points.sort((a, b) => {
    if (a.isGainer !== b.isGainer) return a.isGainer ? 1 : -1;
    return b.workingAgePop - a.workingAgePop;
  });

  const yTicks = niceTicks(maxLeak, 5);
  const xTicks = [0, 20, 40, 60, 80, 100];

  const isMobile = width < 480;
  const dotRadius = (pop) => Math.max(4, Math.min(8, Math.sqrt(pop / 1000)));
  const hitRadius = (r) => r * 2.5;

  const handleMouseLeave = () => setHoveredId(null);

  const gainerColor = 'var(--color-gainer-green, #10b981)';
  const drainColor = 'var(--color-drain-amber, #f59e0b)';

  const getMuniLabel = (p) => getMuniName(p, locale);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        role="img"
        aria-label={t('chart_aria_scatter')}
        onMouseLeave={handleMouseLeave}
      >
        {/* Plot background */}
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="var(--chart-bg, #1e293b)" rx="4" />

        {/* Y-axis grid lines + labels */}
        {yTicks.map((val) => {
          const frac = val / maxLeak;
          if (frac > 1.0001) return null;
          const y = margin.top + plotH - frac * plotH;
          return (
            <g key={`y-${val}`}>
              <line x1={margin.left} y1={y} x2={margin.left + plotW} y2={y} stroke="var(--chart-grid, rgba(51,65,85,.3))" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={margin.left - 10} y={y} textAnchor="end" dominantBaseline="middle" fill="var(--chart-label, #94a3b8)" fontSize={isMobile ? 10 : 11} fontFamily="'JetBrains Mono', monospace">
                {val > 0 ? `€${val.toLocaleString()}` : '€0'}
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines + labels */}
        {xTicks.map(pct => {
          const x = margin.left + (pct / maxComp) * plotW;
          return (
            <g key={`x-${pct}`}>
              <line x1={x} y1={margin.top} x2={x} y2={margin.top + plotH} stroke="var(--chart-grid, rgba(51,65,85,.3))" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={x} y={margin.top + plotH + 16} textAnchor="middle" dominantBaseline="hanging" fill="var(--chart-label, #94a3b8)" fontSize={isMobile ? 10 : 11} fontFamily="'JetBrains Mono', monospace">
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke="var(--chart-axis, #334155)" strokeWidth="1.2" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="var(--chart-axis, #334155)" strokeWidth="1.2" />

        {/* Axis titles */}
        <text x={margin.left + plotW / 2} y={height - 4} textAnchor="middle" dominantBaseline="hanging" fill="var(--chart-label, #94a3b8)" fontSize={isMobile ? 10 : 11} fontWeight="500" fontFamily="'JetBrains Mono', monospace">
          {t('scatter_x')}
        </text>
        <text x={16} y={margin.top + plotH / 2} textAnchor="middle" fill="var(--chart-label, #94a3b8)" fontSize={isMobile ? 10 : 11} fontWeight="500" fontFamily="'JetBrains Mono', monospace" transform={`rotate(-90, 16, ${margin.top + plotH / 2})`}>
          {t('scatter_y')}
        </text>

        {/* Data points */}
        {points.map((p) => {
          const fracX = p.x / maxComp;
          const fracY = p.y / maxLeak;
          const cx = margin.left + fracX * plotW;
          const cy = margin.top + plotH - fracY * plotH;
          const r = dotRadius(p.workingAgePop);
          const hr = hitRadius(r);
          const isFocused = p.id === focusedId;
          const isHovered = hoveredId === p.id;
          const dotColor = p.isGainer ? gainerColor : drainColor;
          const name = getMuniLabel(p);
          const label = `${name}: ${p.origX}% compliance, €${p.origY} leakage per capita${p.isGainer ? ` (${t('surplus')})` : ` (${t('deficit')})`}`;

          return (
            <g
              key={p.id}
              onClick={() => onMuniClick?.(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              role="button"
              tabIndex={onMuniClick ? 0 : -1}
              aria-label={label}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMuniClick?.(p.id); } }}
            >
              <title>{label}</title>
              {/* Glow */}
              <circle cx={cx} cy={cy} r={r + 3} fill={dotColor} fillOpacity={isHovered ? 0.25 : 0.12} />
              {/* Hit target (invisible, large) */}
              <circle cx={cx} cy={cy} r={hr} fill="transparent" />
              {/* Visible dot */}
              <circle
                cx={cx} cy={cy}
                r={r + (isFocused || isHovered ? 3 : 0)}
                fill={dotColor}
                fillOpacity={isFocused || isHovered ? 1 : 0.6}
                stroke="var(--text-primary)"
                strokeWidth={isFocused ? 2 : isHovered ? 1.2 : 0.8}
                strokeOpacity={isFocused ? 0.8 : 0.2}
              />
              {/* Focus label with background */}
              {(isFocused || isHovered) && (
                <>
                  <rect
                    x={cx + r + 8}
                    y={cy - 14}
                    width={name.length * 7.2 + 12}
                    height={18}
                    rx="3"
                    fill="var(--bg-card, #1e293b)"
                    fillOpacity={0.92}
                    stroke="var(--border-card, #334155)"
                    strokeWidth="0.8"
                  />
                  <text
                    x={cx + r + 14}
                    y={cy - 1}
                    dominantBaseline="middle"
                    fill="var(--text-primary, #f8fafc)"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {name}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 justify-center">
        <div className="flex items-center gap-1.5" aria-label={t('scatter_gainer')}>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: gainerColor }}
          />
          <span className="text-[10px] font-mono text-secondary">{t('scatter_gainer')}</span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={t('scatter_loser')}>
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: drainColor }}
          />
          <span className="text-[10px] font-mono text-secondary">{t('scatter_loser')}</span>
        </div>
        <span className="text-[10px] font-mono text-muted">{t('scatter_size')}</span>
      </div>
    </div>
  );
}
