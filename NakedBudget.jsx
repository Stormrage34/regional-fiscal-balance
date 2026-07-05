import React, { useState, useMemo, useCallback, useEffect, useRef, useId } from 'react';

// ───────────────────────────────────────────────────────────────
// 1. HARDCODED ECONOMETRIC BASELINE DATA
// ───────────────────────────────────────────────────────────────

const CONSTANTS = {
  nationalGdpPerCapita: 8588,        // SSO 2024 preliminary: €8,588
  avgGrossSalary: 1147,               // SSO Dec 2025: MKD 70,520 / 61.66 ≈ €1,147 (current rate 61.66 MKD/EUR)
  avgNetSalary: 762,                  // SSO Dec 2025: MKD 46,889 ≈ €762
  shadowEconomyRange: { low: 0.213, high: 0.40 },  // was 0.336 — BTI 2026/Finance Think: 21%-40%
  perfectComplianceRevenueTarget: 1200,   // model assumption, no government source
  fixedOverhead: 600,                     // model assumption, no government source
};

// Current EUR/USD exchange rate (source: xe.com)
const EUR_USD = 1.1438;
const MKD_PER_EUR = 61.66;

// ── Currency Formatting Utility ──
const formatCurrency = (value, isPerCapita = false) => {
  if (value === undefined || value === null) return '—';
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(absValue);
  const sign = value < 0 ? '-' : '';
  if (isPerCapita) return `${sign}$${formatted} / per capita`;
  return `${sign}$${formatted}M`;
};

const MUNICIPALITIES = [
  { id: 'lipkovo',    name: 'Lipkovo',    workingAgePop: 14950, baseShadowEcon: 0.45, baseCompliance: 0.26, corporateDistortion: 0.10, welfareRate: 0.32 },
  // workingAgePop: 22308 total × 67% = ~14950 (was 18500 — pre-2021 estimate)
  // baseCompliance: 0.26 — CEA study range floor (26-83%, cea.org.mk, was 0.22)
  { id: 'aracinovo',  name: 'Aračinovo',  workingAgePop: 8500,  baseShadowEcon: 0.52, baseCompliance: 0.26, corporateDistortion: 0.05, welfareRate: 0.40 },
  // workingAgePop: 12676 total × 67% = ~8500 (was 8200)
  // baseCompliance: 0.26 — CEA study range floor (26-83%, cea.org.mk, was 0.15)
  { id: 'tetovo',     name: 'Tetovo',     workingAgePop: 56800, baseShadowEcon: 0.38, baseCompliance: 0.40, corporateDistortion: 0.65, welfareRate: 0.18 },
  // workingAgePop: 84770 total × 67% = ~56800 (was 56000)
  // baseCompliance: 0.40 — unchanged within CEA range
  { id: 'gostivar',   name: 'Gostivar',   workingAgePop: 40000, baseShadowEcon: 0.36, baseCompliance: 0.45, corporateDistortion: 0.55, welfareRate: 0.16 },
  // workingAgePop: 59770 total × 67% = ~40000 (was 42000)
  // baseCompliance: 0.45 — unchanged within CEA range
  { id: 'aerodrom',   name: 'Aerodrom',   workingAgePop: 52100, baseShadowEcon: 0.15, baseCompliance: 0.83, corporateDistortion: 0.90, welfareRate: 0.04 },
  // workingAgePop: 77735 total × 67% = ~52100 (was 52000)
  // baseCompliance: 0.83 — CEA observed ceiling is 83% (cea.org.mk), was 0.88
  { id: 'karpos',     name: 'Karpoš',     workingAgePop: 42700, baseShadowEcon: 0.14, baseCompliance: 0.83, corporateDistortion: 0.95, welfareRate: 0.03 },
  // workingAgePop: 63760 total × 67% = ~42700 (was 44000)
  // baseCompliance: 0.83 — CEA observed ceiling is 83% (cea.org.mk), was 0.90
  { id: 'bitola',     name: 'Bitola',     workingAgePop: 57100, baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.45, welfareRate: 0.08 },
  // workingAgePop: 85164 total × 67% = ~57100 (was 61000)
  // baseCompliance: 0.65 — CEA mid-upper range (26-83%, was 0.78)
  { id: 'stip',       name: 'Štip',       workingAgePop: 30100, baseShadowEcon: 0.20, baseCompliance: 0.60, corporateDistortion: 0.40, welfareRate: 0.07 },
  // workingAgePop: 44866 total × 67% = ~30100 (was 34000)
  // baseCompliance: 0.60 — CEA mid-upper range (was 0.82)
  // ── New municipalities ──
  { id: 'kumanovo',   name: 'Kumanovo',   workingAgePop: 65700, baseShadowEcon: 0.28, baseCompliance: 0.52, corporateDistortion: 0.40, welfareRate: 0.14 },
  { id: 'prilep',     name: 'Prilep',     workingAgePop: 46247, baseShadowEcon: 0.26, baseCompliance: 0.55, corporateDistortion: 0.35, welfareRate: 0.12 },
  { id: 'ohrid',      name: 'Ohrid',      workingAgePop: 34500, baseShadowEcon: 0.18, baseCompliance: 0.72, corporateDistortion: 0.50, welfareRate: 0.06 },
  { id: 'struga',     name: 'Struga',     workingAgePop: 34157, baseShadowEcon: 0.24, baseCompliance: 0.62, corporateDistortion: 0.35, welfareRate: 0.10 },
  { id: 'veles',      name: 'Veles',      workingAgePop: 32000, baseShadowEcon: 0.25, baseCompliance: 0.58, corporateDistortion: 0.30, welfareRate: 0.11 },
  { id: 'strumica',   name: 'Strumica',   workingAgePop: 33497, baseShadowEcon: 0.29, baseCompliance: 0.55, corporateDistortion: 0.25, welfareRate: 0.11 },
  { id: 'kavadarci',  name: 'Kavadarci',  workingAgePop: 23600, baseShadowEcon: 0.23, baseCompliance: 0.60, corporateDistortion: 0.30, welfareRate: 0.09 },
  { id: 'kocani',     name: 'Kočani',     workingAgePop: 20500, baseShadowEcon: 0.31, baseCompliance: 0.48, corporateDistortion: 0.22, welfareRate: 0.13 },
  { id: 'kicevo',     name: 'Kičevo',     workingAgePop: 26500, baseShadowEcon: 0.33, baseCompliance: 0.42, corporateDistortion: 0.25, welfareRate: 0.16 },
  { id: 'radovis',    name: 'Radoviš',    workingAgePop: 16162, baseShadowEcon: 0.34, baseCompliance: 0.45, corporateDistortion: 0.18, welfareRate: 0.15 },
  { id: 'gevgelija',  name: 'Gevgelija',  workingAgePop: 14200, baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.40, welfareRate: 0.08 },
  { id: 'debar',      name: 'Debar',      workingAgePop:  10326, baseShadowEcon: 0.36, baseCompliance: 0.32, corporateDistortion: 0.12, welfareRate: 0.22 },
  // ── Skopje municipalities ──
  { id: 'centar',     name: 'Centar',     workingAgePop: 29408, baseShadowEcon: 0.10, baseCompliance: 0.90, corporateDistortion: 0.95, welfareRate: 0.02 },
  // pop=43893 × 67% = 29408; business/administrative center of Skopje
  { id: 'gazi-baba',  name: 'Gazi Baba',  workingAgePop: 46650, baseShadowEcon: 0.16, baseCompliance: 0.80, corporateDistortion: 0.82, welfareRate: 0.04 },
  // pop=69626 × 67% = 46650; industrial zone east of Skopje
  { id: 'kisela-voda',name: 'Kisela Voda',workingAgePop: 41517, baseShadowEcon: 0.15, baseCompliance: 0.82, corporateDistortion: 0.88, welfareRate: 0.04 },
  // pop=61965 × 67% = 41517; residential suburb south of Skopje
  { id: 'butel',      name: 'Butel',      workingAgePop: 25439, baseShadowEcon: 0.18, baseCompliance: 0.78, corporateDistortion: 0.75, welfareRate: 0.05 },
  // pop=37968 × 67% = 25439; northern Skopje suburb
  { id: 'cair',       name: 'Čair',       workingAgePop: 41933, baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.45, welfareRate: 0.10 },
  // pop=62586 × 67% = 41933; old bazaar area, mixed residential
  { id: 'gjorce-petrov', name: 'Gjorče Petrov', workingAgePop: 30045, baseShadowEcon: 0.16, baseCompliance: 0.80, corporateDistortion: 0.80, welfareRate: 0.04 },
  // pop=44844 × 67% = 30045; western Skopje suburb
  { id: 'saraj',      name: 'Saraj',      workingAgePop: 25727, baseShadowEcon: 0.28, baseCompliance: 0.55, corporateDistortion: 0.35, welfareRate: 0.12 },
  // pop=38399 × 67% = 25727; western rural Skopje
  { id: 'suto-orizari', name: 'Šuto Orizari', workingAgePop: 17236, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.20, welfareRate: 0.18 },
  // pop=25726 × 67% = 17236; northern Roma-majority suburb
];

// ── NET FISCAL IMPACT DATA (open.finance.gov.mk, 2025, TREASURY TRANSACTIONAL) ──
// Formula: Net Impact = Basic Budget Expenditure − Central Government Grant Expenditure
// Source: Ministry of Finance — Open Finance Portal Treasury archives
// revenueInflow = total realized expenditure from basic budget (own-source + VAT grants balancing)
// budgetOutflow = total realized expenditure from central government grants
// Arrears/utility debt: not available in 2025 source
const NET_FISCAL = {
  aerodrom:  { revenueInflow: 3619850750, budgetOutflow: 2694405380, arrears: 0, utilityDebt: 0 },
  aracinovo: { revenueInflow: 491464104,  budgetOutflow: 613796452, arrears: 0, utilityDebt: 0 },
  bitola:    { revenueInflow: 6295381280, budgetOutflow: 4997170208, arrears: 0, utilityDebt: 0 },
  veles:     { revenueInflow: 2627722974, budgetOutflow: 2711150416, arrears: 0, utilityDebt: 0 },
  gevgelija: { revenueInflow: 2716642872, budgetOutflow: 1398558022, arrears: 0, utilityDebt: 0 },
  gostivar:  { revenueInflow: 3147388072, budgetOutflow: 4284910072, arrears: 0, utilityDebt: 0 },
  debar:     { revenueInflow: 1071562614, budgetOutflow: 1220598080, arrears: 0, utilityDebt: 0 },
  kavadarci: { revenueInflow: 3552455784, budgetOutflow: 2851774640, arrears: 0, utilityDebt: 0 },
  karpos:    { revenueInflow: 4386023570, budgetOutflow: 2670568812, arrears: 0, utilityDebt: 0 },
  kicevo:    { revenueInflow: 2170716672, budgetOutflow: 2901465068, arrears: 0, utilityDebt: 0 },
  kocani:    { revenueInflow: 1605844008, budgetOutflow: 1917384436, arrears: 0, utilityDebt: 0 },
  kumanovo:  { revenueInflow: 6272120432, budgetOutflow: 6017243964, arrears: 0, utilityDebt: 0 },
  lipkovo:   { revenueInflow: 1027167936, budgetOutflow: 1497336002, arrears: 0, utilityDebt: 0 },
  ohrid:     { revenueInflow: 6221997238, budgetOutflow: 2790189614, arrears: 0, utilityDebt: 0 },
  prilep:    { revenueInflow: 3957487308, budgetOutflow: 4554312312, arrears: 0, utilityDebt: 0 },
  radovis:   { revenueInflow: 1538785870, budgetOutflow: 1515211340, arrears: 0, utilityDebt: 0 },
  struga:    { revenueInflow: 2976496884, budgetOutflow: 3480035652, arrears: 0, utilityDebt: 0 },
  strumica:  { revenueInflow: 3427632024, budgetOutflow: 3148534600, arrears: 0, utilityDebt: 0 },
  tetovo:    { revenueInflow: 4344329886, budgetOutflow: 6076385642, arrears: 0, utilityDebt: 0 },
  stip:      { revenueInflow: 6475157418, budgetOutflow: 2750261092, arrears: 0, utilityDebt: 0 },
  centar:    { revenueInflow: 4823769540, budgetOutflow: 2201989136, arrears: 0, utilityDebt: 0 },
  'gazi-baba':  { revenueInflow: 4967650144, budgetOutflow: 2881391016, arrears: 0, utilityDebt: 0 },
  'kisela-voda': { revenueInflow: 3384588830, budgetOutflow: 2344078852, arrears: 0, utilityDebt: 0 },
  butel:     { revenueInflow: 1782363422, budgetOutflow: 1886666012, arrears: 0, utilityDebt: 0 },
  cair:      { revenueInflow: 2190145344, budgetOutflow: 3026554988, arrears: 0, utilityDebt: 0 },
  'gjorce-petrov': { revenueInflow: 2526570174, budgetOutflow: 1418076944, arrears: 0, utilityDebt: 0 },
  saraj:     { revenueInflow: 1169331348, budgetOutflow: 1747901616, arrears: 0, utilityDebt: 0 },
  'suto-orizari': { revenueInflow: 618380118,  budgetOutflow: 988598896, arrears: 0, utilityDebt: 0 },
};

// ── EMPLOYMENT & UNEMPLOYMENT DATA (AVRM Nov 2025 / SSO Q4 2024) ──
// Source: AVRM registered unemployed by employment center; SSO Labour Force Survey
// Fiscal loss per unemployed: $5,810/year (forgone PIT $715 + SSC $3,471 + welfare $1,072 + health $552)

const UNEMPLOYMENT_DATA = {
  tetovo:    { registered: 12114, employmentRate: 0.64 },
  kumanovo:  { registered: 9152, employmentRate: 0.68 },  // AVRM Nov 2025 published count
  gostivar:  { registered: 7673,  employmentRate: 0.56 },
  prilep:    { registered: 5379,  employmentRate: 0.60 },
  strumica:  { registered: 4599,  employmentRate: 0.62 },
  bitola:    { registered: 3438,  employmentRate: 0.66 },
  veles:     { registered: 3219,  employmentRate: 0.58 },
  kicevo:    { registered: 2921,  employmentRate: 0.55 },
  ohrid:     { registered: 2573,  employmentRate: 0.72 },
  struga:    { registered: 2271,  employmentRate: 0.65 },
  stip:      { registered: 2224,  employmentRate: 0.68 },
  kocani:    { registered: 1834,  employmentRate: 0.60 },
  kavadarci: { registered: 1806,  employmentRate: 0.62 },
  radovis:   { registered: 1806,  employmentRate: 0.58 },
  aerodrom:  { registered: 2500,  employmentRate: 0.78 },  // [ESTIMATED] — from Skopje aggregate (20,712 total), no published breakdown
  karpos:    { registered: 2000,  employmentRate: 0.80 },  // [ESTIMATED] — from Skopje aggregate (20,712 total), no published breakdown
  debar:     { registered: 800,   employmentRate: 0.45 },
  lipkovo:   { registered: 1000,  employmentRate: 0.42 },
  aracinovo: { registered: 500,   employmentRate: 0.40 },
  gevgelija: { registered: 630,   employmentRate: 0.70 },
  // ── Skopje municipalities (estimated from Skopje aggregate) ──
  centar:     { registered: 1200,  employmentRate: 0.85 },
  'gazi-baba':  { registered: 2800,  employmentRate: 0.78 },
  'kisela-voda': { registered: 2000,  employmentRate: 0.80 },
  butel:      { registered: 1800,  employmentRate: 0.75 },
  cair:       { registered: 4000,  employmentRate: 0.62 },
  'gjorce-petrov': { registered: 1500,  employmentRate: 0.80 },
  saraj:      { registered: 3500,  employmentRate: 0.55 },
  'suto-orizari': { registered: 3000,  employmentRate: 0.40 },
};

const FISCAL_LOSS_PER_UNEMPLOYED = {
  forgonePIT: 715,            // USD/year (lost income tax)
  forgoneSSC: 3471,           // USD/year (lost social contributions)
  welfareSFA: 1072,           // USD/year (GMP MKD 5,445/mo ≈ $1,072/yr)
  healthCoverage: 552,        // USD/year (health insurance 7.5% of gross salary)
  totalAnnual: 5810,          // USD/year per unemployed person
};

// ───────────────────────────────────────────────────────────────
// 2. BAYESIAN INFERENCE ENGINE
// ───────────────────────────────────────────────────────────────

function computeMunicipalMetrics(muni, enforcementStrength, digitalFiscalization, applyCorrection) {
  const enforcementDec = enforcementStrength / 100;
  const digitalDec = digitalFiscalization / 100;

  // (1) Adjusted Shadow Economy
  const adjustedShadowEcon = Math.max(
    0.05,
    muni.baseShadowEcon * (1 - digitalDec * 0.7)
  );

  // (2) Adjusted Local Compliance
  const adjustedCompliance = Math.min(
    0.98,
    Math.max(0.26, muni.baseCompliance * (enforcementStrength / 50))
  );

  // (3) Uncollected Tax Leakage (per capita, floor at €50)
  const uncollectedLeakage = Math.max(
    50,
    CONSTANTS.perfectComplianceRevenueTarget *
      adjustedShadowEcon *
      (1 - adjustedCompliance * 0.4)
  );

  // Welfare component
  const welfareBurden = muni.welfareRate * 800;

  // Compliance gap cost
  const complianceGapCost = (1 - adjustedCompliance) * 400;

  // (4) Direct State Sponsorship Cost (pre-correction)
  let directSponsorship = CONSTANTS.fixedOverhead + welfareBurden + complianceGapCost;

  // (5) Corporate Retraction Adjustment (conditional on toggle)
  let corporateRetraction = 0;
  if (applyCorrection) {
    corporateRetraction =
      CONSTANTS.perfectComplianceRevenueTarget *
      muni.corporateDistortion *
      0.45 *
      enforcementDec;
    directSponsorship -= corporateRetraction;
  }

  // (6) Total Per Capita Drain
  const totalPerCapitaDrain = uncollectedLeakage + directSponsorship;

  // (7) Total Regional Yearly Drain
  const totalYearlyDrain = totalPerCapitaDrain * muni.workingAgePop;

  return {
    ...muni,
    adjustedShadowEcon: Math.round(adjustedShadowEcon * 10000) / 100,
    adjustedCompliance: Math.round(adjustedCompliance * 10000) / 100,
    uncollectedLeakage: Math.round(uncollectedLeakage),
    welfareBurden: Math.round(welfareBurden),
    complianceGapCost: Math.round(complianceGapCost),
    corporateRetraction: Math.round(corporateRetraction * 100) / 100,
    directSponsorship: Math.round(directSponsorship),
    totalPerCapitaDrain: Math.round(totalPerCapitaDrain),
    totalYearlyDrain: Math.round(totalYearlyDrain),
  };
}

// ───────────────────────────────────────────────────────────────
// 3. ANIMATED NUMBER COMPONENT
// ───────────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '', suffix = '', size = 'text-4xl', color = '#F59E0B' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const targetRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    targetRef.current = value;
    const start = displayValue;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return (
    <span className={`${size} font-bold font-mono tracking-tight transition-colors duration-300`} style={{ color }}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// ───────────────────────────────────────────────────────────────
// 4. STACKED BAR COMPONENT — Enhanced
// ───────────────────────────────────────────────────────────────

function StackedBarChart({ data, onMuniClick }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.totalPerCapitaDrain), 1);
  const barHeight = 28;
  const rowGap = 6;
  const headerH = 48;
  const labelW = 110;
  const valueW = 90;
  const chartAreaW = Math.min(750, typeof window !== 'undefined' ? window.innerWidth * 0.6 : 500);
  const rows = data.length;
  const totalH = headerH + rows * (barHeight + rowGap) + 16;
  const svgW = labelW + chartAreaW + valueW;

  const amberGrad = 'url(#amberBarGrad)';
  const cyanGrad = 'url(#cyanBarGrad)';
  const indigoGrad = 'url(#indigoBarGrad)';

  return (
    <svg
      viewBox={`0 0 ${svgW} ${totalH}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="amberBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="cyanBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="indigoBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Header row */}
      <text x={labelW + chartAreaW * 0.17} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="0.5">
        TAX LEAKAGE
      </text>
      <text x={labelW + chartAreaW * 0.50} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="0.5">
        WELFARE
      </text>
      <text x={labelW + chartAreaW * 0.83} y={20} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="0.5">
        OVERHEAD &amp; CREDITS
      </text>
      <line x1={0} y1={28} x2={svgW} y2={28} stroke="#1e293b" strokeWidth="1" />

      {data.map((muni, i) => {
        const y = headerH + i * (barHeight + rowGap);
        const total = muni.totalPerCapitaDrain;
        const seg1 = total > 0 ? muni.uncollectedLeakage / total : 0;
        const seg2 = total > 0 ? muni.welfareBurden / total : 0;
        const seg3 = Math.max(0, 1 - seg1 - seg2);

        const barFullW = (total / maxVal) * chartAreaW;
        const seg1W = barFullW * seg1;
        const seg2W = barFullW * seg2;
        const seg3W = barFullW * seg3;

        const x0 = labelW;

        return (
          <g key={muni.id}>
            {/* Municipality label */}
            <text
              x={labelW - 10}
              y={y + barHeight / 2 + 4}
              textAnchor="end"
              fill="#cbd5e1"
              fontSize="11"
              fontFamily="ui-monospace,monospace"
            >
              {muni.name}
            </text>

            {/* Zero baseline for tiny values */}
            {barFullW < 6 && (
              <rect x={x0} y={y} width={Math.max(barFullW, 2)} height={barHeight} fill="#334155" rx="2" />
            )}

            {/* Segment 1 — Uncollected Cash Leakage */}
            {seg1W > 1 && (
              <rect x={x0} y={y} width={seg1W} height={barHeight} fill={amberGrad} rx={seg1W < 6 ? 0 : 2} />
            )}

            {/* Segment 2 — Welfare Safety Nets */}
            {seg2W > 1 && (
              <rect x={x0 + seg1W} y={y} width={seg2W} height={barHeight} fill={cyanGrad} rx={0} />
            )}

            {/* Segment 3 — Overhead & Retracted Credits */}
            {seg3W > 1 && (
              <rect
                x={x0 + seg1W + seg2W}
                y={y}
                width={seg3W}
                height={barHeight}
                fill={indigoGrad}
                rx={seg3W < 6 ? 0 : 2}
              />
            )}

            {/* Corporate retraction overlay marker */}
            {muni.corporateRetraction > 0 && (
              <rect
                x={x0 + barFullW - 2}
                y={y + 2}
                width={2}
                height={barHeight - 4}
                fill="#10b981"
                rx="1"
              />
            )}

            {/* Clickable area */}
            <rect
              x={x0 - 12}
              y={y - 3}
              width={barFullW + (muni.corporateRetraction > 0 ? 16 : 8) + 10}
              height={barHeight + 6}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onMuniClick?.(muni.id)}
            />

            {/* Total value label */}
            <text
              x={x0 + barFullW + 10}
              y={y + barHeight / 2 + 4}
              fill="#f59e0b"
              fontSize="12"
              fontFamily="ui-monospace,monospace"
              fontWeight="600"
            >
              {`$${total.toLocaleString()}`}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${labelW}, ${totalH - 14})`}>
        <rect x={0} y={-6} width={10} height={10} fill="#f59e0b" rx="2" />
        <text x={14} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">Leakage</text>
        <rect x={80} y={-6} width={10} height={10} fill="#06b6d4" rx="2" />
        <text x={94} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">Welfare</text>
        <rect x={156} y={-6} width={10} height={10} fill="#3B82F6" rx="2" />
        <text x={170} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">Overhead</text>
        <rect x={238} y={-6} width={10} height={10} fill="#10b981" rx="2" />
        <text x={252} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">Correction</text>
        <rect x={320} y={-6} width={10} height={10} fill="#F59E0B" rx="2" />
        <text x={334} y={3} fill="#94a3b8" fontSize="10" fontFamily="ui-monospace,monospace">Unemployment Loss</text>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────
// 5. SLIDER COMPONENT — Compact Redesign
// ───────────────────────────────────────────────────────────────

function RangeSlider({ label, value, onChange, min, max, unit, accentColor }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs font-mono tracking-tight truncate">{label}</span>
        <span className="font-mono text-sm font-semibold ml-3 shrink-0" style={{ color: accentColor }}>
          {value.toFixed(0)}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Filled track */}
        <div
          className="absolute left-0 right-auto h-1 rounded-full pointer-events-none transition-all duration-75"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accentColor}dd, ${accentColor})`,
            boxShadow: `0 0 8px ${accentColor}30`,
          }}
        />
        {/* Unfilled track */}
        <div
          className="absolute left-0 right-0 h-1 rounded-full pointer-events-none"
          style={{ background: '#334155' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none cursor-pointer bg-transparent z-10 m-0"
          style={{
            accentColor,
            touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// 6. SEGMENT CONTROL — Horizontal Scrollable Tabs
// ───────────────────────────────────────────────────────────────

function SegmentControl({ value, onChange, segments }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-900/60 border border-slate-700/40 p-0.5 gap-0.5">
      {segments.map((seg) => (
        <button
          key={seg.value}
          type="button"
          onClick={() => onChange(seg.value)}
          className={`
            px-3.5 py-1.5 text-xs font-mono rounded-md transition-all duration-200 whitespace-nowrap relative
            ${value === seg.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.07]'}
          `}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// 7a. DONUT CHART — FIXED with genuine transparent hole via mask
// ───────────────────────────────────────────────────────────────

function DonutChart({ data, size = 200 }) {
  if (!data) return null;

  const id = useId();
  const holeId = `donut-hole-${id}`;

  const leakage = data.uncollectedLeakage;
  const welfare = data.welfareBurden;
  const overhead = Math.max(0, data.complianceGapCost + CONSTANTS.fixedOverhead - data.corporateRetraction);
  const total = leakage + welfare + overhead || 1;

  const segments = [
    { value: leakage, label: 'Uncollected Leakage', color: '#F59E0B' },
    { value: welfare, label: 'Welfare Burden', color: '#F43F5E' },
    { value: overhead, label: 'Overhead & Credits', color: '#8B5CF6' },
  ];

  let startAngle = -Math.PI / 2;
  const paths = segments.map((seg) => {
    const sliceAngle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    const outerR = 45, innerR = 27;
    const x1o = 50 + outerR * Math.cos(startAngle), y1o = 50 + outerR * Math.sin(startAngle);
    const x2o = 50 + outerR * Math.cos(endAngle),   y2o = 50 + outerR * Math.sin(endAngle);
    const x1i = 50 + innerR * Math.cos(endAngle),   y1i = 50 + innerR * Math.sin(endAngle);
    const x2i = 50 + innerR * Math.cos(startAngle), y2i = 50 + innerR * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const innerSweep = sliceAngle > Math.PI ? 1 : 0;

    const d = `M${x1o},${y1o}A${outerR},${outerR} 0 ${largeArc},1 ${x2o},${y2o}L${x1i},${y1i}A${innerR},${innerR} 0 0,${innerSweep} ${x2i},${y2i}Z`;

    // Label positioning: midpoint of arc, centered in the ring
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = (outerR + innerR) / 2; // 36 — centered in the 27–45 ring
    const showLabel = (seg.value / total) >= 0.08; // skip segments < 8%

    const result = { ...seg, d, percentage: ((seg.value / total) * 100).toFixed(1), midAngle, labelRadius, showLabel };
    startAngle = endAngle;
    return result;
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <defs>
        <mask id={holeId}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="28" fill="black" />
        </mask>
      </defs>

      {/* Segments group masked to punch out the center */}
      <g mask={`url(#${holeId})`}>
        {paths.map((path, i) => (
          <g key={i}>
            <path
              d={path.d}
              fill={path.color}
              className="cursor-pointer transition-opacity duration-200"
              style={{ opacity: 0.9 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            >
              <title>{`${path.label}: ${path.value.toLocaleString()} (${path.percentage}%)`}</title>
            </path>
            {path.showLabel && (
              <text
                x={50 + path.labelRadius * Math.cos(path.midAngle)}
                y={50 + path.labelRadius * Math.sin(path.midAngle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="9"
                fontFamily="ui-monospace,monospace"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {path.percentage}%
              </text>
            )}
          </g>
        ))}
      </g>

      {/* Center text — sits on top of transparent hole */}
      <circle cx="50" cy="50" r="20" fill="rgba(2,6,23,0.85)" />
      <text x="50" y="47" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="ui-monospace,monospace">Drain</text>
      <text x="50" y="57" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="ui-monospace,monospace">
        {`$${total.toLocaleString()}`}
      </text>
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────
// 7b. PIE MATRIX — FIXED with genuine transparent holes, larger
// ───────────────────────────────────────────────────────────────

function PieMatrix({ data, onMuniClick }) {
  // Sort descending by total per-capita drain (highest value first), precompute segments
  const sortedWithSegs = useMemo(() => {
    const items = [...data].sort((a, b) => (b.totalPerCapitaDrain || 0) - (a.totalPerCapitaDrain || 0));
    return items.map(muni => {
      const leakage = muni.uncollectedLeakage;
      const welfare = muni.welfareBurden;
      const overhead = Math.max(0, muni.complianceGapCost + CONSTANTS.fixedOverhead - muni.corporateRetraction);
      const t = leakage + welfare + overhead || 1;
      const segs = [
        { value: leakage, label: 'Uncollected Leakage', color: '#F59E0B' },
        { value: welfare, label: 'Welfare Burden', color: '#F43F5E' },
        { value: overhead, label: 'Overhead & Credits', color: '#8B5CF6' },
      ];
      let startAngle = -Math.PI / 2;
      const outerR = 48, innerR = 29;
      const paths = segs.map(seg => {
        const sliceAngle = (seg.value / t) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        const x1o = 50 + outerR * Math.cos(startAngle), y1o = 50 + outerR * Math.sin(startAngle);
        const x2o = 50 + outerR * Math.cos(endAngle),   y2o = 50 + outerR * Math.sin(endAngle);
        const x1i = 50 + innerR * Math.cos(endAngle),   y1i = 50 + innerR * Math.sin(endAngle);
        const x2i = 50 + innerR * Math.cos(startAngle), y2i = 50 + innerR * Math.sin(startAngle);
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const es = sliceAngle > Math.PI ? 1 : 0;
        const d = `M${x1o},${y1o}A${outerR},${outerR} 0 ${largeArc},1 ${x2o},${y2o}L${x1i},${y1i}A${innerR},${innerR} 0 0,${es} ${x2i},${y2i}Z`;
        const percentage = ((seg.value / t) * 100).toFixed(1);
        startAngle = endAngle;
        return { ...seg, d, percentage };
      });
      return { ...muni, t, paths };
    });
  }, [data]);
  if (!data || data.length === 0) return null;

  return (
    <div>
      {/* Grid of donuts — sorted by total drain, responsive columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedWithSegs.map((muni) => {
          return (
            <div
              key={muni.id}
              data-muni-id={muni.id}
              onClick={() => onMuniClick?.(muni.id)}
              className={`flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-white/[0.08] transition-all duration-200 group odd:bg-white/[0.05] bg-gradient-to-b from-transparent to-black/[0.02]`}
            >
              <svg viewBox="0 0 100 100" width="112" height="112">
                {(() => {
                  const hid = `pm-hole-${muni.id}`;
                  return (
                    <>
                      <defs>
                        <mask id={hid}>
                          <rect width="100" height="100" fill="white" />
                          <circle cx="50" cy="50" r="30" fill="black" />
                        </mask>
                      </defs>
                      <g mask={`url(#${hid})`}>
                        {muni.paths.map((path, i) => (
                          <path
                            key={i}
                            d={path.d}
                            fill={path.color}
                            className="transition-opacity duration-200"
                            style={{ opacity: 0.9 }}
                          >
                            <title>{`${path.label}: ${path.value.toLocaleString()} (${path.percentage}%)`}</title>
                          </path>
                        ))}
                      </g>
                      {/* Center text with subtle glow for legibility */}
                      <defs>
                        <filter id={`pm-glow-${muni.id}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(255,255,255,0.25)" />
                        </filter>
                      </defs>
                      <circle cx="50" cy="50" r="22" fill="rgba(2,6,23,0.9)" />
                      <text x="50" y="57" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="ui-monospace,monospace" filter={`url(#pm-glow-${muni.id})`}>
                        {`$${muni.t.toLocaleString()}`}
                      </text>
                    </>
                  );
                })()}
              </svg>
              {/* Footer: name + 3-segment colored breakdown */}
              <div className="flex flex-col items-center mt-2 w-full px-1">
                <span className="text-[10px] font-mono truncate text-slate-300 group-hover:text-slate-100 transition-colors duration-200 w-full text-center">{muni.name}</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {muni.paths.map((seg, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span>{seg.percentage}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// 8. COMPLIANCE SCATTER PLOT — Tax Leak vs Compliance Rate
// ───────────────────────────────────────────────────────────────

function ComplianceScatter({ data, onMuniClick, focusedId }) {
  if (!data || data.length === 0) return null;

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = 700, height = 400;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const maxLeak = Math.max(...data.map(d => d.uncollectedLeakage), 1);
  const maxComp = 100;

  const points = data.map(m => ({
    ...m,
    x: m.adjustedCompliance,
    y: m.uncollectedLeakage,
    // Color: green if NET_FISCAL shows net gainer, amber if loser
    isGainer: typeof NET_FISCAL !== 'undefined' && NET_FISCAL[m.id] && (NET_FISCAL[m.id].revenueInflow - NET_FISCAL[m.id].budgetOutflow) > 0,
  }));

  // Sort so gainers render last (on top)
  points.sort((a, b) => (a.isGainer ? 1 : 0) - (b.isGainer ? 1 : 0));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Axes */}
        <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke="#334155" strokeWidth="1" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="#334155" strokeWidth="1" />

        {/* Y-axis grid lines + labels */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = margin.top + plotH - (pct / 100) * plotH;
          return (
            <g key={pct}>
              <line x1={margin.left} y1={y} x2={margin.left + plotW} y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={margin.left - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                {`$${Math.round((pct / 100) * maxLeak).toLocaleString()}`}
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines + labels */}
        {[0, 20, 40, 60, 80, 100].map(pct => {
          const x = margin.left + (pct / 100) * plotW;
          return (
            <g key={pct}>
              <line x1={x} y1={margin.top} x2={x} y2={margin.top + plotH} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={x} y={margin.top + plotH + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={margin.left + plotW / 2} y={height - 6} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
          Tax Compliance Rate (%)
        </text>
        <text x={12} y={margin.top + plotH / 2} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace" transform={`rotate(-90, 12, ${margin.top + plotH / 2})`}>
          Uncollected Tax Leakage ($ per capita)
        </text>

        {/* Data points */}
        {points.map((p) => {
          const cx = margin.left + (p.x / maxComp) * plotW;
          const cy = margin.top + plotH - (p.y / maxLeak) * plotH;
          const r = Math.max(4, Math.min(10, Math.sqrt(p.workingAgePop / 1000)));
          const isFocused = p.id === focusedId;
          return (
            <g key={p.id} onClick={() => onMuniClick && onMuniClick(p.id)} className="cursor-pointer">
              {/* Invisible hit area — 2× the visual radius for easier clicking */}
              <circle cx={cx} cy={cy} r={r * 2.2} fill="transparent" />
              <circle cx={cx} cy={cy} r={r + (isFocused ? 3 : 0)} fill={p.isGainer ? '#10B981' : '#F59E0B'} fillOpacity={isFocused ? 0.9 : 0.5} stroke={isFocused ? '#fff' : 'transparent'} strokeWidth={isFocused ? 1.5 : 0} />
              {isFocused && (
                <text x={cx + r + 6} y={cy + 3} fill="#e2e8f0" fontSize="10" fontFamily="monospace">
                  {p.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-mono text-slate-400">Net Gainer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[10px] font-mono text-slate-400">Net Loser</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">· Dot size = working-age population</span>
      </div>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────
// 8. MAIN DASHBOARD COMPONENT — Premium Fintech Redesign
// ───────────────────────────────────────────────────────────────

export default function NakedBudget() {
  // ── Slider State ──
  const [enforcementStrength, setEnforcementStrength] = useState(50);
  const [digitalFiscalization, setDigitalFiscalization] = useState(30);
  const [applyCorrection, setApplyCorrection] = useState(true);

  // ── Focused Municipality ──
  const [focusedMuniId, setFocusedMuniId] = useState(null);

  // ── Chart View Selection ──
  const [chartView, setChartView] = useState('stacked');
  const [showMethodology, setShowMethodology] = useState(true);

  // ── Sorted display order ──
  const [sortKey, setSortKey] = useState('drain');
  const [sortAsc, setSortAsc] = useState(false);

  // ── Sidebar toggle (mobile) ──
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Calculation Engine ──
  const results = useMemo(
    () =>
      MUNICIPALITIES.map((m) =>
        computeMunicipalMetrics(m, enforcementStrength, digitalFiscalization, applyCorrection)
      ),
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

    return {
      totalPop,
      totalYearlyDrain,
      totalUncollected,
      totalWelfareBurden,
      totalCorporateCredit,
      totalUnemploymentFiscalLoss,
      totalUnemployed,
      weightedAvgDrain: Math.round(weightedAvgDrain),
    };
  }, [results]);

  // ── Top/Bottom Callouts (from NET_FISCAL 2025 Treasury data) ──
  const worstMunis = useMemo(() => {
    const withFiscal = results.filter(m => NET_FISCAL[m.id]).map(m => {
      const nf = NET_FISCAL[m.id];
      const netPC = m.workingAgePop > 0 ? ((nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR * EUR_USD) / m.workingAgePop : 0;
      const drainPC = m.totalPerCapitaDrain || 0;
      return { ...m, netFiscalPC: Math.round(netPC), totalPerCapitaDrain: drainPC };
    });
    return withFiscal.sort((a, b) => a.netFiscalPC - b.netFiscalPC).slice(0, 5);
  }, [results]);

  const bestMunis = useMemo(() => {
    const withFiscal = results.filter(m => NET_FISCAL[m.id]).map(m => {
      const nf = NET_FISCAL[m.id];
      const netPC = m.workingAgePop > 0 ? ((nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR * EUR_USD) / m.workingAgePop : 0;
      const drainPC = m.totalPerCapitaDrain || 0;
      return { ...m, netFiscalPC: Math.round(netPC), totalPerCapitaDrain: drainPC };
    });
    return withFiscal.sort((a, b) => b.netFiscalPC - a.netFiscalPC).slice(0, 5);
  }, [results]);

  // ── Net Fiscal Aggregates (extracted from IIFE) ──
  const netFiscalAggs = useMemo(() => {
    const gainers = results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) > 0);
    const losers = results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) <= 0);
    const totalRev = Object.values(NET_FISCAL).reduce((s, n) => s + n.revenueInflow, 0);
    const totalOut = Object.values(NET_FISCAL).reduce((s, n) => s + n.budgetOutflow, 0);
    const totalNet = totalRev - totalOut;
    const totalArrears = Object.values(NET_FISCAL).reduce((s, n) => s + n.arrears, 0);
    return { gainers, losers, totalRev, totalOut, totalNet, totalArrears };
  }, [results]);

  // ── Max absolute net per capita USD (for diverging bar chart) ──
  const maxAbsNetPCUSD = useMemo(() => {
    return Math.max(...results
      .filter(m => NET_FISCAL[m.id])
      .map(m => Math.abs((NET_FISCAL[m.id].revenueInflow - NET_FISCAL[m.id].budgetOutflow) / MKD_PER_EUR * EUR_USD / m.workingAgePop)), 1);
  }, [results]);

  // ── Currency Display Toggle (EUR / MKD) ──
  const [showMkd, setShowMkd] = useState(false);

  // EUR → MKD display helper — wraps formatCurrency with optional MKD conversion
  const fmt = useCallback((value, isPerCapita = false) => {
    if (showMkd) return formatCurrency(value * MKD_PER_EUR, isPerCapita).replace('$', 'MKD ');
    return formatCurrency(value, isPerCapita);
  }, [showMkd]);

  // ── Focus handler ──
  const handleMuniFocus = useCallback((id) => {
    setFocusedMuniId((prev) => (prev === id ? null : id));
  }, []);

  // ── Handlers ──
  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) setSortAsc((prev) => !prev);
      else {
        setSortKey(key);
        setSortAsc(true);
      }
    },
    [sortKey]
  );

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) return (
      <svg className="ml-1 w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return (
      <svg className={`ml-1 w-4 h-4 ${sortAsc ? 'text-amber-400' : 'text-amber-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {sortAsc ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        )}
      </svg>
    );
  };

  // ── Chart segment control segments ──
  const chartSegments = [
    { value: 'stacked', label: 'Stacked Bars' },
    { value: 'pie',     label: 'Pie Matrix' },
    { value: 'compliance-scatter', label: 'Compliance Scatter' },
  ];

  // ── Focused municipality for panel ──
  const focusedMuni = useMemo(
    () => results.find((r) => r.id === focusedMuniId) || null,
    [results, focusedMuniId]
  );

  // ── Render ──
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
      {/* ─── Bloomberg-terminal style grid lines ─── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ─── Animated gradient orbs — richer depth ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/3 -left-1/3 w-[80%] h-[80%]"
             style={{
               background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.04) 0%, transparent 55%)',
               animation: 'pulse-slow 8s ease-in-out infinite',
             }}
        />
        <div className="absolute -bottom-1/3 -right-1/3 w-[80%] h-[80%]"
             style={{
               background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, transparent 55%)',
               animation: 'pulse-slow 10s ease-in-out infinite reverse',
             }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[60%]"
             style={{
               background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.025) 0%, transparent 60%)',
               animation: 'pulse-slow 12s ease-in-out infinite',
             }}
        />
      </div>

      {/* ─── Top accent gradient line ─── */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 opacity-60" />

      {/* ─── LEFT SIDEBAR — Controls & Parameters ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed md:relative z-40 h-screen md:h-auto w-72 md:w-64 shrink-0 border-r border-slate-800/70 bg-[#1E293B] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
        {/* Sidebar Brand Section */}
        <div className="flex flex-col gap-1 p-4 pt-5 pb-5 border-b relative overflow-hidden" style={{ borderColor: '#334155' }}>
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-500/30 via-teal-500/20 to-indigo-500/30" />
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span className="font-sans font-bold tracking-wider text-white text-base uppercase">
              Open Fiscal Matrix
            </span>
          </div>
          <span className="font-sans text-[11px] font-medium tracking-normal text-slate-400 pl-7">
            North Macedonia Regional Ledger
          </span>
        </div>

        <div className="p-4 flex-1 space-y-6 overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          {/* Gradient separator */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

          <h3 className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Policy Parameters
          </h3>

          <RangeSlider
            label="Central Tax Enforcement Strength (UJP)"
            value={enforcementStrength}
            onChange={setEnforcementStrength}
            min={10}
            max={100}
            unit="%"
            accentColor="#f59e0b"
          />

          <RangeSlider
            label="Digital Fiscalization Rate (Cashless Mandate)"
            value={digitalFiscalization}
            onChange={setDigitalFiscalization}
            min={0}
            max={100}
            unit="%"
            accentColor="#06b6d4"
          />

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-slate-400 text-xs font-mono tracking-tight">Bayesian Corporate Correction</span>
            <button
              type="button"
              onClick={() => setApplyCorrection((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
                border border-transparent transition-all duration-300 ease-in-out
                focus:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] focus:outline-none hover:border-emerald-500/40`}
              style={{
                backgroundColor: applyCorrection ? '#10B981' : '#334155',
                boxShadow: applyCorrection ? '0 0 12px rgba(16,185,129,0.25)' : 'none',
              }}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out`}
                style={{ transform: applyCorrection ? 'translateX(17px)' : 'translateX(2px)' }}
              />
            </button>
            <span className="text-[10px] font-mono transition-colors duration-300"
              style={{ color: applyCorrection ? '#10B981' : '#64748b' }}>
              {applyCorrection ? 'Active — adjusting for HQ distortion' : 'Inactive — nominal figures'}
            </span>
          </div>

          {/* System status badges */}
          <div className="pt-2">
            {/* Gradient separator */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-3" />
            <h3 className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
              System Status
            </h3>
            <div className="space-y-2">
              {/* Status badges with colored dots */}
              <div className="rounded-md px-3 py-2 border text-[10px] font-mono flex items-center gap-2" style={{ backgroundColor: '#243047', borderColor: '#1F3050', color: '#94a3b8' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                GDP/capita: {`$${CONSTANTS.nationalGdpPerCapita.toLocaleString()}`}
              </div>
              <div className="rounded-md px-3 py-2 border text-[10px] font-mono flex items-center gap-2" style={{ backgroundColor: '#243047', borderColor: '#1F3050', color: '#94a3b8' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                Shadow Econ: {(CONSTANTS.shadowEconomyRange.low * 100).toFixed(0)}–{(CONSTANTS.shadowEconomyRange.high * 100).toFixed(0)}%
              </div>
              <div className="rounded-md px-3 py-2 border text-[10px] font-mono flex items-center gap-2" style={{ backgroundColor: '#243047', borderColor: '#1F3050', color: '#94a3b8' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                Revenue Target: {`$${CONSTANTS.perfectComplianceRevenueTarget.toLocaleString()}`} / per capita
              </div>
            </div>
          </div>

          {/* Currency Toggle — Sliding Pill */}
          <div className="pt-2">
            {/* Gradient separator */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
                Display Currency
              </span>
              {/* Sliding pill container */}
              <div className="relative inline-flex h-7 rounded-lg border overflow-hidden" style={{ borderColor: '#334155', backgroundColor: '#243047' }}>
                <button
                  type="button"
                  onClick={() => setShowMkd(false)}
                  className={`relative z-10 px-3 py-1 text-xs font-mono transition-all duration-300 ${
                    !showMkd ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  EUR
                </button>
                {!showMkd && (
                  <div className="absolute inset-y-0 left-0 w-1/2 rounded-lg bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-300" />
                )}
                <button
                  type="button"
                  onClick={() => setShowMkd(true)}
                  className={`relative z-10 px-3 py-1 text-xs font-mono transition-all duration-300 ${
                    showMkd ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MKD
                </button>
                {showMkd && (
                  <div className="absolute inset-y-0 right-0 w-1/2 rounded-lg bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-300" />
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN WORKSPACE ─── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 max-w-6xl space-y-8">

        {/* ════════════════════════════════════════ */}
        {/* HEADER — Compact title + data sources    */}
        {/* ════════════════════════════════════════ */}
        <header className="pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 28 28" className="opacity-90">
                <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx="14" cy="14" r="2.5" fill="#f59e0b" />
              </svg>
              <h1 className="text-lg font-bold tracking-tight text-white font-mono leading-none">
                Regional Fiscal Balance Report
              </h1>
            </div>
            <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>
              North Macedonia &middot; Municipal Treasury &amp; Bayesian Model
            </p>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors ml-auto"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#94a3b8' }}>
                {sidebarOpen
                  ? <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  : <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                }
              </svg>
            </button>
          </div>

          {/* Data source badges */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Treasury</span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: '#e2e8f0' }}>2025</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Census</span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: '#e2e8f0' }}>2021</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Model</span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: '#e2e8f0' }}>PS#50</span>
            </div>
          </div>

          {/* Gradient underline */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber-500/40 via-cyan-500/30 to-emerald-500/20" />
        </header>

        {/* ════════════════════════════════════════ */}
        {/* KPI RIBBON — Consolidated macro outputs   */}
        {/* ════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-10">
          {/* Hero tile — Net Annual Per Capita Drain */}
          <div
            className="rounded-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter"
            style={{
              backgroundColor: '#243047',
              borderColor: '#1F3050',
              borderWidth: 1,
              boxShadow: '0 0 30px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Thicker top accent — 3px amber glow */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/60 via-amber-400/50 to-amber-500/60" />
            {/* Inner glow overlay */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#64748b' }}>
              Net Annual Per Capita Drain
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <AnimatedNumber
                value={aggregates.weightedAvgDrain}
                prefix="$"
                size="text-[2.8rem] sm:text-[3.2rem]"
                color="#f59e0b"
              />
            </div>
            <span className="text-[10px] font-mono mt-1 block" style={{ color: '#94a3b8' }}>
              Population-weighted &middot; {MUNICIPALITIES.length} municipalities &middot; {aggregates.totalPop.toLocaleString()} pop.
            </span>
          </div>

          {/* Total Regional Drain — flat tile, no border */}
          <div
            className="rounded-lg relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter"
            style={{
              backgroundColor: 'rgba(27,42,74,0.4)',
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
              Total Regional Drain
            </span>
            <span className="block text-xl font-bold font-mono mt-1" style={{ color: '#F43F5E' }}>
              {fmt(aggregates.totalYearlyDrain / MKD_PER_EUR / 1_000_000)}
            </span>
            <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#94a3b8' }}>Annual aggregate</span>
          </div>

          {/* Net Gainers / Losers — flat tile */}
          <div
            className="rounded-lg relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter"
            style={{
              backgroundColor: 'rgba(27,42,74,0.4)',
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
              Net Gainers / Losers
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono" style={{ color: '#10B981' }}>
                {results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) > 0).length}
              </span>
              <span className="text-sm font-mono text-slate-600">/</span>
              <span className="text-xl font-bold font-mono" style={{ color: '#F59E0B' }}>
                {results.filter(r => NET_FISCAL[r.id] && (NET_FISCAL[r.id].revenueInflow - NET_FISCAL[r.id].budgetOutflow) <= 0).length}
              </span>
            </div>
            <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#94a3b8' }}>Surplus / deficit</span>
          </div>

          {/* Employment Fiscal Loss — flat tile */}
          <div
            className="rounded-lg relative overflow-hidden group hover:scale-[1.01] transition-all duration-200 kpi-tile-enter"
            style={{
              backgroundColor: 'rgba(27,42,74,0.4)',
            }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>
              Employment Fiscal Loss
            </span>
            <span className="block text-xl font-bold font-mono mt-1" style={{ color: '#F59E0B' }}>
              {fmt(aggregates.totalUnemploymentFiscalLoss / MKD_PER_EUR / 1_000_000)}
            </span>
            <span className="text-[10px] font-mono mt-0.5 block" style={{ color: '#94a3b8' }}>{aggregates.totalUnemployed.toLocaleString()} registered unemployed</span>
          </div>
        </section>

        {/* ════════════════════════════════════════ */}
        {/* NET FISCAL IMPACT SECTION               */}
        {/* ════════════════════════════════════════ */}
        <section className="rounded-xl relative overflow-hidden mb-10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]" style={{ backgroundColor: 'rgba(11,17,32,0.4)', borderColor: '#1F3050', borderWidth: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Net Fiscal Impact
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#334155', color: '#64748b' }}>
               Treasury 2025 — open.finance.gov.mk
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg px-4 py-3 border hover:shadow-[0_0_12px_rgba(99,102,241,0.04)] transition-shadow duration-300" style={{ backgroundColor: '#243047', borderColor: '#1F3050' }}>
              <span className="text-xs font-mono" style={{ color: '#64748b' }}>Net Gainers</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#10B981' }}>{netFiscalAggs.gainers.length}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>municipalities in surplus</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:shadow-[0_0_12px_rgba(99,102,241,0.04)] transition-shadow duration-300" style={{ backgroundColor: '#243047', borderColor: '#1F3050' }}>
              <span className="text-xs font-mono" style={{ color: '#64748b' }}>Net Losers</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#F59E0B' }}>{netFiscalAggs.losers.length}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>municipalities in deficit</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:shadow-[0_0_12px_rgba(99,102,241,0.04)] transition-shadow duration-300" style={{ backgroundColor: '#243047', borderColor: '#1F3050' }}>
              <span className="text-xs font-mono" style={{ color: '#64748b' }}>Total Net Deficit</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#F59E0B' }}>{fmt(Math.abs(netFiscalAggs.totalNet) / MKD_PER_EUR / 1_000_000)}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>aggregate (MKD {Math.abs(Math.round(netFiscalAggs.totalNet/1000)).toLocaleString()}K)</span>
            </div>
            <div className="rounded-lg px-4 py-3 border hover:shadow-[0_0_12px_rgba(99,102,241,0.04)] transition-shadow duration-300" style={{ backgroundColor: '#243047', borderColor: '#1F3050' }}>
              <span className="text-xs font-mono" style={{ color: '#64748b' }}>Total Arrears</span>
              <span className="block text-2xl font-bold font-mono mt-0.5" style={{ color: '#F43F5E' }}>{fmt(netFiscalAggs.totalArrears / MKD_PER_EUR / 1_000_000)}</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>outstanding municipal debt</span>
            </div>
          </div>

          {/* Net Fiscal Balance — Diverging Bar Chart */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xs font-mono" style={{ color: '#64748b' }}>
                Net Fiscal Balance per Municipality ($ /capita)
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#10B981' }}/>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Gainer — self-sufficient</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#F43F5E' }}/>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Loser — reliant on transfers</span>
                </div>
              </div>
            </div>
            <div className="mt-2 space-y-1 max-h-[400px] overflow-y-auto pr-3">
              {(() => {
                const netPCResults = results.filter(m => NET_FISCAL[m.id]).map(m => {
                  const nf = NET_FISCAL[m.id];
                  const netUSD = (nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR * EUR_USD;
                  return { m, netPC: m.workingAgePop > 0 ? netUSD / m.workingAgePop : 0 };
                });
                const maxAbsUSD = Math.max(...netPCResults.map(r => Math.abs(r.netPC)), 1);
                return netPCResults.sort((a, b) => {
                  if (a.netPC >= 0 && b.netPC < 0) return -1;
                  if (a.netPC < 0 && b.netPC >= 0) return 1;
                  if (a.netPC >= 0) return b.netPC - a.netPC;
                  return a.netPC - b.netPC;
                }).map(r => r.m);
              })()
                .map(muni => {
                  const nf = NET_FISCAL[muni.id];
                  if (!nf) return null;
                  const netUSD = (nf.revenueInflow - nf.budgetOutflow) / MKD_PER_EUR * EUR_USD;
                  const netPC = muni.workingAgePop > 0 ? netUSD / muni.workingAgePop : 0;
                  const pctOfMax = Math.abs(netPC) / maxAbsNetPCUSD;
                  const barPct = Math.sqrt(pctOfMax) * 100;
                  const barW = Math.min(Math.max(barPct, 3), 100);
                  const isGainer = netPC > 0;

                  return (
                    <div key={muni.id} className="grid grid-cols-[120px_1fr_120px] gap-2 text-[11px] font-mono items-center">
                      <span className="text-left truncate" style={{ color: '#94a3b8' }}>{muni.name}</span>
                      <div className="relative h-5">
                        {/* Bar — all from left edge */}
                        <div
                          className="absolute h-full rounded-sm transition-all duration-300"
                          style={{
                            width: `${barW}%`,
                            backgroundColor: isGainer ? '#10B981' : '#F43F5E',
                            opacity: isGainer ? 0.85 : 0.7,
                          }}
                        />
                      </div>
                      <span className="text-right font-semibold whitespace-nowrap" style={{ color: isGainer ? '#10B981' : '#F43F5E' }}>
                        {isGainer ? '+' : '-'}${Math.round(Math.abs(netPC)).toLocaleString()} / per capita
                      </span>
                    </div>
                  );
                })}
            </div>

            </div>
        </section>


        {/* ════════════════════════════════════════ */}
        {/* CALLOUTS — Leaderboard style              */}
        {/* ════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* Worst — Highest Fiscal Drain */}
          <div
            className="rounded-xl relative overflow-hidden transition-all duration-300"
            style={{ backgroundColor: 'rgba(11,17,32,0.4)', borderColor: '#1F3050', borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#ef4444' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2" style={{ color: '#ef4444' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Highest Fiscal Drain
              </h3>
            </div>
            <div className="px-1 pb-4">
              {(() => {
                const maxAbs = Math.max(...worstMunis.map(m => Math.abs(m.netFiscalPC)), 1);
                return worstMunis.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b last:border-b-0 hover:bg-white/[0.05] -mx-1 px-1 transition-colors duration-150" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0" style={{
                      background: i === 0 ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.08))' : i === 1 ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.08)',
                      color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#64748b',
                      border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : i === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.15)'}`,
                      boxShadow: i === 0 ? '0 0 8px rgba(245,158,11,0.15)' : undefined,
                    }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-mono truncate" style={{ color: '#e2e8f0' }}>{m.name}</span>
                        <span className="text-sm font-bold font-mono ml-2 flex-shrink-0" style={{ color: '#ef4444' }}>-${Math.abs(m.netFiscalPC).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(Math.abs(m.netFiscalPC) / maxAbs) * 100}%`, backgroundColor: '#ef4444' }} />
                        </div>
                        {UNEMPLOYMENT_DATA[m.id] && (
                          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#64748b' }}>
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

          {/* Best — Best Fiscal Performance */}
          <div
            className="rounded-xl relative overflow-hidden transition-all duration-300"
            style={{ backgroundColor: 'rgba(11,17,32,0.4)', borderColor: '#1F3050', borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#10b981' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2" style={{ color: '#10b981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Best Fiscal Performance
              </h3>
            </div>
            <div className="px-1 pb-4">
              {(() => {
                const maxAbs = Math.max(...bestMunis.map(m => Math.abs(m.netFiscalPC)), 1);
                return bestMunis.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b last:border-b-0 hover:bg-white/[0.05] -mx-1 px-1 transition-colors duration-150" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0" style={{
                      background: i === 0 ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.08))' : i === 1 ? 'rgba(148,163,184,0.1)' : 'rgba(100,116,139,0.08)',
                      color: i === 0 ? '#34d399' : i === 1 ? '#94a3b8' : '#64748b',
                      border: `1px solid ${i === 0 ? 'rgba(16,185,129,0.4)' : i === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.15)'}`,
                      boxShadow: i === 0 ? '0 0 8px rgba(16,185,129,0.15)' : undefined,
                    }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-mono truncate" style={{ color: '#e2e8f0' }}>{m.name}</span>
                        <span className="text-sm font-bold font-mono ml-2 flex-shrink-0" style={{ color: '#10b981' }}>+${m.netFiscalPC.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(m.netFiscalPC / maxAbs) * 100}%`, backgroundColor: '#10b981' }} />
                        </div>
                        {UNEMPLOYMENT_DATA[m.id] && (
                          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#64748b' }}>
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
        </section>

        {/* ════════════════════════════════════════ */}
        {/* CHARTS — Centerpiece section              */}
        {/* ════════════════════════════════════════ */}
        <section
          className="rounded-xl relative overflow-hidden mb-12 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] bg-gradient-to-b from-slate-900/[0.15] to-transparent"
          style={{
            backgroundColor: 'rgba(11,17,32,0.5)',
            borderColor: '#1F3050',
            borderWidth: 1,
          }}
        >
          {/* Subtle glow behind chart */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.03) 0%, transparent 70%)' }}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                Regional Fiscal Balance &amp; Labor Market Mapping
              </h2>
              <button
                type="button"
                onClick={() => setShowMethodology(!showMethodology)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all duration-200 hover:brightness-125"
                style={{ backgroundColor: showMethodology ? 'rgba(245,158,11,0.1)' : '#243047', borderColor: showMethodology ? 'rgba(245,158,11,0.25)' : 'rgba(100,116,139,0.2)', color: showMethodology ? '#F59E0B' : '#64748b' }}
                aria-expanded={showMethodology}
                aria-controls="methodology-panel"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform duration-200 ${showMethodology ? '' : '-rotate-90'}`} style={{ fill: 'currentColor' }}>
                  <polygon points="2,3 5,7 8,3" />
                </svg>
                Methodology
              </button>
            </div>

            {/* ─── Methodology Panel ─── */}
            <div id="methodology-panel" className={`grid overflow-hidden transition-all duration-300 ease-in-out ${showMethodology ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} role="region" aria-label="Model methodology">
              <div className="rounded-xl border p-3.5" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: 'rgba(51,65,85,0.4)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>

                {/* Header row */}
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: '#F59E0B' }}>How these numbers are built</span>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>(click Model to collapse)</span>
                </div>

                {/* Metric rows */}
                <div className="space-y-2.5">

                  {/* Tax Leakage */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F59E0B' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>Tax Leakage</span>
                        <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(245,158,11,0.18)', padding: '1px 5px', borderRadius: 3 }}>$1,200 &times; shadowEcon &times; (1 − compliance&times;0.4)</code>
                      </div>
                      <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                        Revenue shortfall from unreported economic activity. Per-capita revenue target × shadow economy share, reduced by tax compliance rate — municipalities with stronger enforcement lose less.
                      </p>
                    </div>
                  </div>

                  {/* Welfare Burden */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F43F5E' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>Welfare Burden</span>
                        <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(244,63,94,0.18)', padding: '1px 5px', borderRadius: 3 }}>welfareRate &times; $800</code>
                      </div>
                      <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                        Social safety net costs per municipality based on the share of residents receiving welfare benefits. Applies a per-recipient annual cost estimate to each municipality's welfare rate.
                      </p>
                    </div>
                  </div>

                  {/* Overhead & Credits */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#818CF8' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>Overhead &amp; Credits</span>
                        <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(129,140,248,0.18)', padding: '1px 5px', borderRadius: 3 }}>$600 + (1−compliance)&times;$400 − corporate correction</code>
                      </div>
                      <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                        Fixed administrative overhead ($600/capita) plus an enforcement gap cost that grows as compliance drops, reduced by a Bayesian correction for corporate tax headquarters relocating revenue elsewhere.
                      </p>
                    </div>
                  </div>


                  {/* Net Fiscal Balance */}
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#a78bfa' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: '#d4d4d8' }}>Net Fiscal Balance</span>
                        <code className="text-[10px] font-mono" style={{ color: '#94a3b8', backgroundColor: 'rgba(167,139,250,0.18)', padding: '1px 5px', borderRadius: 3 }}>revenueInflow − budgetOutflow</code>
                      </div>
                      <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: '#94a3b8' }}>
                        Actual fiscal position from Treasury data. Positive means the municipality generates more revenue than it spends — self-sufficient. Negative indicates dependence on central government grants.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="mt-3 pt-2.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1.5" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>All constants are model assumptions — adjustable via Policy Parameters</span>
                  <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>Sources: Census pops · Treasury 2025 (open.finance.gov.mk) · AVRM unemployment</span>
                </div>

              </div>
            </div>

            {/* Segment control */}
            <div className="flex items-center justify-between mb-5">
              <SegmentControl
                value={chartView}
                onChange={setChartView}
                segments={chartSegments}
              />
            </div>

            {chartView === 'stacked' && (
              <div className="max-h-[600px] overflow-y-auto">
                <StackedBarChart data={sortedResults} onMuniClick={handleMuniFocus} />
              </div>
            )}

            {chartView === 'pie' && (
              <PieMatrix data={sortedResults} onMuniClick={handleMuniFocus} />
            )}

            {chartView === 'compliance-scatter' && (
              <ComplianceScatter data={results} onMuniClick={handleMuniFocus} focusedId={focusedMuniId} />
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════ */}
        {/* TABLE — Municipal Profiles & Drain Detail */}
        {/* ════════════════════════════════════════ */}
        <section
          className="rounded-xl relative overflow-hidden mb-10 transition-all duration-300"
          style={{ backgroundColor: 'rgba(11,17,32,0.4)', borderColor: '#1F3050', borderWidth: 1 }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-600/25 to-transparent" />

          <div className="px-5 py-3.5 border-b flex items-center justify-between relative" style={{ borderColor: '#1F3050' }}>
            <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Municipal Profiles
            </h2>
            <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
              Sortable &middot; click row for detail
            </span>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(15,23,42,0.6)' }}>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                      style={{ color: '#64748b', zIndex: 1 }}
                      onClick={() => handleSort('name')}>
                    <span className="inline-flex items-center gap-1">
                      Municipality
                      <SortIcon columnKey="name" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                      style={{ color: '#64748b', zIndex: 1 }}
                      onClick={() => handleSort('drain')}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      <span className="text-[#F59E0B]">▸</span> Capita Drain
                      <SortIcon columnKey="drain" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                      style={{ color: '#64748b', zIndex: 1 }}
                      onClick={() => handleSort('leakage')}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      <span className="text-[#F59E0B]">▸</span> Leakage
                      <SortIcon columnKey="leakage" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                      style={{ color: '#64748b', zIndex: 1 }}
                      onClick={() => handleSort('welfare')}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      <span className="text-[#F43F5E]">▸</span> Welfare
                      <SortIcon columnKey="welfare" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                      style={{ color: '#64748b', zIndex: 1 }}
                      onClick={() => handleSort('yearly')}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      <span className="text-[#F43F5E]">▸</span> Annual
                      <SortIcon columnKey="yearly" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors duration-150 sticky top-0"
                      style={{ color: '#64748b', zIndex: 1 }}
                      onClick={() => handleSort('unemployment')}>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-[#38bdf8]">▸</span> Unemployed
                      <SortIcon columnKey="unemployment" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider sticky top-0"
                      style={{ color: '#64748b', backgroundColor: 'rgba(15,23,42,0.6)' }}>
                    Structural
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider sticky top-0"
                      style={{ color: '#64748b', backgroundColor: 'rgba(15,23,42,0.6)' }}>
                    Correction
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((muni, i) => {
                  const maxYearly = Math.max(...sortedResults.map(r => r.totalYearlyDrain));
                  const sparkWidth = (muni.totalYearlyDrain / maxYearly) * 60;
                  const isFocused = muni.id === focusedMuniId;

                  return (
                    <tr
                      key={muni.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => setFocusedMuniId(prev => prev === muni.id ? null : muni.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFocusedMuniId(prev => prev === muni.id ? null : muni.id); } }}
                      className="transition-all duration-200 hover:bg-white/[0.06] cursor-pointer group"
                      style={{
                        borderBottom: i < sortedResults.length - 1 ? '1px solid rgba(27,42,74,0.4)' : 'none',
                        backgroundColor: isFocused ? 'rgba(245,158,11,0.03)' : (i % 2 === 0 ? 'rgba(255,255,255,0.008)' : 'rgba(0,0,0,0.015)'),
                        borderLeft: isFocused ? '2px solid #f59e0b' : undefined,
                        boxShadow: isFocused ? 'inset 0 0 12px rgba(245,158,11,0.02)' : undefined,
                      }}
                    >
                      {/* Municipality */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold whitespace-nowrap transition-colors duration-200 ${isFocused ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'}`}>
                            {muni.name}
                          </span>
                          <div className="hidden sm:block h-1 w-10 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(sparkWidth / 60) * 100}%`, backgroundColor: '#F59E0B' }} />
                          </div>
                          <svg className="w-3 h-3 text-slate-700 group-hover:text-amber-500/50 transition-colors duration-200 ml-auto opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </td>

                      {/* Capita Drain */}
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: '#F59E0B' }}>
                        {fmt(muni.totalPerCapitaDrain, true)}
                      </td>

                      {/* Tax Leakage */}
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#d4a84b' }}>
                        {fmt(muni.uncollectedLeakage, true)}
                      </td>

                      {/* Welfare */}
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#F43F5E' }}>
                        {fmt(muni.welfareBurden, true)}
                      </td>

                      {/* Annual Drain */}
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums" style={{ color: '#F43F5E' }}>
                        {fmt(muni.totalYearlyDrain / 1_000_000, false)}
                      </td>

                      {/* Unemployed */}
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#38bdf8' }}>
                        {(() => {
                          const ud = UNEMPLOYMENT_DATA[muni.id];
                          if (!ud) return '—';
                          const fiscalLoss = ud.registered * FISCAL_LOSS_PER_UNEMPLOYED.totalAnnual;
                          return <>{ud.registered.toLocaleString()} <span className="text-[10px] text-slate-600">/ ${Math.round(fiscalLoss / muni.workingAgePop).toLocaleString()}pc</span></>;
                        })()}
                      </td>

                      {/* Structural — Shadow + Compliance stacked */}
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                            <div className="h-1 w-16 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full rounded-full bg-amber-500" style={{ width: `${muni.adjustedShadowEcon}%` }} />
                            </div>
                            <span className="text-[10px] tabular-nums" style={{ color: '#94a3b8' }}>{muni.adjustedShadowEcon}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                            <div className="h-1 w-16 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${muni.adjustedCompliance}%` }} />
                            </div>
                            <span className="text-[10px] tabular-nums" style={{ color: '#94a3b8' }}>{muni.adjustedCompliance}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Correction */}
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: applyCorrection ? '#10B981' : '#475569' }}>
                        {applyCorrection ? `$${muni.corporateRetraction.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ════════════════════════════════════════ */}
        {/* FOOTER                                    */}
        {/* ════════════════════════════════════════ */}
        <footer className="mt-14 py-8 border-t border-slate-800/60 text-center">
          <p className="font-mono text-xs text-slate-500 tracking-wide">
            Open Fiscal Matrix for North Macedonia &middot; Sources: Treasury 2025 (open.finance.gov.mk) · SSO Census 2021 · AVRM Employment Registry · Finance Think PS#50
          </p>
        </footer>
      </main>

      {/* ════════════════════════════════════════ */}
      {/* SLIDE-OUT PANEL — Focused municipality    */}
      {/* ════════════════════════════════════════ */}
      {focusedMuni && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ease-in-out cursor-pointer"
            style={{ opacity: 1 }}
            onClick={() => setFocusedMuniId(null)}
          />

          <div
            className={`
              fixed top-0 right-0 h-screen w-[380px] max-w-full
              bg-[#243047]/98 backdrop-blur-2xl border-l border-slate-800/60
              z-50 transition-transform duration-500 ease-in-out
              overflow-y-auto
            `}
            style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.5)' }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setFocusedMuniId(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-lg
                         text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200
                         focus:shadow-[0_0_0_3px_rgba(99,102,241,0.3)] focus:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="p-6 pt-12">
              <div className="mb-6">
                <h3 className="text-xl font-bold font-mono text-white tracking-tight">
                  {focusedMuni.name}
                </h3>
                <p className="text-xs font-mono mt-1" style={{ color: '#64748b' }}>
                  {(() => {
                    const c = focusedMuni.adjustedCompliance;
                    if (c >= 70) return 'High Compliance — Central City Profile';
                    if (c >= 55) return 'Moderate Compliance — Regional Center';
                    if (c >= 40) return 'Below Average — Secondary Settlement';
                    return 'Low Compliance — High-Leakage Municipality';
                  })()}
                </p>

                {/* Structural bias flags */}
                {focusedMuni && (() => {
                  const flags = [];
                  if (['aerodrom','karpos'].includes(focusedMuni.id)) {
                    flags.push('⚠️ Centralized Accounting Distortion — HQ registration inflates revenue');
                  }
                  const nf = NET_FISCAL[focusedMuni.id];
                  if (nf && nf.utilityDebt > 0) {
                    flags.push('⚠️ Off-Balance-Sheet Utility Debt — see detail below');
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
                <DonutChart data={focusedMuni} size={220} />
              </div>

              {/* Net Fiscal Balance */}
              {NET_FISCAL[focusedMuni.id] && (() => {
                const nf = NET_FISCAL[focusedMuni.id];
                const net = nf.revenueInflow - nf.budgetOutflow;
                const isGainer = net > 0;
                const withUtility = net - nf.utilityDebt;
                return (
                  <div className="mb-6">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#64748b' }}>Net Fiscal Balance</span>
                    <div className="text-2xl font-bold font-mono mt-1" style={{ color: isGainer ? '#10B981' : '#F59E0B' }}>
                      {fmt(net / MKD_PER_EUR / 1_000_000)}
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                      open.finance.gov.mk — Treasury 2025
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>Revenue Inflow</span>
                        <span style={{ color: '#F43F5E' }}>{fmt(nf.revenueInflow / MKD_PER_EUR / 1_000_000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>Budget Outflow</span>
                        <span style={{ color: '#F59E0B' }}>{fmt(nf.budgetOutflow / MKD_PER_EUR / 1_000_000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>Arrears</span>
                        <span style={{ color: '#ea580c' }}>{fmt(nf.arrears / MKD_PER_EUR / 1_000_000)}</span>
                      </div>
                      {nf.utilityDebt > 0 && (
                        <div className="flex justify-between">
                          <span style={{ color: '#94a3b8' }}>Utility Debt (off-balance)</span>
                          <span style={{ color: '#ea580c' }}>{fmt(nf.utilityDebt / MKD_PER_EUR / 1_000_000)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Breakdown Legend */}
              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#64748b' }}>
                  Breakdown
                </span>

                <div className="mt-2 space-y-1.5">
                  {[
                    { label: 'Leakage', value: focusedMuni.uncollectedLeakage, color: '#F59E0B' },
                    { label: 'Welfare', value: focusedMuni.welfareBurden, color: '#F43F5E' },
                    { label: 'Overhead', value: focusedMuni.complianceGapCost, color: '#3B82F6' },
                    ...(applyCorrection && focusedMuni.corporateRetraction > 0
                      ? [{ label: 'Correction', value: -focusedMuni.corporateRetraction, color: '#10B981' }]
                      : []),
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-mono text-slate-400">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold font-mono" style={{ color: item.color }}>
                        {showMkd ? 'MKD ' + Math.round(Math.abs(item.value) * 61.66).toLocaleString() : (item.value >= 0 ? '$' : '-$') + Math.abs(item.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mb-4" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-slate-400">Total Drain</span>
                <span className="text-lg font-bold font-mono" style={{ color: '#F59E0B' }}>
                  {`$${focusedMuni.totalPerCapitaDrain.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS animations */}
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

        .kpi-tile-enter {
          animation: fade-in-up 0.5s ease-out both;
        }
        .kpi-tile-enter:nth-child(1) { animation-delay: 0ms; }
        .kpi-tile-enter:nth-child(2) { animation-delay: 80ms; }
        .kpi-tile-enter:nth-child(3) { animation-delay: 160ms; }
        .kpi-tile-enter:nth-child(4) { animation-delay: 240ms; }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0B1120;
          box-shadow: 0 0 8px rgba(0,0,0,0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 12px rgba(255,255,255,0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0B1120;
          box-shadow: 0 0 8px rgba(0,0,0,0.4);
        }

        input[type='range']:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.3);
        }
      `}</style>
    </div>
  );
}
