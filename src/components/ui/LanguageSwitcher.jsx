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
      <span className="text-[10px] font-mono uppercase tracking-widest mt-2 mb-1" style={{ color: '#64748b' }}>
        Language / Јазик / Gjuha
      </span>
      <div className="flex gap-1">
        {(['en', 'mk', 'sq']).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`
              flex-1 px-2 py-1.5 text-[11px] font-mono rounded-md transition-all duration-200
              ${locale === code
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'}
            `}
          >
            {FLAGS[code]} {LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
