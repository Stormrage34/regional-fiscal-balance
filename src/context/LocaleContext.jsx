import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../data/locales.js';

const LocaleContext = createContext(null);

const STORAGE_KEY = 'matrix_locale';
const SUPPORTED = ['en', 'mk', 'sq'];

function detectLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  return 'en';
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(detectLocale);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, locale); } catch {}
  }, [locale]);

  const t = useCallback((key) => {
    return translations[locale]?.[key] ?? translations['en'][key] ?? key;
  }, [locale]);

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
