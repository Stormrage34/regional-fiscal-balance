import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Dynamic import of fiscal data ──
// fiscalData.js only uses plain ESM exports, safe to import in Node.
const fiscalDataPath = '../src/data/fiscalData.js';
const { MUNICIPALITIES, NET_FISCAL, MKD_PER_EUR, formatCurrency } = await import(fiscalDataPath);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.resolve(__dirname, '..', 'og-canvas-template.html');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'og');

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

// ── Helpers ──
function fmtEURpc(value) {
  const sign = value >= 0 ? '+' : '−';
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return `${sign}€${formatted}`;
}

function fmtEURm(value) {
  // value in EUR, convert to millions
  const millions = Math.abs(value) / 1_000_000;
  const sign = value < 0 ? '−' : '+';
  if (millions < 1) {
    return `${sign}€${Math.round(millions * 1000)}K`;
  }
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(millions));
  return `${sign}€${formatted}M`;
}

function slugify(id) {
  return id.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function populateTemplate(data) {
  let html = template;
  // Replace placeholders in body content
  html = html.replace(
    /<span class="brand-label">[^<]*<\/span>/,
    `<span class="brand-label">Open Fiscal Ledger</span>`
  );
  html = html.replace(
    /<div class="muni-name"[^>]*>[^<]*<\/div>/,
    `<div class="muni-name" id="muni-name">${data.name}</div>`
  );
  html = html.replace(
    /<span class="net-pc-value"[^>]*>([^<]*)<\/span>/,
    `<span class="net-pc-value" id="net-pc-value" style="color: ${data.statusColor}">${data.netPC}</span>`
  );
  html = html.replace(
    /<span class="per-capita-label">[^<]*<\/span>/,
    '<span class="per-capita-label">net fiscal balance / per capita</span>'
  );

  // Status badge
  const badgeBg = data.isSurplus ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
  html = html.replace(
    /<div class="status-badge"[^>]*>([\s\S]*?)<\/div>/m,
    `<div class="status-badge" id="status-badge" style="color: ${data.statusColor}; border-color: ${data.statusColor}; background: ${badgeBg};">
      <span class="dot" style="background: ${data.statusColor};"></span>
      ${data.status}
    </div>`
  );

  // Total drain
  html = html.replace(
    /<span class="stat-value gold" id="total-drain">[^<]*<\/span>/,
    `<span class="stat-value gold" id="total-drain">${data.totalDrain}</span>`
  );

  // Rank
  html = html.replace(
    /<span class="stat-value" id="rank">[^<]*<\/span>/,
    `<span class="stat-value" id="rank">${data.rank}</span>`
  );

  return html;
}

// ── Main ──
async function generateImages() {
  console.log('Launching headless Chromium...');
  const browser = await chromium.launch({ headless: true });

  // Build ranked list of municipalities with NET_FISCAL data
  const withFiscal = MUNICIPALITIES.filter(m => NET_FISCAL[m.id]);

  // Compute per-capita net fiscal balance
  const ranked = withFiscal.map(m => {
    const nf = NET_FISCAL[m.id];
    const netMKD = nf.revenueInflow - nf.budgetOutflow;
    const netEUR = netMKD / MKD_PER_EUR;
    const netPC = m.workingAgePop > 0 ? netEUR / m.workingAgePop : 0;
    return { ...m, netEUR, netPC };
  });

  // Sort by netPC descending (best fiscal balance first)
  ranked.sort((a, b) => b.netPC - a.netPC);

  const totalCount = ranked.length;

  // ── Generate default OG image ──
  console.log('Generating default OG image...');
  const defaultData = {
    name: 'Open Fiscal Ledger',
    netPC: '',
    statusColor: '#F59E0B',
    isSurplus: false,
    status: 'MACEDONIAN FISCAL DASHBOARD',
    totalDrain: `${totalCount} Municipalities`,
    rank: '2025 Fiscal Year',
  };

  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const defaultHtml = populateTemplate(defaultData);
  await page.setContent(defaultHtml, { waitUntil: 'networkidle' });

  // For default, override the badge to be gold
  await page.evaluate(() => {
    const badge = document.getElementById('status-badge');
    if (badge) {
      badge.style.color = '#F59E0B';
      badge.style.borderColor = '#F59E0B';
      badge.style.background = 'rgba(245,158,11,0.1)';
      const dot = badge.querySelector('.dot');
      if (dot) dot.style.background = '#F59E0B';
    }
    // Hide netPC value for default
    const pcVal = document.getElementById('net-pc-value');
    if (pcVal) pcVal.textContent = '';
  });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'og-default.png'),
    type: 'png',
  });
  console.log('  ✓ og-default.png');

  // ── Generate per-municipality images ──
  for (let i = 0; i < ranked.length; i++) {
    const m = ranked[i];
    const rank = i + 1;
    const isSurplus = m.netPC >= 0;
    const statusColor = isSurplus ? '#10B981' : '#EF4444';
    const status = isSurplus ? 'SURPLUS' : 'DEFICIT';

    const data = {
      name: m.name_mk || m.name,
      netPC: fmtEURpc(m.netPC),
      statusColor,
      isSurplus,
      status,
      totalDrain: fmtEURm(m.netEUR),
      rank: `#${rank} of ${totalCount}`,
    };

    const html = populateTemplate(data);
    await page.setContent(html, { waitUntil: 'networkidle' });

    const filename = slugify(m.id) + '.png';
    await page.screenshot({
      path: path.join(OUTPUT_DIR, filename),
      type: 'png',
    });

    console.log(`  [${rank}/${totalCount}] ${data.name}: ${data.netPC} → ${filename}`);
  }

  await browser.close();
  console.log(`\nDone! Generated ${totalCount + 1} images in ${OUTPUT_DIR}`);
}

generateImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
