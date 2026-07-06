import { UNEMPLOYMENT_DATA, FISCAL_LOSS_PER_UNEMPLOYED, NET_FISCAL, MKD_PER_EUR, getMuniName, DECENTRALIZATION_PHASES, CREDIT_RATINGS, SKOPIE_BORROUGHS } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useMemo } from 'react';

function SortIcon({ columnKey, sortKey, sortAsc }) {
  if (sortKey !== columnKey) {
    return (
      <svg className="ml-1 w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return (
    <svg className={`ml-1 w-4 h-4 text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      {sortAsc ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
}

function getSortDir(key, sortKey, sortAsc) {
  if (sortKey !== key) return 'none';
  return sortAsc ? 'ascending' : 'descending';
}

export default function MunicipalTable({
  sortedResults,
  focusedMuniId,
  setFocusedMuniId,
  fmt,
  applyCorrection,
  sortKey,
  sortAsc,
  handleSort,
}) {
  const { t, locale } = useLocale();

  // ── National macro averages for twin-row header ──
  const totals = useMemo(() => {
    const totalPop = sortedResults.reduce((s, r) => s + r.workingAgePop, 0);
    const wBalance = sortedResults.reduce((s, r) => s + r.totalPerCapitaDrain * r.workingAgePop, 0);
    const wLeakage = sortedResults.reduce((s, r) => s + r.uncollectedLeakage * r.workingAgePop, 0);
    const wWelfare = sortedResults.reduce((s, r) => s + r.welfareBurden * r.workingAgePop, 0);
    const totalDrain = sortedResults.reduce((s, r) => s + r.totalYearlyDrain, 0);
    const totalArrears = sortedResults.reduce((s, r) => {
      const nf = NET_FISCAL[r.id];
      return s + (nf?.arrears || 0);
    }, 0);
    return {
      avgBalance: totalPop > 0 ? Math.round(wBalance / totalPop) : 0,
      avgLeakage: totalPop > 0 ? Math.round(wLeakage / totalPop) : 0,
      avgWelfare: totalPop > 0 ? Math.round(wWelfare / totalPop) : 0,
      totalDrainMillions: Math.round(totalDrain / 1_000_000),
      totalArrearsMillions: Math.round(totalArrears / MKD_PER_EUR / 1_000_000),
    };
  }, [sortedResults]);

  return (
    <section
      className="rounded-xl relative mb-10 transition-all duration-300"
      style={{ backgroundColor: 'rgba(11,17,32,0.4)', borderColor: '#1F3050', borderWidth: 1, overflow: 'clip' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600/25 to-transparent" />

      <div className="px-5 py-3.5 border-b flex items-center justify-between relative" style={{ borderColor: '#1F3050' }}>
        <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          {t('muni_profiles')}
        </h2>
        <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
          {t('muni_sort')}
        </span>
      </div>

      <div className="w-full overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="w-full text-sm font-mono border-collapse table-auto">
          <thead>
            {/* ═══ Single Row Header with Macro Averages inline ═══ */}
            <tr className="border-b border-slate-700/50 bg-[#0f172a]">
              {/* Municipality header — sticky left */}
              <th
                className="px-4 py-2.5 text-left align-middle min-w-[150px] whitespace-nowrap text-[10px] font-sans font-bold uppercase tracking-widest text-slate-400 cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 left-0 z-30 bg-[#0f172a]"
                onClick={() => handleSort('name')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('name'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('name', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {t('hdr_muni')}
                  <SortIcon columnKey="name" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>

              {/* Balance column — shows avg + label */}
              <th
                className="px-3 py-2 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('drain')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('drain'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('drain', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Avg Balance</span>
                  <span className="text-xs font-bold text-[#F59E0B] font-mono tabular-nums">{fmt(totals.avgBalance, true)}</span>
                </div>
              </th>

              {/* Leakage column */}
              <th
                className="px-3 py-2 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('leakage')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('leakage'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('leakage', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Avg Leakage</span>
                  <span className="text-xs font-bold text-[#F59E0B] font-mono tabular-nums">{fmt(totals.avgLeakage, true)}</span>
                </div>
              </th>

              {/* Welfare column */}
              <th
                className="px-3 py-2 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('welfare')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('welfare'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('welfare', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Avg Welfare</span>
                  <span className="text-xs font-bold text-[#F87171] font-mono tabular-nums">{fmt(totals.avgWelfare, true)}</span>
                </div>
              </th>

              {/* Annual Drain */}
              <th
                className="px-3 py-2 text-center align-middle min-w-[130px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('yearly')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('yearly'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('yearly', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Total Drain</span>
                  <span className="text-xs font-bold text-[#F87171] font-mono tabular-nums">{fmt(totals.totalDrainMillions, false)}</span>
                </div>
              </th>

              {/* Arrears */}
              <th
                className="px-3 py-2 text-center align-middle min-w-[120px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('arrears')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('arrears'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('arrears', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Total Arrears</span>
                  <span className="text-xs font-bold text-slate-400 font-mono tabular-nums">{fmt(totals.totalArrearsMillions, false)}</span>
                </div>
              </th>

              {/* Unemployed */}
              <th
                className="px-3 py-2 text-center align-middle min-w-[160px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('unemployment')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('unemployment'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('unemployment', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Unemployed
                  <SortIcon columnKey="unemployment" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>

              {/* Structural */}
              <th className="px-3 py-2 text-center align-middle min-w-[140px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-slate-500 sticky top-0 z-20 bg-[#0f172a]">
                Structural
              </th>

              {/* Correction */}
              <th className="px-3 py-2 text-center align-middle min-w-[110px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-slate-500 sticky top-0 z-20 bg-[#0f172a]">
                Correction
              </th>

              {/* Phase */}
              <th className="px-3 py-2 text-center align-middle min-w-[60px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-slate-500 sticky top-0 z-20 bg-[#0f172a]">
                {t('hdr_phase')}
              </th>

              {/* Risk / Discipline */}
              <th className="px-3 py-2 text-center align-middle min-w-[80px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-slate-500 sticky top-0 z-20 bg-[#0f172a]">
                {t('hdr_discipline')}
              </th>

              {/* Credit Rating */}
              <th className="px-3 py-2 text-center align-middle min-w-[60px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-slate-500 sticky top-0 z-20 bg-[#0f172a]">
                {t('hdr_credit_rating')}
              </th>

              {/* Predicted (Model) */}
              <th
                className="px-2 py-2 text-center align-middle min-w-[80px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('prediction')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('prediction'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('prediction', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {t('hdr_predicted')}
                  <SortIcon columnKey="prediction" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>

              {/* Match */}
              <th className="px-2 py-2 text-center align-middle min-w-[70px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-slate-500 sticky top-0 z-20 bg-[#0f172a]">
                {t('hdr_match')}
              </th>

              {/* Probability */}
              <th
                className="px-2 py-2 text-center align-middle min-w-[70px] whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors sticky top-0 z-20 bg-[#0f172a]"
                onClick={() => handleSort('probability')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('probability'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('probability', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {t('hdr_prob')}
                  <SortIcon columnKey="probability" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((muni, i) => {
              const maxYearly = Math.max(...sortedResults.map(r => r.totalYearlyDrain));
              const sparkWidth = (muni.totalYearlyDrain / maxYearly) * 60;
              const isFocused = muni.id === focusedMuniId;

              return (
                <tr
                  key={muni.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isFocused}
                  onClick={() => setFocusedMuniId(prev => prev === muni.id ? null : muni.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFocusedMuniId(prev => prev === muni.id ? null : muni.id); } }}
                  className="transition-all duration-200 hover:bg-white/[0.06] cursor-pointer group"
                  style={{
                    borderBottom: i < sortedResults.length - 1 ? '1px solid rgba(27,42,74,0.4)' : 'none',
                    backgroundColor: isFocused ? 'rgba(245,158,11,0.03)' : (i % 2 === 0 ? 'rgba(255,255,255,0.008)' : 'rgba(0,0,0,0.015)'),
                    borderLeft: isFocused ? '2px solid #f59e0b' : undefined,
                    boxShadow: isFocused ? 'inset 0 0 12px rgba(245,158,11,0.02)' : undefined,
                  }}
                >
                  {/* Municipality — sticky first column */}
                  <td
                    className="px-4 py-2.5 sticky left-0"
                    style={{
                      zIndex: 3,
                      isolation: 'isolate',
                      willChange: 'transform',
                      backgroundColor: isFocused ? 'rgb(30,41,59)' : (i % 2 === 0 ? 'rgb(15,23,42)' : 'rgb(11,17,32)'),
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`font-semibold whitespace-nowrap transition-colors duration-200 text-sm ${isFocused ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'}`}>
                        {getMuniName(muni, locale)}
                      </span>
                      <div className="hidden sm:block h-1 w-12 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(sparkWidth / 60) * 100}%`, backgroundColor: '#F59E0B' }} />
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-700 group-hover:text-amber-500/50 transition-colors duration-200 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </td>

                  {/* Capita Drain */}
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-sm" style={{ color: '#F59E0B' }}>
                    {fmt(muni.totalPerCapitaDrain, true)}
                  </td>

                  {/* Tax Leakage */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: '#F59E0B' }}>
                    {fmt(muni.uncollectedLeakage, true)}
                  </td>

                  {/* Welfare */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: '#F87171' }}>
                    {fmt(muni.welfareBurden, true)}
                  </td>

                  {/* Annual Drain */}
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-sm" style={{ color: '#F87171' }}>
                    {fmt(muni.totalYearlyDrain / 1_000_000, false)}
                  </td>

                  {/* Arrears */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: '#64748b' }}>
                    {(() => {
                      const nf = NET_FISCAL[muni.id];
                      if (!nf || !nf.arrears) return '—';
                      return fmt(nf.arrears / MKD_PER_EUR / 1_000_000, false);
                    })()}
                  </td>

                  {/* Unemployed */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: '#38bdf8' }}>
                    {(() => {
                      const ud = UNEMPLOYMENT_DATA[muni.id];
                      if (!ud) return '—';
                      const fiscalLoss = ud.registered * FISCAL_LOSS_PER_UNEMPLOYED.totalAnnual;
                      return <>{ud.registered.toLocaleString()} <span className="text-[10px] text-slate-600">/ €{Math.round(fiscalLoss / muni.workingAgePop).toLocaleString()}{t('pc_abbr')}</span></>;
                    })()}
                  </td>

                  {/* Structural — Shadow + Compliance side by side */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="text-[11px] tabular-nums" style={{ color: '#94a3b8' }}>{muni.adjustedShadowEcon}%</span>
                      </div>
                      <div className="w-[1px] h-3 bg-slate-700" />
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-[11px] tabular-nums" style={{ color: '#94a3b8' }}>{muni.adjustedCompliance}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Correction */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: applyCorrection ? '#34d399' : '#475569' }}>
                    {applyCorrection ? `€${muni.corporateRetraction.toLocaleString()}` : '—'}
                  </td>

                  {/* Phase */}
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const phase = muni.phase || 1;
                      const isP2 = phase === 2;
                      return (
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isP2
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isP2 ? 'P2' : 'P1'}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Risk / Discipline */}
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const tier = muni.p2_risk_tier || '—';
                      let colorClass;
                      if (tier === t('risk_low')) {
                        colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      } else if (tier === t('risk_watch')) {
                        colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      } else if (tier === t('risk_high')) {
                        colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                      } else {
                        colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                      }
                      return (
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${colorClass}`}>
                          {tier}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Credit Rating */}
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const rating = muni.creditRating || 'NR';
                      if (rating === 'B1') {
                        return (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {rating}
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          NR
                        </span>
                      );
                    })()}
                  </td>

                  {/* Predicted (Model) */}
                  <td className="px-2 py-2.5 text-center">
                    {(() => {
                      if (!muni.inTrainingSet) {
                        return (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            {t('pred_na')}
                          </span>
                        );
                      }
                      const isGainer = muni.predictedReduced === 'gainer';
                      return (
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isGainer
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isGainer ? t('pred_gainer') : t('pred_loser')}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Match / Mismatch */}
                  <td className="px-2 py-2.5 text-center">
                    {(() => {
                      if (!muni.inTrainingSet) {
                        return <span className="text-[10px] font-mono" style={{ color: '#475569' }}>—</span>;
                      }
                      const nf = NET_FISCAL[muni.id];
                      if (!nf) return '—';
                      const actualIsGainer = (nf.revenueInflow - nf.budgetOutflow) > 0;
                      const predictedIsGainer = muni.predictedReduced === 'gainer';
                      const isMatch = actualIsGainer === predictedIsGainer;
                      return (
                        <span style={{ color: isMatch ? '#10B981' : '#EF4444', fontSize: '12px' }}>
                          {isMatch ? t('match_correct') : t('match_wrong')}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Probability */}
                  <td className="px-2 py-2.5 text-center">
                    {(() => {
                      if (!muni.inTrainingSet) {
                        return <span className="text-[10px] font-mono" style={{ color: '#475569' }}>—</span>;
                      }
                      const probStr = Math.round(muni.probReduced * 100) + '%';
                      return (
                        <span className="text-[11px] font-mono font-semibold tabular-nums" style={{ color: '#F59E0B' }}>
                          {probStr}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
