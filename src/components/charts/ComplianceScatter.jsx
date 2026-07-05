import { useLocale } from '../../context/LocaleContext.jsx';
import { NET_FISCAL, getMuniName } from '../../data/fiscalData.js';

export default function ComplianceScatter({ data, onMuniClick, focusedId }) {
  const { t, locale } = useLocale();
  if (!data || data.length === 0) return null;

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = 700, height = 400;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const maxLeak = Math.max(...data.map(d => d.uncollectedLeakage), 1);
  const maxComp = 100;

  const points = data.map(m => ({
    ...m,
    x: m.adjustedCompliance,
    y: m.uncollectedLeakage,
    isGainer: typeof NET_FISCAL !== 'undefined' && NET_FISCAL[m.id] && (NET_FISCAL[m.id].revenueInflow - NET_FISCAL[m.id].budgetOutflow) > 0,
  }));

  points.sort((a, b) => (a.isGainer ? 1 : 0) - (b.isGainer ? 1 : 0));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Compliance scatter plot: tax compliance rate vs uncollected leakage per capita">
        {/* Axes */}
        <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke="#334155" strokeWidth="1" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="#334155" strokeWidth="1" />

        {/* Y-axis grid lines + labels */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = margin.top + plotH - (pct / 100) * plotH;
          const labelVal = Math.round((pct / 100) * maxLeak);
          return (
            <g key={pct}>
              <line x1={margin.left} y1={y} x2={margin.left + plotW} y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={margin.left - 8} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                {labelVal > 0 ? `€${labelVal.toLocaleString()}` : '€0'}
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines + labels */}
        {[0, 20, 40, 60, 80, 100].map(pct => {
          const x = margin.left + (pct / 100) * plotW;
          return (
            <g key={pct}>
              <line x1={x} y1={margin.top} x2={x} y2={margin.top + plotH} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={x} y={margin.top + plotH + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={margin.left + plotW / 2} y={height - 6} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
          {t('scatter_x')}
        </text>
        <text x={12} y={margin.top + plotH / 2} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace" transform={`rotate(-90, 12, ${margin.top + plotH / 2})`}>
          {t('scatter_y')}
        </text>

        {/* Data points */}
        {points.map((p) => {
          const cx = margin.left + (p.x / maxComp) * plotW;
          const cy = margin.top + plotH - (p.y / maxLeak) * plotH;
          const r = Math.max(6, Math.min(14, Math.sqrt(p.workingAgePop / 500)));
          const isFocused = p.id === focusedId;
          const dotColor = p.isGainer ? '#10B981' : '#F59E0B';
          return (
            <g key={p.id} onClick={() => onMuniClick && onMuniClick(p.id)} className="cursor-pointer">
              <title>{`${getMuniName(p, locale)}: ${p.adjustedCompliance}% compliance, €${p.uncollectedLeakage} leakage per capita${p.isGainer ? ' (surplus)' : ' (deficit)'}`}</title>
              {/* Glow halo */}
              <circle cx={cx} cy={cy} r={r + 2} fill={dotColor} fillOpacity={0.15} stroke="none" />
              {/* Hit target */}
              <circle cx={cx} cy={cy} r={r * 2.5} fill="transparent" />
              {/* Visible dot */}
              <circle cx={cx} cy={cy} r={r + (isFocused ? 4 : 0)} fill={dotColor} fillOpacity={isFocused ? 1 : 0.85} stroke={isFocused ? '#fff' : dotColor} strokeWidth={isFocused ? 2 : 0.5} strokeOpacity={0.4} />
              {isFocused && (
                <text x={cx + r + 8} y={cy + 4} fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {getMuniName(p, locale)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-mono text-slate-400">Net Gainer <span className="sr-only">(surplus)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[10px] font-mono text-slate-400">Net Loser <span className="sr-only">(deficit)</span></span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">· Dot size = working-age population</span>
      </div>
    </div>
  );
}
