/**
 * Key Findings Card — 3 critical insights for non-IT users
 */
export default function KeyFindingsCard() {
  return (
    <section className="max-w-3xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Finding 
          icon="🔴" 
          text="20 од 28 општини имаат негативен фискален биланс — трошат повеќе отколку што собираат"
        />
        <Finding 
          icon="🟢" 
          text="Скопје има суфицит од +€400М, но внатрешен диспаритет: Центар 94% наплата, Шуто Оризари 67%"
        />
        <Finding 
          icon="🟡" 
          text="Општините во Фаза 2 на децентрализација имаат 30% помалку заостанати долгови"
        />
      </div>
    </section>
  );
}

function Finding({ icon, text }) {
  return (
    <div className="rounded-lg px-4 py-3 border" style={{ 
      backgroundColor: 'rgba(15,23,42,0.6)', 
      borderColor: 'rgba(51,65,85,0.5)' 
    }}>
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <p className="text-[11px] font-mono leading-relaxed text-slate-300">
          {text}
        </p>
      </div>
    </div>
  );
}
