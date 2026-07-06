import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ── Locale ──
import { useLocale } from '../context/LocaleContext.jsx';

// ── Data & Model ──
import { MUNICIPALITIES, NET_FISCAL, UNEMPLOYMENT_DATA, FISCAL_LOSS_PER_UNEMPLOYED, MKD_PER_EUR, formatCurrency as baseFormatCurrency, getMuniName, DECENTRALIZATION_PHASES, SKOPIE_BORROUGHS } from '../data/fiscalData.js';
import { computeMunicipalMetrics } from '../models/bayesianInference.js';
import { computePillarScores } from '../models/pillarScoring.js';
import { predictFiscalDisparity } from '../models/logisticRegression.js';

// ── Analytics ──
import { Analytics } from '@vercel/analytics/react';
import { track } from '@vercel/analytics';

// ── Error Boundary ──
import ErrorBoundary from '../components/layout/ErrorBoundary.jsx';

// ── UI Primitives ──
import AnimatedNumber from '../components/ui/AnimatedNumber.jsx';
import SegmentControl from '../components/ui/SegmentControl.jsx';

// ── Charts — above-fold (eager) ──
import KeyFindingsCard from '../components/charts/KeyFindingsCard.jsx';

// ── Charts — below-fold (lazy) ──
const LazyStackedBarChart = React.lazy(() => import('../components/charts/StackedBarChart.jsx'));
const LazyPieMatrix = React.lazy(() => import('../components/charts/PieMatrix.jsx'));
const LazyComplianceScatter = React.lazy(() => import('../components/charts/ComplianceScatter.jsx'));
const LazyDonutChart = React.lazy(() => import('../components/charts/DonutChart.jsx'));
const LazyDivergingBarChart = React.lazy(() => import('../components/charts/DivergingBarChart.jsx'));
const LazyFiscalCapacityChart = React.lazy(() => import('../components/charts/FiscalCapacityChart.jsx'));
const LazyModelAccuracyChart = React.lazy(() => import('../components/charts/ModelAccuracyChart.jsx'));
const LazySkopjeCapitalSection = React.lazy(() => import('../components/charts/SkopjeCapitalSection.jsx'));

// ── Layout — below-fold (lazy) ──
const LazyMunicipalTable = React.lazy(() => import('../components/layout/MunicipalTable.jsx'));

// ── Layout — above-fold ──
import Sidebar from '../components/layout/Sidebar.jsx';
import KpiRibbon from '../components/layout/KpiRibbon.jsx';
import MethodologyPanel from '../components/layout/MethodologyPanel.jsx';
import StickyNav from '../components/navigation/StickyNav.jsx';

// ── Loading fallback ──
const ChartFallback = () => (
  <div className="h-40 flex items-center justify-center">
    <span className="text-tertiary text-xs font-mono">Loading...</span>
  </div>
);

// ───────────────────────────────────────────────────────────────
// DEBOUNCED STATE HOOK — slider values skip 80ms of intermediate frames
// ───────────────────────────────────────────────────────────────
function useDebouncedState(initialValue, delay = 80) {
  const [value, setValue] = useState(initialValue);
  const [debounced, setDebounced] = useState(initialValue);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return [debounced, setValue];
}

// ───────────────────────────────────────────────────────────────
// FOCUS TRAP HOOK
// ───────────────────────────────────────────────────────────────
function useFocusTrap(active, containerRef) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const panel = containerRef.current;
    const closeBtn = panel.querySelector('[data-close-panel]');
    if (closeBtn) closeBtn.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') return; // handled by parent
      if (e.key !== 'Tab') return;
      const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [active, containerRef]);
}

// ───────────────────────────────────────────────────────────────
// BACK TO TOP BUTTON — standalone, independent of StickyNav lifecycle
// ───────────────────────────────────────────────────────────────

function BackToTop() {
  const { t } = useLocale();
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!showBackToTop) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border border-card bg-card backdrop-blur-sm text-secondary hover:text-amber-300 hover:border-amber-500/30 transition-all duration-200 flex items-center justify-center shadow-lg"
      aria-label={t('back_to_top_label')}
      title={t('back_to_top_title')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ───────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT — Orchestration Layer
// ───────────────────────────────────────────────────────────────

export default function NakedBudget() {
  const { t, locale } = useLocale();

  // ── Slider State (debounced — heavy recomputation uses debounced value) ──
  const [enforcementStrength, setEnforcementStrength] = useDebouncedState(50);
  const [digitalFiscalization, setDigitalFiscalization] = useDebouncedState(30);
  const [applyCorrection, setApplyCorrection] = useState(true);

  // ── Focused Municipality ──
  const [focusedMuniId, setFocusedMuniId] = useState(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  useFocusTrap(!!focusedMuniId, panelRef);

  // ── Chart View ──
  const [chartView, setChartView] = useState('stacked');
  const [showMethodology, setShowMethodology] = useState(false); // default closed

  // ── Sort ──
  const [sortKey, setSortKey] = useState('drain');
  const [sortAsc, setSortAsc] = useState(false);

  // ── Sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Currency Display ──
  const [showMkd, setShowMkd] = useState(false);

  // ── Advanced Columns Toggle ──
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);

  // ── Model Computation ──
  const results = useMemo(
    () => MUNICIPALITIES.map((m) => {
      const base = computeMunicipalMetrics(m, enforcementStrength, digitalFiscalization, applyCorrection);
      const nf = NET_FISCAL[m.id] || { revenueInflow: 0, arrears: 0 };
      const pillarScores = computePillarScores(m, nf);
      const prediction = predictFiscalDisparity(m, nf);
      return { ...base, ...pillarScores, ...prediction };
    }),
    [enforcementStrength, digitalFiscalization, applyCorrection]
  );

  // ── Sort ──
  const sortedResults = useMemo(() => {
    const copy = [...results];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'drain') cmp = a.totalPerCapitaDrain - b.totalPerCapitaDrain;
      else if (sortKey === 'leakage') cmp = a.uncollectedLeakage - b.uncollectedLeakage;
      else if (sortKey === 'welfare') cmp = a.welfareBurden - b.welfareBurden;
      else if (sortKey === 'yearly') cmp = a.totalYearlyDrain - b.totalYearlyDrain;
      else if (sortKey === 'unemployment') {
        const ua = UNEMPLOYMENT_DATA[a.id]?.registered || 0;
        const ub = UNEMPLOYMENT_DATA[b.id]?.registered || 0;
        cmp = ua - ub;
      }
      else if (sortKey === 'arrears') {
        const aa = NET_FISCAL[a.id]?.arrears || 0;
        const ab = NET_FISCAL[b.id]?.arrears || 0;
        cmp = aa - ab;
      }
      else if (sortKey === 'prediction') {
        // Sort by predicted class: losers first, then gainers, then N/A
        const pa = a.predictedReduced;
        const pb = b.predictedReduced;
        const order = { loser: 0, gainer: 1, na: 2 };
        cmp = (order[pa] ?? 2) - (order[pb] ?? 2);
      }
      else if (sortKey === 'probability') {
        cmp = a.probReduced - b.probReduced;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [results, sortKey, sortAsc]);

  // ── Aggregates ──
  const aggregates = useMemo(() => {
    const totalPop = results.reduce((s, r) => s + r.workingAgePop, 0);
    const totalYearlyDrain = results.reduce((s, r) => s + r.totalYearlyDrain, 0);
    const totalUncollected = results.reduce((s, r) => s + r.uncollectedLeakage * r.workingAgePop, 0);
    const totalWelfareBurden = results.reduce((s, r) => s + r.welfareBurden * r.workingAgePop, 0);
    const totalCorporateCredit = results.reduce((s, r) => s + r.corporateRetraction * r.workingAgePop, 0);
    const totalUnemploymentFiscalLoss = results.reduce((s, r) => {
      const ud = UNEMPLOYMENT_DATA[r.id];
      return s + (ud ? ud.registered * FISCAL_LOSS_PER_UNEMPLOYED.totalAnnual : 0);
    }, 0);
    const totalUnemployed = results.reduce((s, r) => {
      const ud = UNEMPLOYMENT_DATA[r.id];
      return s + (ud ? ud.registered : 0);
    }, 0);
    const weightedAvgDrain = totalPop > 0 ? totalYearlyDrain / totalPop : 0;
    return { totalPop, totalYearlyDrain, totalUncollected, totalWelfareBurden, totalCorporateCredit, totalUnemploymentFiscalLoss, totalUnemployed, weightedAvgDrain: Math.round(weightedAvgDrain) };
  }, [results]);

  // ── Net Fiscal Aggregates ──
  const netFiscalAggs = useMemo(() => {
    const gainers = results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) > 0);
    const losers = results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) <= 0);
    const totalRev = Object.values(NET_FISCAL).reduce((s, n) => s + n.revenueInflow, 0);
    const totalOut = Object.values(NET_FISCAL).reduce((s, n) => s + n.budgetOutflow, 0);
    const totalNet = totalRev - totalOut;
    const totalArrears = Object.values(NET_FISCAL).reduce((s, n) => s + n.arrears, 0);
    // ── Skopje aggregate (10 municipalities) ──
    const skopjeIds = SKOPIE_BORROUGHS;
    const skopjeRev = skopjeIds.reduce((s, id) => s + (NET_FISCAL[id]?.revenueInflow || 0), 0);
    const skopjeOut = skopjeIds.reduce((s, id) => s + (NET_FISCAL[id]?.budgetOutflow || 0), 0);
    const skopjePop = skopjeIds.reduce((s, id) => {
      const m = results.find(r => r.id === id);
      return s + (m?.workingAgePop || 0);
    }, 0);
    const skopjeNet = skopjeRev - skopjeOut;
    const skopjeNetPC = skopjePop > 0 ? Math.round(skopjeNet / MKD_PER_EUR / skopjePop) : 0;
    // Dynamic national avg own revenue per capita (EUR) — total revenue / total pop
    const totalPopAll = results.reduce((s, r) => s + r.workingAgePop / 0.67, 0);
    const nationalAvgRevPC = totalPopAll > 0 ? Math.round((totalRev / MKD_PER_EUR) / totalPopAll) : 500;
    return { gainers, losers, totalRev, totalOut, totalNet, totalArrears, skopjeRev, skopjeOut, skopjePop, skopjeNet, skopjeNetPC, nationalAvgRevPC, skopjeBoroughsCount: skopjeIds.length };
  }, [results]);

  const gainerCount = results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) > 0).length;
  const loserCount = results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) <= 0).length;

  // ── Phase Comparison Data ──
  const phaseComparison = useMemo(() => {
    const p1Munis = results.filter(r => (DECENTRALIZATION_PHASES[r.id]?.phase || 1) === 1);
    const p2Munis = results.filter(r => (DECENTRALIZATION_PHASES[r.id]?.phase || 1) === 2);

    const avgNetFiscalPC = (munis) => {
      if (munis.length === 0) return 0;
      const total = munis.reduce((s, r) => {
        const nf = NET_FISCAL[r.id];
        if (!nf) return s;
        const netPC = r.workingAgePop > 0 ? ((nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR) / r.workingAgePop : 0;
        return s + netPC;
      }, 0);
      return Math.round(total / munis.length);
    };

    const avgArrearsPC = (munis) => {
      if (munis.length === 0) return 0;
      const total = munis.reduce((s, r) => {
        const nf = NET_FISCAL[r.id];
        if (!nf) return s;
        const arrearsPC = r.workingAgePop > 0 ? (nf.arrears / MKD_PER_EUR) / r.workingAgePop : 0;
        return s + arrearsPC;
      }, 0);
      return Math.round(total / munis.length);
    };

    const avgCompliance = (munis) => {
      if (munis.length === 0) return 0;
      return Math.round(munis.reduce((s, r) => s + r.baseCompliance, 0) / munis.length * 100);
    };

    return {
      p1Count: p1Munis.length,
      p2Count: p2Munis.length,
      avgNetFiscalPC1: avgNetFiscalPC(p1Munis),
      avgNetFiscalPC2: avgNetFiscalPC(p2Munis),
      avgArrearsPC1: avgArrearsPC(p1Munis),
      avgArrearsPC2: avgArrearsPC(p2Munis),
      avgCompliance1: avgCompliance(p1Munis),
      avgCompliance2: avgCompliance(p2Munis),
    };
  }, [results]);

  // ── Model Accuracy (non-Skopje only) ──
  const modelAccuracy = useMemo(() => {
    // Only evaluate on municipalities that were in the original training set
    const trainingSet = results.filter(r => r.inTrainingSet);
    if (trainingSet.length === 0) return null;

    let tp = 0, tn = 0, fp = 0, fn = 0; // true/false positive/negative
    for (const r of trainingSet) {
      const nf = NET_FISCAL[r.id];
      if (!nf) continue;
      const actualIsGainer = (nf.revenueInflow - nf.budgetOutflow) > 0;
      const predictedIsGainer = r.predictedReduced === 'gainer';
      if (actualIsGainer && predictedIsGainer) tp++;
      else if (!actualIsGainer && !predictedIsGainer) tn++;
      else if (actualIsGainer && !predictedIsGainer) fp++;
      else fn++;
    }
    const total = tp + tn + fp + fn;
    const accuracy = total > 0 ? Math.round((tp + tn) / total * 1000) / 10 : 0;
    const sensitivity = (tp + fn) > 0 ? Math.round(tp / (tp + fn) * 1000) / 10 : 0;
    const specificity = (tn + fp) > 0 ? Math.round(tn / (tn + fp) * 1000) / 10 : 0;

    // Mismatches: where prediction ≠ actual
    const mismatches = trainingSet.filter(r => {
      const nf = NET_FISCAL[r.id];
      if (!nf) return false;
      const actualIsGainer = (nf.revenueInflow - nf.budgetOutflow) > 0;
      const predictedIsGainer = r.predictedReduced === 'gainer';
      return actualIsGainer !== predictedIsGainer;
    });

    // Sort mismatches by |probability - 0.5| descending (closest to threshold = most uncertain)
    mismatches.sort((a, b) => Math.abs(b.probReduced - 0.5) - Math.abs(a.probReduced - 0.5));

    return { tp, tn, fp, fn, total, accuracy, sensitivity, specificity, mismatches };
  }, [results]);

  // ── Max abs net per capita EUR ──
  const maxAbsNetPCEUR = useMemo(() => {
    return Math.max(...results
      .filter(m => NET_FISCAL[m.id])
      .map(m => Math.abs((NET_FISCAL[m.id].revenueInflow - NET_FISCAL[m.id].budgetOutflow) / MKD_PER_EUR / m.workingAgePop)), 1);
  }, [results]);

  // ── Currency Format Helper ──
  const fmt = useCallback((value, isPerCapita = false) => {
    if (showMkd) return baseFormatCurrency(value * MKD_PER_EUR, isPerCapita).replace('€', 'MKD ');
    return baseFormatCurrency(value, isPerCapita);
  }, [showMkd]);

  // ── Trust Dot — indicates data source reliability ──
  const TRUST = {
    real:     { color: '#10B981', label: 'Real Treasury data' },
    published:{ color: '#3B82F6', label: 'Published source' },
    derived:  { color: '#F59E0B', label: 'Derived from data + model' },
    model:    { color: '#EF4444', label: 'Model assumption' },
  };

  // ── Focus Handler ──
  const handleMuniFocus = useCallback((id) => {
    triggerRef.current = document.activeElement;
    setFocusedMuniId((prev) => {
      const nextId = prev === id ? null : id;
      if (nextId) {
        track('municipality_panel', { id: nextId });
      }
      return nextId;
    });
  }, []);

  const closePanel = useCallback(() => {
    setFocusedMuniId(null);
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  // ── Sort Handler ──
  const handleSort = useCallback((key) => {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else { setSortKey(key); setSortAsc(true); }
  }, [sortKey]);

  // ── Worst / Best Callouts ──
  const worstMunis = useMemo(() => {
    const withFiscal = results.filter(m => NET_FISCAL[m.id]).map(m => {
      const nf = NET_FISCAL[m.id];
      const netPC = m.workingAgePop > 0 ? ((nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR) / m.workingAgePop : 0;
      return { ...m, netFiscalPC: Math.round(netPC) };
    });
    return withFiscal.sort((a, b) => a.netFiscalPC - b.netFiscalPC).slice(0, 5);
  }, [results]);

  const bestMunis = useMemo(() => {
    const withFiscal = results.filter(m => NET_FISCAL[m.id]).map(m => {
      const nf = NET_FISCAL[m.id];
      const netPC = m.workingAgePop > 0 ? ((nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR) / m.workingAgePop : 0;
      return { ...m, netFiscalPC: Math.round(netPC) };
    });
    return withFiscal.sort((a, b) => b.netFiscalPC - a.netFiscalPC).slice(0, 5);
  }, [results]);

  // ── Focused Municipality ──
  const focusedMuni = useMemo(() => results.find((r) => r.id === focusedMuniId) || null, [results, focusedMuniId]);

  // ── Chart segments ──
  const chartSegments = [
    { value: 'stacked', label: t('tab_bars') },
    { value: 'pie',     label: t('tab_matrix') },
    { value: 'compliance-scatter', label: t('tab_scatter') },
    { value: 'fiscal-capacity', label: t('tab_fiscal_capacity') || 'Fiscal Capacity' },
    { value: 'model-accuracy', label: t('tab_model_accuracy') || 'Model Accuracy' },
  ];

  // ── RENDER ──
  return (
    <div className="flex min-h-screen bg-root text-primary">
      {/* Bloomberg grid lines */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/3 -left-1/3 w-[80%] h-[80%]" style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.04) 0%, transparent 55%)', animation: 'pulse-slow 8s ease-in-out infinite' }} />
        <div className="absolute -bottom-1/3 -right-1/3 w-[80%] h-[80%]" style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, transparent 55%)', animation: 'pulse-slow 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[60%]" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.025) 0%, transparent 60%)', animation: 'pulse-slow 12s ease-in-out infinite' }} />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 opacity-60" />

      {/* ─── SIDEBAR ─── */}
      <Sidebar
        enforcementStrength={enforcementStrength}
        setEnforcementStrength={setEnforcementStrength}
        digitalFiscalization={digitalFiscalization}
        setDigitalFiscalization={setDigitalFiscalization}
        applyCorrection={applyCorrection}
        setApplyCorrection={setApplyCorrection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showMkd={showMkd}
        setShowMkd={setShowMkd}
      />

      {/* ─── MAIN WORKSPACE ─── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 max-w-6xl space-y-10" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Skip-to-content link */}
        <a href="#section-hero" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded focus:bg-card focus:text-primary focus:text-xs focus:font-mono focus:shadow-lg">
          {t('skip_to_content')}
        </a>
        {/* ═══ HEADER ═══ */}
        <header className="pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 28 28" className="opacity-90" aria-hidden="true">
                <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="14" cy="14" r="2.5" fill="#f59e0b" />
              </svg>
              <h1 className="text-lg font-bold tracking-tight text-primary font-mono leading-none">
                {t('brand_title')}
              </h1>
              <p className="text-xs font-mono flex-1" style={{ color: '#94a3b8' }}>
                {t('brand_sub')}
              </p>
              <a
                href="https://buymeacoffee.com/stefangel9b"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm font-semibold text-primary transition-all duration-200 group ml-4 border"
                style={{
                  backgroundColor: 'rgba(245,158,11,0.12)',
                  borderColor: 'rgba(245,158,11,0.35)',
                  boxShadow: '0 0 12px rgba(245,158,11,0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.22)';
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(245,158,11,0.15)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="flex-shrink-0" aria-hidden="true">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                <span className="text-amber-300 group-hover:text-amber-200 transition-colors">{t('buy_coffee')}</span>
              </a>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden relative z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs text-secondary border border-card hover:text-primary hover:border-card transition-colors touch-manipulation"
              aria-label={t('sidebar_open')}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden relative z-20 flex items-center justify-center w-11 h-11 rounded-lg border border-card hover:bg-card transition-colors touch-manipulation"
              aria-label={sidebarOpen ? t('sidebar_close') : t('sidebar_open')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#94a3b8' }} aria-hidden="true">
                {sidebarOpen
                  ? <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  : <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                }
              </svg>
            </button>
          </div>

          {/* Source badges */}
          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-4">
            {[
              { label: t('src_badge_1'), year: '', color: 'rgba(16,185,129,0.08)', dot: 'bg-emerald-500', borderColor: 'rgba(16,185,129,0.2)' },
              { label: t('src_badge_2'), year: '', color: 'rgba(99,102,241,0.08)', dot: 'bg-indigo-500', borderColor: 'rgba(99,102,241,0.2)' },
              { label: t('src_badge_3'), year: '', color: 'rgba(245,158,11,0.08)', dot: 'bg-amber-500', borderColor: 'rgba(245,158,11,0.2)' },
              { label: t('source_badge_4'), year: '', color: 'rgba(139,92,246,0.08)', dot: 'bg-violet-500', borderColor: 'rgba(139,92,246,0.2)' },
              { label: t('src_badge_5'), year: '', color: 'rgba(236,72,153,0.08)', dot: 'bg-pink-500', borderColor: 'rgba(236,72,153,0.2)' },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1 px-2 py-0.5 rounded border" style={{ backgroundColor: badge.color, borderColor: badge.borderColor }}>
                <span className={`w-1 h-1 rounded-full ${badge.dot} flex-shrink-0`} />
                <span className="text-[9px] font-mono" style={{ color: '#94a3b8' }}>{badge.label}</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-500/40 via-cyan-500/30 to-emerald-500/20" />
        </header>

        {/* ═══ STICKY NAVIGATION ═══ */}
        <style>{`
          html { scroll-behavior: smooth; scroll-padding-top: 60px; }
        `}</style>
        <StickyNav />
        <Analytics />

        {/* ═══ HERO — TOTAL FISCAL DRAIN ═══ */}
        <section id="section-hero" className="text-center py-12 md:py-16">
          <p className="text-[11px] font-mono uppercase tracking-widest text-secondary mb-4">
            {t('hero_label')}
          </p>
          <p className="text-4xl md:text-6xl lg:text-8xl font-bold font-mono tabular-nums" style={{ color: '#F59E0B' }}>
            €{Math.round(aggregates.totalYearlyDrain / 1_000_000)}M
          </p>
          <p className="text-xs font-mono text-tertiary mt-4">
            {results.length} {t('hero_municipalities').split('·')[0]?.trim() || ''} · {aggregates.totalPop.toLocaleString()} {t('hero_municipalities').split('·')[1]?.trim() || ''} · {t('hero_avg_prefix')} €{aggregates.weightedAvgDrain}{t('hero_per_person_suffix')}
          </p>
          <p className="text-[11px] leading-relaxed text-secondary max-w-2xl mx-auto mt-6 px-4">
            {t('hero_description').replace('{n}', String(loserCount)).replace('{total}', String(MUNICIPALITIES.length))}
          </p>
        </section>

        {/* ═══ KPI RIBBON ═══ */}
        <ErrorBoundary>
        <section id="section-overview">
          <KpiRibbon
            aggregates={aggregates}
            gainerCount={gainerCount}
            loserCount={loserCount}
            MUNICIPALITIES={MUNICIPALITIES}
            AnimatedNumber={AnimatedNumber}
            fmt={fmt}
            showMkd={showMkd}
          />
        </section>
        </ErrorBoundary>

        {/* ═══ SKOPJE CAPITAL CITY ═══ */}
        <ErrorBoundary>
        <React.Suspense fallback={<ChartFallback />}>
          <LazySkopjeCapitalSection aggregates={netFiscalAggs} />
        </React.Suspense>
        </ErrorBoundary>

        {/* ═══ NET FISCAL IMPACT — 5 CARD GRID ═══ */}
        <ErrorBoundary>
        <section id="section-balance" className="rounded-xl relative overflow-hidden mb-12 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)', borderWidth: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <span title={TRUST.real.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.real.color }} />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-secondary">
              {t('net_fiscal')}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#334155', color: '#94a3b8' }}>
              {t('net_fiscal_sub')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-lg px-4 py-3 border hover:bg-white/[0.03] transition-colors duration-200" style={{ backgroundColor: 'var(--bg-elevated-strong)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_gainers')}</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#10B981' }}>{netFiscalAggs.gainers.length}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_gainers').toLowerCase()} {t('surplus')}</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:bg-white/[0.03] transition-colors duration-200" style={{ backgroundColor: 'var(--bg-elevated-strong)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_losers')}</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#F59E0B' }}>{netFiscalAggs.losers.length}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_losers').toLowerCase()} {t('deficit')}</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:bg-white/[0.03] transition-colors duration-200" style={{ backgroundColor: 'var(--bg-elevated-strong)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_deficit')}</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#F59E0B' }}>{fmt(Math.abs(netFiscalAggs.totalNet) / MKD_PER_EUR / 1_000_000)}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('aggregate_text')} (MKD {Math.abs(Math.round(netFiscalAggs.totalNet/1000)).toLocaleString()}K)</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:bg-white/[0.03] transition-colors duration-200" style={{ backgroundColor: 'var(--bg-elevated-strong)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_arrears')}</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#F43F5E' }}>{fmt(netFiscalAggs.totalArrears / MKD_PER_EUR / 1_000_000)}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_arrears').toLowerCase()}</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:bg-white/[0.03] transition-colors duration-200" style={{ backgroundColor: 'var(--bg-elevated-strong)', borderColor: 'var(--border-card)' }}>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('skopje_label')}</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#10B981' }}>+{fmt(netFiscalAggs.skopjeNetPC, true)}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t('net_gainers').toLowerCase()} · {netFiscalAggs.skopjeBoroughsCount} {t('skopje_boroughs_unit')}</span>
            </div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ═══ REGIONAL FISCAL BALANCE — DIVERGING BAR ═══ */}
        <ErrorBoundary>
        <React.Suspense fallback={<ChartFallback />}>
        <section id="section-regional-balance" className="rounded-xl relative overflow-hidden mb-12 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)', borderWidth: 1 }}>
          <div className="flex items-center gap-2 mb-4 px-5 pt-5">
            <span title={TRUST.real.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.real.color }} />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-secondary">
              {t('section_regional_balance')}
            </h2>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                {t('net_balance')}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#10B981' }}/>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{t('gainer_label')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#F43F5E' }}/>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{t('loser_label')}</span>
                </div>
              </div>
            </div>
            <LazyDivergingBarChart results={results} maxAbsNetPCEUR={maxAbsNetPCEUR} fmt={fmt} netFiscalAggs={netFiscalAggs} />
          </div>
        </section>
        </React.Suspense>
        </ErrorBoundary>

        {/* ═══ LABOR MARKET MAPPING — COMPLIANCE SCATTER ═══ */}
        <ErrorBoundary>
        <React.Suspense fallback={<ChartFallback />}>
        <section id="section-labor-market" className="rounded-xl relative overflow-hidden mb-12 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)', borderWidth: 1 }}>
          <div className="flex items-center gap-2 mb-4 px-5 pt-5">
            <span title={TRUST.derived.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.derived.color }} />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-secondary">
              {t('section_labor_market')}
            </h2>
          </div>
          <div className="px-5 pb-5">
            <LazyComplianceScatter data={results} onMuniClick={handleMuniFocus} focusedId={focusedMuniId} />
          </div>
        </section>
        </React.Suspense>
        </ErrorBoundary>

        {/* ═══ CALLOUTS ═══ */}
        <ErrorBoundary>
        <section id="section-callouts" className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span title={TRUST.derived.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.derived.color }} />
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest mb-0 text-secondary">
              {t('callout_title')}
            </h2>
          </div>
          <p className="text-xs font-sans text-tertiary mt-1 mb-4">
            {t('callout_subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Worst */}
          <div className="rounded-xl relative overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)', borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2" style={{ color: '#ef4444' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {t('lbl_loss')}
              </h3>
            </div>
            <div className="px-1 pb-4">
              {(() => {
                const maxAbs = Math.max(...worstMunis.map(m => Math.abs(m.netFiscalPC)), 1);
                return worstMunis.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b last:border-b-0 hover:bg-white/[0.05] -mx-1 px-1 transition-colors duration-150" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0" style={{
                      background: i === 0 ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.08))' : i === 1 ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.08)',
                      color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#94a3b8',
                      border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : i === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.15)'}`,
                      boxShadow: i === 0 ? '0 0 8px rgba(245,158,11,0.15)' : undefined,
                    }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-mono truncate" style={{ color: '#e2e8f0' }}>{getMuniName(m, locale)}</span>
                        <span className="text-sm font-bold font-mono ml-2 flex-shrink-0" style={{ color: '#ef4444' }}>{fmt(m.netFiscalPC, true)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-card overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(Math.abs(m.netFiscalPC) / maxAbs) * 100}%`, backgroundColor: '#ef4444' }} />
                        </div>
                        {UNEMPLOYMENT_DATA[m.id] && (
                          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#94a3b8' }}>
                            {(UNEMPLOYMENT_DATA[m.id].registered / m.workingAgePop * 100).toFixed(1)}% ul
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Best */}
          <div className="rounded-xl relative overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)', borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#10b981' }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2" style={{ color: '#10b981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('lbl_gain')}
              </h3>
            </div>
            <div className="px-1 pb-4">
              {(() => {
                const maxAbs = Math.max(...bestMunis.map(m => Math.abs(m.netFiscalPC)), 1);
                return bestMunis.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b last:border-b-0 hover:bg-white/[0.05] -mx-1 px-1 transition-colors duration-150" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0" style={{
                      background: i === 0 ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.08))' : i === 1 ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.08)',
                      color: i === 0 ? '#34d399' : i === 1 ? '#94a3b8' : '#94a3b8',
                      border: `1px solid ${i === 0 ? 'rgba(16,185,129,0.4)' : i === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.15)'}`,
                      boxShadow: i === 0 ? '0 0 8px rgba(16,185,129,0.15)' : undefined,
                    }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-mono truncate" style={{ color: '#e2e8f0' }}>{getMuniName(m, locale)}</span>
                        <span className="text-sm font-bold font-mono ml-2 flex-shrink-0" style={{ color: '#10b981' }}>{fmt(m.netFiscalPC, true)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-card overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(m.netFiscalPC / maxAbs) * 100}%`, backgroundColor: '#10b981' }} />
                        </div>
                        {UNEMPLOYMENT_DATA[m.id] && (
                          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#94a3b8' }}>
                            {(UNEMPLOYMENT_DATA[m.id].registered / m.workingAgePop * 100).toFixed(1)}% ul
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ═══ KEY FINDINGS ═══ */}
        <ErrorBoundary>
          <KeyFindingsCard skopjeSurplusEURm={Math.round(netFiscalAggs.skopjeNet / MKD_PER_EUR / 1_000_000)} loserCount={loserCount} totalMunis={MUNICIPALITIES.length} />
        </ErrorBoundary>

        {/* ═══ CHARTS ═══ */}
        <ErrorBoundary>
        <React.Suspense fallback={<ChartFallback />}>
        <section id="section-charts" className="rounded-xl relative overflow-hidden mb-14 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] bg-gradient-to-b from-slate-900/[0.15] to-transparent" style={{ backgroundColor: 'var(--bg-section-transparent)', borderColor: 'var(--border-card)', borderWidth: 1 }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.03) 0%, transparent 70%)' }} />

          <div className="relative">
            <div className="flex items-center gap-2 px-5 pt-5 pb-2">
              <span title={TRUST.derived.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.derived.color }} />
              <h2 className="text-xs font-sans font-semibold uppercase tracking-widest mb-0 text-secondary">
                {t('method_title')}
              </h2>
            </div>
            <p className="text-xs font-sans text-tertiary px-5 pb-4">
              {t('method_how')}
            </p>

            <MethodologyPanel showMethodology={showMethodology} setShowMethodology={setShowMethodology} />

            <div className="flex items-center justify-between mb-5 px-5">
              <SegmentControl value={chartView} onChange={(val) => { setChartView(val); track('chart_view', { chart: val }); }} segments={chartSegments} />
            </div>

            {chartView === 'stacked' && (
              <div className="max-h-[600px] overflow-y-auto">
                <LazyStackedBarChart data={sortedResults} onMuniClick={handleMuniFocus} focusedMuniId={focusedMuniId} />
              </div>
            )}
            {chartView === 'pie' && (
              <LazyPieMatrix data={sortedResults} onMuniClick={handleMuniFocus} />
            )}
            {chartView === 'fiscal-capacity' && (
              <div className="max-h-[600px] overflow-y-auto">
                <LazyFiscalCapacityChart results={results} fmt={fmt} nationalAvgRevPC={netFiscalAggs.nationalAvgRevPC} />
              </div>
            )}
            {chartView === 'model-accuracy' && modelAccuracy && (
              <LazyModelAccuracyChart
                modelAccuracy={modelAccuracy}
                results={results.filter(r => r.inTrainingSet)}
                fmt={fmt}
                t={t}
              />
            )}
          </div>
        </section>
        </React.Suspense>
        </ErrorBoundary>

        {/* ═══ MUNICIPAL TABLE ═══ */}
        <ErrorBoundary>
        <React.Suspense fallback={<ChartFallback />}>
        <section id="section-table" className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span title={TRUST.derived.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.derived.color }} />
                <h2 className="text-xs font-sans font-semibold uppercase tracking-widest mb-0 text-secondary">
                  {t('muni_profiles')}
                </h2>
              </div>
              <p className="text-xs font-sans text-tertiary mt-1">
                {t('table_subtitle').replace('{n}', sortedResults.length)}
              </p>
            </div>
            <button
              onClick={() => setShowAdvancedColumns(!showAdvancedColumns)}
              className="flex items-center gap-1 text-[10px] font-mono text-secondary hover:text-primary transition-colors"
            >
              {showAdvancedColumns ? t('toggle_basic') : t('toggle_advanced')}
            </button>
          </div>
          <LazyMunicipalTable
            sortedResults={sortedResults}
            focusedMuniId={focusedMuniId}
            setFocusedMuniId={setFocusedMuniId}
            fmt={fmt}
            applyCorrection={applyCorrection}
            sortKey={sortKey}
            sortAsc={sortAsc}
            handleSort={handleSort}
            showAdvancedColumns={showAdvancedColumns}
          />
        </section>
        </React.Suspense>
        </ErrorBoundary>

        {/* ═══ PHASE COMPARISON ═══ */}
        <ErrorBoundary>
        <section id="section-phases" className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span title={TRUST.derived.label} className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRUST.derived.color }} />
            <h2 className="text-sm font-sans font-bold tracking-tight text-primary">
              {t('section_phase_comparison')}
            </h2>
          </div>
          <p className="text-xs font-sans text-tertiary mt-1 mb-1">
            {t('section_phase_subtitle')}
          </p>
          <p className="text-[10px] font-sans leading-relaxed max-w-3xl mb-4" style={{ color: '#94a3b8' }}>{t('phase_explanation')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-tertiary">{t('phase_balance_label')}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('phase_badge').replace('{n}', '1')}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{fmt(phaseComparison.avgNetFiscalPC1, true)}</span>
                <span className="text-sm font-mono text-tertiary">{t('phase_2_prefix')}{fmt(phaseComparison.avgNetFiscalPC2, true)}</span>
              </div>
            </div>
            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-tertiary">{t('phase_arrears_label')}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('phase_badge').replace('{n}', '1')}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{fmt(phaseComparison.avgArrearsPC1, true)}</span>
                <span className="text-sm font-mono text-tertiary">{t('phase_2_prefix')}{fmt(phaseComparison.avgArrearsPC2, true)}</span>
              </div>
            </div>
            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-tertiary">{t('phase_compliance_label')}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('phase_badge').replace('{n}', '1')}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{phaseComparison.avgCompliance1}%</span>
                <span className="text-sm font-mono text-tertiary">{t('phase_2_prefix')}{phaseComparison.avgCompliance2}%</span>
              </div>
            </div>
            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-tertiary">{t('phase_count_label')}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('phase_badge').replace('{n}', '1')}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{phaseComparison.p1Count}</span>
                <span className="text-sm font-mono text-tertiary">{t('phase_2_prefix')}{phaseComparison.p2Count}</span>
              </div>
            </div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ═══ FOOTER ═══ */}
        <footer className="mt-16 py-8 border-t border-card text-center">
          <p className="font-mono text-xs text-tertiary tracking-wide">
            {t('footer')}
          </p>
          <p className="mt-5">
            <a
              href="https://buymeacoffee.com/stefangel9b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm font-semibold text-primary transition-all duration-200 group border"
              style={{
                backgroundColor: 'rgba(245,158,11,0.12)',
                borderColor: 'rgba(245,158,11,0.35)',
                boxShadow: '0 0 12px rgba(245,158,11,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.22)';
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.12)';
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(245,158,11,0.15)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="flex-shrink-0" aria-hidden="true">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              <span className="text-amber-300 group-hover:text-amber-200 transition-colors">{t('buy_coffee')}</span>
            </a>
          </p>
          <p className="mt-4 font-mono text-[11px] text-muted tracking-wide">
            Built with{' '}
            <a
              href="https://opencode.ai/go?ref=PZBFA3PEMJ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tertiary hover:text-amber-400 transition-colors duration-200"
            >
              OpenCode Go
            </a>
          </p>
        </footer>
      </main>

      {/* ═══ BACK TO TOP (standalone — independent of StickyNav lifecycle) ═══ */}
      <BackToTop />

      {/* ═══ SLIDE-OUT PANEL ═══ */}
      {focusedMuni && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ease-in-out cursor-pointer"
            style={{ opacity: 1 }}
            onClick={closePanel}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') closePanel(); }}
            className="fixed top-0 right-0 h-dvh w-[420px] max-w-[90vw] bg-elevated backdrop-blur-2xl border-l border-card z-50 transition-transform duration-500 ease-in-out overflow-y-auto"
            style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', height: '100dvh' }}
          >
            <button
              type="button"
              data-close-panel
              onClick={closePanel}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-lg text-secondary hover:text-primary hover:bg-card transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] focus:outline-none"
              aria-label={t('panel_close_label').replace('{name}', getMuniName(focusedMuni, locale))}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="p-6 pt-12 space-y-6" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
              <div className="mb-6">
                <h3 id="panel-title" className="text-xl font-bold font-mono text-primary tracking-tight">
                  {getMuniName(focusedMuni, locale)}
                </h3>
                <p className="text-xs font-mono mt-1" style={{ color: '#94a3b8' }}>
                  {(() => {
                    const c = focusedMuni.adjustedCompliance;
                    if (c >= 70) return t('panel_compliance_high');
                    if (c >= 55) return t('panel_compliance_moderate');
                    if (c >= 40) return t('panel_compliance_below');
                    return t('panel_compliance_low');
                  })()}
                </p>

                {/* Structural bias flags */}
                {(() => {
                  const flags = [];
                  if (['aerodrom','karpos'].includes(focusedMuni.id)) {
                    flags.push(`⚠️ ${t('panel_flag_hq')}`);
                  }
                  const nf = NET_FISCAL[focusedMuni.id];
                  if (nf && nf.utilityDebt > 0) {
                    flags.push(`⚠️ ${t('panel_flag_debt')}`);
                  }
                  if (!flags.length) return null;
                  return (
                    <div className="mb-4 space-y-1">
                      {flags.map((f, i) => (
                        <div key={i} className="text-[10px] font-mono px-2 py-1 rounded" style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                          {f}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-center mb-6">
                <React.Suspense fallback={<div className="h-40 flex items-center justify-center"><span className="text-tertiary text-xs font-mono">Loading chart...</span></div>}>
                  <LazyDonutChart data={focusedMuni} size={220} />
                </React.Suspense>
              </div>

              {/* Net Fiscal Balance */}
              {NET_FISCAL[focusedMuni.id] && (() => {
                const nf = NET_FISCAL[focusedMuni.id];
                const net = nf.revenueInflow - nf.budgetOutflow;
                const isGainer = net > 0;
                return (
                  <div className="mb-6">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#94a3b8' }}>{t('net_fiscal')}</span>
                    <div className="text-2xl font-bold font-mono mt-1" style={{ color: isGainer ? '#10B981' : '#F59E0B' }}>
                      {fmt(net / MKD_PER_EUR / 1_000_000)}
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                      {t('panel_source')}
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>{t('panel_revenue')}</span>
                        <span style={{ color: '#F43F5E' }}>{fmt(nf.revenueInflow / MKD_PER_EUR / 1_000_000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>{t('panel_outflow')}</span>
                        <span style={{ color: '#F59E0B' }}>{fmt(nf.budgetOutflow / MKD_PER_EUR / 1_000_000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>{t('panel_arrears')}</span>
                        <span style={{ color: '#ea580c' }}>{fmt(nf.arrears / MKD_PER_EUR / 1_000_000)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Breakdown Legend */}
              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                  {t('breakdown_label')}
                </span>
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: t('chart_legend_leakage'), value: focusedMuni.uncollectedLeakage, color: '#F59E0B' },
                    { label: t('chart_legend_welfare'), value: focusedMuni.welfareBurden, color: '#F43F5E' },
                    { label: t('chart_legend_overhead'), value: focusedMuni.complianceGapCost, color: '#3B82F6' },
                    ...(applyCorrection && focusedMuni.corporateRetraction > 0
                      ? [{ label: t('chart_legend_correction'), value: -focusedMuni.corporateRetraction, color: '#10B981' }]
                      : []),
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b border-card last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-mono text-secondary">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold font-mono" style={{ color: item.color }}>
                        {showMkd ? 'MKD ' + Math.round(Math.abs(item.value) * MKD_PER_EUR).toLocaleString() : (item.value >= 0 ? '€' : '-€') + Math.abs(item.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-4" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-secondary">{t('panel_total_drain')}</span>
                <span className="text-lg font-bold font-mono" style={{ color: '#F59E0B' }}>
                  {fmt(focusedMuni.totalPerCapitaDrain, true)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          33% { transform: scale(1.08) translate(2%, -1%); opacity: 0.7; }
          66% { transform: scale(0.95) translate(-1%, 2%); opacity: 0.4; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kpi-tile-enter { animation: fade-in-up 0.5s ease-out both; }
        .kpi-tile-enter:nth-child(1) { animation-delay: 0ms; }
        .kpi-tile-enter:nth-child(2) { animation-delay: 80ms; }
        .kpi-tile-enter:nth-child(3) { animation-delay: 160ms; }
        .kpi-tile-enter:nth-child(4) { animation-delay: 240ms; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 24px; height: 24px;
          border-radius: 50%; background: white; cursor: pointer;
          border: 2px solid #0B1120; box-shadow: 0 0 8px rgba(0,0,0,0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2); box-shadow: 0 0 12px rgba(255,255,255,0.2);
        }
        input[type='range']::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: white; cursor: pointer; border: 2px solid #0B1120;
          box-shadow: 0 0 8px rgba(0,0,0,0.4);
        }
        input[type='range']:focus-visible {
          outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.3);
        }
      `}</style>
    </div>
  );
}
