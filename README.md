# Open Fiscal Ledger

Interactive dashboard analyzing net fiscal balance across all 77 municipalities in North Macedonia. Built with React + Vite + Tailwind CSS v4.

## What it measures

Three per-capita fiscal drain components per municipality:
- **Tax Leakage** — unreported revenue via shadow economy modeling
- **Welfare Burden** — social safety net costs per welfare recipient share
- **Overhead & Credits** — fixed admin costs + enforcement gap, corrected for corporate HQ distortion

Plus treasury-backed net fiscal balance (2025 actuals from open.finance.gov.mk), a logistic regression model (Gruevski & Gaber, 2023), Skopje property tax breakdown, unemployment impact, and Phase 1/2 decentralization comparison.

## Data sources

| Source | Year | What |
|--------|------|------|
| [open.finance.gov.mk](https://open.finance.gov.mk) | 2025 | Treasury transactional data (revenue, expenditure, arrears) |
| SSO Census | 2021 | Working-age population per municipality |
| AVRM Employment Registry | 2024 | Registered unemployed per municipality |
| CEA Study (cea.org.mk) | 2023 | Tax compliance rate range (26–83%) |
| Gruevski & Gaber | 2023 | Logistic regression model (reduced, 3 predictors) |
| CCC Open Data | 2017–2019 | Skopje borough property tax collection |

## Architecture

```
src/
  data/           Fiscal data & locales (MKD, all 77 municipalities)
  models/         Bayesian inference, fiscal capacity, logistic regression
  components/
    charts/       7 chart types (stacked bar, pie matrix, scatter, diverging bar, donut, fiscal capacity, model accuracy)
    layout/       Sidebar, KPI ribbon, municipal table, methodology panel
    navigation/   Sticky nav with scroll spy
    ui/           Segment control, range slider, language switcher, skeleton
  context/        Locale (en/mk/sq) + theme (dark/light) providers
  pages/          Main dashboard (NakedBudget)
```

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
npm run lint       # Oxlint static analysis
```

## OG image generation

Generate per-municipality Open Graph images for social sharing:

```bash
npx playwright install chromium           # one-time setup
npm run generate-og                       # generates 78 PNGs in public/assets/og/
```

## Data validation

```bash
npm run validate    # checks municipality coverage, nulls, outliers
```

## Deployment

Deployed on Vercel — push to `main` triggers automatic build and deploy.

Live at: **[fiskalenradar.org](https://fiskalenradar.org)**

## License

Data: public sector information from the Republic of North Macedonia.
Code: MIT.
