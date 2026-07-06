import { SKOPIE_PROPERTY_TAX, SKOPIE_BORROUGHS, MUNICIPALITIES, getMuniName, MKD_PER_EUR } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

/**
 * Capital City Deep Dive — Skopje Borough Analysis
 * 
 * Highlights the unique fiscal status of Skopje as North Macedonia's capital,
 * with constituent boroughs under a unified LSGU budget (permanent asymmetric
 * decentralization since 2005/2011). Shows internal property tax collection
 * disparities and academic context from Gruevski & Gaber (2023).
 * 
 * Data structure: 16 total municipalities in SKOPIE_BORROUGHS —
 * 10 City of Skopje boroughs (property tax data available for 9) +
 * 6 ring municipalities (no property tax data).
 */
export default function SkopjeCapitalSection({ aggregates = {} }) {
  const { t, locale } = useLocale();
  
  // Compute Skopje net surplus from per-borough Treasury data
  const skopjeNetEUR = aggregates.skopjeNet ? aggregates.skopjeNet / MKD_PER_EUR : 0;
  const skopjeSurplusM = Math.round(skopjeNetEUR / 1_000_000);
  const skopjeNetPC = aggregates.skopjeNetPC || 0;

  // Build borough list from SKOPIE_PROPERTY_TAX (only entries with data)
  const boroughs = Object.entries(SKOPIE_PROPERTY_TAX)
    .map(([id, data]) => ({ 
      id, ...data, 
      muni: MUNICIPALITIES.find(m => m.id === id) || { id, name: id, name_mk: id, name_sq: id }
    }))
    .sort((a, b) => b.collectionRate - a.collectionRate);

  const maxRevenue = Math.max(...boroughs.map(b => b.annualRevenueK));

  // Ring municipalities (in SKOPIE_BORROUGHS but NOT in SKOPIE_PROPERTY_TAX)
  const ringMunis = SKOPIE_BORROUGHS.filter(id => !SKOPIE_PROPERTY_TAX[id]);

  return (
    <section id="section-skopje" className="rounded-xl relative overflow-hidden mb-8 transition-all duration-300 border border-section bg-section-transparent" style={{ 
      borderLeftWidth: 4,
      borderLeftColor: '#FFD700',
    }}>
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-500/60 via-amber-500/40 to-transparent" />
      
      {/* Background glow */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.03) 0%, transparent 60%)',
      }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-section">
        <div className="flex items-center gap-3 mb-1">
          {/* Capital crown icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M2 20h20L18 8l-4 6-2-8-2 8-4-6z" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="18" r="1" fill="#FFD700" />
          </svg>
          <span title="Real data from Ministry of Finance Treasury" className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
          <h2 className="text-sm font-mono font-bold text-primary tracking-widest uppercase">
            {t('capital_section_title')}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-section text-gold">
            {t('capital_region')}
          </span>
        </div>
        <p className="text-[11px] font-mono ml-7 text-secondary">
          {t('capital_section_subtitle')}
        </p>
      </div>

      {/* Aggregate Metrics — split into Boroughs + Ring columns */}
      <div className="grid grid-cols-3 gap-4 px-5 py-4 border-b border-light">
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider mb-1 text-tertiary">
            {t('capital_budget_surplus')}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-light">
            €{skopjeSurplusM}M
            <span title="Per-borough Treasury data sums to ~4× the consolidated City of Skopje budget. Boroughs allocate shared city revenues individually. True aggregate surplus lies between €5.9M (city budget) and €123M (borough sum)." className="inline-block w-3.5 h-3.5 rounded-full bg-tertiary/40 text-[8px] text-secondary text-center leading-3 ml-1 cursor-help align-middle" aria-label="Data note">ⓘ</span>
          </div>
          <div className="text-[10px] font-mono mt-0.5 text-muted">{t('capital_net_per_capita').replace('{n}', skopjeNetPC)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider mb-1 text-tertiary">
            {t('capital_population')}
          </div>
          <div className="text-xl font-bold font-mono text-primary">526K</div>
          <div className="text-[10px] font-mono mt-0.5 text-muted">SSO Census 2021</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider mb-1 text-tertiary">
            {t('capital_boroughs')}
          </div>
          <div className="text-xl font-bold font-mono text-amber-light">10</div>
          <div className="text-[10px] font-mono mt-0.5 text-muted">City boroughs</div>
        </div>
      </div>

      {/* Ring municipalities count bar */}
      <div className="px-5 py-2 border-b border-light bg-hover">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary">
            {t('capital_ring_count')}
          </span>
          <span className="text-[10px] font-mono text-muted">
            {ringMunis.map(id => getMuniName(MUNICIPALITIES.find(m => m.id === id) || { id }, locale)).join(', ')}
          </span>
        </div>
      </div>

      {/* Property Tax Collection Table */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-secondary">
            {t('capital_property_tax')}
          </h3>
          <span className="text-[10px] font-mono text-muted">
            CCC Open Data 2017-2019
          </span>
        </div>

        {/* Section 1: City of Skopje Boroughs (with data) */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ 
              backgroundColor: 'rgba(16,185,129,0.1)', 
              borderColor: 'rgba(16,185,129,0.3)',
              color: '#10B981',
            }}>
              ● {boroughs.length} with data
            </span>
          </div>

          <div className="space-y-1.5">
            {boroughs.map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-1.5 border-b last:border-b-0 group hover-bg transition-colors" style={{ 
                borderColor: 'rgba(51,65,85,0.3)',
              }}>
                {/* Borough name */}
                <div className="w-20 md:w-28 text-right flex-shrink-0">
                  <span className="text-[11px] font-mono text-secondary group-hover-text-primary transition-colors">
                    {getMuniName(b.muni, locale)}
                  </span>
                </div>

                {/* Collection rate bar */}
                <div className="flex-1 h-4 rounded-sm bg-chart-bg overflow-hidden relative">
                  <div 
                    className="h-full rounded-sm transition-all duration-300"
                    style={{ 
                      width: `${b.collectionRate * 100}%`,
                      backgroundColor: b.collectionRate >= 0.90 ? '#10B981' : 
                                      b.collectionRate >= 0.80 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {(b.collectionRate * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Annual revenue */}
                <div className="w-12 md:w-16 text-right flex-shrink-0">
                  <span className="text-[11px] font-mono tabular-nums text-secondary">
                    €{(b.annualRevenueK / 1000).toFixed(1)}M
                  </span>
                </div>

                {/* Revenue bar (normalized) */}
                <div className="w-12 md:w-16 h-4 rounded-sm bg-chart-bg overflow-hidden flex-shrink-0">
                  <div 
                    className="h-full rounded-sm bg-drain-amber/60"
                    style={{ width: `${(b.annualRevenueK / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-[1px] bg-border-light" />
          <span className="text-[9px] font-mono uppercase tracking-wider whitespace-nowrap text-muted">
            — {t('capital_ring_count')} —
          </span>
          <div className="flex-1 h-[1px] bg-border-light" />
        </div>

        {/* Section 2: Ring Municipalities (no data) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ 
              backgroundColor: 'rgba(100,116,139,0.1)', 
              borderColor: 'rgba(100,116,139,0.3)',
              color: '#64748b',
            }}>
              ○ {ringMunis.length} no data
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
            {ringMunis.map((id) => {
              const muni = MUNICIPALITIES.find(m => m.id === id) || { id, name: id, name_mk: id, name_sq: id };
              return (
                <div key={id} className="flex items-center gap-1.5 py-1">
                  <span className="text-[10px] font-mono text-muted line-through">
                    {getMuniName(muni, locale)}
                  </span>
                  <span className="text-[8px] font-mono px-1 rounded" style={{ 
                    backgroundColor: 'rgba(100,116,139,0.15)',
                    color: '#64748b',
                  }}>
                    {t('capital_ring_no_data')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consolidated info bar */}
        <div className="mt-4 p-2.5 rounded border bg-hover border-light">
          <div className="flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }}>
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-secondary">
                <span className="text-loser-rose">⚠ {t('capital_disparity_note')}</span>
              </p>
              <p className="text-[10px] font-mono text-muted">
                {t('capital_academic_note')} — Gruevski & Gaber (2023)
              </p>
            </div>
          </div>
        </div>

        {/* Model exclusion note */}
        <div className="mt-1.5 p-2 rounded border bg-hover/50 border-light">
          <p className="text-[9px] font-mono text-muted">
            ⚠ {t('capital_model_exclusion')}
          </p>
        </div>
      </div>
    </section>
  );
}
