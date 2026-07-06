import { UNEMPLOYMENT_DATA, FISCAL_LOSS_PER_UNEMPLOYED, NET_FISCAL, MKD_PER_EUR, getMuniName, DECENTRALIZATION_PHASES, CREDIT_RATINGS, SKOPIE_BORROUGHS } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useMemo } from 'react';

function SortIcon({ columnKey, sortKey, sortAsc }) {
  if (sortKey !== columnKey) {
    return (
      <svg className="ml-1 w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return (
    <svg className="ml-1 w-4 h-4 text-drain-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
  showAdvancedColumns = false,
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
      className="rounded-xl relative mb-10 transition-all duration-300 border border-card bg-section-transparent overflow-clip"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border-light to-transparent" />

      <div className="px-5 py-3.5 border-b flex items-center justify-between relative border-card">
        <h3 className="text-xs font-mono uppercase tracking-widest text-secondary">
          {t('muni_profiles')}
        </h3>
        <span className="text-[10px] font-mono text-secondary">
          {t('muni_sort')}
        </span>
      </div>

      {/* Source legend */}
      <div className="px-5 pb-2 flex items-center gap-4 text-[9px] font-mono text-muted">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gainer-green flex-shrink-0" />Treasury data</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-drain-amber flex-shrink-0" />Model-derived</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-loser-rose flex-shrink-0" />Estimated</span>
      </div>

      <div className="w-full overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="w-full text-sm font-mono border-collapse table-auto">
          <thead>
            {/* ═══ Single Row Header with Macro Averages inline ═══ */}
            <tr className="border-b border-card bg-card">
              {/* Municipality header — sticky left */}
              <th
                className="px-4 py-2.5 text-left align-middle min-w-[150px] whitespace-nowrap text-[10px] font-sans font-bold uppercase tracking-widest text-secondary cursor-pointer select-none hover-text-primary transition-colors sticky top-0 left-0 z-30 bg-card"
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
                className="px-3 py-3 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover-text-primary transition-colors sticky top-0 z-20 bg-card"
                onClick={() => handleSort('drain')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('drain'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('drain', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-gainer-green" title="Real Treasury data" />{t('tbl_avg_balance')}</span>
                  <span className="text-xs font-bold text-drain-amber font-mono tabular-nums">{fmt(totals.avgBalance, true)}</span>
                </div>
              </th>

              {/* Leakage column */}
              <th
                className="px-3 py-3 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover-text-primary transition-colors sticky top-0 z-20 bg-card"
                onClick={() => handleSort('leakage')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('leakage'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('leakage', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-drain-amber" title="Model-derived estimate" />{t('tbl_avg_leakage')}</span>
                  <span className="text-xs font-bold text-drain-amber font-mono tabular-nums">{fmt(totals.avgLeakage, true)}</span>
                </div>
              </th>

              {/* Welfare column */}
              <th
                className="px-3 py-3 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover-text-primary transition-colors sticky top-0 z-20 bg-card"
                onClick={() => handleSort('welfare')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('welfare'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('welfare', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-drain-amber" title="Model-derived estimate" />{t('tbl_avg_welfare')}</span>
                  <span className="text-xs font-bold text-loser-rose font-mono tabular-nums">{fmt(totals.avgWelfare, true)}</span>
                </div>
              </th>

              {/* Annual Drain */}
              <th
                className="px-3 py-3 text-center align-middle min-w-[130px] whitespace-nowrap cursor-pointer select-none hover-text-primary transition-colors sticky top-0 z-20 bg-card"
                onClick={() => handleSort('yearly')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('yearly'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('yearly', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-accent" title="Published source data" />{t('tbl_total_drain')}</span>
                  <span className="text-xs font-bold text-loser-rose font-mono tabular-nums">{fmt(totals.totalDrainMillions, false)}</span>
                </div>
              </th>

              {/* Arrears */}
              <th
                className="px-3 py-3 text-center align-middle min-w-[120px] whitespace-nowrap cursor-pointer select-none hover-text-primary transition-colors sticky top-0 z-20 bg-card"
                onClick={() => handleSort('arrears')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('arrears'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('arrears', sortKey, sortAsc)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-gainer-green" title="Real Treasury data" />{t('tbl_total_arrears')}</span>
                  <span className="text-xs font-bold text-secondary font-mono tabular-nums">{fmt(totals.totalArrearsMillions, false)}</span>
                </div>
              </th>

              {/* Unemployed */}
              <th
                className="px-3 py-3 text-center align-middle min-w-[140px] whitespace-nowrap cursor-pointer select-none hover-text-primary transition-colors sticky top-0 z-20 bg-card"
                onClick={() => handleSort('unemployment')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('unemployment'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('unemployment', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-center text-[10px] font-mono uppercase tracking-wider text-muted">
                  {t('tbl_unemployed')}
                  <SortIcon columnKey="unemployment" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>

              {showAdvancedColumns && (
                <>
                  {/* Structural */}
                  <th className="relative group cursor-help whitespace-nowrap px-3 py-3 text-center align-middle min-w-[140px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('tbl_structural')}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Структурна компонента на одливот
                    </div>
                  </th>

                  {/* Correction */}
                  <th className="relative group cursor-help whitespace-nowrap px-3 py-3 text-center align-middle min-w-[110px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('tbl_correction')}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Корективен фактор
                    </div>
                  </th>

                  {/* Phase */}
                  <th className="px-3 py-3 text-center align-middle min-w-[60px] whitespace-nowrap text-[10px] font-mono uppercase tracking-wider text-muted">
                    {t('hdr_phase')}
                  </th>

                  {/* Risk / Discipline */}
                  <th className="relative group cursor-help whitespace-nowrap px-3 py-3 text-center align-middle min-w-[80px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('hdr_discipline')}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Ризик базиран на однос заостанати долгови/приходи
                    </div>
                  </th>

                  {/* Credit Rating */}
                  <th className="relative group cursor-help whitespace-nowrap px-3 py-3 text-center align-middle min-w-[60px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">RATING*</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Кредитен рејтинг: B1 (Moody's, Штип 2017) или NR
                    </div>
                  </th>

                  {/* Predicted (Model) */}
                  <th
                    className="relative group cursor-pointer select-none whitespace-nowrap px-2 py-2 text-center align-middle min-w-[80px]"
                    onClick={() => handleSort('prediction')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('prediction'); } }}
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={getSortDir('prediction', sortKey, sortAsc)}
                  >
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted">MODEL</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Gainer/Loser предвидување од логистички модел
                      </div>
                    </div>
                  </th>

                  {/* Match */}
                  <th className="relative group cursor-help whitespace-nowrap px-2 py-3 text-center align-middle min-w-[70px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('hdr_match')}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Моделот точно/неточно ја предвидел класификацијата
                    </div>
                  </th>

                  {/* Probability */}
                  <th
                    className="relative group cursor-pointer select-none whitespace-nowrap px-2 py-2 text-center align-middle min-w-[70px]"
                    onClick={() => handleSort('probability')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('probability'); } }}
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={getSortDir('probability', sortKey, sortAsc)}
                  >
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted">PROB</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Веројатност од логистички модел
                      </div>
                    </div>
                  </th>
                </>
              )}
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
                  className="transition-all duration-200 hover-bg cursor-pointer group"
                  style={{
                    borderBottom: i < sortedResults.length - 1 ? '1px solid var(--border-light)' : 'none',
                    backgroundColor: isFocused ? 'rgba(245,158,11,0.03)' : (i % 2 === 0 ? 'var(--bg-hover)' : 'var(--bg-section-transparent)'),
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
                      backgroundColor: isFocused ? 'var(--bg-card)' : (i % 2 === 0 ? 'var(--bg-root)' : 'var(--bg-section-transparent)'),
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`font-semibold whitespace-nowrap transition-colors duration-200 text-sm ${isFocused ? 'text-amber-light' : 'text-secondary group-hover-text-primary'}`}>
                        {getMuniName(muni, locale)}
                      </span>
                      <div className="hidden sm:block h-1 w-12 rounded-full bg-chart-bg overflow-hidden flex-shrink-0">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(sparkWidth / 60) * 100}%`, backgroundColor: '#F59E0B' }} />
                      </div>
                      <svg className="w-3.5 h-3.5 text-muted group-hover-text-drain-amber/50 transition-colors duration-200 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </td>

                  {/* Capita Drain */}
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-sm text-drain-amber">
                    {fmt(muni.totalPerCapitaDrain, true)}
                  </td>

                  {/* Tax Leakage */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm text-drain-amber">
                    {fmt(muni.uncollectedLeakage, true)}
                  </td>

                  {/* Welfare */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm text-loser-rose">
                    {fmt(muni.welfareBurden, true)}
                  </td>

                  {/* Annual Drain */}
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-sm text-loser-rose">
                    {fmt(muni.totalYearlyDrain / 1_000_000, false)}
                  </td>

                  {/* Arrears */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm text-tertiary">
                    {(() => {
                      const nf = NET_FISCAL[muni.id];
                      if (!nf || !nf.arrears) return '—';
                      return fmt(nf.arrears / MKD_PER_EUR / 1_000_000, false);
                    })()}
                  </td>

                  {/* Unemployed */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm text-sky-accent">
                    {(() => {
                      const ud = UNEMPLOYMENT_DATA[muni.id];
                      if (!ud) return '—';
                      const fiscalLoss = ud.registered * FISCAL_LOSS_PER_UNEMPLOYED.totalAnnual;
                      return <>{ud.registered.toLocaleString()} <span className="text-[10px] text-muted">/ €{Math.round(fiscalLoss / muni.workingAgePop).toLocaleString()}{t('pc_abbr')}</span></>;
                    })()}
                  </td>

                  {/* Structural — Shadow + Compliance side by side */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-drain-amber flex-shrink-0" />
                        <span className="text-[11px] tabular-nums text-secondary">{muni.adjustedShadowEcon}%</span>
                      </div>
                      <div className="w-[1px] h-3 bg-border-light" />
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gainer-green flex-shrink-0" />
                        <span className="text-[11px] tabular-nums text-secondary">{muni.adjustedCompliance}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Correction */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: applyCorrection ? '#34d399' : '#64748b' }}>
                    {applyCorrection ? `€${muni.corporateRetraction.toLocaleString()}` : '—'}
                  </td>

                  {/* Phase */}
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const phase = muni.phase || 1;
                      const isP2 = phase === 2;
                      return (
                        <span title={isP2 ? t('phase_tooltip_2') : t('phase_tooltip_1')} className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-help ${
                          isP2
                            ? 'bg-gainer-green/10 text-gainer-green border-gainer-green/20'
                            : 'bg-drain-amber/10 text-drain-amber border-drain-amber/20'
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
                        colorClass = 'bg-gainer-green/10 text-gainer-green border-gainer-green/20';
                      } else if (tier === t('risk_watch')) {
                        colorClass = 'bg-drain-amber/10 text-drain-amber border-drain-amber/20';
                      } else if (tier === t('risk_high')) {
                        colorClass = 'bg-loser-rose/10 text-loser-rose border-loser-rose/20';
                      } else {
                        colorClass = 'bg-muted/10 text-muted border-muted/20';
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
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-gainer-green/10 text-gainer-green border-gainer-green/20">
                            {rating}
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted/10 text-muted border-muted/20">
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
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted/10 text-muted border-muted/20">
                            {t('pred_na')}
                          </span>
                        );
                      }
                      const isGainer = muni.predictedReduced === 'gainer';
                      return (
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isGainer
                            ? 'bg-gainer-green/10 text-gainer-green border-gainer-green/20'
                            : 'bg-loser-rose/10 text-loser-rose border-loser-rose/20'
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
                        return <span className="text-[10px] font-mono text-muted">—</span>;
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
                        return <span className="text-[10px] font-mono text-muted">—</span>;
                      }
                      const probStr = Math.round(muni.probReduced * 100) + '%';
                      return (
                        <span className="text-[11px] font-mono font-semibold tabular-nums text-drain-amber">
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

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-mono text-muted px-5 pb-4">
        <span>Фаза: <span className="text-gainer-green">🟢 P2</span> = блок дотации (со плати)</span>
        <span><span className="text-drain-amber">🟡 P1</span> = наменски дотации (без плати)</span>
        <span>Ризик: <span className="text-loser-rose">🔴 High</span> · <span className="text-drain-amber">🟡 Watch</span> · <span className="text-gainer-green">🟢 Low</span></span>
      </div>
    </section>
  );
}
