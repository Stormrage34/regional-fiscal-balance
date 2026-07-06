import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';

// BackToTopButton moved to NakedBudget.jsx for reliable rendering.
// See NakedBudget.jsx for the implementation.

function useScrollSpy(itemIds) {
  const [active, setActive] = useState(itemIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0) {
          setActive(intersecting[0].target.id);
        }
      },
      { rootMargin: '-60px 0px -70% 0px', threshold: 0 }
    );

    itemIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itemIds]);

  return active;
}

export default function StickyNav() {
  const { t } = useLocale();

  const NAV_ITEMS = useMemo(() => [
    { id: 'section-skopje',            label: t('nav_skopje') },
    { id: 'section-balance',           label: t('nav_balance') },
    { id: 'section-regional-balance',  label: t('nav_regional') },
    { id: 'section-labor-market',      label: t('nav_labor') },
    { id: 'section-phases',            label: t('nav_phases') },
    { id: 'section-charts',            label: t('nav_charts') },
    { id: 'section-table',             label: t('nav_table') },
  ], [t]);

  const itemIds = NAV_ITEMS.map(i => i.id);
  const activeSection = useScrollSpy(itemIds);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }, []);

  return (
    <>
      <nav
        className="sticky top-0 z-40 border-b border-card bg-section backdrop-blur-xl"
        role="navigation"
        aria-label={t('nav_aria_label')}
      >
        <div className="hidden md:flex items-center gap-0.5 px-6 py-2 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-2 rounded-full text-[11px] font-mono whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-drain-amber/15 text-drain-amber border border-drain-amber/30 shadow-[0_0_8px_rgba(245,158,11,0.08)]'
                    : 'text-secondary hover-text-primary hover-bg border border-transparent'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="md:hidden flex items-center justify-between px-4 py-2.5">
          <span className="text-[11px] font-mono text-drain-amber font-semibold truncate">
            {NAV_ITEMS.find(i => i.id === activeSection)?.label || t('nav_default')}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-2 rounded-md text-secondary hover-text-primary hover-bg transition-colors"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t('nav_menu_close') : t('nav_menu_open')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                : <><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></>
              }
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-card px-3 py-2 space-y-0.5 bg-section">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded text-[11px] font-mono transition-colors duration-150 ${
                    isActive
                      ? 'text-drain-amber bg-drain-amber/10 font-semibold'
                      : 'text-secondary hover-text-primary hover-bg'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
