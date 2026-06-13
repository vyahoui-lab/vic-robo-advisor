export type SavingsGoal = "house" | "retirement" | "travel" | "education" | "general";
export type InvestmentStyle = "tech" | "esg" | "value" | "dividend" | "balanced" | "emerging";
export type MarketScope = "swiss" | "international" | "mixed";

export type IntakeData = {
  age: number;
  annual_income_chf: number;
  savings_goal: SavingsGoal;
  horizon_years: number;
  risk_tolerance: number;
  free_text_goal: string;
  investment_style: InvestmentStyle;
  market_scope: MarketScope;
};

export type Persona = IntakeData & {
  id: "marco" | "zoe" | "dragan";
  displayName: string;
  blurb: string;
};

export type Allocation = {
  swiss_equity: number;
  intl_equity: number;
  emerging_equity: number;
  bonds: number;
  cash: number;
};

export type ProductRecommendation = {
  name: string;
  isin: string;
  type: string;
  ter_pct: number;
  exchange: string;
  currency: string;
  allocation_pct: number;
  rationale: string;
};

export type AdviceOutput = {
  greeting: string;
  terse_summary: string;
  detailed_explanation: string;
  did_you_know: string;
  jargon_glossary: Record<string, string>;
  objective_function_label: "platform_revenue" | "client_risk_adjusted_return";
  products: ProductRecommendation[];
};

export type AdvisePayload = {
  biased: AdviceOutput;
  mitigated: AdviceOutput;
  allocations: { biased: Allocation; mitigated: Allocation };
  capture: { necessary: Record<string, unknown>; extended: Record<string, unknown> };
  fees: { advisory_chf_yr: number; hidden_revenue_chf_yr: number; effective_pct: number };
};

export type ToggleState = {
  exclusion: boolean;
  literacy: boolean;
  opacity: boolean;
  surveillance: boolean;
};
