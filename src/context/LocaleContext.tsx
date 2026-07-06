import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocaleContext = createContext(null);

const STORAGE_KEY = 'matrix_locale';
const SUPPORTED = ['en', 'mk', 'sq'];

function detectLocale() {
  // Check URL param first, then localStorage, then default
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) return urlLang;
  } catch {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  return 'en';
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(detectLocale);
  const [translations, setTranslations] = useState(null);

  // Dynamically load locale data — Vite code-splits this into a separate chunk
  useEffect(() => {
    import('../data/locales.js').then(mod => {
      setTranslations(mod.translations);
    });
  }, []);

  // Persist locale to localStorage and URL
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, locale); } catch {}
    try {
      const url = new URL(window.location);
      url.searchParams.set('lang', locale);
      window.history.replaceState({}, '', url);
    } catch {}
  }, [locale]);

  const t = useCallback((key) => {
    if (!translations) return '';
    return translations[locale]?.[key] ?? translations['en']?.[key] ?? key;
  }, [locale, translations]);

  const switchLocale = useCallback((l) => {
    if (SUPPORTED.includes(l)) setLocale(l);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: switchLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
