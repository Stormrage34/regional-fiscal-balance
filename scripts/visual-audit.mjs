import { chromium } from 'playwright';

const SITE = 'https://fiskalenradar.org';
const OUT = '/home/stormrage/statistika/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// 1. Desktop full page — 1440×900
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: OUT + 'audit-01-desktop-full.png', fullPage: true });
console.log('1. Desktop full page — done');

// 2. Mobile — 375×812 (iPhone X)
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: OUT + 'audit-02-mobile-full.png', fullPage: true });
console.log('2. Mobile full page — done');

// 3. Back to desktop, scroll to Labor Market scatter plot
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
const scatterSection = await page.$('#section-labor-market');
if (scatterSection) {
  await scatterSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  console.log('3. Scrolled to scatter plot');
} else {
  console.log('3. WARNING: #section-labor-market not found');
}
await page.screenshot({ path: OUT + 'audit-03-scatter-plot.png', fullPage: false });
console.log('3. Scatter plot — done');

// 4. Charts section with SegmentControl
const chartsSection = await page.$('#section-charts');
if (chartsSection) {
  await chartsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  console.log('4. Scrolled to charts section');
}
await page.screenshot({ path: OUT + 'audit-04-charts-section.png', fullPage: false });
console.log('4. Charts section — done');

// 5. Scroll further down to Municipal Table
const tableSection = await page.$('#section-table');
if (tableSection) {
  await tableSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  console.log('5. Scrolled to table');
}
await page.screenshot({ path: OUT + 'audit-05-muni-table.png', fullPage: false });
console.log('5. Municipal table — done');

// 6. Mobile sidebar open
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
const mobileHamburger = page.locator('button[aria-label*="Open"]').or(page.locator('button[aria-label*="Отвори"]')).or(page.locator('button[aria-label*="Hap"]')).first();
try {
  await mobileHamburger.click({ timeout: 5000 });
  await page.waitForTimeout(1000);
  console.log('6. Mobile sidebar opened');
} catch {
  // Try any sidebar button
  const btns = await page.$$('button');
  for (const btn of btns) {
    const label = await btn.getAttribute('aria-label');
    if (label && (label.includes('Open') || label.includes('Отвори') || label.includes('Hap'))) {
      await btn.click();
      await page.waitForTimeout(1000);
      console.log('6. Mobile sidebar opened via aria-label:', label);
      break;
    }
  }
}
await page.screenshot({ path: OUT + 'audit-06-mobile-sidebar.png', fullPage: false });
console.log('6. Mobile sidebar — done');

// 7. Detail panel — click a circle in scatter plot
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
const scat2 = await page.$('#section-labor-market');
if (scat2) {
  await scat2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
}
const dots = await page.$$('#section-labor-market svg circle');
if (dots.length > 0) {
  await dots[Math.floor(dots.length / 2)].click({ force: true });
  await page.waitForTimeout(1500);
  console.log('7. Clicked scatter dot, count:', dots.length);
} else {
  console.log('7. WARNING: No scatter dots found');
}
await page.screenshot({ path: OUT + 'audit-07-detail-panel.png', fullPage: false });
console.log('7. Detail panel — done');

// 8. Light theme toggle from desktop
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
// Find theme toggle - it's inside the sidebar
// First check if sidebar is visible on desktop (md+)
const themeBtn = page.locator('button').filter({ hasText: /Dark/ }).first();
try {
  await themeBtn.click({ timeout: 5000 });
  await page.waitForTimeout(2000);
  console.log('8. Theme toggled to light');
} catch {
  console.log('8. Theme toggle — could not click, sidebar may be closed on desktop');
}
await page.screenshot({ path: OUT + 'audit-08-light-theme.png', fullPage: false });
console.log('8. Light theme — done');

// 9. StickyNav with active section highlighted
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
// Scroll to expose sticky nav behavior
window.scrollBy?.(0, 200);
await page.waitForTimeout(1000);
await page.screenshot({ path: OUT + 'audit-09-sticky-nav.png', fullPage: false });
console.log('9. Sticky nav — done');

// 10. Mobile sidebar fully open + scroll to bottom for language switcher
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
// Open sidebar
const sidebarBtn = page.locator('button[aria-label*="Open"]').or(page.locator('button[aria-label*="Отвори"]')).first();
try {
  await sidebarBtn.click({ timeout: 5000 });
  await page.waitForTimeout(1000);
} catch {}
// Scroll sidebar to bottom
const aside = await page.$('aside');
if (aside) {
  await aside.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page.waitForTimeout(1000);
}
await page.screenshot({ path: OUT + 'audit-10-mobile-sidebar-bottom.png', fullPage: false });
console.log('10. Mobile sidebar bottom — done');

await browser.close();
console.log('\nAll 10 screenshots saved to /home/stormrage/statistika/audit-*.png');
