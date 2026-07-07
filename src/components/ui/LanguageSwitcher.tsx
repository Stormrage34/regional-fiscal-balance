import { useLocale } from '../../context/LocaleContext.jsx';

const FLAGS = {
  en: '🇬🇧',
  mk: '🇲🇰',
  sq: '🇦🇱',
};

const LABELS = {
  en: 'EN',
  mk: 'MK',
  sq: 'SQ',
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex flex-col gap-1.5 pt-2 mt-2">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      <span className="text-[10px] font-mono uppercase tracking-widest mt-2 mb-1" style={{ color: '#94a3b8' }}>
        Language / Јазик / Gjuha
      </span>
      <div className="flex gap-1">
        {(['en', 'mk', 'sq']).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-label={code === 'en' ? 'English' : code === 'mk' ? 'Македонски' : 'Shqip'}
            className={`
              flex-1 px-2 py-2.5 text-[11px] font-mono rounded-md transition-all duration-200 min-h-[44px]
              ${locale === code
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-secondary hover:text-primary hover:bg-white/[0.06]'}
            `}
          >
            {FLAGS[code]} {LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
