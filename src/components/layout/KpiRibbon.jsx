import { MKD_PER_EUR } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function KpiRibbon({
  aggregates,
  results,
  gainerCount,
  loserCount,
  NET_FISCAL,
  MUNICIPALITIES,
  UNEMPLOYMENT_DATA,
  FISCAL_LOSS_PER_UNEMPLOYED,
  AnimatedNumber,
  fmt,
  showMkd,
}) {
  const { t } = useLocale();
  return (
    <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-10">
      {/* Hero tile — Net Annual Per Capita Drain */}
      <div
        className="rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter p-5"
        style={{
          backgroundColor: '#243047',
          borderColor: '#1F3050',
          borderWidth: 1,
          boxShadow: '0 0 30px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/60 via-amber-400/50 to-amber-500/60" style={{ pointerEvents: 'none' }} />
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        <span className="block text-[10px] font-mono uppercase tracking-widest" style={{ color: '#64748b' }}>
          {t('hero_drain')}
        </span>
        <div className="mt-2 flex items-baseline gap-1">
          <AnimatedNumber
            value={showMkd ? Math.round(aggregates.weightedAvgDrain * MKD_PER_EUR) : aggregates.weightedAvgDrain}
            prefix={showMkd ? 'MKD ' : '€'}
            size="text-[2.8rem] sm:text-[3.2rem]"
            color="#f59e0b"
          />
        </div>
        <span className="text-[10px] font-mono mt-1 block" style={{ color: '#94a3b8' }}>
          {t('pop_weighted')} &middot; {MUNICIPALITIES.length} {t('municipalities')} &middot; {aggregates.totalPop.toLocaleString()} {t('pop')}
        </span>
      </div>

      {/* Total Regional Drain */}
      <div
        className="rounded-lg relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter p-4"
        style={{
          backgroundColor: 'rgba(27,42,74,0.4)',
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
          {t('kpi_total_drain')}
        </span>
        <span className="block text-xl font-bold font-mono mt-1" style={{ color: '#F43F5E' }}>
          {fmt(aggregates.totalYearlyDrain / MKD_PER_EUR / 1_000_000)}
        </span>
        <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#94a3b8' }}>{t('annual_aggregate')}</span>
      </div>

      {/* Net Gainers / Losers */}
      <div
        className="rounded-lg relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter p-4"
        style={{
          backgroundColor: 'rgba(27,42,74,0.4)',
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
          {t('kpi_gainers_losers')}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono" style={{ color: '#10B981' }}>
            {gainerCount}
          </span>
          <span className="text-sm font-mono text-slate-600">/</span>
          <span className="text-xl font-bold font-mono" style={{ color: '#F59E0B' }}>
            {loserCount}
          </span>
        </div>
        <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#94a3b8' }}>{t('surplus')} <span className="sr-only">{t('surplus')}</span> / {t('deficit')} <span className="sr-only">{t('deficit')}</span></span>
      </div>

      {/* Employment Fiscal Loss */}
      <div
        className="rounded-lg relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter p-4"
        style={{
          backgroundColor: 'rgba(27,42,74,0.4)',
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
          {t('kpi_emp_loss')}
        </span>
        <span className="block text-xl font-bold font-mono mt-1" style={{ color: '#F59E0B' }}>
          {fmt(aggregates.totalUnemploymentFiscalLoss / MKD_PER_EUR / 1_000_000)}
        </span>
        <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#94a3b8' }}>{aggregates.totalUnemployed.toLocaleString()} registered unemployed</span>
      </div>
    </section>
  );
}
