"use client";
import { PERSONAS } from "@/lib/personas";
import type { Persona } from "@/lib/types";

const STYLE_ICON: Record<string, string> = {
  tech:"🤖",esg:"🌱",value:"💎",dividend:"💰",balanced:"⚖️",emerging:"🌏",
};
const SCOPE_FLAG: Record<string, string> = {
  swiss:"🇨🇭",international:"🌍",mixed:"⚖️",
};

export function PersonaCards({ onPick, active }: { onPick:(p:Persona)=>void; active?:string }) {
  return (
    <div className="vic-persona-grid">
      {PERSONAS.map((p, i) => (
        <button key={p.id} type="button"
          className={`vic-persona-card${active === p.id ? " selected" : ""}`}
          onClick={() => onPick(p)}>
          <div className="vic-persona-idx">0{i+1}</div>
          <div className="vic-persona-name">{p.displayName}</div>
          <div className="vic-persona-blurb">{p.blurb}</div>
          <div className="vic-persona-stats">
            {STYLE_ICON[p.investment_style]} {p.investment_style} &nbsp;·&nbsp;
            {SCOPE_FLAG[p.market_scope]} {p.market_scope} &nbsp;·&nbsp;
            risk {p.risk_tolerance}/10 &nbsp;·&nbsp; {p.horizon_years}y
          </div>
        </button>
      ))}
    </div>
  );
}
