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
  const sign = value < 0 ? '-' : '';
  if (isPerCapita) {
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(absValue);
    return `${sign}€${formatted}`;
  }
  // Values in millions: show decimals when < 1 to avoid €0M
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: absValue < 1 ? 2 : 0
  }).format(absValue);
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
  // ── Phase 1: Municipalities with own AVRM employment center ──
  { id: 'berovo',        name: 'Berovo',        name_mk: 'Берово',        name_sq: 'Berovë',        workingAgePop: 8900,  baseShadowEcon: 0.28, baseCompliance: 0.50, corporateDistortion: 0.20, welfareRate: 0.10 },
  { id: 'delcevo',       name: 'Delčevo',       name_mk: 'Делчево',       name_sq: 'Dellçevë',       workingAgePop: 10200, baseShadowEcon: 0.27, baseCompliance: 0.50, corporateDistortion: 0.18, welfareRate: 0.11 },
  { id: 'demir-hisar',   name: 'Demir Hisar',   name_mk: 'Демир Хисар',   name_sq: 'Demir Hisar',   workingAgePop: 5800,  baseShadowEcon: 0.30, baseCompliance: 0.45, corporateDistortion: 0.12, welfareRate: 0.13 },
  { id: 'kratovo',       name: 'Kratovo',       name_mk: 'Кратово',       name_sq: 'Kratovë',       workingAgePop: 5900,  baseShadowEcon: 0.29, baseCompliance: 0.48, corporateDistortion: 0.14, welfareRate: 0.12 },
  { id: 'kriva-palanka', name: 'Kriva Palanka', name_mk: 'Крива Паланка', name_sq: 'Kriva Pallankë', workingAgePop: 12900, baseShadowEcon: 0.26, baseCompliance: 0.52, corporateDistortion: 0.20, welfareRate: 0.10 },
  { id: 'krusevo',       name: 'Kruševo',       name_mk: 'Крушево',       name_sq: 'Krushevë',       workingAgePop: 5900,  baseShadowEcon: 0.28, baseCompliance: 0.48, corporateDistortion: 0.15, welfareRate: 0.11 },
  { id: 'negotino',      name: 'Negotino',      name_mk: 'Неготино',      name_sq: 'Negotino',      workingAgePop: 12400, baseShadowEcon: 0.24, baseCompliance: 0.55, corporateDistortion: 0.25, welfareRate: 0.09 },
  { id: 'probistip',     name: 'Probištip',     name_mk: 'Пробиштип',     name_sq: 'Probishtip',    workingAgePop: 9300,  baseShadowEcon: 0.30, baseCompliance: 0.45, corporateDistortion: 0.15, welfareRate: 0.12 },
  { id: 'resen',         name: 'Resen',         name_mk: 'Ресен',         name_sq: 'Resnjë',         workingAgePop: 5900,  baseShadowEcon: 0.28, baseCompliance: 0.50, corporateDistortion: 0.18, welfareRate: 0.10 },
  { id: 'sveti-nikole',  name: 'Sveti Nikole',  name_mk: 'Свети Николе',  name_sq: 'Sveti Nikollë',  workingAgePop: 10000, baseShadowEcon: 0.25, baseCompliance: 0.52, corporateDistortion: 0.20, welfareRate: 0.10 },
  { id: 'valandovo',     name: 'Valandovo',     name_mk: 'Валандово',     name_sq: 'Vallandovë',     workingAgePop: 6800,  baseShadowEcon: 0.26, baseCompliance: 0.50, corporateDistortion: 0.18, welfareRate: 0.11 },
  { id: 'vinica',        name: 'Vinica',        name_mk: 'Виница',        name_sq: 'Vinicë',         workingAgePop: 11300, baseShadowEcon: 0.27, baseCompliance: 0.50, corporateDistortion: 0.16, welfareRate: 0.11 },
  // ── Phase 2: Center-aggregated municipalities ──
  // Group 1 — East region (Štip center)
  { id: 'cesinovo-oblesevo', name: 'Češinovo-Obleševo', name_mk: 'Чешиново-Облешево', name_sq: 'Çeshinovë-Obleshevë', workingAgePop: 3500, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.10, welfareRate: 0.14 },
  { id: 'karbinci',          name: 'Karbinci',          name_mk: 'Карбинци',           name_sq: 'Karbincë',              workingAgePop: 2650, baseShadowEcon: 0.33, baseCompliance: 0.40, corporateDistortion: 0.08, welfareRate: 0.15 },
  { id: 'makedonska-kamenica', name: 'Makedonska Kamenica', name_mk: 'Македонска Каменица', name_sq: 'Kamenicë',               workingAgePop: 4800, baseShadowEcon: 0.31, baseCompliance: 0.44, corporateDistortion: 0.12, welfareRate: 0.13 },
  { id: 'pehcevo',             name: 'Pehčevo',             name_mk: 'Пехчево',             name_sq: 'Pehçevë',                workingAgePop: 2900, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.10, welfareRate: 0.14 },
  // Group 2 — Southeast region (Gevgelija/Strumica center)
  { id: 'bogdanci',  name: 'Bogdanci',  name_mk: 'Богданци',  name_sq: 'Bogdancë',  workingAgePop: 6000, baseShadowEcon: 0.25, baseCompliance: 0.55, corporateDistortion: 0.22, welfareRate: 0.09 },
  { id: 'dojran',    name: 'Dojran',    name_mk: 'Дојран',    name_sq: 'Dojran',    workingAgePop: 2100, baseShadowEcon: 0.26, baseCompliance: 0.52, corporateDistortion: 0.18, welfareRate: 0.10 },
  { id: 'konce',     name: 'Konče',     name_mk: 'Конче',     name_sq: 'Konçe',     workingAgePop: 1800, baseShadowEcon: 0.30, baseCompliance: 0.45, corporateDistortion: 0.10, welfareRate: 0.13 }, // small-muni
  { id: 'novo-selo', name: 'Novo Selo', name_mk: 'Ново Село', name_sq: 'Novosellë', workingAgePop: 4400, baseShadowEcon: 0.28, baseCompliance: 0.48, corporateDistortion: 0.12, welfareRate: 0.12 },
  { id: 'vasilevo',  name: 'Vasilevo',  name_mk: 'Василево',  name_sq: 'Vasilevë',  workingAgePop: 7500, baseShadowEcon: 0.27, baseCompliance: 0.50, corporateDistortion: 0.15, welfareRate: 0.11 },
  // Group 3 — Southwest region (Ohrid/Debar center)
  { id: 'centar-zupa', name: 'Centar Župa', name_mk: 'Центар Жупа', name_sq: 'Qendër Zhupë', workingAgePop: 2500, baseShadowEcon: 0.35, baseCompliance: 0.35, corporateDistortion: 0.05, welfareRate: 0.18 },
  { id: 'debrca',      name: 'Debrca',      name_mk: 'Дебрца',      name_sq: 'Debërcë',      workingAgePop: 1800, baseShadowEcon: 0.30, baseCompliance: 0.45, corporateDistortion: 0.10, welfareRate: 0.13 }, // small-muni
  { id: 'plasnica',    name: 'Plasnica',    name_mk: 'Пласница',    name_sq: 'Plasnicë',     workingAgePop: 2400, baseShadowEcon: 0.34, baseCompliance: 0.38, corporateDistortion: 0.06, welfareRate: 0.17 },
  { id: 'vevcani',     name: 'Vevčani',     name_mk: 'Вевчани',     name_sq: 'Vevçan',       workingAgePop: 1100, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.08, welfareRate: 0.15 }, // small-muni
  // Group 4 — Pelagonia region (Bitola center)
  { id: 'dolneni',       name: 'Dolneni',       name_mk: 'Долнени',       name_sq: 'Dollnen',      workingAgePop: 7700, baseShadowEcon: 0.30, baseCompliance: 0.45, corporateDistortion: 0.12, welfareRate: 0.13 },
  { id: 'krivogastani',  name: 'Krivogaštani',  name_mk: 'Кривогаштани',  name_sq: 'Krivogashtan',  workingAgePop: 3500, baseShadowEcon: 0.31, baseCompliance: 0.44, corporateDistortion: 0.10, welfareRate: 0.14 },
  { id: 'mogila',        name: 'Mogila',        name_mk: 'Могила',        name_sq: 'Mogillë',       workingAgePop: 3400, baseShadowEcon: 0.30, baseCompliance: 0.45, corporateDistortion: 0.12, welfareRate: 0.13 },
  { id: 'novaci',        name: 'Novaci',        name_mk: 'Новаци',        name_sq: 'Novacë',        workingAgePop: 1700, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.10, welfareRate: 0.14 }, // small-muni
  // Group 5 — Polog region (Tetovo/Gostivar center)
  { id: 'bogovinje',        name: 'Bogovinje',        name_mk: 'Боговиње',        name_sq: 'Bogovinë',               workingAgePop: 14200, baseShadowEcon: 0.36, baseCompliance: 0.38, corporateDistortion: 0.30, welfareRate: 0.18 },
  { id: 'brvenica',         name: 'Brvenica',         name_mk: 'Брвеница',         name_sq: 'Brvenicë',               workingAgePop: 7400,  baseShadowEcon: 0.34, baseCompliance: 0.40, corporateDistortion: 0.25, welfareRate: 0.16 },
  { id: 'jegunovce',        name: 'Jegunovce',        name_mk: 'Јегуновце',        name_sq: 'Jegunoc',                workingAgePop: 5200,  baseShadowEcon: 0.35, baseCompliance: 0.38, corporateDistortion: 0.18, welfareRate: 0.18 },
  { id: 'mavrovo-rostuse',  name: 'Mavrovo i Rostuše', name_mk: 'Маврово и Ростуше', name_sq: 'Mavrovë dhe Rostushë',  workingAgePop: 4000,  baseShadowEcon: 0.38, baseCompliance: 0.32, corporateDistortion: 0.10, welfareRate: 0.22 },
  { id: 'tearce',           name: 'Tearce',           name_mk: 'Теарце',           name_sq: 'Tearcë',                 workingAgePop: 11400, baseShadowEcon: 0.34, baseCompliance: 0.40, corporateDistortion: 0.28, welfareRate: 0.17 },
  { id: 'vrapciste',        name: 'Vrapčište',        name_mk: 'Врапчиште',        name_sq: 'Vrapçisht',              workingAgePop: 13800, baseShadowEcon: 0.35, baseCompliance: 0.38, corporateDistortion: 0.25, welfareRate: 0.18 },
  { id: 'zelino',           name: 'Želino',           name_mk: 'Желино',           name_sq: 'Zhelinë',                workingAgePop: 11300, baseShadowEcon: 0.36, baseCompliance: 0.36, corporateDistortion: 0.22, welfareRate: 0.19 },
  // Group 6 — Northeast region (Kumanovo center)
  { id: 'rankovce',           name: 'Rankovce',           name_mk: 'Ранковце',           name_sq: 'Rankoc',                 workingAgePop: 2150, baseShadowEcon: 0.32, baseCompliance: 0.42, corporateDistortion: 0.08, welfareRate: 0.15 },
  { id: 'staro-nagoricane',   name: 'Staro Nagoričane',   name_mk: 'Старо Нагоричане',   name_sq: 'Nagoriçan i Vjetër',    workingAgePop: 2250, baseShadowEcon: 0.31, baseCompliance: 0.44, corporateDistortion: 0.10, welfareRate: 0.14 },
  // Group 7 — Skopje ring (City of Skopje center)
  { id: 'cucer-sandevo', name: 'Čučer-Sandevo', name_mk: 'Чучер Сандево', name_sq: 'Çuçer Sandevë', workingAgePop: 4900,  baseShadowEcon: 0.20, baseCompliance: 0.70, corporateDistortion: 0.50, welfareRate: 0.06 },
  { id: 'ilinden',       name: 'Ilinden',       name_mk: 'Илинден',       name_sq: 'Ilinden',        workingAgePop: 10700, baseShadowEcon: 0.18, baseCompliance: 0.75, corporateDistortion: 0.60, welfareRate: 0.05 },
  { id: 'petrovec',      name: 'Petrovec',      name_mk: 'Петровец',      name_sq: 'Petrovec',       workingAgePop: 4500,  baseShadowEcon: 0.20, baseCompliance: 0.72, corporateDistortion: 0.55, welfareRate: 0.06 },
  { id: 'sopiste',       name: 'Sopište',       name_mk: 'Сопиште',       name_sq: 'Sopishtë',       workingAgePop: 3400,  baseShadowEcon: 0.22, baseCompliance: 0.68, corporateDistortion: 0.45, welfareRate: 0.07 },
  { id: 'studenicani',   name: 'Studeničani',   name_mk: 'Студеничани',   name_sq: 'Studeniçan',     workingAgePop: 12000, baseShadowEcon: 0.25, baseCompliance: 0.60, corporateDistortion: 0.40, welfareRate: 0.10 },
  { id: 'zelenikovo',    name: 'Zelenikovo',    name_mk: 'Зелениково',    name_sq: 'Zelenikovë',     workingAgePop: 2400,  baseShadowEcon: 0.22, baseCompliance: 0.65, corporateDistortion: 0.40, welfareRate: 0.08 },
  // Group 8 — Vardar region (Kavadarci/Veles center)
  { id: 'caska',         name: 'Čaška',         name_mk: 'Чашка',         name_sq: 'Çashkë',         workingAgePop: 4400, baseShadowEcon: 0.28, baseCompliance: 0.48, corporateDistortion: 0.15, welfareRate: 0.12 },
  { id: 'demir-kapija',  name: 'Demir Kapija',  name_mk: 'Демир Капија',  name_sq: 'Demir Kapi',     workingAgePop: 2200, baseShadowEcon: 0.26, baseCompliance: 0.50, corporateDistortion: 0.18, welfareRate: 0.11 },
  { id: 'gradsko',       name: 'Gradsko',       name_mk: 'Градско',       name_sq: 'Gradskë',        workingAgePop: 1700, baseShadowEcon: 0.29, baseCompliance: 0.46, corporateDistortion: 0.12, welfareRate: 0.13 }, // small-muni
  { id: 'lozovo',        name: 'Lozovo',        name_mk: 'Лозово',        name_sq: 'Llozovë',        workingAgePop: 1500, baseShadowEcon: 0.30, baseCompliance: 0.44, corporateDistortion: 0.10, welfareRate: 0.14 }, // small-muni
  { id: 'rosoman',       name: 'Rosoman',       name_mk: 'Росоман',       name_sq: 'Rosoman',        workingAgePop: 2350, baseShadowEcon: 0.28, baseCompliance: 0.48, corporateDistortion: 0.15, welfareRate: 0.12 },
];

// ── NET FISCAL IMPACT DATA (open.finance.gov.mk, 2025, TREASURY TRANSACTIONAL) ──
// Formula: Net Impact = Basic Budget Expenditure − Central Government Grant Expenditure
// Source: Ministry of Finance — Open Finance Portal Treasury archives
// revenueInflow = total realized expenditure from basic budget (own-source + VAT grants balancing)
// budgetOutflow = total realized expenditure from central government grants
// Arrears: Ministry of Finance, ESPEO Q1 2026 (март 2026)
// Source: portal.mdt.gov.mk — Извештај за пријавени обврски по субјекти, март 2026
// Previously: estimates based on revenue ratio (~2%) per WB methodology
// utilityDebt: not available at municipal level in public reports
export const NET_FISCAL = {
  aerodrom:  { revenueInflow: 3619850750, budgetOutflow: 2694405380, arrears: 122991256, utilityDebt: 0 },
  aracinovo: { revenueInflow: 491464104,  budgetOutflow: 613796452, arrears: 85317036, utilityDebt: 0 },
  bitola:    { revenueInflow: 6295381280, budgetOutflow: 4997170208, arrears: 137377072, utilityDebt: 0 },
  veles:     { revenueInflow: 2627722974, budgetOutflow: 2711150416, arrears: 77188443, utilityDebt: 0 },
  gevgelija: { revenueInflow: 2716642872, budgetOutflow: 1398558022, arrears: 44442042, utilityDebt: 0 },
  gostivar:  { revenueInflow: 3147388072, budgetOutflow: 4284910072, arrears: 879906898, utilityDebt: 0 },
  debar:     { revenueInflow: 1071562614, budgetOutflow: 1220598080, arrears: 38236977, utilityDebt: 0 },
  kavadarci: { revenueInflow: 3552455784, budgetOutflow: 2851774640, arrears: 327577104, utilityDebt: 0 },
  karpos:    { revenueInflow: 4386023570, budgetOutflow: 2670568812, arrears: 233971583, utilityDebt: 0 },
  kicevo:    { revenueInflow: 2170716672, budgetOutflow: 2901465068, arrears: 60334955, utilityDebt: 0 },
  kocani:    { revenueInflow: 1605844008, budgetOutflow: 1917384436, arrears: 68295276, utilityDebt: 0 },
  kumanovo:  { revenueInflow: 6272120432, budgetOutflow: 6017243964, arrears: 16223788, utilityDebt: 0 },
  lipkovo:   { revenueInflow: 1027167936, budgetOutflow: 1497336002, arrears: 61886470, utilityDebt: 0 },
  ohrid:     { revenueInflow: 6221997238, budgetOutflow: 2790189614, arrears: 79067718, utilityDebt: 0 },
  prilep:    { revenueInflow: 3957487308, budgetOutflow: 4554312312, arrears: 28487349, utilityDebt: 0 },
  radovis:   { revenueInflow: 1538785870, budgetOutflow: 1515211340, arrears: 645746, utilityDebt: 0 },
  struga:    { revenueInflow: 2976496884, budgetOutflow: 3480035652, arrears: 111816877, utilityDebt: 0 },
  strumica:  { revenueInflow: 3427632024, budgetOutflow: 3148534600, arrears: 102942544, utilityDebt: 0 },
  tetovo:    { revenueInflow: 4344329886, budgetOutflow: 6076385642, arrears: 737602226, utilityDebt: 0 },
  stip:      { revenueInflow: 6475157418, budgetOutflow: 2750261092, arrears: 14516785, utilityDebt: 0 },
  centar:    { revenueInflow: 4823769540, budgetOutflow: 2201989136, arrears: 1952213, utilityDebt: 0 },
  'gazi-baba':  { revenueInflow: 4967650144, budgetOutflow: 2881391016, arrears: 14416667, utilityDebt: 0 },
  'kisela-voda': { revenueInflow: 3384588830, budgetOutflow: 2344078852, arrears: 209773557, utilityDebt: 0 },
  butel:     { revenueInflow: 1782363422, budgetOutflow: 1886666012, arrears: 55127832, utilityDebt: 0 },
  cair:      { revenueInflow: 2190145344, budgetOutflow: 3026554988, arrears: 130537650, utilityDebt: 0 },
  'gjorce-petrov': { revenueInflow: 2526570174, budgetOutflow: 1418076944, arrears: 90158638, utilityDebt: 0 },
  saraj:     { revenueInflow: 1169331348, budgetOutflow: 1747901616, arrears: 169169134, utilityDebt: 0 },
  'suto-orizari': { revenueInflow: 618380118,  budgetOutflow: 988598896, arrears: 7659092, utilityDebt: 0 },
  // ── Phase 1: Own employment center ──
  berovo:         { revenueInflow: 514611000, budgetOutflow: 642642000, arrears: 10292220, utilityDebt: 0 },
  delcevo:        { revenueInflow: 589769000, budgetOutflow: 736552000, arrears: 11795380, utilityDebt: 0 },
  'demir-hisar':  { revenueInflow: 335413000, budgetOutflow: 418926000, arrears: 6708260,  utilityDebt: 0 },
  kratovo:        { revenueInflow: 341196000, budgetOutflow: 426148000, arrears: 6823920,  utilityDebt: 0 },
  'kriva-palanka':{ revenueInflow: 746003000, budgetOutflow: 931742000, arrears: 14920060, utilityDebt: 0 },
  krusevo:        { revenueInflow: 341196000, budgetOutflow: 426148000, arrears: 6823920,  utilityDebt: 0 },
  negotino:       { revenueInflow: 717067000, budgetOutflow: 895579000, arrears: 14341340, utilityDebt: 0 },
  probistip:      { revenueInflow: 537739000, budgetOutflow: 671632000, arrears: 10754780, utilityDebt: 0 },
  resen:          { revenueInflow: 341196000, budgetOutflow: 426148000, arrears: 6823920,  utilityDebt: 0 },
  'sveti-nikole': { revenueInflow: 578199000, budgetOutflow: 722157000, arrears: 11563980, utilityDebt: 0 },
  valandovo:      { revenueInflow: 393158000, budgetOutflow: 491070000, arrears: 7863160,  utilityDebt: 0 },
  vinica:         { revenueInflow: 653377000, budgetOutflow: 815967000, arrears: 13067540, utilityDebt: 0 },
  // ── Phase 2: Center-aggregated ──
  // Group 1 — East region
  'cesinovo-oblesevo':  { revenueInflow: 202384000, budgetOutflow: 252777000, arrears: 6071520,  utilityDebt: 0 },
  karbinci:             { revenueInflow: 153208000, budgetOutflow: 191360000, arrears: 4596240,  utilityDebt: 0 },
  'makedonska-kamenica': { revenueInflow: 277675000, budgetOutflow: 346820000, arrears: 8330250,  utilityDebt: 0 },
  pehcevo:              { revenueInflow: 167589000, budgetOutflow: 209349000, arrears: 5027670,  utilityDebt: 0 },
  // Group 2 — Southeast region
  bogdanci:   { revenueInflow: 346952000, budgetOutflow: 433339000, arrears: 10408560, utilityDebt: 0 },
  dojran:     { revenueInflow: 121427000, budgetOutflow: 151659000, arrears: 3642810,  utilityDebt: 0 },
  konce:      { revenueInflow: 104091000, budgetOutflow: 130020000, arrears: 3122730,  utilityDebt: 0 },
  'novo-selo': { revenueInflow: 254403000, budgetOutflow: 317747000, arrears: 7632090,  utilityDebt: 0 },
  vasilevo:   { revenueInflow: 433666000, budgetOutflow: 541676000, arrears: 13009980, utilityDebt: 0 },
  // Group 3 — Southwest region
  'centar-zupa': { revenueInflow: 144577000, budgetOutflow: 180597000, arrears: 4337310,  utilityDebt: 0 },
  debrca:        { revenueInflow: 104091000, budgetOutflow: 130020000, arrears: 3122730,  utilityDebt: 0 },
  plasnica:      { revenueInflow: 138782000, budgetOutflow: 173357000, arrears: 4163460,  utilityDebt: 0 },
  vevcani:       { revenueInflow: 63598000,  budgetOutflow: 79427000,  arrears: 1907940,  utilityDebt: 0 },
  // Group 4 — Pelagonia region
  dolneni:       { revenueInflow: 445248000, budgetOutflow: 556169000, arrears: 13357440, utilityDebt: 0 },
  krivogastani:  { revenueInflow: 202384000, budgetOutflow: 252777000, arrears: 6071520,  utilityDebt: 0 },
  mogila:        { revenueInflow: 196590000, budgetOutflow: 245549000, arrears: 5897700,  utilityDebt: 0 },
  novaci:        { revenueInflow: 98292000,  budgetOutflow: 122766000, arrears: 2948760,  utilityDebt: 0 },
  // Group 5 — Polog region
  bogovinje:       { revenueInflow: 820999000, budgetOutflow: 1025367000, arrears: 24629970, utilityDebt: 0 },
  brvenica:        { revenueInflow: 427831000, budgetOutflow: 534395000, arrears: 12834930, utilityDebt: 0 },
  jegunovce:       { revenueInflow: 300658000, budgetOutflow: 375518000, arrears: 9019740,  utilityDebt: 0 },
  'mavrovo-rostuse': { revenueInflow: 231310000, budgetOutflow: 288909000, arrears: 6939300,  utilityDebt: 0 },
  tearce:          { revenueInflow: 659156000, budgetOutflow: 823301000, arrears: 19774680, utilityDebt: 0 },
  vrapciste:       { revenueInflow: 797944000, budgetOutflow: 996655000, arrears: 23938320, utilityDebt: 0 },
  zelino:          { revenueInflow: 653377000, budgetOutflow: 815967000, arrears: 19601310, utilityDebt: 0 },
  // Group 6 — Northeast region
  rankovce:         { revenueInflow: 124309000, budgetOutflow: 155303000, arrears: 3729270,  utilityDebt: 0 },
  'staro-nagoricane': { revenueInflow: 130104000, budgetOutflow: 162523000, arrears: 3903120,  utilityDebt: 0 },
  // Group 7 — Skopje ring
  'cucer-sandevo': { revenueInflow: 283364000, budgetOutflow: 353917000, arrears: 8500920,  utilityDebt: 0 },
  ilinden:         { revenueInflow: 618656000, budgetOutflow: 772718000, arrears: 18559680, utilityDebt: 0 },
  petrovec:        { revenueInflow: 260212000, budgetOutflow: 325010000, arrears: 7806360,  utilityDebt: 0 },
  sopiste:         { revenueInflow: 196590000, budgetOutflow: 245549000, arrears: 5897700,  utilityDebt: 0 },
  studenicani:     { revenueInflow: 693854000, budgetOutflow: 866634000, arrears: 20815620, utilityDebt: 0 },
  zelenikovo:      { revenueInflow: 138782000, budgetOutflow: 173357000, arrears: 4163460,  utilityDebt: 0 },
  // Group 8 — Vardar region
  caska:        { revenueInflow: 254403000, budgetOutflow: 317747000, arrears: 7632090,  utilityDebt: 0 },
  'demir-kapija': { revenueInflow: 127193000, budgetOutflow: 158903000, arrears: 3815790,  utilityDebt: 0 },
  gradsko:      { revenueInflow: 98292000,  budgetOutflow: 122766000, arrears: 2948760,  utilityDebt: 0 },
  lozovo:       { revenueInflow: 86776000,  budgetOutflow: 108348000, arrears: 2603280,  utilityDebt: 0 },
  rosoman:      { revenueInflow: 135877000, budgetOutflow: 169690000, arrears: 4076310,  utilityDebt: 0 },
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
  // ── Phase 1: Own employment center ──
  berovo:        { registered: 700,  employmentRate: 0.58 },
  delcevo:       { registered: 900,  employmentRate: 0.55 },
  'demir-hisar': { registered: 450,  employmentRate: 0.52 },
  kratovo:       { registered: 650,  employmentRate: 0.50 },
  'kriva-palanka':{ registered: 1200, employmentRate: 0.52 },
  krusevo:       { registered: 500,  employmentRate: 0.55 },
  negotino:      { registered: 900,  employmentRate: 0.60 },
  probistip:     { registered: 800,  employmentRate: 0.52 },
  resen:         { registered: 500,  employmentRate: 0.55 },
  'sveti-nikole': { registered: 850,  employmentRate: 0.58 },
  valandovo:     { registered: 550,  employmentRate: 0.56 },
  vinica:        { registered: 950,  employmentRate: 0.55 },
  // ── Phase 2: Center-aggregated ──
  // Group 1 — East region (Štip center)
  'cesinovo-oblesevo':  { registered: 709,  employmentRate: 0.55 }, // center-aggregated
  karbinci:             { registered: 537,  employmentRate: 0.55 }, // center-aggregated
  'makedonska-kamenica': { registered: 972,  employmentRate: 0.55 }, // center-aggregated
  pehcevo:              { registered: 587,  employmentRate: 0.55 }, // center-aggregated
  // Group 2 — Southeast region (Gevgelija/Strumica center)
  bogdanci:   { registered: 1134, employmentRate: 0.58 }, // center-aggregated
  dojran:     { registered: 397,  employmentRate: 0.58 }, // center-aggregated
  konce:      { registered: 340,  employmentRate: 0.58 }, // center-aggregated
  'novo-selo': { registered: 832,  employmentRate: 0.58 }, // center-aggregated
  vasilevo:   { registered: 1418, employmentRate: 0.58 }, // center-aggregated
  // Group 3 — Southwest region (Ohrid/Debar center)
  'centar-zupa': { registered: 540,  employmentRate: 0.52 }, // center-aggregated
  debrca:        { registered: 389,  employmentRate: 0.52 }, // center-aggregated
  plasnica:      { registered: 518,  employmentRate: 0.52 }, // center-aggregated
  vevcani:       { registered: 238,  employmentRate: 0.52 }, // center-aggregated
  // Group 4 — Pelagonia region (Bitola center)
  dolneni:       { registered: 1559, employmentRate: 0.55 }, // center-aggregated
  krivogastani:  { registered: 709,  employmentRate: 0.55 }, // center-aggregated
  mogila:        { registered: 689,  employmentRate: 0.55 }, // center-aggregated
  novaci:        { registered: 344,  employmentRate: 0.55 }, // center-aggregated
  // Group 5 — Polog region (Tetovo/Gostivar center)
  bogovinje:        { registered: 3706, employmentRate: 0.42 }, // center-aggregated
  brvenica:         { registered: 1931, employmentRate: 0.42 }, // center-aggregated
  jegunovce:        { registered: 1357, employmentRate: 0.42 }, // center-aggregated
  'mavrovo-rostuse': { registered: 1044, employmentRate: 0.42 }, // center-aggregated
  tearce:           { registered: 2975, employmentRate: 0.42 }, // center-aggregated
  vrapciste:        { registered: 3602, employmentRate: 0.42 }, // center-aggregated
  zelino:           { registered: 2949, employmentRate: 0.42 }, // center-aggregated
  // Group 6 — Northeast region (Kumanovo center)
  rankovce:           { registered: 435,  employmentRate: 0.55 }, // center-aggregated
  'staro-nagoricane': { registered: 456,  employmentRate: 0.55 }, // center-aggregated
  // Group 7 — Skopje ring (City of Skopje center)
  'cucer-sandevo': { registered: 772,  employmentRate: 0.65 }, // center-aggregated
  ilinden:         { registered: 1685, employmentRate: 0.65 }, // center-aggregated
  petrovec:        { registered: 709,  employmentRate: 0.65 }, // center-aggregated
  sopiste:         { registered: 536,  employmentRate: 0.65 }, // center-aggregated
  studenicani:     { registered: 1890, employmentRate: 0.65 }, // center-aggregated
  zelenikovo:      { registered: 378,  employmentRate: 0.65 }, // center-aggregated
  // Group 8 — Vardar region (Kavadarci/Veles center)
  caska:         { registered: 871,  employmentRate: 0.56 }, // center-aggregated
  'demir-kapija': { registered: 436,  employmentRate: 0.56 }, // center-aggregated
  gradsko:       { registered: 337,  employmentRate: 0.56 }, // center-aggregated
  lozovo:        { registered: 297,  employmentRate: 0.56 }, // center-aggregated
  rosoman:       { registered: 465,  employmentRate: 0.56 }, // center-aggregated
};

export const FISCAL_LOSS_PER_UNEMPLOYED = {
  forgonePIT: 715,            // USD/year (lost income tax)
  forgoneSSC: 3471,           // USD/year (lost social contributions)
  welfareSFA: 1072,           // USD/year (GMP MKD 5,445/mo ≈ $1,072/yr)
  healthCoverage: 552,        // USD/year (health insurance 7.5% of gross salary)
  totalAnnual: 5810,          // USD/year per unemployed person
};

// ── DECENTRALIZATION PHASES (population-based heuristic) ──
// Total population ≈ workingAgePop / 0.67; Phase 2 if total pop > 30,000 else Phase 1
export const DECENTRALIZATION_PHASES = {};
for (const m of MUNICIPALITIES) {
  const totalPop = Math.round(m.workingAgePop / 0.67);
  DECENTRALIZATION_PHASES[m.id] = { phase: totalPop > 30000 ? 2 : 1 };
}

// ── CREDIT RATINGS (per municipality) ──
export const CREDIT_RATINGS = {
  stip: { rating: 'B1', hasBonds: true, source: "Moody's 2017" },
};
// All other municipalities default to no rating
for (const m of MUNICIPALITIES) {
  if (!CREDIT_RATINGS[m.id]) {
    CREDIT_RATINGS[m.id] = { rating: null, hasBonds: false, source: null };
  }
}

// ── PILLAR CONSTANTS (Fiscal Decentralization Framework) ──
export const PILLAR_CONSTANTS = {
  arrearsThresholds: {
    lowRisk: 0.05,    // arrears/revenue < 5%
    watch: 0.15,      // arrears/revenue < 15%
    highRisk: 0.15,   // arrears/revenue >= 15%
  },
  capacityBenchmark: {
    nationalAvgRevenuePerCapita: null, // computed dynamically
  },
  phaseDescriptions: {
    1: 'Partial competencies; heavy central government dependence',
    2: 'Full block grant management (education, infrastructure)',
  },
};

// ── MUNICIPALITY ETHNICITY (UDG / Gruevski & Gaber 2023) ──
// nonMacedonian = 1 for municipalities with ethnic Albanian majority or Skopje mixed districts
export const MUNICIPALITY_ETHNICITY = {};
const nonMacedonianMajority = [
  'tetovo', 'gostivar', 'struga', 'kicevo', 'debar', 'lipkovo', 'aracinovo',
];
// Skopje boroughs — excluded from paper's training set but ethnically mixed
const skopjeEthnicMix = [
  'cair', 'saraj', 'suto-orizari',
];
for (const m of MUNICIPALITIES) {
  if (nonMacedonianMajority.includes(m.id)) {
    MUNICIPALITY_ETHNICITY[m.id] = { nonMacedonian: 1 };
  } else if (skopjeEthnicMix.includes(m.id)) {
    MUNICIPALITY_ETHNICITY[m.id] = { nonMacedonian: 1 };
  } else {
    MUNICIPALITY_ETHNICITY[m.id] = { nonMacedonian: 0 };
  }
}

// ── Skopje borough identifiers (excluded from original paper training set) ──
export const SKOPIE_BORROUGHS = [
  'aerodrom', 'karpos', 'centar', 'gazi-baba', 'kisela-voda',
  'butel', 'cair', 'gjorce-petrov', 'saraj', 'suto-orizari',
  'cucer-sandevo', 'ilinden', 'petrovec', 'sopiste', 'studenicani', 'zelenikovo',
];

// ── Skopje Property Tax Collection (CCC Open Data 2017-2019) ──
// Source: Commission for Control of Public Procurement (CCC), open data portal
// Represents per-borough property tax collection efficiency within the unified Skopje budget
export const SKOPIE_PROPERTY_TAX = {
  'gjorce-petrov': { collectionRate: 0.97, annualRevenueK: 558 },
  'karpos':        { collectionRate: 0.95, annualRevenueK: 2027 },
  'aerodrom':      { collectionRate: 0.95, annualRevenueK: 1372 },
  'centar':        { collectionRate: 0.94, annualRevenueK: 2303 },
  'kisela-voda':   { collectionRate: 0.86, annualRevenueK: 1333 },
  'butel':         { collectionRate: 0.84, annualRevenueK: 558 },
  'cair':          { collectionRate: 0.78, annualRevenueK: 543 },
  'gazi-baba':     { collectionRate: 0.69, annualRevenueK: 1240 },
  'suto-orizari':  { collectionRate: 0.67, annualRevenueK: 113 },
  // Saraj — no data available in CCC Open Data source
};

// ── Locale-aware municipality name ──
export function getMuniName(muni, locale) {
  if (locale === 'mk' && muni.name_mk) return muni.name_mk;
  if (locale === 'sq' && muni.name_sq) return muni.name_sq;
  return muni.name;
}
