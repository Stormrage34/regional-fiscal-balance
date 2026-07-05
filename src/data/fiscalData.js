// ───────────────────────────────────────────────────────────────
// HARDCODED ECONOMETRIC BASELINE DATA
// ───────────────────────────────────────────────────────────────

export const CONSTANTS = {
  nationalGdpPerCapita: 8588,        // SSO 2024 preliminary: €8,588
  avgGrossSalary: 1147,               // SSO Dec 2025: MKD 70,520 / 61.66 ≈ €1,147 (current rate 61.66 MKD/EUR)
  avgNetSalary: 762,                  // SSO Dec 2025: MKD 46,889 ≈ €762
  shadowEconomyRange: { low: 0.213, high: 0.40 },  // was 0.336 — BTI 2026/Finance Think: 21%-40%
  perfectComplianceRevenueTarget: 1200,   // model assumption, no government source
  fixedOverhead: 600,                     // model assumption, no government source
};

// MKD per EUR — NBM mid-rate, stable peg (~61.5)
export const MKD_PER_EUR = 61.66;
// EUR per USD — current spot rate
export const EUR_USD = 1.15;

// ── Currency Formatting Utility ──
export const formatCurrency = (value, isPerCapita = false) => {
  if (value === undefined || value === null) return '—';
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(absValue);
  const sign = value < 0 ? '-' : '';
  if (isPerCapita) return `${sign}€${formatted}`;
  return `${sign}€${formatted}M`;
};

export const MUNICIPALITIES = [
  { id: 'lipkovo',       name: 'Lipkovo',       name_mk: 'Липково',       name_sq: 'Likovë',        workingAgePop: 14950, baseShadowEcon: 0.45, baseCompliance: 0.26, corporateDistortion: 0.10, welfareRate: 0.32 },
  // workingAgePop: 22308 total × 67% = ~14950 (was 18500 — pre-2021 estimate)
  // baseCompliance: 0.26 — CEA study range floor (26-83%, cea.org.mk, was 0.22)
  { id: 'aracinovo',     name: 'Aračinovo',     name_mk: 'Арачиново',     name_sq: 'Araçinovë',     workingAgePop: 8500,  baseShadowEcon: 0.52, baseCompliance: 0.26, corporateDistortion: 0.05, welfareRate: 0.40 },
  // workingAgePop: 12676 total × 67% = ~8500 (was 8200)
  // baseCompliance: 0.26 — CEA study range floor (26-83%, cea.org.mk, was 0.15)
  { id: 'tetovo',        name: 'Tetovo',        name_mk: 'Тетово',        name_sq: 'Tetovë',        workingAgePop: 56800, baseShadowEcon: 0.38, baseCompliance: 0.40, corporateDistortion: 0.65, welfareRate: 0.18 },
  // workingAgePop: 84770 total × 67% = ~56800 (was 56000)
  // baseCompliance: 0.40 — unchanged within CEA range
  { id: 'gostivar',      name: 'Gostivar',      name_mk: 'Гостивар',      name_sq: 'Gostivar',      workingAgePop: 40000, baseShadowEcon: 0.36, baseCompliance: 0.45, corporateDistortion: 0.55, welfareRate: 0.16 },
  // workingAgePop: 59770 total × 67% = ~40000 (was 42000)
  // baseCompliance: 0.45 — unchanged within CEA range
  { id: 'aerodrom',      name: 'Aerodrom',      name_mk: 'Аеродром',      name_sq: 'Aerodrom',      workingAgePop: 52100, baseShadowEcon: 0.15, baseCompliance: 0.83, corporateDistortion: 0.90, welfareRate: 0.04 },
  // workingAgePop: 77735 total × 67% = ~52100 (was 52000)
  // baseCompliance: 0.83 — CEA observed ceiling is 83% (cea.org.mk), was 0.88
  { id: 'karpos',        name: 'Karpoš',        name_mk: 'Карпош',        name_sq: 'Karposh',       workingAgePop: 42700, baseShadowEcon: 0.14, baseCompliance: 0.83, corporateDistortion: 0.95, welfareRate: 0.03 },
  // workingAgePop: 63760 total × 67% = ~42700 (was 44000)
  // baseCompliance: 0.83 — CEA observed ceiling is 83% (cea.org.mk), was 0.90
  { id: 'bitola',        name: 'Bitola',        name_mk: 'Битола',        name_sq: 'Bitolë',        workingAgePop: 57100, baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.45, welfareRate: 0.08 },
  // workingAgePop: 85164 total × 67% = ~57100 (was 61000)
  // baseCompliance: 0.65 — CEA mid-upper range (26-83%, was 0.78)
  { id: 'stip',          name: 'Štip',          name_mk: 'Штип',          name_sq: 'Shtip',         workingAgePop: 30100, baseShadowEcon: 0.20, baseCompliance: 0.60, corporateDistortion: 0.40, welfareRate: 0.07 },
  // workingAgePop: 44866 total × 67% = ~30100 (was 34000)
  // baseCompliance: 0.60 — CEA mid-upper range (was 0.82)
  // ── New municipalities ──
  { id: 'kumanovo',      name: 'Kumanovo',      name_mk: 'Куманово',      name_sq: 'Kumanovë',      workingAgePop: 65700, baseShadowEcon: 0.28, baseCompliance: 0.52, corporateDistortion: 0.40, welfareRate: 0.14 },
  { id: 'prilep',        name: 'Prilep',        name_mk: 'Прилеп',        name_sq: 'Prilep',        workingAgePop: 46247, baseShadowEcon: 0.26, baseCompliance: 0.55, corporateDistortion: 0.35, welfareRate: 0.12 },
  { id: 'ohrid',         name: 'Ohrid',         name_mk: 'Охрид',         name_sq: 'Ohër',          workingAgePop: 34500, baseShadowEcon: 0.18, baseCompliance: 0.72, corporateDistortion: 0.50, welfareRate: 0.06 },
  { id: 'struga',        name: 'Struga',        name_mk: 'Струга',        name_sq: 'Strugë',        workingAgePop: 34157, baseShadowEcon: 0.24, baseCompliance: 0.62, corporateDistortion: 0.35, welfareRate: 0.10 },
  { id: 'veles',         name: 'Veles',         name_mk: 'Велес',         name_sq: 'Veles',         workingAgePop: 32000, baseShadowEcon: 0.25, baseCompliance: 0.58, corporateDistortion: 0.30, welfareRate: 0.11 },
  { id: 'strumica',      name: 'Strumica',      name_mk: 'Струмица',      name_sq: 'Strumicë',      workingAgePop: 33497, baseShadowEcon: 0.29, baseCompliance: 0.55, corporateDistortion: 0.25, welfareRate: 0.11 },
  { id: 'kavadarci',     name: 'Kavadarci',     name_mk: 'Кавадарци',     name_sq: 'Kavadarc',      workingAgePop: 23600, baseShadowEcon: 0.23, baseCompliance: 0.60, corporateDistortion: 0.30, welfareRate: 0.09 },
  { id: 'kocani',        name: 'Kočani',        name_mk: 'Кочани',        name_sq: 'Koçan',         workingAgePop: 20500, baseShadowEcon: 0.31, baseCompliance: 0.48, corporateDistortion: 0.22, welfareRate: 0.13 },
  { id: 'kicevo',        name: 'Kičevo',        name_mk: 'Кичево',        name_sq: 'Kërçovë',       workingAgePop: 26500, baseShadowEcon: 0.33, baseCompliance: 0.42, corporateDistortion: 0.25, welfareRate: 0.16 },
  { id: 'radovis',       name: 'Radoviš',       name_mk: 'Радовиш',       name_sq: 'Radovish',      workingAgePop: 16162, baseShadowEcon: 0.34, baseCompliance: 0.45, corporateDistortion: 0.18, welfareRate: 0.15 },
  { id: 'gevgelija',     name: 'Gevgelija',     name_mk: 'Гевгелија',     name_sq: 'Gjevgjeli',     workingAgePop: 14200, baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.40, welfareRate: 0.08 },
  { id: 'debar',         name: 'Debar',         name_mk: 'Дебар',         name_sq: 'Dibër',         workingAgePop: 10326, baseShadowEcon: 0.36, baseCompliance: 0.32, corporateDistortion: 0.12, welfareRate: 0.22 },
  // ── Skopje municipalities ──
  { id: 'centar',        name: 'Centar',        name_mk: 'Центар',        name_sq: 'Qendër',        workingAgePop: 29408, baseShadowEcon: 0.10, baseCompliance: 0.90, corporateDistortion: 0.95, welfareRate: 0.02 },
  // pop=43893 × 67% = 29408; business/administrative center of Skopje
  { id: 'gazi-baba',     name: 'Gazi Baba',     name_mk: 'Гази Баба',     name_sq: 'Gazi Babë',     workingAgePop: 46650, baseShadowEcon: 0.16, baseCompliance: 0.80, corporateDistortion: 0.82, welfareRate: 0.04 },
  // pop=69626 × 67% = 46650; industrial zone east of Skopje
  { id: 'kisela-voda',   name: 'Kisela Voda',   name_mk: 'Кисела Вода',   name_sq: 'Kiselë Vodë',   workingAgePop: 41517, baseShadowEcon: 0.15, baseCompliance: 0.82, corporateDistortion: 0.88, welfareRate: 0.04 },
  // pop=61965 × 67% = 41517; residential suburb south of Skopje
  { id: 'butel',         name: 'Butel',         name_mk: 'Бутел',         name_sq: 'Butel',         workingAgePop: 25439, baseShadowEcon: 0.18, baseCompliance: 0.78, corporateDistortion: 0.75, welfareRate: 0.05 },
  // pop=37968 × 67% = 25439; northern Skopje suburb
  { id: 'cair',          name: 'Čair',          name_mk: 'Чаир',          name_sq: 'Çair',          workingAgePop: 41933, baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.45, welfareRate: 0.10 },
  // pop=62586 × 67% = 41933; old bazaar area, mixed residential
  { id: 'gjorce-petrov', name: 'Gjorče Petrov', name_mk: 'Ѓорче Петров',  name_sq: 'Gjorçe Petrov', workingAgePop: 30045, baseShadowEcon: 0.16, baseCompliance: 0.80, corporateDistortion: 0.80, welfareRate: 0.04 },
  // pop=44844 × 67% = 30045; western Skopje suburb
  { id: 'saraj',         name: 'Saraj',         name_mk: 'Сарај',         name_sq: 'Saraj',         workingAgePop: 25727, baseShadowEcon: 0.28, baseCompliance: 0.55, corporateDistortion: 0.35, welfareRate: 0.12 },
  // pop=38399 × 67% = 25727; western rural Skopje
  { id: 'suto-orizari',  name: 'Šuto Orizari',  name_mk: 'Шуто Оризари',  name_sq: 'Shuto Orizar',  workingAgePop: 17236, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.20, welfareRate: 0.18 },
  // pop=25726 × 67% = 17236; northern Roma-majority suburb
];

// ── NET FISCAL IMPACT DATA (open.finance.gov.mk, 2025, TREASURY TRANSACTIONAL) ──
// Formula: Net Impact = Basic Budget Expenditure − Central Government Grant Expenditure
// Source: Ministry of Finance — Open Finance Portal Treasury archives
// revenueInflow = total realized expenditure from basic budget (own-source + VAT grants balancing)
// budgetOutflow = total realized expenditure from central government grants
// Arrears/utility debt: not available in 2025 source
export const NET_FISCAL = {
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

export const UNEMPLOYMENT_DATA = {
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

export const FISCAL_LOSS_PER_UNEMPLOYED = {
  forgonePIT: 715,            // USD/year (lost income tax)
  forgoneSSC: 3471,           // USD/year (lost social contributions)
  welfareSFA: 1072,           // USD/year (GMP MKD 5,445/mo ≈ $1,072/yr)
  healthCoverage: 552,        // USD/year (health insurance 7.5% of gross salary)
  totalAnnual: 5810,          // USD/year per unemployed person
};

// ── Locale-aware municipality name ──
export function getMuniName(muni, locale) {
  if (locale === 'mk' && muni.name_mk) return muni.name_mk;
  if (locale === 'sq' && muni.name_sq) return muni.name_sq;
  return muni.name;
}
