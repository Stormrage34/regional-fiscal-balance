import { useMemo } from 'react';
import { NET_FISCAL, MKD_PER_EUR, getMuniName } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function DivergingBarChart({ results, maxAbsNetPCEUR, fmt }) {
  const { t, locale } = useLocale();
  const sortedMunis = useMemo(() => {
    const netPCResults = results.filter(m => NET_FISCAL[m.id]).map(m => {
      const nf = NET_FISCAL[m.id];
      const netEUR = (nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR;
      return { m, netPC: m.workingAgePop > 0 ? netEUR / m.workingAgePop : 0 };
    });
    return netPCResults.sort((a, b) => {
      if (a.netPC >= 0 && b.netPC < 0) return -1;
      if (a.netPC < 0 && b.netPC >= 0) return 1;
      if (a.netPC >= 0) return b.netPC - a.netPC;
      return a.netPC - b.netPC;
    }).map(r => r.m);
  }, [results]);

  return (
    <div role="img" aria-label="Diverging bar chart of net fiscal balance per municipality">
      <div className="mt-2 space-y-1 max-h-[400px] overflow-y-auto pr-3">
        {sortedMunis.map(muni => {
          const nf = NET_FISCAL[muni.id];
          if (!nf) return null;
          const netEUR = (nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR;
          const netPC = muni.workingAgePop > 0 ? netEUR / muni.workingAgePop : 0;
          const pctOfMax = Math.abs(netPC) / maxAbsNetPCEUR;
          const barPct = Math.sqrt(pctOfMax) * 100;
          const barW = Math.min(Math.max(barPct, 3), 100);
          const isGainer = netPC > 0;

          return (
            <div key={muni.id} className="grid grid-cols-[120px_1fr_120px] gap-2 text-[11px] font-mono items-center">
              <span className="text-left truncate" style={{ color: '#94a3b8' }}>{getMuniName(muni, locale)}</span>
              <div className="relative h-5">
                <div
                  className="absolute h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${barW}%`,
                    backgroundColor: isGainer ? '#10B981' : '#F43F5E',
                    opacity: isGainer ? 0.85 : 0.7,
                  }}
                />
              </div>
              <span className="text-right font-semibold whitespace-nowrap" style={{ color: isGainer ? '#10B981' : '#F43F5E' }}>
                {isGainer ? '+' : '-'}€{Math.round(Math.abs(netPC)).toLocaleString()} {t('suffix_capita')} <span className="sr-only">{isGainer ? t('surplus') : t('deficit')}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
