export interface Municipality {
  id: string;
  name: string;
  name_mk: string;
  name_sq: string;
  workingAgePop: number;
  baseShadowEcon: number;
  baseCompliance: number;
  corporateDistortion: number;
  welfareRate: number;
  inTrainingSet?: boolean;
}

export interface NetFiscalEntry {
  revenueInflow: number;
  budgetOutflow: number;
  arrears: number;
  utilityDebt: number;
}

export interface UnemploymentEntry {
  registered: number;
  employmentRate: number;
}

export interface FiscalResult extends Municipality {
  adjustedCompliance: number;
  totalPerCapitaDrain: number;
  uncollectedLeakage: number;
  welfareBurden: number;
  complianceGapCost: number;
  corporateRetraction: number;
  totalYearlyDrain: number;
  predictedReduced?: string;
  probReduced?: number;
  netFiscalPC?: number;
  inTrainingSet?: boolean;
  fiscalHealth?: number;
  revenueEffort?: number;
  expenditureEfficiency?: number;
  debtSustainability?: number;
}

export interface PhaseComparisonResult {
  p1Count: number;
  p2Count: number;
  avgNetFiscalPC1: number;
  avgNetFiscalPC2: number;
  avgArrearsPC1: number;
  avgArrearsPC2: number;
  avgCompliance1: number;
  avgCompliance2: number;
}

export interface Aggregates {
  totalPop: number;
  totalYearlyDrain: number;
  totalUncollected: number;
  totalWelfareBurden: number;
  totalCorporateCredit: number;
  totalUnemploymentFiscalLoss: number;
  totalUnemployed: number;
  weightedAvgDrain: number;
}

export interface NetFiscalAggs {
  gainers: FiscalResult[];
  losers: FiscalResult[];
  totalRev: number;
  totalOut: number;
  totalNet: number;
  totalArrears: number;
  skopjeRev: number;
  skopjeOut: number;
  skopjePop: number;
  skopjeNet: number;
  skopjeNetPC: number;
  nationalAvgRevPC: number;
  skopjeBoroughsCount: number;
}

export interface ModelAccuracy {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  total: number;
  mismatches: FiscalResult[];
}

export interface Translations {
  [key: string]: string;
}

export interface LocaleContextValue {
  locale: string;
  setLocale: (l: string) => void;
  t: (key: string) => string;
}

export interface PieSegment {
  value: number;
  label: string;
  color: string;
  d?: string;
  percentage?: string;
}
