import { useMemo } from 'react';
import { computeFiscalCapacity } from '../../models/fiscalCapacity.js';
import { UNEMPLOYMENT_DATA, NET_FISCAL, MKD_PER_EUR } from '../../data/fiscalData.js';

/**
 * Horizontal paired-bar chart comparing estimated vs actual fiscal capacity per capita.
 * Sorted by gap size (largest positive gap first = most underperforming).
 *
 * @param {object} props
 * @param {Array}  props.results — per-municipality computed results (from computeMunicipalMetrics)
 * @param {Function} props.fmt   — currency formatter
 * @returns {JSX.Element}
 */
export default function FiscalCapacityChart({ results, fmt, nationalAvgRevPC = 500 }) {
  const chartData = useMemo(() => {
    return results
      .map((m) => {
        const nf = NET_FISCAL[m.id];
        if (!nf) return null;
        const empData = UNEMPLOYMENT_DATA[m.id] || { employmentRate: 0.5 };
        const cap = computeFiscalCapacity(m, nf, empData.employmentRate, nationalAvgRevPC);
        return {
          id: m.id,
          name: m.name,
          name_mk: m.name_mk,
          name_sq: m.name_sq,
          ...cap,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.capacityGapPC - a.capacityGapPC); // largest gap first
  }, [results]);

  const maxAbsGap = useMemo(() => {
    return Math.max(...chartData.map((d) => Math.abs(d.capacityGapPC)), 1);
  }, [chartData]);

  const maxEst = useMemo(() => {
    return Math.max(...chartData.map((d) => d.estimatedCapacityPC), 1);
  }, [chartData]);

  const maxAct = useMemo(() => {
    return Math.max(...chartData.map((d) => d.actualRevenuePC), 1);
  }, [chartData]);

  const maxVal = Math.max(maxEst, maxAct);

  return (
    <section>
      <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>
        Fiscal Capacity: Estimated vs Actual Revenue per Capita
      </h3>

      <div className="space-y-2">
        {chartData.map((d) => {
          const estWidth = (d.estimatedCapacityPC / maxVal) * 100;
          const actWidth = (d.actualRevenuePC / maxVal) * 100;
          return (
            <div key={d.id} className="flex items-center gap-3 py-1.5">
              {/* Label */}
              <span className="text-[11px] font-mono w-28 text-right truncate flex-shrink-0" style={{ color: '#94a3b8' }}>
                {d.name}
              </span>

              {/* Estimated bar (faded) */}
              <div className="flex-1 h-5 bg-slate-800/50 rounded-sm overflow-hidden relative">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{ width: `${estWidth}%`, backgroundColor: 'rgba(245,158,11,0.25)' }}
                />
              </div>

              {/* Actual bar (solid) */}
              <div className="flex-1 h-5 bg-slate-800/50 rounded-sm overflow-hidden relative">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{ width: `${actWidth}%`, backgroundColor: '#F59E0B' }}
                />
              </div>

              {/* Values */}
              <span className="text-[10px] font-mono w-14 text-right flex-shrink-0" style={{ color: 'rgba(245,158,11,0.6)' }}>
                €{Math.round(d.estimatedCapacityPC)}
              </span>
              <span className="text-[10px] font-mono w-14 text-right flex-shrink-0" style={{ color: '#F59E0B' }}>
                €{Math.round(d.actualRevenuePC)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm" style={{ backgroundColor: 'rgba(245,158,11,0.25)' }} />
          <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Estimated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm" style={{ backgroundColor: '#F59E0B' }} />
          <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Actual</span>
        </div>
      </div>
    </section>
  );
}
