/**
 * Key Findings Card — 3 critical insights for non-IT users
 */
import { useLocale } from '../../context/LocaleContext.jsx';

export default function KeyFindingsCard({ skopjeSurplusEURm }) {
  const { t, locale } = useLocale();

  // Compute dynamic surplus if not provided as prop
  const surplusM = skopjeSurplusEURm ?? null;
  const formattedSurplus = surplusM !== null ? `€${surplusM.toLocaleString(locale)}M` : '€—';

  const makeFinding2 = () => {
    const prefix = t('key_finding_2_prefix');
    const suffix = t('key_finding_2_suffix');
    return `${prefix}${formattedSurplus}${suffix}`;
  };

  return (
    <section id="section-findings" className="max-w-3xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Finding 
          icon="🔴" 
          text={t('key_finding_1')}
        />
        <Finding 
          icon="🟢" 
          text={makeFinding2()}
        />
        <Finding 
          icon="🟡" 
          text={t('key_finding_3')}
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
