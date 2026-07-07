import { UNEMPLOYMENT_DATA, FISCAL_LOSS_PER_UNEMPLOYED, NET_FISCAL, MKD_PER_EUR, getMuniName, DECENTRALIZATION_PHASES, CREDIT_RATINGS, SKOPIE_BORROUGHS } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useMemo, useState } from 'react';

// ── Responsive breakpoint helper ───────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useMemo(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

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
  const isMobile = useIsMobile(768);
  const [expandedRows, setExpandedRows] = useState(new Set());

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
        <div className="text-xs font-mono uppercase tracking-widest text-secondary">
          {t('muni_profiles')}
        </div>
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

      {/* ═══ MOBILE CARD LAYOUT (hidden on md+) ═══ */}
      <div className="md:hidden divide-y divide-border-light">
        {sortedResults.map((muni, i) => {
          const maxYearly = Math.max(...sortedResults.map(r => r.totalYearlyDrain));
          const sparkWidth = (muni.totalYearlyDrain / maxYearly) * 60;
          const isFocused = muni.id === focusedMuniId;
          const nf = NET_FISCAL[muni.id];
          const arrearsPC = nf?.arrears ? nf.arrears / MKD_PER_EUR / muni.workingAgePop : 0;
          const ud = UNEMPLOYMENT_DATA[muni.id];
          const unemployed = ud?.registered || 0;

          return (
            <div key={muni.id} className={`px-4 py-3 transition-colors duration-200 ${isFocused ? 'bg-amber-light/5' : 'hover-bg'}`} style={{ borderLeft: isFocused ? '2px solid #f59e0b' : undefined }}>
              {/* Row header: name + key metrics */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setFocusedMuniId(prev => prev === muni.id ? null : muni.id)}
                  className="flex items-center gap-2 text-left min-w-0 flex-1"
                >
                  <span className={`font-semibold text-sm truncate ${isFocused ? 'text-amber-light' : 'text-secondary group-hover-text-primary'}`}>
                    {getMuniName(muni, locale)}
                  </span>
                  <svg className="w-3.5 h-3.5 text-muted flex-shrink-0 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-drain-amber tabular-nums ml-2 flex-shrink-0">{fmt(muni.totalPerCapitaDrain, true)}</span>
              </div>

              {/* Key metrics row */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted block">Annual Drain</span>
                  <span className="text-xs font-semibold tabular-nums text-loser-rose">{fmt(muni.totalYearlyDrain / 1_000_000, false)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted block">Leakage</span>
                  <span className="text-xs font-semibold tabular-nums text-drain-amber">{fmt(muni.uncollectedLeakage, true)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted block">Welfare</span>
                  <span className="text-xs font-semibold tabular-nums text-loser-rose">{fmt(muni.welfareBurden, true)}</span>
                </div>
              </div>

              {/* Expandable detail row */}
              <button
                type="button"
                onClick={() => setExpandedRows(prev => prev.has(muni.id) ? new Set([...prev].filter(id => id !== muni.id)) : new Set([muni.id]))}
                className="w-full text-left py-1 text-[10px] font-mono text-secondary hover-text-primary transition-colors flex items-center gap-1"
                aria-expanded={expandedRows.has(muni.id)}
              >
                <svg className={`w-3 h-3 transition-transform duration-200 ${expandedRows.has(muni.id) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {expandedRows.has(muni.id) ? 'Hide details' : 'Show details'}
              </button>

              {expandedRows.has(muni.id) && (
                <div className="mt-2 pt-2 border-t border-border-light space-y-1.5 animate-pulse-none">
                  {/* Arrears */}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Arrears</span>
                    <span className="tabular-nums">{arrearsPC > 0 ? fmt(arrearsPC, true) : '—'}</span>
                  </div>
                  {/* Unemployed */}
                  {ud && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Unemployed</span>
                      <span className="tabular-nums text-sky-accent">{unemployed.toLocaleString()} / €{Math.round(ud.registered * FISCAL_LOSS_PER_UNEMPLOYED.totalAnnual / muni.workingAgePop).toLocaleString()}{t('pc_abbr')}</span>
                    </div>
                  )}
                  {/* Structural */}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Structural</span>
                    <span className="tabular-nums"><span className="text-drain-amber">{muni.adjustedShadowEcon}%</span> <span className="text-muted mx-1">·</span> <span className="text-gainer-green">{muni.adjustedCompliance}%</span></span>
                  </div>
                  {/* Correction */}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Correction</span>
                    <span className="tabular-nums" style={{ color: applyCorrection ? '#34d399' : '#94a3b8' }}>
                      {applyCorrection ? `€${muni.corporateRetraction.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  {/* Phase + Risk */}
                  <div className="flex items-center gap-2 text-xs">
                    {(() => {
                      const phase = muni.phase || 1;
                      return (
                        <span title={phase === 2 ? t('phase_tooltip_2') : t('phase_tooltip_1')} className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          phase === 2 ? 'bg-gainer-green/10 text-gainer-green border-gainer-green/20' : 'bg-drain-amber/10 text-drain-amber border-drain-amber/20'
                        }`}>P{phase}</span>
                      );
                    })()}
                    <span className="text-muted">·</span>
                    {(() => {
                      const tier = muni.p2_risk_tier || '—';
                      let colorClass;
                      if (tier === t('risk_low')) colorClass = 'text-gainer-green';
                      else if (tier === t('risk_watch')) colorClass = 'text-drain-amber';
                      else if (tier === t('risk_high')) colorClass = 'text-loser-rose';
                      else colorClass = 'text-muted';
                      return <span className={colorClass}>{tier}</span>;
                    })()}
                  </div>
                  {/* Model prediction */}
                  {muni.inTrainingSet && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Model</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        muni.predictedReduced === 'gainer' ? 'bg-gainer-green/10 text-gainer-green border-gainer-green/20' : 'bg-loser-rose/10 text-loser-rose border-loser-rose/20'
                      }`}>
                        {muni.predictedReduced === 'gainer' ? t('pred_gainer') : t('pred_loser')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ DESKTOP TABLE (hidden on mobile) ═══ */}
      <div className="hidden md:block w-full overflow-x-auto overflow-y-auto max-h-[520px]" style={{ maskImage: 'linear-gradient(to right, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 95%, transparent 100%)' }}>
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
                      {t('tooltip_structural')}
                    </div>
                  </th>

                  {/* Correction */}
                  <th className="relative group cursor-help whitespace-nowrap px-3 py-3 text-center align-middle min-w-[110px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('tbl_correction')}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {t('tooltip_correction')}
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
                      {t('tooltip_risk')}
                    </div>
                  </th>

                  {/* Credit Rating */}
                  <th className="relative group cursor-help whitespace-nowrap px-3 py-3 text-center align-middle min-w-[60px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">RATING*</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {t('tooltip_credit_rating')}
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
                        {t('tooltip_prediction')}
                      </div>
                    </div>
                  </th>

                  {/* Match */}
                  <th className="relative group cursor-help whitespace-nowrap px-2 py-3 text-center align-middle min-w-[70px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{t('hdr_match')}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-elevated border border-card rounded text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {t('tooltip_match')}
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
                        {t('tooltip_probability')}
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
                  <td className="px-3 py-2.5 text-right tabular-nums text-sm" style={{ color: applyCorrection ? '#34d399' : '#94a3b8' }}>
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
        <span>{t('legend_phase')}: <span className="text-gainer-green">🟢 P2</span> = {t('phase_tooltip_2')}</span>
        <span><span className="text-drain-amber">🟡 P1</span> = {t('phase_tooltip_1')}</span>
        <span>{t('legend_risk')}: <span className="text-loser-rose">🔴 High</span> · <span className="text-drain-amber">🟡 Watch</span> · <span className="text-gainer-green">🟢 Low</span></span>
      </div>
    </section>
  );
}
