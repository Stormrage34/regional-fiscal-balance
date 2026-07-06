// ───────────────────────────────────────────────────────────────
// PILLAR SCORING MODEL (3-Pillar Fiscal Decentralization Framework)
// ───────────────────────────────────────────────────────────────

import { DECENTRALIZATION_PHASES, CREDIT_RATINGS, PILLAR_CONSTANTS } from '../data/fiscalData.js';

/**
 * Compute the three-pillar scores for a municipality.
 *
 * Pillar 1 — Fiscal Capacity: proxy = base compliance rate
 * Pillar 2 — Fiscal Discipline: arrears/revenue ratio → risk tier
 * Pillar 3 — Decentralization Readiness: phase + credit rating + equalization status
 *
 * @param {object} muni — full municipality object (includes workingAgePop, baseCompliance, baseShadowEcon)
 * @param {object} netFiscal — { revenueInflow, budgetOutflow, arrears } from NET_FISCAL
 * @returns {object} scores object
 */
export function computePillarScores(muni, netFiscal) {
  const thresholds = PILLAR_CONSTANTS.arrearsThresholds;

  // Pillar 1: Fiscal Capacity (proxy = base compliance rate)
  const p1_capacity_score = muni.baseCompliance;

  // Pillar 2: Fiscal Discipline
  const arrearsRevenueRatio = netFiscal.revenueInflow > 0
    ? netFiscal.arrears / netFiscal.revenueInflow
    : 0;
  let p2_risk_tier;
  if (arrearsRevenueRatio < thresholds.lowRisk) {
    p2_risk_tier = 'Low Risk';
  } else if (arrearsRevenueRatio < thresholds.highRisk) {
    p2_risk_tier = 'Watch';
  } else {
    p2_risk_tier = 'High Risk';
  }
  const p2_discipline_marker = arrearsRevenueRatio < 0.15; // boolean

  // Pillar 3: Decentralization Readiness
  const phaseInfo = DECENTRALIZATION_PHASES[muni.id] || { phase: 1 };
  const creditInfo = CREDIT_RATINGS[muni.id] || { rating: null };

  const creditRating = creditInfo.rating || 'NR';

  // Equalization status — placeholder national avg (will be computed dynamically)
  const nationalAvgPC = PILLAR_CONSTANTS.capacityBenchmark.nationalAvgRevenuePerCapita || 500;
  const estimatedCapacityPC = p1_capacity_score * nationalAvgPC; // rough proxy
  let equalizationStatus = 'Neutral';
  if (estimatedCapacityPC < nationalAvgPC * 0.9) {
    equalizationStatus = 'Receiver';
  } else if (estimatedCapacityPC > nationalAvgPC * 1.1) {
    equalizationStatus = 'Contributor';
  }

  return {
    p1_capacity_score,
    p2_discipline_marker,
    p2_risk_tier,
    phase: phaseInfo.phase,
    creditRating,
    equalizationStatus,
  };
}
