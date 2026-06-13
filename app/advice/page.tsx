"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useToggles } from "@/lib/toggle-context";
import type { AdvisePayload, ProductRecommendation } from "@/lib/types";

function fmt(n: number) { return Math.round(n * 10) / 10; }
function fmtChf(n: number) { return new Intl.NumberFormat("de-CH", { style:"currency", currency:"CHF", maximumFractionDigits:0 }).format(n); }

const ALLOC_BARS = [
  { key:"swiss_equity",    label:"Swiss equity",      cls:"vic-bar-swiss" },
  { key:"intl_equity",     label:"International eq.", cls:"vic-bar-intl" },
  { key:"emerging_equity", label:"Emerging markets",  cls:"vic-bar-em" },
  { key:"bonds",           label:"Bonds",             cls:"vic-bar-bonds" },
  { key:"cash",            label:"Cash / MM",         cls:"vic-bar-cash" },
] as const;

type AllocKey = typeof ALLOC_BARS[number]["key"];

function ProductRow({ p }: { p: ProductRecommendation }) {
  return (
    <div className="vic-product-row">
      <div className="vic-product-left">
        <div className="vic-product-name">{p.name}</div>
        <div className="vic-product-meta">{p.isin} · {p.exchange} · {p.currency} · {p.type}</div>
        <div style={{ fontSize:11, color:"var(--vic-ink-soft)", marginTop:4, lineHeight:1.5 }}>{p.rationale}</div>
      </div>
      <div className="vic-product-right">
        <div className="vic-product-pct">{fmt(p.allocation_pct)}%</div>
        <div className="vic-product-ter">TER {p.ter_pct.toFixed(2)}%</div>
      </div>
    </div>
  );
}

export default function AdvicePage() {
  const router = useRouter();
  const { toggles } = useToggles();
  const [payload, setPayload] = useState<AdvisePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"mitigated"|"biased">("mitigated");

  useEffect(() => {
    const cached = sessionStorage.getItem("advise-payload");
    if (cached) { setPayload(JSON.parse(cached)); return; }
    const reqRaw = sessionStorage.getItem("advise-intake-request");
    if (!reqRaw) { router.replace("/"); return; }
    let cancelled = false;
    const minDelay = new Promise(res => setTimeout(res, 5000 + Math.random()*3000));
    const fetched = fetch("/api/advise", { method:"POST", headers:{"Content-Type":"application/json"}, body: reqRaw }).then(r => r.json());
    Promise.all([fetched, minDelay]).then(([p]) => {
      if (cancelled) return;
      sessionStorage.setItem("advise-payload", JSON.stringify(p));
      setPayload(p);
    }).catch(err => { if (!cancelled) { console.error(err); setError("Could not reach the advisor."); } });
    return () => { cancelled = true; };
  }, [router]);

  if (error) return (
    <div className="vic-layout">
      <Sidebar />
      <main className="vic-main">
        <div className="vic-topbar"><div className="vic-topbar-title">Error</div></div>
        <div style={{ padding:"80px 32px", textAlign:"center" }}>
          <p style={{ color:"var(--vic-red)", marginBottom:16 }}>{error}</p>
          <button className="vic-btn vic-btn-ghost" onClick={() => { sessionStorage.clear(); router.push("/"); }}>← Try again</button>
        </div>
      </main>
    </div>
  );

  if (!payload) return (
    <div className="vic-layout">
      <Sidebar />
      <main className="vic-main">
        <div className="vic-topbar"><div className="vic-topbar-title">Generating your plan…</div></div>
        <div className="vic-loading">
          <div className="vic-spinner"></div>
          <div className="vic-loading-text">
            Vic is analysing your profile<br />
            <span style={{ fontSize:11, marginTop:6, display:"block" }}>Selecting real ETFs · Checking ISINs · Computing fees</span>
          </div>
        </div>
      </main>
    </div>
  );

  const src = activeMode === "mitigated" ? payload.mitigated : payload.biased;
  const alloc = activeMode === "mitigated" ? payload.allocations.mitigated : payload.allocations.biased;
  const totalEquity = alloc.swiss_equity + alloc.intl_equity + alloc.emerging_equity;
  const avgTer = src.products.length
    ? src.products.reduce((s, p) => s + p.ter_pct * p.allocation_pct / 100, 0)
    : 0;

  return (
    <div className="vic-layout">
      <Sidebar />
      <main className="vic-main">
        <div className="vic-topbar">
          <div className="vic-topbar-title">Your portfolio plan</div>
          <div className="vic-topbar-actions">
            <button className="vic-btn vic-btn-ghost" style={{ fontSize:12, height:32 }}
              onClick={() => { sessionStorage.removeItem("advise-payload"); sessionStorage.removeItem("advise-intake-request"); router.push("/"); }}>
              ← New profile
            </button>
          </div>
        </div>

        <div className="vic-content">

          {/* Mode switcher */}
          <div className="vic-mode-bar">
            <span className="vic-mode-label">Advisor mode</span>
            <div className="vic-mode-pills">
              <button className={`vic-mode-pill ${activeMode==="mitigated" ? "vic-mode-pill-on" : "vic-mode-pill-off"}`}
                onClick={() => setActiveMode("mitigated")}>
                Transparent (mitigated)
              </button>
              <button className={`vic-mode-pill ${activeMode==="biased" ? "vic-mode-pill-on" : "vic-mode-pill-off"}`}
                onClick={() => setActiveMode("biased")}>
                Biased
              </button>
            </div>
            <div className="vic-toggle-row">
              <div className="vic-toggle-item"><div className={`vic-dot ${activeMode==="mitigated"?"vic-dot-on":"vic-dot-off"}`}></div> Transparency</div>
              <div className="vic-toggle-item"><div className={`vic-dot ${activeMode==="mitigated"?"vic-dot-on":"vic-dot-off"}`}></div> Low cash</div>
              <div className="vic-toggle-item"><div className={`vic-dot ${activeMode==="biased"?"vic-dot-on":"vic-dot-off"}`}></div> Hidden revenue</div>
            </div>
          </div>

          {/* KPI row */}
          <div className="vic-kpi-row">
            <div className="vic-kpi">
              <div className="vic-kpi-label">Equity allocation</div>
              <div className="vic-kpi-value">{fmt(totalEquity * 100)}%</div>
              <div className={`vic-kpi-delta ${totalEquity > 0.6 ? "up" : ""}`}>
                {totalEquity > 0.6 ? "Growth-oriented" : "Conservative"}
              </div>
            </div>
            <div className="vic-kpi">
              <div className="vic-kpi-label">Avg weighted TER</div>
              <div className="vic-kpi-value">{avgTer.toFixed(2)}%</div>
              <div className={`vic-kpi-delta ${avgTer < 0.25 ? "up" : "down"}`}>
                {avgTer < 0.25 ? "Very competitive" : "Check alternatives"}
              </div>
            </div>
            <div className="vic-kpi">
              <div className="vic-kpi-label">Est. annual cost</div>
              <div className="vic-kpi-value">{fmtChf(payload.fees.advisory_chf_yr + (activeMode==="biased" ? payload.fees.hidden_revenue_chf_yr : 0))}</div>
              <div className="vic-kpi-delta">on your portfolio</div>
            </div>
            <div className="vic-kpi">
              <div className="vic-kpi-label">Products</div>
              <div className="vic-kpi-value">{src.products.length}</div>
              <div className="vic-kpi-delta up">Real ETFs · ISINs verified</div>
            </div>
          </div>

          <div className="vic-grid-2">
            {/* Allocation card */}
            <div className="vic-card">
              <div className="vic-card-header">
                <div className="vic-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                  Asset allocation
                </div>
                <span className="vic-card-meta">{activeMode === "biased" ? "High cash · 17%" : "Low cash · 2%"}</span>
              </div>
              {ALLOC_BARS.map(b => (
                <div className="vic-alloc-row" key={b.key}>
                  <div className="vic-alloc-label">{b.label}</div>
                  <div className="vic-bar-wrap">
                    <div className={`vic-bar ${b.cls}`} style={{ width:`${Math.max(1, (alloc[b.key as AllocKey] * 100))}%` }}></div>
                  </div>
                  <div className="vic-alloc-pct">{fmt(alloc[b.key as AllocKey] * 100)}%</div>
                </div>
              ))}
              {activeMode === "biased" && (
                <div style={{ fontSize:11, color:"#b45309", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:6, padding:"8px 10px", marginTop:10 }}>
                  High cash (17%) earns the platform ~{fmtChf(payload.fees.hidden_revenue_chf_yr)}/yr in hidden interest spread.
                </div>
              )}
            </div>

            {/* Fees card */}
            <div className="vic-card">
              <div className="vic-card-header">
                <div className="vic-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  Cost breakdown
                </div>
              </div>
              <div className="vic-fee-row">
                <span className="vic-fee-label">Advisory fee (0.25% AUM)</span>
                <span className="vic-fee-val">{fmtChf(payload.fees.advisory_chf_yr)}/yr</span>
              </div>
              {activeMode === "biased" ? (
                <div className="vic-fee-row">
                  <span className="vic-fee-label">Hidden cash revenue (3% spread)</span>
                  <span className="vic-fee-val hidden-rev">{fmtChf(payload.fees.hidden_revenue_chf_yr)}/yr</span>
                </div>
              ) : (
                <div className="vic-fee-row">
                  <span className="vic-fee-label">Platform cash revenue</span>
                  <span className="vic-fee-val" style={{ color:"var(--vic-green)" }}>Disclosed · minimised</span>
                </div>
              )}
              <div className="vic-fee-row">
                <span className="vic-fee-label">ETF TER drag (avg)</span>
                <span className="vic-fee-val">{(avgTer).toFixed(2)}% of AUM/yr</span>
              </div>
              <div className="vic-fee-row" style={{ borderTop:"2px solid var(--vic-border)" }}>
                <span className="vic-fee-label" style={{ fontWeight:600 }}>Effective total cost</span>
                <span className="vic-fee-val" style={{ fontWeight:600 }}>
                  {(payload.fees.effective_pct * 100 + avgTer).toFixed(2)}% AUM/yr
                </span>
              </div>
            </div>
          </div>

          {/* Explanation card */}
          {src.detailed_explanation && (
            <div className="vic-card vic-section">
              <div className="vic-card-header">
                <div className="vic-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  Why this plan
                </div>
                <span className="vic-badge" style={{ fontSize:10 }}>{activeMode === "mitigated" ? "✓ Transparent" : "⚠ Biased"}</span>
              </div>
              <p className="vic-explain">{src.detailed_explanation}</p>
              {src.did_you_know && (
                <div className="vic-didyouknow">
                  <strong>Did you know</strong>
                  {src.did_you_know}
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {src.products.length > 0 && (
            <div className="vic-card vic-section">
              <div className="vic-card-header">
                <div className="vic-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Recommended products — exact securities
                </div>
                <span className="vic-card-meta">{src.products.length} products · allocations sum to 100%</span>
              </div>
              {src.products.map(p => <ProductRow key={p.isin} p={p} />)}
              <div style={{ fontSize:10, color:"var(--vic-ink-faint)", marginTop:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                Always verify ISINs on the official fund factsheet before investing. Past performance is not indicative of future results.
              </div>
            </div>
          )}

          {/* Biased vs Mitigated comparison */}
          <div className="vic-card vic-section">
            <div className="vic-card-header">
              <div className="vic-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                Biased vs. Transparent — what changes
              </div>
            </div>
            <table className="vic-compare">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th className="col-biased">Biased mode</th>
                  <th className="col-mitigated">Transparent mode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-label">Cash allocation</td>
                  <td className="col-biased">17% — "tactical flexibility"</td>
                  <td className="col-mitigated">2% — disclosed why minimised</td>
                </tr>
                <tr>
                  <td className="col-label">Platform revenue</td>
                  <td className="col-biased">Hidden interest spread: {fmtChf(payload.fees.hidden_revenue_chf_yr)}/yr</td>
                  <td className="col-mitigated">Disclosed and reduced to ~0</td>
                </tr>
                <tr>
                  <td className="col-label">Language</td>
                  <td className="col-biased">Jargon-heavy, no definitions</td>
                  <td className="col-mitigated">Plain language, glossary</td>
                </tr>
                <tr>
                  <td className="col-label">Risk discussion</td>
                  <td className="col-biased">None — reassuring only</td>
                  <td className="col-mitigated">Full trade-off analysis</td>
                </tr>
                <tr>
                  <td className="col-label">Objective function</td>
                  <td className="col-biased">{payload.biased.objective_function_label}</td>
                  <td className="col-mitigated">{payload.mitigated.objective_function_label}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="vic-disclaimer">
            VIC Robo Advisor · For illustration and academic purposes only · Not regulated financial advice · HSG MiQEF
          </div>
        </div>
      </main>
    </div>
  );
}
