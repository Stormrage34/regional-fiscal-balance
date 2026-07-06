import { chromium } from 'playwright';

const SITE = 'https://fiskalenradar.org';
const browser = await chromium.launch({ headless: true });

// ─── DESKTOP AUDIT ───
const d = await browser.newPage();
await d.setViewportSize({ width: 1440, height: 900 });
await d.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await d.waitForTimeout(3000);

console.log("═══════════════════════════════════════════");
console.log("AUDIT 1: DOM STRUCTURE & HEADINGS");
console.log("═══════════════════════════════════════════");

const headings = await d.evaluate(() => {
  return [...document.querySelectorAll('h1,h2,h3,h4')].map(h => ({
    tag: h.tagName,
    text: h.textContent.slice(0, 60),
    class: h.className.slice(0, 80),
  }));
});
console.log("Headings:", JSON.stringify(headings, null, 2));

const skipLink = await d.evaluate(() => {
  const a = document.querySelector('a[href="#section-hero"]');
  return a ? { text: a.textContent, classes: a.className } : null;
});
console.log("Skip link:", JSON.stringify(skipLink));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 2: SECTION STRUCTURE");
console.log("═══════════════════════════════════════════");

const sections = await d.evaluate(() => {
  return [...document.querySelectorAll('section[id]')].map(s => ({
    id: s.id,
    childCount: s.children.length,
    firstH2: s.querySelector('h2')?.textContent?.slice(0, 50) || 'none',
  }));
});
console.log("Sections:", JSON.stringify(sections, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 3: STICKY NAV");
console.log("═══════════════════════════════════════════");

const nav = await d.evaluate(() => {
  const n = document.querySelector('nav[role="navigation"]');
  if (!n) return { error: 'nav not found' };
  const buttons = [...n.querySelectorAll('button')].map(b => ({
    text: b.textContent.trim(),
    ariaCurrent: b.getAttribute('aria-current'),
  }));
  const rect = n.getBoundingClientRect();
  return { 
    visible: rect.height > 0,
    position: window.getComputedStyle(n).position,
    top: rect.top,
    buttonCount: buttons.length,
    buttons,
  };
});
console.log("Nav:", JSON.stringify(nav, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 4: ERROR BOUNDARIES");
console.log("═══════════════════════════════════════════");

// Check if any section has an error-boundary fallback visible
const errors = await d.evaluate(() => {
  return [...document.querySelectorAll('main > div, main > section')].filter(el => {
    return el.textContent.includes('unavailable') || el.textContent.includes('try refreshing');
  }).map(el => el.textContent.slice(0, 100));
});
console.log("Error boundary fallbacks visible:", errors.length > 0 ? errors : "NONE — all sections rendered cleanly");

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 5: SCATTER PLOT");
console.log("═══════════════════════════════════════════");

const scatterSec = await d.$('#section-labor-market');
if (scatterSec) {
  await scatterSec.scrollIntoViewIfNeeded();
  await d.waitForTimeout(2000);
}

const scatterInfo = await d.evaluate(() => {
  const svg = document.querySelector('#section-labor-market svg');
  if (!svg) return { error: 'No SVG in scatter section' };
  const circles = svg.querySelectorAll('circle');
  const viewBox = svg.getAttribute('viewBox');
  const rect = svg.getBoundingClientRect();
  
  // Get overlapping circles (check if any two centers are too close)
  const positions = [...circles].map(c => ({
    cx: parseFloat(c.getAttribute('cx')),
    cy: parseFloat(c.getAttribute('cy')),
    r: parseFloat(c.getAttribute('r')),
    fill: c.getAttribute('fill'),
    opacity: c.getAttribute('opacity'),
  }));
  
  // Count circles with jitter (non-uniform positions)
  const xVals = positions.map(p => p.cx);
  const uniqueX = new Set(xVals.map(v => Math.round(v * 10) / 10));
  
  // Check for very close circles (within 5px of each other)
  let overlaps = 0;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].cx - positions[j].cx;
      const dy = positions[i].cy - positions[j].cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 4) overlaps++;
    }
  }
  
  return {
    circleCount: circles.length,
    uniqueXPositions: uniqueX.size,
    overlapPairs: overlaps,
    viewBox,
    svgSize: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
    jittered: uniqueX.size > Math.min(circles.length * 0.5, 50),
    samplePoints: positions.slice(0, 5),
  };
});
console.log("Scatter plot:", JSON.stringify(scatterInfo, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 6: PIE MATRIX (CHART VIEW 'pie')");
console.log("═══════════════════════════════════════════");

const chartsSec = await d.$('#section-charts');
if (chartsSec) {
  await chartsSec.scrollIntoViewIfNeeded();
  await d.waitForTimeout(1500);
}

// Click the "pie" / "Share" / "Matrix" tab
const pieTab = await d.evaluate(() => {
  const tabs = document.querySelectorAll('#section-charts button');
  for (const t of tabs) {
    if (t.textContent.includes('Share') || t.textContent.includes('Матрица') || t.textContent.includes('удел') || t.textContent.includes('Pjesa')) {
      t.click();
      return { clicked: t.textContent.trim() };
    }
  }
  return { clicked: false, available: [...tabs].map(t => t.textContent.trim()) };
});
console.log("Pie tab click:", JSON.stringify(pieTab));
await d.waitForTimeout(2000);

const pieInfo = await d.evaluate(() => {
  const svgs = document.querySelectorAll('#section-charts svg');
  const cards = document.querySelectorAll('#section-charts [data-muni-id]');
  
  // Check for overlapping cards
  const positions = [...cards].map(c => ({
    id: c.getAttribute('data-muni-id'),
    rect: c.getBoundingClientRect(),
  }));
  
  // Detect any cards that overlap (overlapping rects)
  let overlaps = 0;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i].rect, b = positions[j].rect;
      if (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom) {
        // Only count if they're in different rows (grid)
        if (Math.abs(a.top - b.top) < 5) overlaps++;
      }
    }
  }
  
  return {
    donutChartCount: svgs.length,
    cardCount: cards.length,
    overlappingCards: overlaps,
    sampleRects: positions.slice(0, 3).map(p => ({
      id: p.id,
      w: Math.round(p.rect.width),
      h: Math.round(p.rect.height),
    })),
  };
});
console.log("Pie matrix:", JSON.stringify(pieInfo, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 7: MUNICIPAL TABLE");
console.log("═══════════════════════════════════════════");

const tableSec = await d.$('#section-table');
if (tableSec) {
  await tableSec.scrollIntoViewIfNeeded();
  await d.waitForTimeout(2000);
}

const tableInfo = await d.evaluate(() => {
  const tbody = document.querySelector('#section-table tbody');
  const thead = document.querySelector('#section-table thead');
  if (!tbody || !thead) return { error: 'Table not rendered' };
  
  const rows = tbody.querySelectorAll('tr');
  const headers = [...thead.querySelectorAll('th')].map(th => th.textContent.trim().slice(0, 30));
  
  // Check sticky columns
  const firstStickyCells = [...rows].map(r => r.querySelector('td'));
  const stickyInfo = firstStickyCells.slice(0, 3).map(td => ({
    position: td ? window.getComputedStyle(td).position : 'none',
    left: td ? td.style.left : 'none',
    zIndex: td ? window.getComputedStyle(td).zIndex : 'none',
    text: td ? td.textContent.trim().slice(0, 20) : 'empty',
  }));
  
  return {
    rowCount: rows.length,
    headerCount: headers.length,
    headers: headers,
    stickyColumnInfo: stickyInfo,
  };
});
console.log("Table:", JSON.stringify(tableInfo, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 8: THEME TOGGLE");
console.log("═══════════════════════════════════════════");

// Check data-theme attribute
const themeNow = await d.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log("Current theme:", themeNow);

// Click theme toggle in sidebar
const themeBtn = d.locator('button').filter({ hasText: /Dark|Light/ }).first();
try {
  await themeBtn.click({ timeout: 5000 });
  await d.waitForTimeout(2000);
} catch {
  console.log("Theme toggle not clickable from viewport — sidebar may be closed on desktop");
}

const themeAfter = await d.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log("Theme after toggle attempt:", themeAfter);

// Check CSS custom property values
const cssProps = await d.evaluate(() => {
  const root = document.documentElement;
  const style = window.getComputedStyle(root);
  return {
    '--bg-root': style.getPropertyValue('--bg-root').trim(),
    '--text-primary': style.getPropertyValue('--text-primary').trim(),
    '--text-secondary': style.getPropertyValue('--text-secondary').trim(),
    '--bg-card': style.getPropertyValue('--bg-card').trim(),
  };
});
console.log("CSS vars:", JSON.stringify(cssProps, null, 2));

// Check contrast ratio of secondary text on root bg (WCAG check)
const contrastInfo = await d.evaluate(() => {
  function getRGB(str) {
    if (str.startsWith('#')) {
      const hex = str.replace('#', '');
      return {
        r: parseInt(hex.slice(0,2), 16),
        g: parseInt(hex.slice(2,4), 16),
        b: parseInt(hex.slice(4,6), 16),
      };
    }
    const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) } : null;
  }
  
  function luminance(r, g, b) {
    const [rs, gs, bs] = [r,g,b].map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*rs + 0.7152*gs + 0.0722*bs;
  }
  
  function contrastRatio(l1, l2) {
    const lighter = Math.max(l1,l2), darker = Math.min(l1,l2);
    return (lighter+0.05)/(darker+0.05);
  }
  
  const style = window.getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--bg-root').trim();
  const text = style.getPropertyValue('--text-secondary').trim();
  
  const bgRgb = getRGB(bg);
  const textRgb = getRGB(text);
  if (!bgRgb || !textRgb) return { error: 'Cannot parse colors', bg, text };
  
  const ratio = contrastRatio(luminance(bgRgb.r, bgRgb.g, bgRgb.b), luminance(textRgb.r, textRgb.g, textRgb.b));
  return { bg, text, contrastRatio: Math.round(ratio*10)/10, passesAA: ratio >= 4.5 };
});
console.log("Contrast (bg-root vs text-secondary):", JSON.stringify(contrastInfo));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 9: MOBILE SIDEBAR");
console.log("═══════════════════════════════════════════");

const m = await browser.newPage();
await m.setViewportSize({ width: 375, height: 812 });
await m.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
await m.waitForTimeout(3000);

// Open sidebar on mobile
const mobSidebarBtn = m.locator('button').filter({ hasText: /Open sidebar|Отвори|Hap/ }).first();
try {
  await mobSidebarBtn.click({ timeout: 5000 });
  await m.waitForTimeout(1500);
} catch (e) {
  console.log("Mobile sidebar could not open:", e.message.slice(0, 80));
}

const sidebarInfo = await m.evaluate(() => {
  const aside = document.querySelector('aside');
  if (!aside) return { error: 'No aside element' };
  const style = window.getComputedStyle(aside);
  const rect = aside.getBoundingClientRect();
  
  // Check all interactive elements in sidebar for touch targets
  const buttons = aside.querySelectorAll('button');
  const smallTargets = [...buttons].filter(b => {
    const r = b.getBoundingClientRect();
    return Math.min(r.width, r.height) < 40;
  });
  
  return {
    visible: rect.width > 0 && rect.right > 0,
    transform: style.transform,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    buttonCount: buttons.length,
    smallTouchTargets: smallTargets.length,
    smallTargetTexts: smallTargets.map(b => b.textContent?.trim().slice(0, 20)),
  };
});
console.log("Mobile sidebar:", JSON.stringify(sidebarInfo, null, 2));

// Scroll sidebar to bottom and check lang switcher
const aside = await m.$('aside');
if (aside) {
  await aside.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await m.waitForTimeout(1000);
}

const langInfo = await m.evaluate(() => {
  const aside = document.querySelector('aside');
  if (!aside) return { error: 'no sidebar' };
  const langBtns = aside.querySelectorAll('button');
  const relevant = [...langBtns].filter(b => {
    const t = b.textContent;
    return t.includes('MK') || t.includes('EN') || t.includes('SQ') || t.includes('МК') || t.includes('Shq');
  });
  // Also look for any language-related elements
  const allText = aside.textContent;
  const hasLangSwitcher = allText.includes('MK') || allText.includes('Shqip') || allText.includes('МК');
  
  return {
    langButtonsFound: relevant.length,
    langTexts: relevant.map(b => b.textContent.trim().slice(0, 30)),
    hasLangSwitcher,
    bottomVisible: aside.scrollTop > 0,
  };
});
console.log("Language switcher:", JSON.stringify(langInfo, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 10: LIGHT THEME RENDER QUALITY");
console.log("═══════════════════════════════════════════");

// Force light theme via attribute
await d.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});
await d.waitForTimeout(1000);

const lightThemeInfo = await d.evaluate(() => {
  const style = window.getComputedStyle(document.documentElement);
  
  // Sample text colors in the main area
  const h1 = document.querySelector('h1');
  const mainText = document.querySelector('main');
  const h2s = [...document.querySelectorAll('h2')].slice(0, 3);
  
  const h1Style = h1 ? window.getComputedStyle(h1) : null;
  const mainStyle = mainText ? window.getComputedStyle(mainText) : null;
  
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    '--bg-root': style.getPropertyValue('--bg-root').trim(),
    '--text-primary': style.getPropertyValue('--text-primary').trim(),
    mainBg: mainStyle?.backgroundColor,
    mainColor: mainStyle?.color,
    h1Color: h1Style?.color,
    h2Colors: h2s.map(h => window.getComputedStyle(h).color),
  };
});
console.log("Light theme:", JSON.stringify(lightThemeInfo, null, 2));

// Check for any hardcoded dark-only text-white elements in light theme
const whiteTextInLight = await d.evaluate(() => {
  const allEls = document.querySelectorAll('*');
  const whiteText = [];
  for (const el of allEls) {
    const style = window.getComputedStyle(el);
    const color = style.color;
    // #f8fafc, rgb(248, 250, 252), or white
    if (color === 'rgb(248, 250, 252)' || color === 'rgb(255, 255, 255)' || color === '#f8fafc' || color === '#ffffff') {
      const tag = el.tagName;
      const cls = el.className?.toString()?.slice(0, 60);
      const txt = el.textContent?.trim()?.slice(0, 40);
      const bg = style.backgroundColor;
      // Only flag if not on a dark background
      const isDarkBg = bg.includes('rgb(15, 23, 42)') || bg.includes('rgb(27,') || bg.includes('rgb(30,') || bg.includes('#0f172a');
      if (!isDarkBg) {
        whiteText.push({ tag, cls, txt, color, bg });
      }
    }
  }
  return whiteText.slice(0, 10);
});
console.log("White text on light bg (in light theme):", whiteTextInLight.length > 0 ? JSON.stringify(whiteTextInLight, null, 2) : "NONE — clean");

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 11: RESPONSIVE LAYOUT METRICS");
console.log("═══════════════════════════════════════════");

// Check overflow/truncation on desktop and mobile
for (const [name, page] of [['desktop', d], ['mobile', m]]) {
  const overflowInfo = await page.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth;
    const clientW = document.documentElement.clientWidth;
    const hasHorizontalScroll = scrollW > clientW + 1;
    
    // Check any element with style overflow-hidden
    const truncatedTextEls = [...document.querySelectorAll('p, span, td, th, h2, h3')].filter(el => {
      const style = window.getComputedStyle(el);
      return style.overflow === 'hidden' && style.textOverflow === 'ellipsis';
    });
    
    // Check for elements extending beyond viewport
    const bodyEls = [...document.querySelectorAll('main *, aside *')];
    const overflowing = bodyEls.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > clientW + 5;
    }).slice(0, 5).map(el => ({
      tag: el.tagName,
      right: Math.round(el.getBoundingClientRect().right),
      clientW,
    }));
    
    return {
      horizontalScroll: hasHorizontalScroll,
      truncatedElements: truncatedTextEls.length,
      overflowingElements: overflowing.length,
      sampleOverflows: overflowing,
    };
  });
  console.log(`${name} overflow:`, JSON.stringify(overflowInfo, null, 2));
}

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 12: ARIA & ACCESSIBILITY ATTRIBUTES");
console.log("═══════════════════════════════════════════");

const ariaReport = await d.evaluate(() => {
  const labels = document.querySelectorAll('[aria-label]');
  const describedBy = document.querySelectorAll('[aria-describedby]');
  const expanded = document.querySelectorAll('[aria-expanded]');
  const current = document.querySelectorAll('[aria-current]');
  const modal = document.querySelectorAll('[aria-modal]');
  const roles = document.querySelectorAll('[role]');
  
  // Check for alt text on images
  const imgs = document.querySelectorAll('img:not([alt])');
  const svgsWithoutRole = document.querySelectorAll('svg:not([role]):not([aria-hidden]):not([aria-label])');
  
  return {
    ariaLabels: labels.length,
    ariaDescribedBy: describedBy.length,
    ariaExpanded: expanded.length,
    ariaCurrent: current.length,
    ariaModal: modal.length,
    explicitRoles: roles.length,
    imgsMissingAlt: imgs.length,
    svgsMissingLabel: svgsWithoutRole.length,
  };
});
console.log("ARIA:", JSON.stringify(ariaReport, null, 2));

console.log("\n═══════════════════════════════════════════");
console.log("AUDIT 13: BUILD CHUNK SIZES (from dist)");
console.log("═══════════════════════════════════════════");

// All done
await browser.close();
