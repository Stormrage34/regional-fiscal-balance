import { SKOPIE_PROPERTY_TAX, MUNICIPALITIES, getMuniName, MKD_PER_EUR, SKOPIE_BORROUGHS } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

/**
 * Capital City Deep Dive — Skopje Borough Analysis
 * 
 * Highlights the unique fiscal status of Skopje as North Macedonia's capital,
 * with constituent boroughs under a unified LSGU budget (permanent asymmetric
 * decentralization since 2005/2011). Shows internal property tax collection
 * disparities and academic context from Gruevski & Gaber (2023).
 */
export default function SkopjeCapitalSection({ aggregates = {} }) {
  const { t, locale } = useLocale();
  
  // Compute Skopje net surplus from per-borough Treasury data
  const skopjeNetEUR = aggregates.skopjeNet ? aggregates.skopjeNet / MKD_PER_EUR : 0;
  const skopjeSurplusM = Math.round(skopjeNetEUR / 1_000_000);
  const skopjeNetPC = aggregates.skopjeNetPC || 0;
  const subtitle = t('capital_section_subtitle').replace('{n}', SKOPIE_BORROUGHS.length);
  
  // Build borough list from all SKOPIE_BORROUGHS, filling missing property tax with "no data"
  const boroughs = SKOPIE_BORROUGHS.map(id => {
    const taxData = SKOPIE_PROPERTY_TAX[id];
    const muni = MUNICIPALITIES.find(m => m.id === id) || { id, name: id, name_mk: id, name_sq: id };
    return {
      id, muni,
      collectionRate: taxData?.collectionRate ?? null,
      annualRevenueK: taxData?.annualRevenueK ?? 0,
    };
  }).sort((a, b) => {
    // Null collection rates sort last
    if (a.collectionRate === null && b.collectionRate === null) return 0;
    if (a.collectionRate === null) return 1;
    if (b.collectionRate === null) return -1;
    return b.collectionRate - a.collectionRate;
  });

  const maxRevenue = Math.max(...boroughs.map(b => b.annualRevenueK));

  return (
    <section id="section-skopje" className="rounded-xl relative overflow-hidden mb-8 transition-all duration-300" style={{ 
      backgroundColor: 'rgba(11,17,32,0.6)', 
      borderColor: '#B8860B', // Dark goldenrod — capital accent
      borderWidth: 1,
      borderLeftWidth: 4,
      borderLeftColor: '#FFD700', // Gold
    }}>
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-500/60 via-amber-500/40 to-transparent" />
      
      {/* Background glow */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.03) 0%, transparent 60%)',
      }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b relative" style={{ borderColor: 'rgba(184,134,11,0.3)' }}>
        <div className="flex items-center gap-3 mb-1">
          {/* Capital crown icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M2 20h20L18 8l-4 6-2-8-2 8-4-6z" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="18" r="1" fill="#FFD700" />
          </svg>
          <span title="Real data from Ministry of Finance Treasury" className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
          <h2 className="text-sm font-mono font-bold text-white tracking-widest uppercase">
            {t('capital_section_title')}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ 
            backgroundColor: 'rgba(255,215,0,0.1)', 
            borderColor: 'rgba(255,215,0,0.3)',
            color: '#FFD700' 
          }}>
            {t('capital_boroughs')}
          </span>
        </div>
        <p className="text-[11px] font-mono ml-7" style={{ color: '#94a3b8' }}>
          {subtitle}
        </p>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-3 gap-4 px-5 py-4 border-b" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
            {t('capital_budget_surplus')}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            €{skopjeSurplusM}M
            <span title="Per-borough Treasury data sums to ~4× the consolidated City of Skopje budget. Boroughs allocate shared city revenues individually. True aggregate surplus lies between €5.9M (city budget) and €123M (borough sum)." className="inline-block w-3.5 h-3.5 rounded-full bg-slate-600/40 text-[8px] text-slate-400 text-center leading-3 ml-1 cursor-help align-middle" aria-label="Data note">ⓘ</span>
          </div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>+€{skopjeNetPC}/жител · Трезор 2025</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
            {t('capital_population')}
          </div>
          <div className="text-xl font-bold font-mono text-white">526K</div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>SSO Census 2021</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
            {t('capital_boroughs')}
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{SKOPIE_BORROUGHS.length}</div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>total</div>
        </div>
      </div>

      {/* Property Tax Collection Table */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            {t('capital_property_tax')}
          </h3>
          <span className="text-[10px] font-mono" style={{ color: '#475569' }}>
            CCC Open Data 2017-2019
          </span>
        </div>

        <div className="space-y-1.5">
          {boroughs.map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-1.5 border-b last:border-b-0 group" style={{ 
              borderColor: 'rgba(51,65,85,0.3)',
            }}>
              {/* Borough name */}
              <div className="w-20 md:w-28 text-right flex-shrink-0">
                <span className="text-[11px] font-mono text-slate-300 group-hover:text-white transition-colors">
                  {getMuniName(b.muni, locale)}
                </span>
              </div>

              {/* Collection rate bar */}
              <div className="flex-1 h-4 rounded-sm bg-slate-800 overflow-hidden relative">
                {b.collectionRate !== null ? (
                  <>
                    <div 
                      className="h-full rounded-sm transition-all duration-300"
                      style={{ 
                        width: `${b.collectionRate * 100}%`,
                        backgroundColor: b.collectionRate >= 0.90 ? '#10B981' : 
                                        b.collectionRate >= 0.80 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {(b.collectionRate * 100).toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-slate-600">
                    —
                  </span>
                )}
              </div>

              {/* Annual revenue */}
              <div className="w-12 md:w-16 text-right flex-shrink-0">
                <span className="text-[11px] font-mono tabular-nums" style={{ color: b.annualRevenueK > 0 ? '#94a3b8' : '#475569' }}>
                  {b.annualRevenueK > 0 ? `€${(b.annualRevenueK / 1000).toFixed(1)}M` : '—'}
                </span>
              </div>

              {/* Revenue bar (normalized) */}
              <div className="w-12 md:w-16 h-4 rounded-sm bg-slate-800 overflow-hidden flex-shrink-0">
                {b.annualRevenueK > 0 ? (
                  <div 
                    className="h-full rounded-sm bg-amber-500/60"
                    style={{ width: `${(b.annualRevenueK / maxRevenue) * 100}%` }}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Disparity note */}
        <div className="mt-3 p-2.5 rounded border" style={{ 
          backgroundColor: 'rgba(239,68,68,0.05)', 
          borderColor: 'rgba(239,68,68,0.2)' 
        }}>
          <div className="flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }}>
              <path d="M12 9v2m0 4h.01M12 3l9.8 17H2.2L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[11px] font-mono" style={{ color: '#f87171' }}>
              {t('capital_disparity_note')}
            </p>
          </div>
        </div>

        {/* Academic context */}
        <div className="mt-2 p-2.5 rounded border" style={{ 
          backgroundColor: 'rgba(99,102,241,0.05)', 
          borderColor: 'rgba(99,102,241,0.2)' 
        }}>
          <div className="flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }}>
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[11px] font-mono" style={{ color: '#a5b4fc' }}>
              {t('capital_academic_note')} — Gruevski & Gaber (2023)
            </p>
          </div>
        </div>

        {/* Model exclusion note */}
        <div className="mt-2 p-2 rounded border" style={{ 
          backgroundColor: 'rgba(100,116,139,0.05)', 
          borderColor: 'rgba(100,116,139,0.2)' 
        }}>
          <p className="text-[10px] font-mono" style={{ color: '#64748b' }}>
            ⚠️ {t('capital_model_exclusion')}
          </p>
        </div>
      </div>
    </section>
  );
}
