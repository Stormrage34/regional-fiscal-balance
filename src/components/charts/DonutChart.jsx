import { useId } from 'react';
import { CONSTANTS } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function DonutChart({ data, size = 200 }) {
  const { t } = useLocale();
  if (!data) return null;

  const id = useId();
  const holeId = `donut-hole-${id}`;

  const leakage = data.uncollectedLeakage;
  const welfare = data.welfareBurden;
  const overhead = Math.max(0, data.complianceGapCost + CONSTANTS.fixedOverhead - data.corporateRetraction);
  const total = leakage + welfare + overhead || 1;

  const segments = [
    { value: leakage, label: 'Uncollected Leakage', color: '#F59E0B' },
    { value: welfare, label: 'Welfare Burden', color: '#F43F5E' },
    { value: overhead, label: 'Overhead & Credits', color: '#8B5CF6' },
  ];

  let startAngle = -Math.PI / 2;
  const paths = segments.map((seg) => {
    const sliceAngle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    const outerR = 45, innerR = 27;
    const x1o = 50 + outerR * Math.cos(startAngle), y1o = 50 + outerR * Math.sin(startAngle);
    const x2o = 50 + outerR * Math.cos(endAngle),   y2o = 50 + outerR * Math.sin(endAngle);
    const x1i = 50 + innerR * Math.cos(endAngle),   y1i = 50 + innerR * Math.sin(endAngle);
    const x2i = 50 + innerR * Math.cos(startAngle), y2i = 50 + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const innerSweep = sliceAngle > Math.PI ? 1 : 0;

    const d = `M${x1o},${y1o}A${outerR},${outerR} 0 ${largeArc},1 ${x2o},${y2o}L${x1i},${y1i}A${innerR},${innerR} 0 0,${innerSweep} ${x2i},${y2i}Z`;

    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = (outerR + innerR) / 2;
    const showLabel = (seg.value / total) >= 0.08;

    const result = { ...seg, d, percentage: ((seg.value / total) * 100).toFixed(1), midAngle, labelRadius, showLabel };
    startAngle = endAngle;
    return result;
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Drain breakdown: ${segments.map(s => `${s.label} ${s.percentage}%`).join(', ')}`}>
      <defs>
        <mask id={holeId}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="28" fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${holeId})`}>
        {paths.map((path, i) => (
          <g key={i}>
            <path
              d={path.d}
              fill={path.color}
              className="cursor-pointer transition-opacity duration-200"
              style={{ opacity: 0.9 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            >
              <title>{`${path.label}: ${path.value.toLocaleString()} (${path.percentage}%)`}</title>
            </path>
            {path.showLabel && (
              <text
                x={50 + path.labelRadius * Math.cos(path.midAngle)}
                y={50 + path.labelRadius * Math.sin(path.midAngle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="9"
                fontFamily="ui-monospace,monospace"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {path.percentage}%
              </text>
            )}
          </g>
        ))}
      </g>

      <circle cx="50" cy="50" r="20" fill="rgba(2,6,23,0.85)" />
      <text x="50" y="47" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="ui-monospace,monospace">{t('modal_drain')}</text>
      <text x="50" y="57" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="ui-monospace,monospace">
        {`€${total.toLocaleString()}`}
      </text>
    </svg>
  );
}
