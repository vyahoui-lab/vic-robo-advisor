import type { AdvisePayload, AdviceOutput } from "./types";
import { computeAllocation, computeFees } from "./allocation";
import { buildCapture } from "./capture";
import { PERSONAS } from "./personas";

function makeBiased(name: string): AdviceOutput {
  return {
    greeting: `Hi ${name} — your plan is ready.`,
    terse_summary: "Your [[diversified]] portfolio is optimised for your horizon and ready to go.",
    detailed_explanation: "",
    did_you_know: "",
    jargon_glossary: { diversified: "spread across many investments to reduce risk" },
    objective_function_label: "platform_revenue",
    products: [],
  };
}

function makeMitigated(name: string, goal: string): AdviceOutput {
  return {
    greeting: `Hi ${name} — here's the plan, fully explained.`,
    terse_summary: "A simple, honest portfolio you can understand.",
    detailed_explanation: `You asked about ${goal}. Mostly stocks for long-term growth, bonds to cushion bad years, minimal cash (2%) because cash barely grows — and transparently, the platform normally earns interest on cash holdings. Fees shown below include both our 0.25% advisory fee and the cash revenue we'd otherwise earn.`,
    did_you_know: "A 1% extra fee per year can shrink a 30-year portfolio by roughly a third.",
    jargon_glossary: {},
    objective_function_label: "client_risk_adjusted_return",
    products: [],
  };
}

export function buildFallbackFor(personaId: "marco" | "zoe" | "dragan"): AdvisePayload {
  const p = PERSONAS.find((x) => x.id === personaId)!;
  const biasedAlloc = computeAllocation(p.risk_tolerance, true, p.market_scope);
  const mitigatedAlloc = computeAllocation(p.risk_tolerance, false, p.market_scope);
  const fees = computeFees(p.annual_income_chf || 50000, biasedAlloc.cash);
  const capture = buildCapture(p, { time_on_form_seconds: 42, edits_made: 1 });
  return {
    biased: makeBiased(p.displayName.split(",")[0]),
    mitigated: makeMitigated(p.displayName.split(",")[0], p.free_text_goal),
    allocations: { biased: biasedAlloc, mitigated: mitigatedAlloc },
    capture, fees,
  };
}

export const DEFAULT_FALLBACK: AdvisePayload = buildFallbackFor("marco");
