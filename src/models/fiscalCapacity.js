// ───────────────────────────────────────────────────────────────
// FISCAL CAPACITY MODEL (Gruevski & Gaber 2023 adapted)
// ───────────────────────────────────────────────────────────────

/**
 * Compute a proxy fiscal capacity estimate for a municipality.
 *
 * Uses the Gruevski & Gaber approach adapted to available data:
 * - Estimated capacity per capita = formal economy multiplier × national avg revenue target
 * - Actual revenue per capita = net fiscal inflow (MKD → EUR) / population
 * - Capacity gap = estimated − actual (positive = underperforming potential)
 *
 * @param {object} muni — full municipality object (includes workingAgePop, baseCompliance, baseShadowEcon)
 * @param {object} netFiscal — { revenueInflow, budgetOutflow, arrears } from NET_FISCAL
 * @param {number} employmentRate — AVRM registered employment rate (0-1)
 * @returns {{ estimatedCapacityPC: number, actualRevenuePC: number, capacityGapPC: number }}
 */
export function computeFiscalCapacity(muni, netFiscal, employmentRate) {
  // Derived values
  const pop = muni.workingAgePop / 0.67;
  const nationalAvgOwnRevenuePC = 500; // Placeholder — actual national avg (EUR)

  // Proxy: tax base health = compliance × employment × (1 - shadowEcon)
  const formalEconomyMultiplier = muni.baseCompliance * employmentRate * (1 - muni.baseShadowEcon);

  // Estimated capacity per capita (EUR)
  const estimatedCapacityPC = formalEconomyMultiplier * nationalAvgOwnRevenuePC;

  // Actual revenue per capita (EUR)
  const actualRevenuePC = (netFiscal.revenueInflow / 61.66) / pop;

  // Gap: positive means underperforming potential
  const capacityGapPC = estimatedCapacityPC - actualRevenuePC;

  return { estimatedCapacityPC, actualRevenuePC, capacityGapPC };
}
