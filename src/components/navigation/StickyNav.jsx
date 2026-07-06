import { useState, useEffect, useCallback, useRef } from 'react';

const NAV_ITEMS = [
  { id: 'section-hero',     label: 'Почеток' },
  { id: 'section-findings', label: 'Наоди' },
  { id: 'section-overview', label: 'Преглед' },
  { id: 'section-phases',   label: 'Фази' },
  { id: 'section-balance',  label: 'Биланс' },
  { id: 'section-callouts', label: 'Рангирање' },
  { id: 'section-skopje',   label: 'Скопје' },
  { id: 'section-charts',   label: 'Графикони' },
  { id: 'section-table',    label: 'Табела' },
];

function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 600);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full 
                 border border-slate-600/50 bg-slate-800/90 backdrop-blur-sm 
                 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 
                 transition-all duration-200 flex items-center justify-center
                 shadow-lg shadow-black/20"
      aria-label="Врати се на почеток"
      title="Врти се на почеток"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

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
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-all duration-200 ${
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
      <BackToTopButton />
    </>
  );
}
