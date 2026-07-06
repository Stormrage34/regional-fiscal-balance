import RangeSlider from '../ui/RangeSlider.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import { CONSTANTS } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function Sidebar({
  enforcementStrength, setEnforcementStrength,
  digitalFiscalization, setDigitalFiscalization,
  applyCorrection, setApplyCorrection,
  sidebarOpen, setSidebarOpen,
  showMkd, setShowMkd,
}) {
  const { t } = useLocale();
  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed md:relative z-40 h-dvh md:h-auto w-72 md:w-64 shrink-0 border-r border-slate-800/70 bg-[var(--color-surface-card)] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y', height: '100dvh' }}
      >
        {/* Brand Section */}
        <div className="flex flex-col gap-1 p-4 pt-5 pb-5 border-b relative overflow-hidden" style={{ borderColor: '#334155' }}>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-500/30 via-teal-500/20 to-indigo-500/30" />
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span className="font-sans font-bold tracking-wider text-white text-base uppercase">
              {t('brand_title')}
            </span>
          </div>
          <span className="font-sans text-[11px] font-medium tracking-normal text-slate-400 pl-7">
            {t('brand_sub')}
          </span>
        </div>

        <div className="p-4 flex-1 space-y-6 overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

          <h3 className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            {t('sidebar_policy')}
          </h3>

          <RangeSlider
            label={t('sidebar_enforcement')}
            value={enforcementStrength}
            onChange={setEnforcementStrength}
            min={10}
            max={100}
            unit="%"
            accentColor="#f59e0b"
          />

          <RangeSlider
            label={t('sidebar_digital')}
            value={digitalFiscalization}
            onChange={setDigitalFiscalization}
            min={0}
            max={100}
            unit="%"
            accentColor="#06b6d4"
          />

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-slate-400 text-xs font-mono tracking-tight">{t('sidebar_correction')}</span>
            <button
              type="button"
              onClick={() => setApplyCorrection((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
                border border-transparent transition-all duration-300 ease-in-out
                focus:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] focus:outline-none hover:border-emerald-500/40`}
              style={{
                backgroundColor: applyCorrection ? '#10B981' : '#334155',
                boxShadow: applyCorrection ? '0 0 12px rgba(16,185,129,0.25)' : 'none',
              }}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out`}
                style={{ transform: applyCorrection ? 'translateX(17px)' : 'translateX(2px)' }}
              />
            </button>
            <span className="text-[10px] font-mono transition-colors duration-300"
              style={{ color: applyCorrection ? '#10B981' : '#64748b' }}>
              {applyCorrection ? t('correction_active') : t('correction_inactive')}
            </span>
          </div>

          {/* System status badges */}
          <div className="pt-2">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-3" />
            <h3 className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
              {t('sidebar_status')}
            </h3>
            <div className="space-y-2">
              {[
                t('gdp_label'),
                t('shadow_label'),
                t('revenue_label'),
              ].map((text, i) => (
                <div key={i} className="rounded-md px-3 py-2 border text-[10px] font-mono flex items-center gap-2" style={{ backgroundColor: '#243047', borderColor: '#1F3050', color: '#94a3b8' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="pt-2">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
                {t('sidebar_currency')}
              </span>
              <div className="relative inline-flex h-11 rounded-lg border overflow-hidden" style={{ borderColor: '#334155', backgroundColor: '#0f172a' }}>
                {/* Sliding indicator */}
                <div
                  className="absolute inset-y-0 w-1/2 rounded-lg bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-300 ease-in-out"
                  style={{ left: showMkd ? '50%' : '0%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowMkd(false)}
                  className={`relative z-10 px-3 py-1 text-xs font-mono transition-colors duration-300 ${
                    !showMkd ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  EUR
                </button>
                <button
                  type="button"
                  onClick={() => setShowMkd(true)}
                  className={`relative z-10 px-3 py-1 text-xs font-mono transition-colors duration-300 ${
                    showMkd ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MKD
                </button>
              </div>
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
