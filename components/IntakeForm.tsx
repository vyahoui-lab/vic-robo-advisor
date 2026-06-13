"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeData, InvestmentStyle, MarketScope, Persona, SavingsGoal } from "@/lib/types";

const EMPTY: IntakeData = {
  age: 25, annual_income_chf: 30000, savings_goal: "general",
  horizon_years: 10, risk_tolerance: 5, free_text_goal: "",
  investment_style: "balanced", market_scope: "mixed",
};

const RISK_LABELS: Record<number, string> = {
  1:"Very cautious",2:"Cautious",3:"Cautious",4:"Moderate",5:"Moderate",
  6:"Balanced",7:"Growth-oriented",8:"Aggressive",9:"Aggressive",10:"Very aggressive",
};

const GOALS: { id: SavingsGoal; label: string }[] = [
  { id:"house", label:"House" }, { id:"retirement", label:"Retirement" },
  { id:"travel", label:"Travel" }, { id:"education", label:"Education" }, { id:"general", label:"General growth" },
];

const STYLES: { id: InvestmentStyle; icon: string; label: string; desc: string }[] = [
  { id:"tech",      icon:"🤖", label:"Tech & AI",       desc:"Nasdaq, semis, cloud" },
  { id:"esg",       icon:"🌱", label:"ESG / Green",     desc:"SRI, impact, green bonds" },
  { id:"value",     icon:"💎", label:"Value",           desc:"Graham-style, undervalued" },
  { id:"dividend",  icon:"💰", label:"Dividend",        desc:"High yield, income" },
  { id:"balanced",  icon:"⚖️", label:"Balanced",        desc:"Classic 60/40, simple" },
  { id:"emerging",  icon:"🌏", label:"Emerging Mkts",  desc:"India, SEA, EM growth" },
];

const SCOPES: { id: MarketScope; flag: string; label: string; desc: string }[] = [
  { id:"swiss",         flag:"🇨🇭", label:"Swiss focus",      desc:"SIX-listed, CHF-denominated" },
  { id:"international", flag:"🌍", label:"International",     desc:"Global ETFs, MSCI World, S&P" },
  { id:"mixed",         flag:"⚖️", label:"Mixed",             desc:"Home bias + global diversification" },
];

export function IntakeForm({ initial, personaId }: { initial?: Persona; personaId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<IntakeData>(initial ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useState(() => Date.now())[0];
  const [edits, setEdits] = useState(0);

  const patch = <K extends keyof IntakeData>(k: K, v: IntakeData[K]) => {
    setEdits(e => e + 1); setData(d => ({ ...d, [k]: v }));
  };
  const numPatch = (k: "age" | "annual_income_chf" | "horizon_years") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value, 10);
      patch(k, isNaN(n) ? 0 : n);
    };
  const show = (n: number) => n === 0 ? "" : String(n);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    const body = { ...data, meta: { time_on_form_seconds: Math.round((Date.now() - startedAt) / 1000), edits_made: edits, persona_id: personaId } };
    sessionStorage.setItem("advise-intake-request", JSON.stringify(body));
    sessionStorage.removeItem("advise-payload");
    router.push("/advice");
  }

  return (
    <form onSubmit={onSubmit}>
      {/* 01 Age */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">01</span><span className="vic-form-name">Your age</span></div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
          <input className="vic-input" style={{ width:100 }} type="text" inputMode="numeric"
            value={show(data.age)} onChange={numPatch("age")} placeholder="25" />
          <span className="vic-input-unit">years</span>
        </div>
      </div>

      {/* 02 Income */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">02</span><span className="vic-form-name">Annual income</span></div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
          <span className="vic-input-unit">CHF</span>
          <input className="vic-input" style={{ flex:1 }} type="text" inputMode="numeric"
            value={show(data.annual_income_chf)} onChange={numPatch("annual_income_chf")} placeholder="60,000" />
        </div>
      </div>

      {/* 03 Goal */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">03</span><span className="vic-form-name">Savings goal</span></div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {GOALS.map(g => (
            <button key={g.id} type="button"
              className={`vic-pill-btn${data.savings_goal === g.id ? " selected" : ""}`}
              onClick={() => patch("savings_goal", g.id)}>{g.label}</button>
          ))}
        </div>
      </div>

      {/* 04 Investment style */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">04</span><span className="vic-form-name">What excites you as an investor?</span></div>
        <div className="vic-style-grid">
          {STYLES.map(s => (
            <button key={s.id} type="button"
              className={`vic-style-card${data.investment_style === s.id ? " selected" : ""}`}
              onClick={() => patch("investment_style", s.id)}>
              <div className="vic-style-icon">{s.icon}</div>
              <div className="vic-style-title">{s.label}</div>
              <div className="vic-style-desc">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 05 Market scope */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">05</span><span className="vic-form-name">Swiss or international focus?</span></div>
        <div className="vic-scope-grid">
          {SCOPES.map(s => (
            <button key={s.id} type="button"
              className={`vic-scope-card${data.market_scope === s.id ? " selected" : ""}`}
              onClick={() => patch("market_scope", s.id)}>
              <div className="vic-scope-flag">{s.flag}</div>
              <div className="vic-scope-title">{s.label}</div>
              <div className="vic-scope-desc">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 06 Horizon */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">06</span><span className="vic-form-name">Investment horizon</span></div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
          <input className="vic-input" style={{ width:100 }} type="text" inputMode="numeric"
            value={show(data.horizon_years)} onChange={numPatch("horizon_years")} placeholder="10" />
          <span className="vic-input-unit">years</span>
        </div>
      </div>

      {/* 07 Risk */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">07</span><span className="vic-form-name">Risk tolerance</span></div>
        <div className="vic-range-wrap">
          <div className="vic-range-display">
            <span className="vic-range-val">{data.risk_tolerance}</span>
            <span className="vic-range-max">/10</span>
            <span className="vic-range-label-text">&nbsp;— {RISK_LABELS[data.risk_tolerance]}</span>
          </div>
          <input type="range" min={1} max={10} step={1} value={data.risk_tolerance}
            onChange={e => patch("risk_tolerance", Number(e.target.value))} />
          <div className="vic-range-ticks"><span>1 — cautious</span><span>5 — balanced</span><span>10 — aggressive</span></div>
        </div>
      </div>

      {/* 08 Free text */}
      <div className="vic-form-field">
        <div className="vic-form-label"><span className="vic-form-num">08</span><span className="vic-form-name">In your own words</span></div>
        <textarea className="vic-textarea" rows={3}
          placeholder="What are you investing for? Any preferences or constraints?"
          value={data.free_text_goal}
          onChange={e => patch("free_text_goal", e.target.value)} />
      </div>

      <div style={{ paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--vic-ink-faint)" }}>
          For illustration purposes only — not financial advice
        </span>
        <button type="submit" disabled={submitting} className="vic-btn vic-btn-primary">
          {submitting ? "Vic is thinking…" : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Get my portfolio plan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
