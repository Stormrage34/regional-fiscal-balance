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

  const zeroX = 0.5; // center of the bar area

  return (
    <div role="img" aria-label={t('chart_aria_diverging')}>
      <div className="mt-2 space-y-0.5 max-h-[420px] overflow-y-auto pr-2">
        {/* Zero axis line */}
        <div className="relative h-0 border-t border-slate-700/40 my-2" aria-hidden="true" />

        {sortedMunis.map(muni => {
          const nf = NET_FISCAL[muni.id];
          if (!nf) return null;
          const netEUR = (nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR;
          const netPC = muni.workingAgePop > 0 ? netEUR / muni.workingAgePop : 0;
          const pctOfMax = Math.abs(netPC) / maxAbsNetPCEUR;
          const barPct = Math.sqrt(pctOfMax) * 90; // max 90% of available width
          const barW = Math.max(barPct, 2);
          const isGainer = netPC > 0;

          return (
            <div key={muni.id} className="grid grid-cols-[110px_1fr_110px] gap-2 text-[11px] font-mono items-center">
              <span className="text-left truncate" style={{ color: '#94a3b8' }}>{getMuniName(muni, locale)}</span>
              <div className="relative h-5 flex items-center">
                {/* Zero axis */}
                <div className="absolute top-0 bottom-0 w-[2px] bg-slate-600/50 z-10" aria-hidden="true" />

                {/* Bar — diverges from center */}
                {isGainer ? (
                  <div
                    className="absolute h-full rounded-sm transition-all duration-300"
                    style={{
                      left: `${zeroX * 100}%`,
                      width: `${barW / 2}%`,
                      backgroundColor: '#10B981',
                      opacity: 0.85,
                    }}
                  />
                ) : (
                  <div
                    className="absolute h-full rounded-sm transition-all duration-300"
                    style={{
                      right: `${zeroX * 100}%`,
                      width: `${barW / 2}%`,
                      backgroundColor: '#F43F5E',
                      opacity: 0.75,
                    }}
                  />
                )}
              </div>
              <span className="text-right font-semibold whitespace-nowrap tabular-nums" style={{ color: isGainer ? '#10B981' : '#F43F5E' }}>
                {isGainer ? '+' : '−'}€{Math.round(Math.abs(netPC)).toLocaleString()}
                <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>{isGainer ? t('surplus') : t('deficit')}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
