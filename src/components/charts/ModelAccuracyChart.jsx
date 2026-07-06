import { useMemo } from 'react';
import { NET_FISCAL } from '../../data/fiscalData.js';
import { useLocale } from '../../context/LocaleContext.jsx';

/**
 * Confusion matrix + mismatch list for the Gruevski & Gaber logistic regression model.
 *
 * Top: 2×2 grid showing TP, FP, FN, TN counts.
 * Below: scrollable list of mismatches sorted by |prob - 0.5| descending (most uncertain first).
 */
export default function ModelAccuracyChart({ modelAccuracy, results, fmt, t }) {
  const { locale } = useLocale();

  if (!modelAccuracy) return null;

  const { tp, tn, fp, fn, total, accuracy, sensitivity, specificity, mismatches } = modelAccuracy;

  // Filter to only training-set results for the mismatch list display
  const trainingResults = useMemo(() => results.filter(r => r.inTrainingSet), [results]);

  return (
    <section>
      <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>
        {t('method_logit_title')}
      </h3>

      {/* Model performance metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
        {[
          { label: 'Accuracy', value: `${modelAccuracy.accuracy}%`, color: '#10B981' },
          { label: 'Sensitivity', value: `${modelAccuracy.sensitivity}%`, color: '#3B82F6' },
          { label: 'Specificity', value: `${modelAccuracy.specificity}%`, color: '#818CF8' },
          { label: 'AUC', value: '0.91', color: '#A78BFA' },
          { label: 'R²', value: '0.6426', color: '#F59E0B' },
          { label: 'N (training)', value: String(total), color: '#94A3B8' },
        ].map((m) => (
          <div key={m.label} className="rounded-lg px-3 py-2 border text-center" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: 'rgba(51,65,85,0.4)' }}>
            <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: '#64748b' }}>{m.label}</span>
            <span className="text-sm font-bold font-mono block mt-0.5" style={{ color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Confusion Matrix 2×2 */}
      <div className="rounded-xl border mb-5 p-4" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: 'rgba(51,65,85,0.4)' }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
          Confusion Matrix (Reduced Model)
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center">
          {/* Header row */}
          <div />
          <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>Predicted Gainer</div>
          <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>Predicted Loser</div>

          {/* Actual Gainer row */}
          <div className="text-[10px] font-mono uppercase tracking-wider text-right pr-2" style={{ color: '#64748b' }}>Actual Gainer</div>
          <div className="rounded-lg py-2 px-3 border" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
            <span className="text-xl font-bold font-mono" style={{ color: '#10B981' }}>{tp}</span>
            <span className="text-[9px] block" style={{ color: '#34d399' }}>True Positive</span>
          </div>
          <div className="rounded-lg py-2 px-3 border" style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <span className="text-xl font-bold font-mono" style={{ color: '#F59E0B' }}>{fn}</span>
            <span className="text-[9px] block" style={{ color: '#fbbf24' }}>False Negative</span>
          </div>

          {/* Actual Loser row */}
          <div className="text-[10px] font-mono uppercase tracking-wider text-right pr-2" style={{ color: '#64748b' }}>Actual Loser</div>
          <div className="rounded-lg py-2 px-3 border" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <span className="text-xl font-bold font-mono" style={{ color: '#EF4444' }}>{fp}</span>
            <span className="text-[9px] block" style={{ color: '#f87171' }}>False Positive</span>
          </div>
          <div className="rounded-lg py-2 px-3 border" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
            <span className="text-xl font-bold font-mono" style={{ color: '#10B981' }}>{tn}</span>
            <span className="text-[9px] block" style={{ color: '#34d399' }}>True Negative</span>
          </div>
        </div>
      </div>

      {/* Mismatches list */}
      {mismatches.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#ef4444' }}>
              Mismatches ({mismatches.length})
            </span>
            <span className="text-[10px] font-mono" style={{ color: '#64748b' }}>
              Sorted by proximity to decision threshold (0.5)
            </span>
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {mismatches.map((r) => {
              const nf = NET_FISCAL[r.id];
              const actualIsGainer = nf && (nf.revenueInflow - nf.budgetOutflow) > 0;
              const predictedIsGainer = r.predictedReduced === 'gainer';
              const isFalsePositive = !actualIsGainer && predictedIsGainer;
              const isFalseNegative = actualIsGainer && !predictedIsGainer;

              return (
                <div key={r.id} className="flex items-center gap-3 py-2 px-3 rounded border" style={{
                  backgroundColor: isFalsePositive ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
                  borderColor: isFalsePositive ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                }}>
                  <span className="text-xs font-mono flex-1 truncate" style={{ color: '#e2e8f0' }}>
                    {r.name}
                  </span>

                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    predictedIsGainer
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {predictedIsGainer ? 'Pred: Gainer' : 'Pred: Loser'}
                  </span>

                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    actualIsGainer
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {actualIsGainer ? 'Actual: Gainer' : 'Actual: Loser'}
                  </span>

                  <span className="text-xs font-mono tabular-nums" style={{ color: '#F59E0B' }}>
                    p={Math.round(r.probReduced * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-3 rounded border" style={{ backgroundColor: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
        <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
          ⚠️ Model trained on 28 municipalities excluding Skopje boroughs. Full model with ethnicity variable has quasi-complete separation (p=0.998). Primary display uses reduced 3-variable model.
        </span>
      </div>
    </section>
  );
}
