import { useLocale } from '../../context/LocaleContext.jsx';

export default function MethodologyPanel({ showMethodology, setShowMethodology }) {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          {t('method_title')}
        </h2>
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all duration-200 hover:brightness-125"
          style={{
            backgroundColor: showMethodology ? 'rgba(245,158,11,0.1)' : '#243047',
            borderColor: showMethodology ? 'rgba(245,158,11,0.25)' : 'rgba(100,116,139,0.2)',
            color: showMethodology ? '#F59E0B' : '#64748b',
          }}
          aria-expanded={showMethodology}
          aria-controls="methodology-panel"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform duration-200 ${showMethodology ? '' : '-rotate-90'}`} style={{ fill: 'currentColor' }}>
            <polygon points="2,3 5,7 8,3" />
          </svg>
          {t('method_btn')}
        </button>
      </div>

      {/* Collapsible panel */}
      <div id="methodology-panel" className={`grid overflow-hidden transition-all duration-300 ease-in-out ${showMethodology ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} role="region" aria-label="Model methodology">
        <div className="rounded-xl border p-3.5" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: 'rgba(51,65,85,0.4)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: '#F59E0B' }}>{t('method_how')}</span>
            <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>({t('method_collapse')})</span>
          </div>

          <div className="space-y-2.5">
            {/* Tax Leakage */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F59E0B' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>{t('chart_leakage')}</span>
                  <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(245,158,11,0.18)', padding: '1px 5px', borderRadius: 3 }}>€1,200 &times; shadowEcon &times; (1 − compliance&times;0.4)</code>
                </div>
                <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                  {t('method_leakage_desc')}
                </p>
              </div>
            </div>

            {/* Welfare Burden */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F43F5E' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>{t('chart_welfare')}</span>
                  <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(244,63,94,0.18)', padding: '1px 5px', borderRadius: 3 }}>welfareRate &times; €800</code>
                </div>
                <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                  {t('method_welfare_desc')}
                </p>
              </div>
            </div>

            {/* Overhead & Credits */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#818CF8' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>{t('chart_overhead')}</span>
                  <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(129,140,248,0.18)', padding: '1px 5px', borderRadius: 3 }}>€600 + (1−compliance)&times;€400 − corporate correction</code>
                </div>
                <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                  {t('method_overhead_desc')}
                </p>
              </div>
            </div>

            {/* Net Fiscal Balance */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#a78bfa' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>{t('net_fiscal')}</span>
                  <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(167,139,250,0.18)', padding: '1px 5px', borderRadius: 3 }}>revenueInflow − budgetOutflow</code>
                </div>
                <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                  {t('method_fiscal_desc')}
                </p>
              </div>
            </div>

            {/* Logistic Regression Model */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#8B5CF6' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>{t('method_logit_title')}</span>
                   <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(139,92,246,0.18)', padding: '1px 5px', borderRadius: 3 }}>logit = 2.7879 + 3.87e-05·pop − 2.4627·urban − 0.00166·estOwnRevPC(MKD)</code>
                </div>
                <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                  {t('method_logit_desc')}
                </p>
              </div>
            </div>

            {/* Property Tax Benchmark Note */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#06B6D4' }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>Property Tax Benchmark</span>
                </div>
                <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                  {t('method_property_note')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1.5" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
            <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{t('method_footer')}</span>
            <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{t('method_sources')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
