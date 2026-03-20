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
  forest: "#5a7a4f",
  parchment: "#f2efe2",
};

const SYSTEM = `You are an elite Technical Recruiter and Career Coach specializing in Big Tech (Meta, Google, TikTok). Analyze the resume using the Three Pillars Framework.

IMPORTANT TONE RULES:
- ALWAYS address the resume owner directly as "you" / "your" — NEVER use third-person ("the candidate", "they", "he", "she", or the person's name)
- Write as if you are speaking directly to the person whose resume this is

IMPORTANT SCORING RULES:
- All scores are out of 100 (not 10)
- Be constructive and actionable in ALL feedback — never give vague praise like "good use of bullet points"
- Every pillar summary MUST include specific suggestions starting with "I suggest you..." or "Consider..."
- If a score is below 90, explain exactly what you need to change to reach 90+

IMPORTANT FOR WORK EXPERIENCE:
- Extract EVERY job from the resume
- For each job include the company name, job title, and a 1-2 sentence summary of what your bullet points convey
- For each job, extract ALL bullet points verbatim as "original" and provide a stronger rewrite for each in "rewrite"

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "overall_score": 0,
  "pillars": {
    "impact_statements": { "score": 0, "summary": "", "suggestions": [""] },
    "information_architecture": { "score": 0, "summary": "", "suggestions": [""] },
    "ats_design": { "score": 0, "summary": "", "suggestions": [""] }
  },
  "work_experience": [
    { "company": "", "title": "", "summary": "", "bullets": [{ "original": "", "rewrite": "" }] }
  ],
  "weakest_bullets": [
    { "original": "", "rewrite": "", "reason": "" }
  ],
  "missing_keywords": [""],
  "strengths": ["", ""],
  "executive_summary": ""
}`;

const LOADING_PHRASES = [
  "📄 Reading your resume with a magnifying glass...",
  "🤔 Judging your font choices (just kidding)...",
  "🔍 Scanning for buzzwords and hidden talents...",
  "☕ Brewing some career advice...",
  "🧠 Teaching AI what 'synergy' actually means...",
  "📊 Crunching numbers like a caffeinated recruiter...",
  "🎯 Aiming for that perfect score...",
  "💼 Putting on our hiring manager glasses...",
  "🚀 Calculating your Big Tech readiness level...",
  "✨ Polishing our brutally honest feedback...",
  "🤖 Consulting with the resume gods...",
  "📝 Comparing against 10,000 imaginary resumes...",
  "🎪 Performing résumé acrobatics...",
  "🔮 Gazing into your career crystal ball...",
  "🏋️ Stress-testing your bullet points...",
  "🧪 Running your resume through the lab...",
  "🎭 Rehearsing our constructive criticism...",
  "🌶️ Rating your resume's spiciness level...",
];

export default function App() {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("upload");
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const inputRef = useRef();
  const loadingIntervalRef = useRef();
  const phraseIntervalRef = useRef();
  const jobCardRefs = useRef([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cardRect, setCardRect] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (view === "loading") {
      setLoadingPercent(0);
      setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);

      let current = 0;
      loadingIntervalRef.current = setInterval(() => {
        const remaining = 90 - current;
        const increment = Math.max(0.5, remaining * 0.04);
        current = Math.min(90, current + increment);
        setLoadingPercent(Math.round(current));
      }, 200);

      phraseIntervalRef.current = setInterval(() => {
        setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
      }, 2500);

      return () => {
        clearInterval(loadingIntervalRef.current);
        clearInterval(phraseIntervalRef.current);
      };
    }
  }, [view]);

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
    setView("loading");
    try {
      const b64 = await toBase64(file);
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 16384,
          system: SYSTEM,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
            { type: "text", text: "Analyze this resume and return only the JSON output." }
          ]}]
        })
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        let msg;
        if (resp.status === 429) msg = "Rate limited — please wait a moment and try again.";
        else if (resp.status === 401) msg = "Invalid API key. Check your ANTHROPIC_KEY in Netlify.";
        else if (resp.status === 504 || resp.status === 502) msg = "Request timed out — the server took too long to respond. Try again.";
        else if (resp.status === 500) msg = "Server error — something went wrong on our end.";
        else {
          try { msg = JSON.parse(errBody).error?.message; } catch { /* not JSON */ }
          msg = msg || `Something went wrong (${resp.status}). Please try again.`;
        }
        throw new Error(msg);
      }

      // Read SSE stream and accumulate text deltas
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              fullText += evt.delta.text;
            }
          } catch { /* non-text SSE event, skip */ }
        }
      }

      const raw = fullText.replace(/```json|```/g, "").trim();
      if (!raw) throw new Error("No content received from API");
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const fixed = raw.replace(/,\s*([}\]])/g, "$1");
        try { parsed = JSON.parse(fixed); } catch { throw new Error("Could not parse response as JSON"); }
      }
      setResult(parsed);
      clearInterval(loadingIntervalRef.current);
      setLoadingPercent(100);
      setTimeout(() => setView("results"), 600);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
      setView("upload");
    }
    setLoading(false);
  };

  const resetToUpload = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setView("upload");
  };

  const openJobCard = (index) => {
    const rect = jobCardRefs.current[index].getBoundingClientRect();
    setCardRect(rect);
    setSelectedJob(index);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsFlipped(true);
      });
    });
  };

  const closeJobCard = () => {
    setSelectedJob(null);
    setCardRect(null);
    setIsFlipped(false);
  };

  const pillars = [
    { label: "Impact Statements", key: "impact_statements", weight: "40%" },
    { label: "Info Architecture", key: "information_architecture", weight: "30%" },
    { label: "ATS Design", key: "ats_design", weight: "30%" },
  ];

  const scoreGrade = (s) => {
    if (s >= 85) return { label: "STRONG", color: C.forest };
    if (s >= 70) return { label: "SOLID", color: C.brown };
    if (s >= 50) return { label: "NEEDS WORK", color: C.terracotta };
    return { label: "WEAK", color: C.rust };
  };

  const ff = "'Inter Tight', 'Helvetica Neue', sans-serif";

  // ─── LOADING SCREEN ───
  if (view === "loading") {
    return (
      <div style={{ fontFamily: ff, background: C.cream, color: C.espresso, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 32px", position: "relative", zIndex: 1 }}>
          <div style={{ width: 16, height: 16, background: C.terracotta, transform: "rotate(45deg)", margin: "0 auto 32px" }} />
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, color: C.espresso, marginBottom: 16 }}>
            {loadingPercent}%
          </div>
          <div style={{ height: 4, background: C.sand, marginBottom: 32, borderRadius: 0, overflow: "hidden" }}>
            <div style={{ width: `${loadingPercent}%`, height: "100%", background: C.terracotta, transition: "width 0.3s ease-out" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: C.darkBrown, lineHeight: 1.5, minHeight: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loadingPhrase}
          </div>
          <div style={{ marginTop: 24, fontSize: 13, color: C.tan, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {file?.name}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───
  if (view === "results" && result) {
    const grade = scoreGrade(result.overall_score);
    return (
      <div style={{ fontFamily: ff, background: C.cream, color: C.espresso, minHeight: "100vh" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

        {/* Nav */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 32px", borderBottom: `1px solid ${C.tan}`, background: C.cream, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, background: C.terracotta, transform: "rotate(45deg)" }} />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.espresso }}>Resume Analyzer</span>
          </div>
          <button
            onClick={resetToUpload}
            style={{ background: C.forest, color: C.parchment, border: "none", padding: "11px 22px", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >← Upload Another Version</button>
        </nav>

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Score banner */}
          <div style={{ background: C.espresso, color: C.cream, padding: "40px 48px", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.tan, marginBottom: 6 }}>Overall Score</div>
              <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, color: C.cream }}>{result.overall_score}</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: grade.color, marginTop: 6 }}>{grade.label}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ height: 8, background: "#3a2a1a" }}>
                <div style={{ width: `${result.overall_score}%`, height: "100%", background: C.terracotta }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: C.tan }}>0</span>
                <span style={{ fontSize: 12, color: C.tan }}>100</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {pillars.map((p) => (
                <div key={p.key} style={{
                  background: "rgba(255,255,255,0.06)",
                  padding: "20px 24px",
                  minWidth: 120,
                  textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: C.cream, marginBottom: 6 }}>{result.pillars[p.key].score}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.tan, textTransform: "uppercase", lineHeight: 1.3 }}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary — full width */}
          <div style={{ padding: "36px 48px", borderBottom: `1px solid ${C.sand}`, background: C.cream }}>
            <SectionHead label="Executive Summary" color={C} />
            <p style={{ fontSize: 16, color: C.darkBrown, lineHeight: 1.8, margin: 0, borderLeft: `3px solid ${C.terracotta}`, paddingLeft: 20 }}>{result.executive_summary}</p>
          </div>

          {/* Work Experience — full width */}
          {result.work_experience && result.work_experience.length > 0 && (
            <div style={{ padding: "36px 48px", borderBottom: `1px solid ${C.sand}`, background: C.cream }}>
              <SectionHead label="Work Experience Detected" color={C} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {result.work_experience.map((job, i) => (
                  <div
                    key={i}
                    ref={el => jobCardRefs.current[i] = el}
                    onClick={() => openJobCard(i)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.terracotta; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.tan; e.currentTarget.style.transform = "translateY(0)"; }}
                    style={{ padding: 20, background: C.sand, border: `1px solid ${C.tan}`, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s" }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.forest, marginBottom: 2 }}>{job.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.brown, letterSpacing: "0.04em", marginBottom: 10 }}>{job.company}</div>
                    <p style={{ fontSize: 14, color: C.darkBrown, lineHeight: 1.65, margin: "0 0 12px" }}>{job.summary}</p>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.forest }}>View bullet rewrites →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", background: C.cream }}>
            {/* Left — Pillar Breakdown + Strengths */}
            <div style={{ padding: "40px 48px", minWidth: 0, overflowWrap: "break-word" }}>
              <SectionHead label="Pillar Breakdown" color={C} />
              {pillars.map(p => (
                <div key={p.key} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${C.sand}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", flex: 1, color: C.forest }}>{p.label}</span>
                    <span style={{ fontSize: 12, color: C.brown, background: C.sand, padding: "3px 8px", flexShrink: 0 }}>{p.weight}</span>
                    <span style={{ fontSize: 17, fontWeight: 900, color: C.espresso, flexShrink: 0 }}>{result.pillars[p.key].score}/100</span>
                  </div>
                  <div style={{ height: 4, background: C.sand, marginBottom: 10 }}>
                    <div style={{ width: `${result.pillars[p.key].score}%`, height: "100%", background: C.terracotta }} />
                  </div>
                  <p style={{ fontSize: 15, color: C.darkBrown, lineHeight: 1.7, margin: "0 0 12px" }}>{result.pillars[p.key].summary}</p>
                  {result.pillars[p.key].suggestions && result.pillars[p.key].suggestions.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {result.pillars[p.key].suggestions.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: C.terracotta, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 14, color: C.darkBrown, lineHeight: 1.6 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <SectionHead label="Top Strengths" color={C} />
              {result.strengths.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <span style={{ color: C.moss, fontWeight: 900, fontSize: 18, flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: 15, color: C.darkBrown, lineHeight: 1.7 }}>{st}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.tan }} />

            {/* Right — Weakest Bullets + Missing Keywords */}
            <div style={{ padding: "40px 48px", minWidth: 0, overflowWrap: "break-word" }}>
              <SectionHead label="Weakest Bullets — With Rewrites" color={C} />
              {result.weakest_bullets.map((b, i) => (
                <div key={i} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${C.sand}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.forest, textTransform: "uppercase", marginBottom: 6 }}>Before</div>
                  <p style={{ fontSize: 14, color: C.brown, lineHeight: 1.7, margin: "0 0 8px", fontStyle: "italic" }}>{b.original}</p>
                  {b.reason && (
                    <div style={{ fontSize: 13, color: C.rust, lineHeight: 1.6, margin: "0 0 12px", padding: "8px 12px", background: C.terracottaLight, border: `1px solid ${C.terracotta}` }}>
                      <strong>Why:</strong> {b.reason}
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.forest, textTransform: "uppercase", marginBottom: 6 }}>Suggested Rewrite</div>
                  <p style={{ fontSize: 14, color: C.darkBrown, lineHeight: 1.7, margin: 0 }}>{b.rewrite}</p>
                </div>
              ))}

              <div style={{ marginTop: 12 }}>
                <SectionHead label="Missing Keywords" color={C} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {result.missing_keywords.map((k, i) => (
                    <span key={i} style={{ border: `1px solid ${C.brown}`, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", color: C.darkBrown, background: C.sand }}>{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flip card modal */}
        {selectedJob !== null && cardRect && (() => {
          const job = result.work_experience[selectedJob];
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const modalW = Math.min(700, vw - 48);
          const srcCX = cardRect.left + cardRect.width / 2;
          const srcCY = cardRect.top + cardRect.height / 2;
          const dx = srcCX - vw / 2;
          const dy = srcCY - vh / 2;
          const scale = cardRect.width / modalW;

          return (
            <div
              onClick={closeJobCard}
              style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: isFlipped ? "rgba(44,31,14,0.6)" : "transparent",
                transition: "background 0.5s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                perspective: "1200px",
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  width: modalW,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isFlipped
                    ? "translate(0px, 0px) scale(1) rotateY(180deg)"
                    : `translate(${dx}px, ${dy}px) scale(${scale}) rotateY(0deg)`,
                }}
              >
                {/* Front face */}
                <div style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  background: C.sand,
                  border: `1px solid ${C.tan}`,
                  padding: 32,
                  display: "flex", flexDirection: "column", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.espresso, marginBottom: 4 }}>{job.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.terracotta, letterSpacing: "0.04em", marginBottom: 16 }}>{job.company}</div>
                  <p style={{ fontSize: 15, color: C.darkBrown, lineHeight: 1.7, margin: 0 }}>{job.summary}</p>
                </div>

                {/* Back face */}
                <div style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: C.cream,
                  border: `1px solid ${C.tan}`,
                  padding: "32px 36px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.sand}` }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: C.forest, marginBottom: 2 }}>{job.title}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.brown, letterSpacing: "0.04em" }}>{job.company}</div>
                    </div>
                    <button
                      onClick={closeJobCard}
                      style={{
                        background: "none", border: `1px solid ${C.tan}`,
                        fontSize: 12, fontWeight: 700, color: C.brown,
                        padding: "8px 14px", cursor: "pointer",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        fontFamily: ff,
                      }}
                    >Close ✕</button>
                  </div>

                  <SectionHead label="Bullet Rewrites" color={C} />

                  {job.bullets && job.bullets.map((b, i) => (
                    <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.sand}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.forest, textTransform: "uppercase", marginBottom: 6 }}>Original</div>
                      <p style={{ fontSize: 14, color: C.brown, lineHeight: 1.7, margin: "0 0 12px", fontStyle: "italic" }}>{b.original}</p>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: C.forest, textTransform: "uppercase", marginBottom: 6 }}>Suggested Rewrite</div>
                      <p style={{ fontSize: 14, color: C.darkBrown, lineHeight: 1.7, margin: 0 }}>{b.rewrite}</p>
                    </div>
                  ))}

                  {(!job.bullets || job.bullets.length === 0) && (
                    <p style={{ fontSize: 14, color: C.brown, fontStyle: "italic" }}>No bullet points detected for this position.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ background: C.espresso, padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="https://linkedin.com/in/ricobolos" style={{ fontSize: 13, color: C.sand, letterSpacing: "0.06em", fontWeight: 700, textDecoration: "underline", textDecorationStyle: "dotted" }}>
              Rico Bolos
            </a>
            <a href="https://www.youtube.com/watch?v=3aWHJdS59Qk" style={{ fontSize: 13, color: C.terracotta, letterSpacing: "0.06em", textDecoration: "underline", textDecorationStyle: "dotted" }}>
              Rubric: Chloe Shih's PM Resume Tips
            </a>
          </div>
          <button
            onClick={resetToUpload}
            style={{ background: C.forest, color: C.parchment, border: "none", padding: "11px 22px", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          >Upload Another Version →</button>
        </div>
      </div>
    );
  }

  // ─── UPLOAD SCREEN ───
  return (
    <div style={{ fontFamily: ff, background: C.cream, color: C.espresso, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "80px 24px" }}>
        {/* Organic arc */}
        <svg width="64" height="32" viewBox="0 0 64 32" fill="none" style={{ marginBottom: 32, opacity: 0.5 }}>
          <path d="M2 30 C16 2, 48 2, 62 30" stroke={C.moss} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>


        <div style={{ fontSize: 14, color: C.brown, marginBottom: 20, textAlign: "center", fontStyle: "italic", opacity: 0.7 }}>Worried about your resume? You're not alone.</div>

        <h1 style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", color: C.espresso, marginBottom: 16, textAlign: "center" }}>
          Resume Analyzer
        </h1>
        <p style={{ fontSize: 15, color: C.brown, textAlign: "center", maxWidth: 420, lineHeight: 1.7, marginBottom: 20 }}>
          Big Tech-caliber critique scored on three pillars:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {["Impact Statements", "Information Architecture", "ATS Design"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.tan, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: C.darkBrown, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.tan, textAlign: "center", marginBottom: 48, fontStyle: "italic" }}>Drop your PDF and find out where you stand.</div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            width: "100%", maxWidth: 480,
            border: file ? `2px solid ${C.moss}` : drag ? `2px solid ${C.brown}` : `2px dashed ${C.tan}`,
            borderRadius: 16,
            padding: "48px 32px",
            textAlign: "center",
            background: file ? C.mossLight : drag ? C.sand : "rgba(232,223,200,0.4)",
            transition: "all 0.3s ease",
            marginBottom: 16,
          }}
        >
          {file ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.moss, marginBottom: 4 }}>{file.name}</div>
              <div style={{ fontSize: 13, color: C.brown }}>{(file.size / 1024).toFixed(0)} KB</div>
            </>
          ) : (
            <>
              {/* Leaf icon */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 16, opacity: 0.4 }}>
                <path d="M16 28 C16 28, 6 20, 6 12 C6 4, 16 2, 16 2 C16 2, 26 4, 26 12 C26 20, 16 28, 16 28Z" stroke={C.moss} strokeWidth="1.5" fill="none" />
                <path d="M16 28 L16 10" stroke={C.moss} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div style={{ fontSize: 15, color: C.darkBrown, marginBottom: 6 }}>
                Drop your resume here
              </div>
              <div style={{ fontSize: 13, color: C.tan }}>
                or{" "}
                <span
                  onClick={() => inputRef.current.click()}
                  style={{ color: C.terracotta, fontWeight: 700, cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}
                >upload</span>
                {" "}a PDF
              </div>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

        {error && <div style={{ fontSize: 13, color: C.rust, fontWeight: 600, marginBottom: 12 }}>{error}</div>}

        <button
          onClick={analyze}
          disabled={!file || loading}
          style={{
            padding: "14px 40px", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", border: "none", borderRadius: 8, cursor: file && !loading ? "pointer" : "default",
            background: file && !loading ? C.forest : C.tan,
            color: file && !loading ? C.parchment : C.brown,
            transition: "all 0.3s ease",
          }}
        >Analyze →</button>
      </div>

      {/* How It Works */}
      <div style={{ background: C.sand, padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.forest, marginBottom: 8 }}>How It Works</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.espresso }}>Three steps. One honest score.</div>
          </div>

          {[
            { step: "01", title: "Drop your resume", desc: "Upload any PDF — we read it page by page, just like a recruiter would on a Monday morning." },
            { step: "02", title: "AI does the hard part", desc: "Our engine scores every bullet, checks your structure, and flags what ATS systems will choke on." },
            { step: "03", title: "Get your playbook", desc: "You'll see exactly what to fix, with rewritten bullets you can copy straight into your resume." },
          ].map((item, i) => (
            <div key={item.step} style={{ display: "flex", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.forest, color: C.parchment, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{item.step}</div>
                {i < 2 && <div style={{ width: 2, flex: 1, background: C.tan, minHeight: 40 }} />}
              </div>
              <div style={{ paddingBottom: i < 2 ? 32 : 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.forest, marginBottom: 4 }}>{item.title}</div>
                <p style={{ fontSize: 14, color: C.darkBrown, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Rubric */}
      <div style={{ background: C.cream, padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <svg width="48" height="24" viewBox="0 0 64 32" fill="none" style={{ marginBottom: 24, opacity: 0.4 }}>
            <path d="M2 30 C16 2, 48 2, 62 30" stroke={C.forest} strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.forest, marginBottom: 8 }}>The Rubric</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.espresso, marginBottom: 20 }}>Why these three pillars?</div>
          <p style={{ fontSize: 15, color: C.darkBrown, lineHeight: 1.8, marginBottom: 16, textAlign: "left" }}>
            {"This framework comes from "}
            <a href="https://www.youtube.com/watch?v=3aWHJdS59Qk" style={{ color: C.forest, fontWeight: 700, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>Chloe Shih</a>
            {", a PM leader who\u2019s reviewed thousands of resumes at companies like Meta and TikTok. Her take is refreshingly simple: most resume advice is vague fluff. What actually matters is whether your bullets prove impact, whether your information is structured so the important stuff hits first, and whether an ATS can even parse your formatting."}
          </p>
          <p style={{ fontSize: 15, color: C.darkBrown, lineHeight: 1.8, marginBottom: 16, textAlign: "left" }}>
            {"She boils it down to three things \u2014 "}
            <strong style={{ color: C.forest }}>Impact Statements</strong>
            {" (are you quantifying results or just listing tasks?), "}
            <strong style={{ color: C.forest }}>Information Architecture</strong>
            {" (is your best work buried at the bottom?), and "}
            <strong style={{ color: C.forest }}>ATS Design</strong>
            {" (will a robot even let a human see this?)."}
          </p>
          <p style={{ fontSize: 15, color: C.brown, lineHeight: 1.8, textAlign: "left", fontStyle: "italic" }}>
            We weighted Impact at 40% and the other two at 30% each — because at the end of the day, showing what you achieved matters most.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 24px", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 12, color: C.tan }}>
          By <a href="https://linkedin.com/in/ricobolos" style={{ color: C.brown, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>Rico Bolos</a>
          {" "}&middot;{" "}
          Rubric from <a href="https://www.youtube.com/watch?v=3aWHJdS59Qk" style={{ color: C.brown, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>Chloe Shih</a>
        </span>
      </div>
    </div>
  );
}

function SectionHead({ label, color: C }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 6, height: 6, background: C.forest, transform: "rotate(45deg)", flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.forest }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: C.sand }} />
    </div>
  );
}
