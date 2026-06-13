"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { IntakeForm } from "@/components/IntakeForm";
import { PersonaCards } from "@/components/PersonaCards";
import type { Persona } from "@/lib/types";

export default function Home() {
  const [picked, setPicked] = useState<Persona | undefined>(undefined);

  return (
    <div className="vic-layout">
      <Sidebar />
      <main className="vic-main">
        <div className="vic-topbar">
          <div className="vic-topbar-title">New profile</div>
          <div className="vic-topbar-actions">
            <span className="vic-badge">
              <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              Vic AI
            </span>
          </div>
        </div>

        <div className="vic-form-wrap">
          <div className="vic-page-hero">
            <div className="vic-page-eyebrow">Vic Investment Club · Robo Advisor</div>
            <h1 className="vic-page-h1">Build your portfolio<br />in 2 minutes.</h1>
            <p className="vic-page-sub">Answer 8 questions. Get a personalised plan with real ETFs, valid ISINs, TER costs — Swiss or international.</p>
          </div>

          <div style={{ marginBottom:12, borderBottom:"1px solid var(--vic-border)", paddingBottom:8 }}>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--vic-ink-faint)", marginBottom:12 }}>
              Quick-start with a sample profile
            </div>
            <PersonaCards onPick={setPicked} active={picked?.id} />
          </div>

          {picked && (
            <div style={{ fontSize:12, color:"var(--vic-ink-faint)", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Pre-filled with <strong style={{color:"var(--vic-ink)"}}>{picked.displayName}</strong> — edit any field below
            </div>
          )}

          <IntakeForm key={picked?.id ?? "blank"} initial={picked} personaId={picked?.id} />

          <div className="vic-foot">
            <span>Vic Investment Club</span>
            <span>For illustration purposes only · Not financial advice</span>
          </div>
        </div>
      </main>
    </div>
  );
}
