import { MUNICIPALITIES, NET_FISCAL, UNEMPLOYMENT_DATA, MKD_PER_EUR } from '../src/data/fiscalData.js';

let errors = 0;

function warn(msg) {
  console.warn(`  ⚠️  ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

console.log('Validating fiscal data pipeline...\n');

// 1. Municipality coverage
console.log('Municipality coverage:');
const muniIds = MUNICIPALITIES.map(m => m.id);
console.log(`  Total municipalities: ${muniIds.length}`);

const missingFiscal = muniIds.filter(id => !NET_FISCAL[id]);
const missingUnemp = muniIds.filter(id => !UNEMPLOYMENT_DATA[id]);

if (missingFiscal.length > 0) warn(`${missingFiscal.length} missing NET_FISCAL: ${missingFiscal.join(', ')}`);
else ok('All municipalities have NET_FISCAL entries');

if (missingUnemp.length > 0) warn(`${missingUnemp.length} missing UNEMPLOYMENT_DATA: ${missingUnemp.join(', ')}`);
else ok('All municipalities have UNEMPLOYMENT_DATA entries');

// 2. Critical field validation
console.log('\nCritical field validation:');
for (const m of MUNICIPALITIES) {
  const nf = NET_FISCAL[m.id];
  if (!nf) continue;

  if (typeof nf.revenueInflow !== 'number' || isNaN(nf.revenueInflow))
    warn(`${m.id}: revenueInflow is ${nf.revenueInflow}`);
  if (typeof nf.budgetOutflow !== 'number' || isNaN(nf.budgetOutflow))
    warn(`${m.id}: budgetOutflow is ${nf.budgetOutflow}`);
  if (typeof nf.arrears !== 'number' || isNaN(nf.arrears))
    warn(`${m.id}: arrears is ${nf.arrears}`);
  if (typeof m.workingAgePop !== 'number' || isNaN(m.workingAgePop) || m.workingAgePop <= 0)
    warn(`${m.id}: workingAgePop is ${m.workingAgePop}`);
  if (typeof m.baseCompliance !== 'number' || isNaN(m.baseCompliance) || m.baseCompliance < 0 || m.baseCompliance > 1)
    warn(`${m.id}: baseCompliance is ${m.baseCompliance}`);
  if (typeof m.baseShadowEcon !== 'number' || isNaN(m.baseShadowEcon) || m.baseShadowEcon < 0 || m.baseShadowEcon > 1)
    warn(`${m.id}: baseShadowEcon is ${m.baseShadowEcon}`);
}
ok('Critical fields validated');

// 3. Net fiscal balance anomalies
console.log('\nFiscal balance anomalies:');
let anomalyCount = 0;
for (const id of muniIds) {
  const nf = NET_FISCAL[id];
  const m = MUNICIPALITIES.find(x => x.id === id);
  if (!nf || !m) continue;

  const netMKD = nf.revenueInflow - nf.budgetOutflow;
  const netEUR = netMKD / MKD_PER_EUR;
  const netPC = m.workingAgePop > 0 ? netEUR / m.workingAgePop : 0;

  // Flag unusually large per-capita values
  if (Math.abs(netPC) > 5000) {
    warn(`${id}: extreme netPC = €${Math.round(netPC)}/capita`);
    anomalyCount++;
  }
}
if (anomalyCount === 0) ok('No fiscal balance anomalies detected');

// 4. Population sanity
console.log('\nPopulation sanity:');
const totalPop = MUNICIPALITIES.reduce((s, m) => s + m.workingAgePop, 0);
console.log(`  Total working-age population: ${totalPop.toLocaleString()}`);
if (totalPop < 500000) warn(`Total population seems low: ${totalPop.toLocaleString()}`);
else if (totalPop > 5000000) warn(`Total population seems high: ${totalPop.toLocaleString()}`);
else ok('Total population within expected range');

// 5. Unemployment data
console.log('\nUnemployment data:');
const totalUnemp = Object.values(UNEMPLOYMENT_DATA).reduce((s, u) => s + (u.registered || 0), 0);
const unempRate = totalPop > 0 ? (totalUnemp / totalPop * 100).toFixed(1) : 0;
console.log(`  Registered unemployed: ${totalUnemp.toLocaleString()} (${unempRate}%)`);
ok('Unemployment data loaded');

// Summary
console.log(`\n${'='.repeat(40)}`);
if (errors === 0) {
  console.log('✅ All validations passed. Data pipeline is clean.');
  process.exit(0);
} else {
  console.error(`❌ ${errors} validation error(s) found.`);
  process.exit(1);
}
