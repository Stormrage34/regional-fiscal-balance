import { CONSTANTS } from '../data/fiscalData.js';

// ───────────────────────────────────────────────────────────────
// BAYESIAN INFERENCE ENGINE
// ───────────────────────────────────────────────────────────────

export function computeMunicipalMetrics(muni, enforcementStrength, digitalFiscalization, applyCorrection) {
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
