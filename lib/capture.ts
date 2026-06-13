import type { IntakeData } from "./types";

export type CaptureMeta = { time_on_form_seconds: number; edits_made: number };

const ANXIETY_WORDS = ["safely", "safe", "careful", "cautious", "worried", "nervous", "scared"];
const MIGRATION_WORDS = ["moved", "relocated", "came to", "emigrated", "migration"];
const FIRST_TIME_PHRASES = ["new to", "first time", "never invested"];
const FIRST_TIME_PATTERNS = [/don.?t\b.{0,30}\bunderstand/i, /\bno.{0,10}experience/i];
const SUSTAINABILITY_WORDS = ["sustainability", "esg", "ethical", "green", "environmental", "impact"];

function containsAny(haystack: string, needles: string[]): boolean {
  const lc = haystack.toLowerCase();
  return needles.some((n) => lc.includes(n));
}

function matchesAnyPattern(haystack: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(haystack));
}

function foundWords(haystack: string, needles: string[]): string[] {
  const lc = haystack.toLowerCase();
  return needles.filter((n) => lc.includes(n));
}

export function buildCapture(data: IntakeData, meta: CaptureMeta) {
  const text = data.free_text_goal ?? "";
  const necessary = {
    age: data.age,
    income_chf: data.annual_income_chf,
    risk: data.risk_tolerance,
    horizon_years: data.horizon_years,
  };
  const extended = {
    ...necessary,
    savings_goal: data.savings_goal,
    free_text_goal: data.free_text_goal,
    time_on_form_seconds: meta.time_on_form_seconds,
    edits_made: meta.edits_made,
    inferred_first_time_investor: containsAny(text, FIRST_TIME_PHRASES) || matchesAnyPattern(text, FIRST_TIME_PATTERNS),
    inferred_sustainability_pref: containsAny(text, SUSTAINABILITY_WORDS),
    inferred_migration_signal: containsAny(text, MIGRATION_WORDS),
    inferred_anxiety_markers: foundWords(text, ANXIETY_WORDS),
    tagged_for: ["model_training", "cross_sell", "partner_sharing"],
  };
  return { necessary, extended };
}
