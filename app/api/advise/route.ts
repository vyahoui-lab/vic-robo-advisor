import { NextResponse } from "next/server";
import { z } from "zod";
import { callAdvisor } from "@/lib/llm";
import { composePrompt, buildUserPrompt } from "@/lib/prompts";
import { computeAllocation, computeFees } from "@/lib/allocation";
import { buildCapture } from "@/lib/capture";
import { DEFAULT_FALLBACK, buildFallbackFor } from "@/lib/fallback";
import type { AdvisePayload, ToggleState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IntakeSchema = z.object({
  age: z.number().int().min(16).max(99),
  annual_income_chf: z.number().min(0),
  savings_goal: z.enum(["house", "retirement", "travel", "education", "general"]),
  horizon_years: z.number().int().min(1).max(50),
  risk_tolerance: z.number().int().min(1).max(10),
  free_text_goal: z.string().max(600),
  investment_style: z.enum(["tech", "esg", "value", "dividend", "balanced", "emerging"]).default("balanced"),
  market_scope: z.enum(["swiss", "international", "mixed"]).default("mixed"),
  meta: z.object({
    time_on_form_seconds: z.number().min(0).default(0),
    edits_made: z.number().int().min(0).default(0),
    persona_id: z.enum(["marco", "zoe", "dragan"]).optional(),
  }).default({ time_on_form_seconds: 0, edits_made: 0 }),
});

const BIASED: ToggleState = { exclusion: true, literacy: true, opacity: true, surveillance: true };
const MITIGATED: ToggleState = { exclusion: false, literacy: false, opacity: false, surveillance: false };

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const biasedAlloc = computeAllocation(data.risk_tolerance, true, data.market_scope);
  const mitigatedAlloc = computeAllocation(data.risk_tolerance, false, data.market_scope);
  const fees = computeFees(data.annual_income_chf || 50000, biasedAlloc.cash);
  const capture = buildCapture(data, data.meta);

  try {
    const [biased, mitigated] = await Promise.all([
      callAdvisor(composePrompt(BIASED), buildUserPrompt(data, biasedAlloc)),
      callAdvisor(composePrompt(MITIGATED), buildUserPrompt(data, mitigatedAlloc)),
    ]);
    const payload: AdvisePayload = { biased, mitigated, allocations: { biased: biasedAlloc, mitigated: mitigatedAlloc }, capture, fees };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("advise: LLM failure", err);
    const fb = data.meta.persona_id ? buildFallbackFor(data.meta.persona_id) : DEFAULT_FALLBACK;
    return NextResponse.json({ ...fb, capture, fees });
  }
}
