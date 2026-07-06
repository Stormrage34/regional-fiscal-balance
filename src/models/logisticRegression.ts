// ───────────────────────────────────────────────────────────────
// LOGISTIC REGRESSION MODEL (Gruevski & Gaber 2023)
// ───────────────────────────────────────────────────────────────

import { MUNICIPALITY_ETHNICITY, SKOPIE_BORROUGHS } from '../data/fiscalData.js';

/**
 * Model performance metrics from the original paper (UGD, 2023).
 * Reduced model: 3 predictors, all statistically significant.
 * Full model: 4 predictors, ethnicity has p=0.998 (quasi-complete separation).
 */
// Paper's national average own revenues per capita (MKD) — Table 1, 2010
// Used as target for our compliance × shadow-economy proxy
const PAPER_NATIONAL_OWN_REV_PC = 2970;

export const LOGIT_COEFFICIENTS = {
  // Reduced model (3 variables) — PRIMARY display
  // ownRevenuePerCapita uses paper coefficient directly (no scaling needed)
  // because we estimate own revenues via compliance × shadow-econ proxy
  reduced: {
    intercept: 2.7879,
    population: 3.87e-05,
    urban: -2.4627,
    ownRevenuePerCapita: -0.00166,
  },
  // Full model (4 variables) — shown only in methodology with disclaimer
  full: {
    intercept: 2.7879,
    ethnicity: 20.4562, // nonMacedonian=1; p=0.998 quasi-complete separation
    urban: -2.4627,
    ownRevenuePerCapita: -0.00166,
  },
  // Model performance (reduced model)
  performance: {
    rSquared: 0.6426,
    chiSquared: 48.398,
    auc: 0.91,
    sensitivity: 0.829,
    specificity: 0.818,
    accuracy: 0.824,
  },
  // Proxy estimation parameters
  proxy: {
    nationalOwnRevTargetPC: PAPER_NATIONAL_OWN_REV_PC, // MKD per capita
    method: 'baseCompliance × (1 − baseShadowEcon) × nationalTarget',
  },
};

/**
 * Check if a municipality is a Skopje borough (excluded from original training set).
 */
export function isSkopje(muniId) {
  return SKOPIE_BORROUGHS.includes(muniId);
}

/**
 * Predict fiscal disparity using the Gruevski & Gaber logistic regression model.
 *
 * Returns both reduced-model and full-model predictions. The reduced model uses
 * ethnicity fixed to 0 (primary display). The full model includes the ethnicity
 * coefficient but carries a quasi-complete separation warning.
 *
 * @param {object} muni — municipality object (includes workingAgePop, id)
 * @param {object} netFiscal — { revenueInflow, budgetOutflow, arrears } from NET_FISCAL
 * @returns {{
 *   totalPop: number,
 *   isUrban: boolean,
 *   ethnicity: number,
 *   ownRevPC_MKD: number,
 *   inTrainingSet: boolean,
 *   logitReduced: number,
 *   probReduced: number,
 *   predictedReduced: 'gainer' | 'loser',
 *   logitFull: number,
 *   probFull: number,
 *   predictedFull: 'gainer' | 'loser',
 * }}
 */
export function predictFiscalDisparity(muni, netFiscal) {
  const c = LOGIT_COEFFICIENTS;

  // Derived values
  const totalPop = Math.round(muni.workingAgePop / 0.67);
  const isUrban = totalPop > 20000;
  const ethnicity = MUNICIPALITY_ETHNICITY[muni.id]?.nonMacedonian ?? 0;

  // Estimated own revenue per capita in MKD
  // Proxy: compliance × formal-economy share × national target
  // Matches the paper's "сопствени приходи по глава на жител" variable
  // (Paper Table 1: national avg own revenues = 2,970 MKD/capita)
  const formalEconomyShare = 1 - muni.baseShadowEcon;
  const ownRevPC_MKD = muni.baseCompliance * formalEconomyShare * PAPER_NATIONAL_OWN_REV_PC;

  const inTrainingSet = !isSkopje(muni.id);

  // Reduced model logit (ethnicity fixed to 0)
  const logitReduced = c.reduced.intercept
    + c.reduced.population * totalPop
    + c.reduced.urban * (isUrban ? 1 : 0)
    + c.reduced.ownRevenuePerCapita * ownRevPC_MKD;

  // Full model logit (with ethnicity coefficient)
  const logitFull = c.full.intercept
    + c.full.ethnicity * ethnicity
    + c.full.urban * (isUrban ? 1 : 0)
    + c.full.ownRevenuePerCapita * ownRevPC_MKD;

  // Sigmoid
  const probReduced = 1 / (1 + Math.exp(-logitReduced));
  const probFull = 1 / (1 + Math.exp(-logitFull));

  // Classification: p > 0.5 → "loser" (below-average fiscal capacity)
  const predictedReduced = probReduced > 0.5 ? 'loser' : 'gainer';
  const predictedFull = probFull > 0.5 ? 'loser' : 'gainer';

  return {
    totalPop,
    isUrban,
    ethnicity,
    ownRevPC_MKD,
    inTrainingSet,
    logitReduced: Math.round(logitReduced * 1000) / 1000,
    probReduced: Math.round(probReduced * 10000) / 10000,
    predictedReduced,
    logitFull: Math.round(logitFull * 1000) / 1000,
    probFull: Math.round(probFull * 10000) / 10000,
    predictedFull,
  };
}
