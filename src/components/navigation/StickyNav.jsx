import { useState, useEffect, useCallback } from 'react';

// BackToTopButton moved to NakedBudget.jsx for reliable rendering.
// See NakedBudget.jsx for the implementation.

const NAV_ITEMS = [
  { id: 'section-skopje',       label: 'Скопје' },
  { id: 'section-balance',      label: 'Нето Влијание' },
  { id: 'section-regional-balance', label: 'Регионален Биланс' },
  { id: 'section-labor-market', label: 'Пазар на Труд' },
  { id: 'section-phases',       label: 'Фази' },
  { id: 'section-charts',       label: 'Графикони' },
  { id: 'section-table',        label: 'Табела' },
];

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
        className="sticky top-0 z-40 border-b border-slate-700/40 backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(15,23,42,0.92)' }}
        role="navigation"
        aria-label="Навигација по секции"
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
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="md:hidden flex items-center justify-between px-4 py-2.5">
          <span className="text-[11px] font-mono text-amber-300 font-semibold truncate">
            {NAV_ITEMS.find(i => i.id === activeSection)?.label || 'Почеток'}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Затвори мени' : 'Отвори мени'}
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
          <div className="md:hidden border-t border-slate-700/40 px-3 py-2 space-y-0.5" style={{ backgroundColor: 'rgba(15,23,42,0.98)' }}>
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded text-[11px] font-mono transition-colors duration-150 ${
                    isActive
                      ? 'text-amber-300 bg-amber-500/10 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
