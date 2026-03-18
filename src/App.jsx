import { useState, useEffect } from "react";

const WEEKENDS = [
  { id: "may23", label: "May 23–25" },
  { id: "may30", label: "May 30 – Jun 1" },
  { id: "jun6",  label: "Jun 6–8" },
  { id: "jun13", label: "Jun 13–15" },
  { id: "jun20", label: "Jun 20–22" },
  { id: "jun27", label: "Jun 27–29" },
];

const SUPABASE_URL = "https://ofhvjgrkbkjgkomdhqkg.supabase.co";
const SUPABASE_KEY = "sb_publishable_1uja284ixi8NUYls4OEAxg_oAMlhkPn";
const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

async function fetchResponses() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses?select=*`, { headers: HEADERS });
  if (!res.ok) return [];
  return await res.json();
}

async function upsertResponse(row) {
  await fetch(`${SUPABASE_URL}/rest/v1/responses?name=eq.${encodeURIComponent(row.name)}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error("Save failed");
}

export default function App() {
  const [view, setView] = useState("home");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResponses().then(r => {
      setResponses(r);
      setLoading(false);
    });
  }, []);

  async function saveResponse() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await upsertResponse({
        name: name.trim(),
        handicap: handicap.trim() || null,
        weekends: Object.keys(selected).filter(k => selected[k]).join(","),
        submitted_at: Date.now(),
      });
      const updated = await fetchResponses();
      setResponses(updated);
      setSubmitted(true);
    } catch {
      alert("Something went wrong saving. Try again.");
    }
    setSubmitting(false);
  }

  function toggleWeekend(id) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function resetForm() {
    setName(""); setHandicap(""); setSelected({}); setSubmitted(false);
    setView("home");
  }

  const weekendCounts = WEEKENDS.map(w => ({
    ...w,
    count: responses.filter(r => r.weekends?.split(",").includes(w.id)).length,
    people: responses.filter(r => r.weekends?.split(",").includes(w.id)).map(r => r.name),
  })).sort((a, b) => b.count - a.count);

  const maxCount = weekendCounts[0]?.count || 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1a0f",
      backgroundImage: `
        radial-gradient(ellipse at 20% 0%, rgba(34,85,34,0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(20,60,20,0.4) 0%, transparent 50%)
      `,
      fontFamily: "'Georgia', serif",
      color: "#e8e0d0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .app-container { max-width: 680px; margin: 0 auto; padding: 40px 24px 80px; }
        .flag-banner { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; }
        .flag-icon { font-size: 36px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
        .title-block h1 { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #f0e8d0; letter-spacing: -0.5px; line-height: 1.1; }
        .title-block p { font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #7a9a6a; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #3a5a2a, transparent); margin: 32px 0; }
        .hero-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px; text-align: center; }
        .hero-card h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: #f0e8d0; margin-bottom: 10px; }
        .hero-card p { font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #9aaa8a; line-height: 1.7; margin-bottom: 28px; font-weight: 300; }
        .details-row { display: flex; justify-content: center; gap: 28px; margin-bottom: 28px; flex-wrap: wrap; }
        .detail-item { text-align: center; }
        .detail-item .label { font-family: 'Source Sans 3', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #6a8a5a; margin-bottom: 4px; }
        .detail-item .value { font-family: 'Playfair Display', serif; font-size: 16px; color: #d4c8a8; }
        .btn-primary { background: #4a7a3a; color: #f0e8d0; border: none; border-radius: 6px; padding: 14px 32px; font-family: 'Source Sans 3', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; display: block; width: 100%; }
        .btn-primary:hover { background: #5a8a4a; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-secondary { background: transparent; color: #9aaa8a; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 12px 24px; font-family: 'Source Sans 3', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 10px; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.25); color: #d4c8a8; }
        .form-section label { display: block; font-family: 'Source Sans 3', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #7a9a6a; margin-bottom: 8px; }
        .form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px 14px; font-family: 'Source Sans 3', sans-serif; font-size: 15px; color: #f0e8d0; outline: none; transition: border-color 0.2s; margin-bottom: 20px; }
        .form-input:focus { border-color: #4a7a3a; }
        .form-input::placeholder { color: #4a5a3a; }
        .weekend-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 28px; }
        .weekend-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px 12px; cursor: pointer; transition: all 0.2s; text-align: left; }
        .weekend-btn:hover { border-color: rgba(74,122,58,0.5); background: rgba(74,122,58,0.08); }
        .weekend-btn.active { border-color: #4a7a3a; background: rgba(74,122,58,0.18); }
        .weekend-btn .wk-label { font-family: 'Playfair Display', serif; font-size: 15px; color: #f0e8d0; display: block; }
        .weekend-btn .wk-sub { font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #6a8a5a; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; display: block; }
        .weekend-btn.active .wk-sub { color: #8aaa7a; }
        .check-icon { float: right; font-size: 16px; margin-top: -2px; }
        .results-bar-row { margin-bottom: 14px; }
        .results-bar-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .results-bar-header .wknd-name { font-family: 'Playfair Display', serif; font-size: 16px; color: #f0e8d0; }
        .results-bar-header .wknd-count { font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #7a9a6a; letter-spacing: 1px; }
        .bar-track { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
        .bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
        .bar-fill.best { background: #6ab04a; }
        .bar-fill.good { background: #4a7a3a; }
        .bar-fill.low { background: #2a4a1a; }
        .name-list { font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #6a7a5a; font-weight: 300; }
        .response-count { display: inline-flex; align-items: center; gap: 6px; background: rgba(74,122,58,0.15); border: 1px solid rgba(74,122,58,0.3); border-radius: 20px; padding: 4px 12px; font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #8aaa7a; margin-bottom: 24px; }
        .success-state { text-align: center; padding: 20px 0; }
        .success-icon { font-size: 48px; margin-bottom: 16px; }
        .success-state h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: #f0e8d0; margin-bottom: 8px; }
        .success-state p { font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #9aaa8a; margin-bottom: 28px; font-weight: 300; }
        .nav-link { font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #6a8a5a; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; margin-right: 16px; }
        .nav-link:hover { color: #9aaa8a; }
        .best-badge { display: inline-block; background: rgba(106,176,74,0.2); border: 1px solid rgba(106,176,74,0.4); color: #8aca6a; font-family: 'Source Sans 3', sans-serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 2px 7px; border-radius: 3px; margin-left: 8px; vertical-align: middle; }
        .loading { text-align: center; padding: 60px 0; font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #4a6a3a; letter-spacing: 2px; text-transform: uppercase; }
      `}</style>

      <div className="app-container">
        <div className="flag-banner">
          <div className="flag-icon">⛳</div>
          <div className="title-block">
            <h1>The Golf Trip</h1>
            <p>Summer 2025 · Ryder Cup Format</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>

        ) : view === "home" ? (
          <div className="hero-card">
            <h2>We're making this happen.</h2>
            <p>2 teams of 6. 4 rounds. Friday through Sunday somewhere in Jersey, PA, or Westchester. First half of summer means we need to move. Mark your weekends below.</p>
            <div className="details-row">
              {[["Format","Ryder Cup"],["Teams","2 × 6"],["Rounds","4"],["Responses",`${responses.length} / 12`]].map(([l,v]) => (
                <div className="detail-item" key={l}>
                  <div className="label">{l}</div>
                  <div className="value">{v}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setView("form")}>Mark My Availability →</button>
            {responses.length > 0 && (
              <button className="btn-secondary" onClick={() => setView("results")}>View Results</button>
            )}
          </div>

        ) : view === "form" && !submitted ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <span className="nav-link" onClick={() => setView("home")}>← Back</span>
            </div>
            <div className="form-section">
              <label>Your Name</label>
              <input className="form-input" placeholder="First name is fine" value={name} onChange={e => setName(e.target.value)} />
              <label>Handicap (optional)</label>
              <input className="form-input" placeholder="e.g. 14" value={handicap} onChange={e => setHandicap(e.target.value)} />
              <label>Weekends You Can Make</label>
              <div className="weekend-grid">
                {WEEKENDS.map(w => (
                  <button key={w.id} className={`weekend-btn ${selected[w.id] ? "active" : ""}`} onClick={() => toggleWeekend(w.id)}>
                    {selected[w.id] && <span className="check-icon">✓</span>}
                    <span className="wk-label">{w.label}</span>
                    <span className="wk-sub">Friday–Sunday</span>
                  </button>
                ))}
              </div>
              <button className="btn-primary" onClick={saveResponse}
                disabled={!name.trim() || submitting || Object.values(selected).filter(Boolean).length === 0}>
                {submitting ? "Saving..." : "Submit Availability"}
              </button>
            </div>
          </>

        ) : view === "form" && submitted ? (
          <div className="success-state">
            <div className="success-icon">🏌️</div>
            <h2>You're in.</h2>
            <p>
              {Object.values(selected).filter(Boolean).length} weekend{Object.values(selected).filter(Boolean).length !== 1 ? "s" : ""} marked.
              {responses.length < 12 ? ` Still waiting on ${12 - responses.length} more.` : " Full squad."}
            </p>
            <button className="btn-primary" onClick={() => setView("results")}>See the Results</button>
            <button className="btn-secondary" onClick={resetForm}>Back to Home</button>
          </div>

        ) : view === "results" ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <span className="nav-link" onClick={() => setView("home")}>← Home</span>
              <span className="nav-link" onClick={() => { setSubmitted(false); setView("form"); }}>Edit My Picks</span>
            </div>
            <div className="response-count">● {responses.length} of 12 responded</div>
            {weekendCounts.map(w => (
              <div className="results-bar-row" key={w.id}>
                <div className="results-bar-header">
                  <span className="wknd-name">
                    {w.label}
                    {w.count === maxCount && maxCount > 0 && <span className="best-badge">Best</span>}
                  </span>
                  <span className="wknd-count">{w.count} available</span>
                </div>
                <div className="bar-track">
                  <div className={`bar-fill ${w.count === maxCount && maxCount > 0 ? "best" : w.count > maxCount * 0.5 ? "good" : "low"}`}
                    style={{ width: maxCount > 0 ? `${(w.count / 12) * 100}%` : "0%" }} />
                </div>
                <div className="name-list">{w.people.length > 0 ? w.people.join(", ") : "No responses yet"}</div>
              </div>
            ))}
            <div className="divider" />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#5a7a4a", marginBottom: 12 }}>Who's In</div>
              {responses.length === 0 ? (
                <div style={{ color: "#4a6a3a", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>No responses yet.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {responses.map(r => (
                    <div key={r.name} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 12px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "#c4b898" }}>
                      {r.name}{r.handicap ? ` · ${r.handicap}` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
