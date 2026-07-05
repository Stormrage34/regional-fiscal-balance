import { UNEMPLOYMENT_DATA, FISCAL_LOSS_PER_UNEMPLOYED, NET_FISCAL, MKD_PER_EUR, getMuniName } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

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
  return (
    <section
      className="rounded-xl relative overflow-hidden mb-10 transition-all duration-300"
      style={{ backgroundColor: 'rgba(11,17,32,0.4)', borderColor: '#1F3050', borderWidth: 1 }}
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

      <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(15,23,42,0.6)' }}>
              <th
                className="px-4 py-3 text-left text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 2, left: 0, backgroundColor: 'rgb(15,23,42)' }}
                onClick={() => handleSort('name')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('name'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('name', sortKey, sortAsc)}
              >
                  <span className="inline-flex items-center gap-1">
                  {t('hdr_muni')}
                  <SortIcon columnKey="name" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 1 }}
                onClick={() => handleSort('drain')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('drain'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('drain', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  <span className="text-[#F59E0B]">▸</span> {t('hdr_balance')}
                  <SortIcon columnKey="drain" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 1 }}
                onClick={() => handleSort('leakage')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('leakage'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('leakage', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  <span className="text-[#F59E0B]">▸</span> {t('hdr_leakage')}
                  <SortIcon columnKey="leakage" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 1 }}
                onClick={() => handleSort('welfare')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('welfare'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('welfare', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  <span className="text-[#F43F5E]">▸</span> {t('hdr_welfare')}
                  <SortIcon columnKey="welfare" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 1 }}
                onClick={() => handleSort('yearly')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('yearly'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('yearly', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  <span className="text-[#F43F5E]">▸</span> {t('hdr_drain_yr')}
                  <SortIcon columnKey="yearly" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 1 }}
                onClick={() => handleSort('arrears')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('arrears'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('arrears', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  <span className="text-[#64748b]">▸</span> {t('hdr_arrears')}
                  <SortIcon columnKey="arrears" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                style={{ color: '#64748b', zIndex: 1 }}
                onClick={() => handleSort('unemployment')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('unemployment'); } }}
                tabIndex={0}
                role="columnheader"
                aria-sort={getSortDir('unemployment', sortKey, sortAsc)}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="text-[#38bdf8]">▸</span> {t('hdr_unemployed')}
                  <SortIcon columnKey="unemployment" sortKey={sortKey} sortAsc={sortAsc} />
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-[10px] uppercase tracking-wider sticky top-0"
                style={{ color: '#64748b', zIndex: 1, backgroundColor: 'rgb(15,23,42)' }}
              >
                {t('hdr_structural')}
              </th>
              <th
                className="px-4 py-3 text-right text-[10px] uppercase tracking-wider sticky top-0"
                style={{ color: '#64748b', zIndex: 1, backgroundColor: 'rgb(15,23,42)' }}
              >
                {t('hdr_correction')}
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
                      zIndex: 1,
                      backgroundColor: isFocused ? 'rgb(30,41,59)' : (i % 2 === 0 ? 'rgb(15,23,42)' : 'rgb(11,17,32)'),
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold whitespace-nowrap transition-colors duration-200 ${isFocused ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'}`}>
                        {getMuniName(muni, locale)}
                      </span>
                      <div className="hidden sm:block h-1 w-10 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(sparkWidth / 60) * 100}%`, backgroundColor: '#F59E0B' }} />
                      </div>
                      <svg className="w-3 h-3 text-slate-700 group-hover:text-amber-500/50 transition-colors duration-200 ml-auto opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </td>

                  {/* Capita Drain */}
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: '#F59E0B' }}>
                    {fmt(muni.totalPerCapitaDrain, true)}
                  </td>

                  {/* Tax Leakage — fixed from #d4a84b to #F59E0B */}
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#F59E0B' }}>
                    {fmt(muni.uncollectedLeakage, true)}
                  </td>

                  {/* Welfare */}
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#F43F5E' }}>
                    {fmt(muni.welfareBurden, true)}
                  </td>

                  {/* Annual Drain */}
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: '#F43F5E' }}>
                    {fmt(muni.totalYearlyDrain / 1_000_000, false)}
                  </td>

                  {/* Arrears */}
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#64748b' }}>
                    {(() => {
                      const nf = NET_FISCAL[muni.id];
                      if (!nf || !nf.arrears) return '—';
                      return fmt(nf.arrears / MKD_PER_EUR / 1_000_000, false);
                    })()}
                  </td>

                  {/* Unemployed */}
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#38bdf8' }}>
                    {(() => {
                      const ud = UNEMPLOYMENT_DATA[muni.id];
                      if (!ud) return '—';
                      const fiscalLoss = ud.registered * FISCAL_LOSS_PER_UNEMPLOYED.totalAnnual;
                      return <>{ud.registered.toLocaleString()} <span className="text-[10px] text-slate-600">/ €{Math.round(fiscalLoss / muni.workingAgePop).toLocaleString()}{t('pc_abbr')}</span></>;
                    })()}
                  </td>

                  {/* Structural — Shadow + Compliance stacked */}
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                        <div className="h-1 w-16 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${muni.adjustedShadowEcon}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums" style={{ color: '#94a3b8' }}>{muni.adjustedShadowEcon}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div className="h-1 w-16 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${muni.adjustedCompliance}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums" style={{ color: '#94a3b8' }}>{muni.adjustedCompliance}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Correction */}
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: applyCorrection ? '#10B981' : '#475569' }}>
                    {applyCorrection ? `€${muni.corporateRetraction.toLocaleString()}` : '—'}
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
