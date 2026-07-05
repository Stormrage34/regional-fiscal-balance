import { useLocale } from '../../context/LocaleContext.jsx';

export default function StackedBarChart({ data, onMuniClick }) {
  const { t } = useLocale();
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.totalPerCapitaDrain), 1);
  const barHeight = 28;
  const rowGap = 6;
  const headerH = 48;
  const labelW = 110;
  const valueW = 90;
  const chartAreaW = Math.min(750, typeof window !== 'undefined' ? window.innerWidth * 0.6 : 500);
  const rows = data.length;
  const totalH = headerH + rows * (barHeight + rowGap) + 16;
  const svgW = labelW + chartAreaW + valueW;

  const amberGrad = 'url(#amberBarGrad)';
  const cyanGrad = 'url(#cyanBarGrad)';
  const indigoGrad = 'url(#indigoBarGrad)';

  return (
    <svg
      viewBox={`0 0 ${svgW} ${totalH}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Stacked bar chart of municipal fiscal drain: leakage, welfare, and overhead components"
    >
      <defs>
        <linearGradient id="amberBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="cyanBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="indigoBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Header row */}
      <text x={labelW + chartAreaW * 0.17} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="0.5">
        {t('chart_leakage')}
      </text>
      <text x={labelW + chartAreaW * 0.50} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="0.5">
        {t('chart_welfare')}
      </text>
      <text x={labelW + chartAreaW * 0.83} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="0.5">
        {t('chart_overhead')}
      </text>
      <line x1={0} y1={28} x2={svgW} y2={28} stroke="#1e293b" strokeWidth="1" />

      {data.map((muni, i) => {
        const y = headerH + i * (barHeight + rowGap);
        const total = muni.totalPerCapitaDrain;
        const seg1 = total > 0 ? muni.uncollectedLeakage / total : 0;
        const seg2 = total > 0 ? muni.welfareBurden / total : 0;
        const seg3 = Math.max(0, 1 - seg1 - seg2);

        const barFullW = (total / maxVal) * chartAreaW;
        const seg1W = barFullW * seg1;
        const seg2W = barFullW * seg2;
        const seg3W = barFullW * seg3;

        const x0 = labelW;

        return (
          <g key={muni.id}>
            <text
              x={labelW - 10}
              y={y + barHeight / 2 + 4}
              textAnchor="end"
              fill="#cbd5e1"
              fontSize="11"
              fontFamily="ui-monospace,monospace"
            >
              {muni.name}
            </text>

            {barFullW < 6 && (
              <rect x={x0} y={y} width={Math.max(barFullW, 2)} height={barHeight} fill="#334155" rx="2" />
            )}

            {seg1W > 1 && (
              <rect x={x0} y={y} width={seg1W} height={barHeight} fill={amberGrad} rx={seg1W < 6 ? 0 : 2} />
            )}

            {seg2W > 1 && (
              <rect x={x0 + seg1W} y={y} width={seg2W} height={barHeight} fill={cyanGrad} rx={0} />
            )}

            {seg3W > 1 && (
              <rect
                x={x0 + seg1W + seg2W}
                y={y}
                width={seg3W}
                height={barHeight}
                fill={indigoGrad}
                rx={seg3W < 6 ? 0 : 2}
              />
            )}

            {muni.corporateRetraction > 0 && (
              <rect
                x={x0 + barFullW - 2}
                y={y + 2}
                width={2}
                height={barHeight - 4}
                fill="#10b981"
                rx="1"
              />
            )}

            <rect
              x={x0 - 12}
              y={y - 3}
              width={barFullW + (muni.corporateRetraction > 0 ? 16 : 8) + 10}
              height={barHeight + 6}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onMuniClick?.(muni.id)}
            />

            <text
              x={x0 + barFullW + 10}
              y={y + barHeight / 2 + 4}
              fill="#f59e0b"
              fontSize="12"
              fontFamily="ui-monospace,monospace"
              fontWeight="600"
            >
              {`€${total.toLocaleString()}`}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${labelW}, ${totalH - 14})`}>
        <rect x={0} y={-6} width={10} height={10} fill="#f59e0b" rx="2" />
        <text x={14} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">{t('chart_legend_leakage')}</text>
        <rect x={80} y={-6} width={10} height={10} fill="#06b6d4" rx="2" />
        <text x={94} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">{t('chart_legend_welfare')}</text>
        <rect x={156} y={-6} width={10} height={10} fill="#3B82F6" rx="2" />
        <text x={170} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">{t('chart_legend_overhead')}</text>
        <rect x={238} y={-6} width={10} height={10} fill="#10b981" rx="2" />
        <text x={252} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">{t('chart_legend_correction')}</text>
        <rect x={320} y={-6} width={10} height={10} fill="#F59E0B" rx="2" />
        <text x={334} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">{t('chart_legend_unemp')}</text>
      </g>
    </svg>
  );
}
