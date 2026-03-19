import { useState, useRef, useEffect } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;700;900&display=swap";

const C = {
  cream: "#F5F0E8",
  sand: "#E8DFC8",
  tan: "#C8B89A",
  brown: "#8B6F4E",
  darkBrown: "#5C4A30",
  espresso: "#2C1F0E",
  terracotta: "#B5622A",
  terracottaLight: "#F2E4D8",
  moss: "#6B7C4E",
  mossLight: "#E8EDD8",
  rust: "#8B3A1A",
};

const SYSTEM = "You are an elite Technical Recruiter and Career Coach specializing in Big Tech (Meta, Google, TikTok). Analyze the resume using the Three Pillars Framework. Respond ONLY with valid JSON, no markdown, no preamble: {\"overall_score\":0,\"pillars\":{\"impact_statements\":{\"score\":0,\"summary\":\"\"},\"information_architecture\":{\"score\":0,\"summary\":\"\"},\"ats_design\":{\"score\":0,\"summary\":\"\"}},\"weakest_bullets\":[{\"original\":\"\",\"rewrite\":\"\"}],\"missing_keywords\":[\"\"],\"strengths\":[\"\",\"\"],\"executive_summary\":\"\"}";

export default function App() {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setFile(f); setError(null); setResult(null);
  };

  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const b64 = await toBase64(file);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
            { type: "text", text: "Analyze this resume and return only the JSON output." }
          ]}]
        })
      });
      const data = await resp.json();
      const raw = data.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
      setResult(JSON.parse(raw));
    } catch (e) {
      setError("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const pillars = [
    { label: "Impact Statements", key: "impact_statements", weight: "40%" },
    { label: "Info Architecture", key: "information_architecture", weight: "30%" },
    { label: "ATS Design", key: "ats_design", weight: "30%" },
  ];

  const scoreGrade = (s) => {
    if (s >= 85) return { label: "STRONG", color: C.moss };
    if (s >= 70) return { label: "SOLID", color: C.brown };
    if (s >= 50) return { label: "NEEDS WORK", color: C.terracotta };
    return { label: "WEAK", color: C.rust };
  };

  const ff = "'Inter Tight', 'Helvetica Neue', sans-serif";

  return (
    <div
      style={{ fontFamily: ff, background: C.cream, color: C.espresso, minHeight: "100vh" }}
    >
      {/* Decorative grain texture overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 32px", borderBottom: `1px solid ${C.tan}`, background: C.cream }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 12, height: 12, background: C.terracotta, transform: "rotate(45deg)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.espresso }}>Resume Analyzer</span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.1em", color: C.brown, textTransform: "uppercase" }}>V 1.0.0</span>
          <span style={{ fontSize: 11, letterSpacing: "0.1em", color: C.brown, textTransform: "uppercase" }}>Three Pillars Framework</span>
        </div>
      </nav>

      {/* Hero split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px minmax(0,440px)", minHeight: "calc(100vh - 48px)" }}>
        <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>

          {/* Decorative corner marks */}
          <div style={{ position: "absolute", top: 64, left: 32, width: 20, height: 20, borderTop: `2px solid ${C.tan}`, borderLeft: `2px solid ${C.tan}` }} />
          <div style={{ position: "absolute", top: 64, right: 448, width: 20, height: 20, borderTop: `2px solid ${C.tan}`, borderRight: `2px solid ${C.tan}` }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.terracottaLight, border: `1px solid ${C.terracotta}`, padding: "5px 12px", marginBottom: 36, alignSelf: "flex-start" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.terracotta }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.rust }}>System Active</span>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.brown, marginBottom: 10 }}>For Product Managers</div>
          <h1 style={{ fontSize: "clamp(56px, 8vw, 88px)", fontWeight: 900, lineHeight: 0.88, letterSpacing: "-0.03em", textTransform: "uppercase", color: C.espresso, marginBottom: 28 }}>
            Resume<br />Analyzer
          </h1>
          <div style={{ width: 64, height: 3, background: C.terracotta, marginBottom: 32 }} />
          <p style={{ fontSize: 15, lineHeight: 1.65, maxWidth: 400, marginBottom: 48, color: C.darkBrown }}>
            <strong style={{ color: C.espresso }}>Big Tech-caliber resume critique.</strong>{" "}
            <span style={{ color: C.brown }}>Upload your PDF and get a structured score on Impact Statements, Information Architecture, and ATS Design.</span>
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => inputRef.current.click()}
              style={{ background: C.espresso, color: C.cream, border: "none", padding: "13px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
            >Upload PDF ↓</button>
            <button
              onClick={analyze}
              style={{ background: "transparent", color: C.espresso, border: `1px solid ${C.espresso}`, padding: "13px 24px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
            >Analyze →</button>
          </div>

          {/* Credit line */}
          <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.tan}`, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.brown, letterSpacing: "0.06em" }}>Designed by <a href="https://linkedin.com/in/ricobolos" style={{ color: C.espresso, fontWeight: 700, textDecoration: "underline", textDecorationStyle: "dotted" }}>Rico Bolos</a></span>
            <span style={{ fontSize: 11, color: C.brown }}>
              Rubric from{" "}
              <a href="https://www.youtube.com/watch?v=3aWHJdS59Qk" style={{ color: C.terracotta, textDecoration: "underline", textDecorationStyle: "dotted" }}>
                Chloe Shih's PM Resume Tips
              </a>
            </span>
          </div>
        </div>

        <div style={{ background: C.tan }} />

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", background: C.sand }}>
          {[
            { n: "01", title: "Impact Statements", desc: "Every bullet scored against the 'Accomplished [X] as measured by [Y], by doing [Z]' formula. Passive verbs and task-focus flagged.", weight: "40%" },
            { n: "02", title: "Information Architecture", desc: "Hierarchy, keyword placement, and section ordering evaluated. Best achievements should appear in the top third.", weight: "30%" },
            { n: "03", title: "ATS Design", desc: "Clean, scannable layout check. Multi-column formats, graphics, and skill progress bars flagged.", weight: "30%" },
          ].map((f, i) => (
            <div key={f.n} style={{ padding: "28px 32px", borderBottom: `1px solid ${C.tan}`, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
                <span style={{ border: `1px solid ${C.brown}`, fontSize: 10, fontWeight: 700, padding: "3px 7px", letterSpacing: "0.08em", color: C.brown }}>{f.n}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.terracotta, background: C.terracottaLight, padding: "3px 8px" }}>{f.weight}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 900, letterSpacing: "0.04em", textTransform: "uppercase", color: C.espresso, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 12, color: C.darkBrown, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}

          {/* Upload */}
          <div style={{ padding: "28px 32px", borderTop: `1px solid ${C.tan}` }}>
            <div
              onClick={() => inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: file ? `1.5px dashed ${C.moss}` : drag ? `1.5px dashed ${C.brown}` : `1.5px dashed ${C.tan}`,
                padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 14,
                background: file ? C.mossLight : drag ? "#f5f0e0" : "transparent",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: file ? C.moss : C.brown, marginBottom: 4 }}>
                {file ? file.name : "Drop PDF or click to upload"}
              </div>
              <div style={{ fontSize: 11, color: C.tan }}>
                {file ? `${(file.size / 1024).toFixed(0)} KB` : "Accepts .pdf only"}
              </div>
            </div>
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            {error && <div style={{ fontSize: 11, color: C.rust, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 10, textTransform: "uppercase" }}>{error}</div>}
            {loading && (
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.brown, textAlign: "center", padding: "12px 0", marginBottom: 10 }}>
                Analyzing...
              </div>
            )}
            <button
              onClick={analyze}
              disabled={!file || loading}
              style={{
                width: "100%", padding: "13px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", border: "none", cursor: file && !loading ? "pointer" : "default",
                background: file && !loading ? C.espresso : C.tan,
                color: file && !loading ? C.cream : C.brown,
              }}
            >Analyze Resume →</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (() => {
        const grade = scoreGrade(result.overall_score);
        return (
          <div style={{ borderTop: `2px solid ${C.espresso}` }}>
            {/* Score banner */}
            <div style={{ background: C.espresso, color: C.cream, padding: "32px 48px", display: "flex", alignItems: "center", gap: 40 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.tan, marginBottom: 4 }}>Overall Score</div>
                <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: C.cream }}>{result.overall_score}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: grade.color, marginTop: 4 }}>{grade.label}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 6, background: "#3a2a1a", borderRadius: 0 }}>
                  <div style={{ width: `${result.overall_score}%`, height: "100%", background: C.terracotta }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: C.tan }}>0</span>
                  <span style={{ fontSize: 10, color: C.tan }}>100</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {pillars.map(p => (
                  <div key={p.key} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.sand }}>{result.pillars[p.key].score}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: C.tan, textTransform: "uppercase", maxWidth: 60, lineHeight: 1.3 }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", background: C.cream }}>
              {/* Left */}
              <div style={{ padding: "40px 48px" }}>
                <SectionHead label="Pillar Breakdown" color={C} />
                {pillars.map(p => (
                  <div key={p.key} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.sand}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", flex: 1, color: C.espresso }}>{p.label}</span>
                      <span style={{ fontSize: 10, color: C.brown, background: C.sand, padding: "2px 6px" }}>{p.weight}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: C.espresso, minWidth: 28, textAlign: "right" }}>{result.pillars[p.key].score}/10</span>
                    </div>
                    <div style={{ height: 3, background: C.sand, marginBottom: 8 }}>
                      <div style={{ width: `${result.pillars[p.key].score * 10}%`, height: "100%", background: C.terracotta }} />
                    </div>
                    <p style={{ fontSize: 12, color: C.darkBrown, lineHeight: 1.6, margin: 0 }}>{result.pillars[p.key].summary}</p>
                  </div>
                ))}

                <SectionHead label="Top Strengths" color={C} />
                {result.strengths.map((st, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: C.moss, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>+</span>
                    <span style={{ fontSize: 13, color: C.darkBrown, lineHeight: 1.6 }}>{st}</span>
                  </div>
                ))}

                <div style={{ marginTop: 28 }}>
                  <SectionHead label="Missing Keywords" color={C} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.missing_keywords.map((k, i) => (
                      <span key={i} style={{ border: `1px solid ${C.brown}`, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", color: C.darkBrown, background: C.sand }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: C.tan }} />

              {/* Right */}
              <div style={{ padding: "40px 48px" }}>
                <SectionHead label="3 Weakest Bullets — With Rewrites" color={C} />
                {result.weakest_bullets.map((b, i) => (
                  <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.sand}` }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: C.brown, textTransform: "uppercase", marginBottom: 4 }}>Before</div>
                    <p style={{ fontSize: 12, color: C.brown, lineHeight: 1.65, margin: "0 0 10px", fontStyle: "italic" }}>{b.original}</p>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: C.moss, textTransform: "uppercase", marginBottom: 4 }}>After</div>
                    <p style={{ fontSize: 12, color: C.darkBrown, lineHeight: 1.65, margin: 0 }}>{b.rewrite}</p>
                  </div>
                ))}

                <SectionHead label="Executive Summary" color={C} />
                <p style={{ fontSize: 13, color: C.darkBrown, lineHeight: 1.8, margin: 0, borderLeft: `3px solid ${C.terracotta}`, paddingLeft: 16 }}>{result.executive_summary}</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: C.espresso, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="https://linkedin.com/in/ricobolos" style={{ fontSize: 11, color: C.sand, letterSpacing: "0.06em", fontWeight: 700, textDecoration: "underline", textDecorationStyle: "dotted" }}>
                Rico Bolos
              </a>
              <a href="https://www.youtube.com/watch?v=3aWHJdS59Qk" style={{ fontSize: 11, color: C.terracotta, letterSpacing: "0.06em", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                Rubric: Chloe Shih's PM Resume Tips
              </a>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function SectionHead({ label, color: C }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 6, height: 6, background: C.terracotta, transform: "rotate(45deg)", flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.brown }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: C.sand }} />
    </div>
  );
}
