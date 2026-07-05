import { useMemo } from 'react';
import { CONSTANTS, getMuniName } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function PieMatrix({ data, onMuniClick }) {
  const { t, locale } = useLocale();
  const sortedWithSegs = useMemo(() => {
    const items = [...data].sort((a, b) => (b.totalPerCapitaDrain || 0) - (a.totalPerCapitaDrain || 0));
    return items.map(muni => {
      const leakage = muni.uncollectedLeakage;
      const welfare = muni.welfareBurden;
      const overhead = Math.max(0, muni.complianceGapCost + CONSTANTS.fixedOverhead - muni.corporateRetraction);
      const totalDrain = leakage + welfare + overhead || 1;
      const segs = [
        { value: leakage, label: t('chart_legend_leakage'), color: '#F59E0B' },
        { value: welfare, label: t('chart_legend_welfare'), color: '#F43F5E' },
        { value: overhead, label: t('chart_legend_overhead'), color: '#8B5CF6' },
      ];
      let startAngle = -Math.PI / 2;
      const outerR = 48, innerR = 29;
      const paths = segs.map(seg => {
        const sliceAngle = (seg.value / t) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        const x1o = 50 + outerR * Math.cos(startAngle), y1o = 50 + outerR * Math.sin(startAngle);
        const x2o = 50 + outerR * Math.cos(endAngle),   y2o = 50 + outerR * Math.sin(endAngle);
        const x1i = 50 + innerR * Math.cos(endAngle),   y1i = 50 + innerR * Math.sin(endAngle);
        const x2i = 50 + innerR * Math.cos(startAngle), y2i = 50 + innerR * Math.sin(startAngle);
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const es = sliceAngle > Math.PI ? 1 : 0;
        const d = `M${x1o},${y1o}A${outerR},${outerR} 0 ${largeArc},1 ${x2o},${y2o}L${x1i},${y1i}A${innerR},${innerR} 0 0,${es} ${x2i},${y2i}Z`;
        const percentage = ((seg.value / t) * 100).toFixed(1);
        startAngle = endAngle;
        return { ...seg, d, percentage };
      });
      return { ...muni, totalDrain: totalDrain, paths };
    });
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div role="img" aria-label={t('chart_aria_matrix')}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedWithSegs.map((muni) => {
          return (
            <div
              key={muni.id}
              data-muni-id={muni.id}
              onClick={() => onMuniClick?.(muni.id)}
              className={`flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-white/[0.08] transition-all duration-200 group odd:bg-white/[0.05] bg-gradient-to-b from-transparent to-black/[0.02]`}
            >
              <svg viewBox="0 0 100 100" width="112" height="112" role="img" aria-label={`${getMuniName(muni, locale)}: €${muni.totalDrain} ${t('modal_drain')} ${t('suffix_capita')}`}>
                {(() => {
                  const hid = `pm-hole-${muni.id}`;
                  return (
                    <>
                      <defs>
                        <mask id={hid}>
                          <rect width="100" height="100" fill="white" />
                          <circle cx="50" cy="50" r="30" fill="black" />
                        </mask>
                      </defs>
                      <g mask={`url(#${hid})`}>
                        {muni.paths.map((path, i) => (
                          <path
                            key={i}
                            d={path.d}
                            fill={path.color}
                            className="transition-opacity duration-200"
                            style={{ opacity: 0.9 }}
                          >
                            <title>{`${path.label}: ${path.value.toLocaleString()} (${path.percentage}%)`}</title>
                          </path>
                        ))}
                      </g>
                      <defs>
                        <filter id={`pm-glow-${muni.id}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(255,255,255,0.25)" />
                        </filter>
                      </defs>
                      <circle cx="50" cy="50" r="22" fill="rgba(2,6,23,0.9)" />
                      <text x="50" y="57" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="ui-monospace,monospace" filter={`url(#pm-glow-${muni.id})`}>
                        {`€${muni.totalDrain.toLocaleString()}`}
                      </text>
                    </>
                  );
                })()}
              </svg>
              <div className="flex flex-col items-center mt-2 w-full px-1">
                <span className="text-[10px] font-mono truncate text-slate-300 group-hover:text-slate-100 transition-colors duration-200 w-full text-center">{getMuniName(muni, locale)}</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {muni.paths.map((seg, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span>{seg.percentage}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
