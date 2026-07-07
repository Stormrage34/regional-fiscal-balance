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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 mb-8">
      {/* Hero tile — Net Annual Per Capita Drain */}
      <div
        className="rounded-xl relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-5 border border-card bg-card"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-drain-amber/50 via-drain-amber/40 to-drain-amber/50" style={{ pointerEvents: 'none' }} />
        <span className="block text-[10px] font-mono uppercase tracking-widest text-secondary">
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
          <span className="text-[10px] font-mono text-secondary">
            {t('pop_weighted')}
          </span>
          <span className="text-[10px] font-mono text-muted">·</span>
          <span className="text-[10px] font-mono text-secondary">
            {MUNICIPALITIES.length} {t('municipalities')}
          </span>
          <span className="text-[10px] font-mono text-muted">·</span>
          <span className="text-[10px] font-mono text-secondary">
            {aggregates.totalPop.toLocaleString()} {t('pop')}
          </span>
        </div>
      </div>

      {/* Total Regional Drain */}
      <div
        className="rounded-lg relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-4 border border-card bg-card"
      >
        <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
          {t('kpi_total_drain')}
        </span>
        <span className="block text-xl font-bold font-mono mt-1 tabular-nums text-loser-rose">
          {fmt(aggregates.totalYearlyDrain / 1_000_000)}
        </span>
        <span className="text-[10px] font-mono mt-0.5 block text-secondary">{t('annual_aggregate')}</span>
      </div>

      {/* Net Gainers / Losers */}
      <div
        className="rounded-lg relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-4 border border-card bg-card"
      >
        <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
          {t('kpi_gainers_losers')}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums text-gainer-green">
            {gainerCount}
          </span>
          <span className="text-sm font-mono text-muted">/</span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-light">
            {loserCount}
          </span>
        </div>
        <span className="text-[10px] font-mono mt-0.5 block text-secondary">{t('surplus')} / {t('deficit')}</span>
      </div>

      {/* Employment Fiscal Loss */}
      <div
        className="rounded-lg relative overflow-hidden group hover:brightness-105 transition-all duration-200 kpi-tile-enter p-4 border border-card bg-card"
      >
        <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">
          {t('kpi_emp_loss')}
        </span>
        <span className="block text-xl font-bold font-mono mt-1 tabular-nums text-amber-light">
          {fmt(aggregates.totalUnemploymentFiscalLoss / EUR_USD / 1_000_000)}
        </span>
        <span className="text-[10px] font-mono mt-0.5 block text-secondary">{aggregates.totalUnemployed.toLocaleString()} {t('hdr_unemployed').toLowerCase()}</span>
      </div>
    </section>
  );
}
