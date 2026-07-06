import { MKD_PER_EUR, EUR_USD } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function KpiRibbon({
  aggregates,
  gainerCount,
  loserCount,
  MUNICIPALITIES,
  AnimatedNumber,
  fmt,
  showMkd,
}) {
  const { t } = useLocale();
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 mb-8">
      {/* Hero tile — Net Annual Per Capita Drain */}
      <div
        className="rounded-xl relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-5 border"
        style={{
          backgroundColor: '#1e293b',
          borderColor: 'rgba(245,158,11,0.15)',
          boxShadow: '0 0 30px rgba(245,158,11,0.04), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-amber-400/40 to-amber-500/50" style={{ pointerEvents: 'none' }} />
        <span className="block text-[10px] font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          {t('hero_drain')}
        </span>
        <div className="mt-2 flex items-baseline gap-1">
          <AnimatedNumber
            value={showMkd ? Math.round(aggregates.weightedAvgDrain * MKD_PER_EUR) : aggregates.weightedAvgDrain}
            prefix={showMkd ? 'MKD ' : '€'}
            size="text-[2.6rem] sm:text-[3rem]"
            color="#f59e0b"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <span className="text-[10px] font-mono" style={{ color: '#64748b' }}>
            {t('pop_weighted')}
          </span>
          <span className="text-[10px] font-mono" style={{ color: '#64748b' }}>·</span>
          <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
            {MUNICIPALITIES.length} {t('municipalities')}
          </span>
          <span className="text-[10px] font-mono" style={{ color: '#64748b' }}>·</span>
          <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
            {aggregates.totalPop.toLocaleString()} {t('pop')}
          </span>
        </div>
      </div>

      {/* Total Regional Drain */}
      <div
        className="rounded-lg relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-4 border"
        style={{
          backgroundColor: '#1e293b',
          borderColor: 'rgba(248,113,113,0.1)',
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
          {t('kpi_total_drain')}
        </span>
        <span className="block text-xl font-bold font-mono mt-1 tabular-nums" style={{ color: '#F87171' }}>
          {fmt(aggregates.totalYearlyDrain / 1_000_000)}
        </span>
        <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#64748b' }}>{t('annual_aggregate')}</span>
      </div>

      {/* Net Gainers / Losers */}
      <div
        className="rounded-lg relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-4 border"
        style={{
          backgroundColor: '#1e293b',
          borderColor: 'rgba(148,163,184,0.08)',
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
          {t('kpi_gainers_losers')}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums" style={{ color: '#34d399' }}>
            {gainerCount}
          </span>
          <span className="text-sm font-mono text-slate-600">/</span>
          <span className="text-xl font-bold font-mono tabular-nums" style={{ color: '#fbbf24' }}>
            {loserCount}
          </span>
        </div>
        <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#64748b' }}>{t('surplus')} / {t('deficit')}</span>
      </div>

      {/* Employment Fiscal Loss */}
      <div
        className="rounded-lg relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-4 border"
        style={{
          backgroundColor: '#1e293b',
          borderColor: 'rgba(251,191,36,0.1)',
        }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
          {t('kpi_emp_loss')}
        </span>
        <span className="block text-xl font-bold font-mono mt-1 tabular-nums" style={{ color: '#fbbf24' }}>
          {fmt(aggregates.totalUnemploymentFiscalLoss / EUR_USD / 1_000_000)}
        </span>
        <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#64748b' }}>{aggregates.totalUnemployed.toLocaleString()} {t('hdr_unemployed').toLowerCase()}</span>
      </div>
    </section>
  );
}
