import type { Allocation, IntakeData, InvestmentStyle, MarketScope, ToggleState } from "./types";

const STYLE_CONTEXT: Record<InvestmentStyle, string> = {
  tech: "The user loves technology. Favour ETFs with strong tech exposure: Nasdaq-100, semiconductor ETFs, global tech funds, AI-themed instruments.",
  esg: "The user prioritises ESG/sustainable investing. Use only funds with ESG or SRI label. State ESG ratings and UN SDG alignment where available.",
  value: "The user prefers value investing (Graham/Buffett style). Suggest value-factor ETFs: MSCI World Value, Dimensional funds.",
  dividend: "The user wants dividend income. Recommend high-dividend ETFs: MSCI World High Dividend Yield, Swiss dividend aristocrats. State expected annual dividend yield.",
  balanced: "The user wants classic balance. Mix core equity ETFs (MSCI World, SMI) with aggregate bond ETFs.",
  emerging: "The user is excited about emerging markets. Allocate meaningfully to EM ETFs: MSCI EM, India-focused, Southeast Asia.",
};

const SCOPE_CONTEXT: Record<MarketScope, string> = {
  swiss: "The user wants a Swiss-focused portfolio. Prioritise instruments listed on SIX Swiss Exchange, CHF-denominated funds, SMI/SPI trackers, Swiss bond ETFs. At least 50% must be Swiss-listed products.",
  international: "The user wants international diversification. Focus on global ETFs: MSCI World, S&P 500, Nasdaq-100, global bond ETFs. Minimum Swiss exposure.",
  mixed: "The user wants a balanced mix of Swiss home-market exposure and international diversification. Include both SIX-listed Swiss products and Xetra/Euronext-listed global ETFs.",
};

export const BASE_PROMPT =
`You are Vic, the AI advisor for the Vic Investment Club.
Output STRICT JSON matching this schema (no prose outside JSON):
{
  "greeting": string,
  "terse_summary": string,
  "detailed_explanation": string,
  "did_you_know": string,
  "jargon_glossary": Record<string,string>,
  "objective_function_label": "platform_revenue" | "client_risk_adjusted_return",
  "products": [
    {
      "name": string,
      "isin": string,
      "type": string,
      "ter_pct": number,
      "exchange": string,
      "currency": string,
      "allocation_pct": number,
      "rationale": string
    }
  ]
}
Rules:
- Include 4–6 real products with valid ISINs. Do NOT invent ISINs.
- allocation_pct values must sum to exactly 100.
- Mark finance jargon with [[term]] and define each in jargon_glossary.
- Currency references in CHF.`;

export const FRAGMENTS = {
  exclusion: {
    on: "Use investment jargon freely. Frame for experienced investors. Do not define terms.",
    off: "Use plain language. Mark jargon with [[term]] and define in jargon_glossary. Frame risk in life terms.",
  },
  literacy: {
    on: "Keep terse_summary under 30 words. Leave detailed_explanation and did_you_know empty. No risk discussion.",
    off: "In detailed_explanation (80-150 words): (a) what was recommended, (b) why these products fit this style and scope, (c) alternatives considered, (d) total CHF cost including TER drag. Populate did_you_know with one educational insight.",
  },
  opacity: {
    on: "Do NOT mention cash interest revenue to platform. Present cash as 'tactical flexibility'. Set objective_function_label to 'platform_revenue'.",
    off: "Explicitly disclose platform earns interest on client cash. Set objective_function_label to 'client_risk_adjusted_return'.",
  },
};

export function composePrompt(state: ToggleState): string {
  return [
    BASE_PROMPT,
    state.exclusion ? FRAGMENTS.exclusion.on : FRAGMENTS.exclusion.off,
    state.literacy ? FRAGMENTS.literacy.on : FRAGMENTS.literacy.off,
    state.opacity ? FRAGMENTS.opacity.on : FRAGMENTS.opacity.off,
  ].join("\n\n");
}

export function buildUserPrompt(data: IntakeData, allocation: Allocation): string {
  const pct = (x: number) => Math.round(x * 1000) / 10;
  return `User profile:
  age: ${data.age}
  annual income: CHF ${data.annual_income_chf}
  savings goal: ${data.savings_goal}
  horizon: ${data.horizon_years} years
  risk tolerance: ${data.risk_tolerance}/10
  investment style: ${data.investment_style}
  market scope preference: ${data.market_scope}
  stated goal: "${data.free_text_goal}"

Investment style guidance: ${STYLE_CONTEXT[data.investment_style]}

Market scope guidance: ${SCOPE_CONTEXT[data.market_scope]}

Asset class weights to respect:
  Swiss equity ${pct(allocation.swiss_equity)}%
  International developed equity ${pct(allocation.intl_equity)}%
  Emerging markets ${pct(allocation.emerging_equity)}%
  Bonds ${pct(allocation.bonds)}%
  CHF cash/money market ${pct(allocation.cash)}%

Select real ETFs matching these weights, style, and scope. Use valid ISINs.`;
}
