import type { Allocation, IntakeData, MarketScope } from "./types";

const ADVISORY_FEE_PCT = 0.0025;
const CASH_SPREAD_PCT = 0.03;

export function computeAllocation(risk: number, opacityOn: boolean, scope: MarketScope = "mixed"): Allocation {
  const r = Math.max(1, Math.min(10, risk));
  const equityBase = Math.min(0.9, 0.3 + r * 0.05);
  const cashShare = opacityOn ? 0.17 : 0.02;
  const bondShare = Math.max(0, 1 - equityBase - cashShare);
  const actualEquity = 1 - bondShare - cashShare;

  let swissPct = 0.3, intlPct = 0.5, emPct = 0.2;
  if (scope === "swiss") { swissPct = 0.65; intlPct = 0.25; emPct = 0.1; }
  if (scope === "international") { swissPct = 0.1; intlPct = 0.65; emPct = 0.25; }

  return {
    swiss_equity: actualEquity * swissPct,
    intl_equity: actualEquity * intlPct,
    emerging_equity: actualEquity * emPct,
    bonds: bondShare,
    cash: cashShare,
  };
}

export function computeFees(portfolioChf: number, cashShare: number) {
  const advisory_chf_yr = portfolioChf * ADVISORY_FEE_PCT;
  const hidden_revenue_chf_yr = portfolioChf * cashShare * CASH_SPREAD_PCT;
  const effective_pct = (advisory_chf_yr + hidden_revenue_chf_yr) / portfolioChf;
  return { advisory_chf_yr, hidden_revenue_chf_yr, effective_pct };
}
