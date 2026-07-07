"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   CONTACT — "Start The Launch"
   Adapted from the Contact_Us reference (public/Contact_Us/): kept
   the structure (manifesto + glass "mission intake" form, mouse-tilt
   parallax panel, launch-sequence submit micro-interaction) but
   re-skinned entirely to FOURWARD's actual brand — deep-space
   #04040a + single amber accent (the reference's own violet token
   set was a generic starting palette, never used in the section
   markup itself beyond a neutral glass tint), Syne/Space Grotesk
   (already FOURWARD's fonts), and copy/options tied to the real
   5 sectors and PRODUCT.md's actual stated design principles rather
   than the reference's placeholder "Fintech/Aerospace/Biotech" copy.

   ⚠️ No backend is wired up — 👈 replace CONTACT_EMAIL with the
   real inbox, or swap the mailto: submit for a real form endpoint
   (Formspree/Web3Forms/your own API) once one exists. Without this,
   a "successful" submit would vanish into nothing.
══════════════════════════════════════════════════════════════ */

const CONTACT_EMAIL = "hello@fourward.studio"; // 👈 replace with the real inbox

const PRINCIPLES = [
  "The Rocket Lands First",
  "One Accent, Total Commitment",
  "Every Element Earns Its Place",
];

const SECTORS = [
  "Fashion & Apparel",
  "Real Estate",
  "Restaurants & Cafés",
  "Beauty & Wellness",
  "Automotive",
  "Something Else",
];

const BUDGETS = [
  "Under $5k",
  "$5k – $15k",
  "$15k – $50k",
  "$50k+",
];

function RocketRing({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="hidden sm:flex items-center justify-center rounded-full"
      style={{
        width: "88px", height: "88px", flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.14)",
        animation: reduced ? "none" : "spin 14s linear infinite",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style={{ transform: "rotate(45deg)" }}>
        <path
          d="M12 2c2.5 3 3.5 6.5 3.5 10.5 0 2-1 4-3.5 6.5-2.5-2.5-3.5-4.5-3.5-6.5C8.5 8.5 9.5 5 12 2z"
          stroke="#f97316" strokeWidth="1.4" strokeLinejoin="round"
        />
        <path d="M9 15.5c-2 .3-2.8 1.6-3 4 2.4-.2 3.7-1 4-3" stroke="#f97316" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M15 15.5c2 .3 2.8 1.6 3 4-2.4-.2-3.7-1-4-3" stroke="#f97316" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="12" cy="10.5" r="1.3" stroke="#f97316" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

type SubmitState = "idle" | "sending" | "sent";

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [form, setForm] = useState({ name: "", company: "", industry: "", budget: BUDGETS[1], brief: "" });

  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  /* Mouse-tilt parallax on the glass panel — direct DOM mutation (not
     React state) since this fires on every mousemove; matches the
     imperative-effect convention used elsewhere in this codebase
     (RocketCanvas, EmberTrail) for continuous pointer-driven motion. */
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      panel.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  const onChange = useCallback((field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value })), []);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (submitState !== "idle") return;
    setSubmitState("sending");

    /* No backend exists yet — mailto: is the only way this actually
       reaches anyone right now. Swap for a real endpoint later. */
    const subject = encodeURIComponent(`New project inquiry — ${form.name || "unnamed"}${form.company ? " / " + form.company : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nCompany: ${form.company}\nIndustry: ${form.industry || "—"}\nBudget: ${form.budget}\n\nBrief:\n${form.brief}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSubmitState("sent");
      setTimeout(() => {
        setSubmitState("idle");
        setForm({ name: "", company: "", industry: "", budget: BUDGETS[1], brief: "" });
      }, 3000);
    }, 1400);
  }, [form, submitState]);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#050505",
    border: "1px solid rgba(255,255,255,0.10)", borderRadius: "6px",
    padding: "14px 16px", color: "#fdf2f2",
    fontFamily: "var(--font-space-grotesk)", fontSize: "14px",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "8px",
    fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
    fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative"
      style={{
        background: "#04040a", overflow: "hidden",
        paddingTop: "clamp(96px,12vh,140px)", paddingBottom: "clamp(96px,12vh,140px)",
        scrollMarginTop: "64px",
      }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes contactGlow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.12); }
        }
        .fw-input:focus, .fw-select:focus, .fw-textarea:focus {
          border-color: rgba(249,115,22,0.65) !important;
          box-shadow: 0 0 16px rgba(249,115,22,0.22);
        }
        .fw-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23f97316' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; }
      `}</style>

      {/* ambient glow — same visual language as the services section */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: "-10%", top: "10%", width: "44vw", height: "44vw",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}/>
        <div style={{
          position: "absolute", right: "-8%", bottom: "0%", width: "38vw", height: "38vw",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}/>
      </div>

      <div
        className="px-5 sm:px-8 md:px-14 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative"
        style={{ maxWidth: "1440px", margin: "0 auto", zIndex: 1 }}
      >
        {/* ── Left: manifesto ── */}
        <div
          className="lg:col-span-6 flex flex-col gap-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          <div>
            <span style={{
              display: "block", marginBottom: "16px",
              fontFamily: "var(--font-space-grotesk)", fontWeight: 700, textTransform: "uppercase",
              fontSize: "10px", letterSpacing: "0.30em", color: "#f97316",
            }}>
              Start A Project
            </span>
            <h2
              className="font-display font-black uppercase text-white"
              style={{ fontSize: "clamp(38px,6vw,76px)", lineHeight: 0.98, letterSpacing: "-0.03em" }}
            >
              Start The<br/>
              <span style={{ color: "var(--amber-deep)", position: "relative", display: "inline-block" }}>
                Launch.
                <span aria-hidden style={{
                  position: "absolute", left: 0, right: 0, bottom: "-8px", height: "3px",
                  background: "#f97316", transformOrigin: "0% 50%",
                  transform: isVisible ? "scaleX(1)" : "scaleX(0)",
                  transition: "transform 0.9s cubic-bezier(0.23,1,0.32,1) 0.4s",
                }}/>
              </span>
            </h2>
          </div>

          <p style={{
            maxWidth: "42ch", fontFamily: "var(--font-space-grotesk)",
            fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.65, color: "rgba(255,255,255,0.62)",
          }}>
            No templates, no filler slides. Tell us what you&apos;re building and we&apos;ll tell you, honestly, whether we&apos;re the right team to launch it.
          </p>

          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <span style={{
                display: "block", marginBottom: "10px",
                fontFamily: "var(--font-space-grotesk)", fontWeight: 700, textTransform: "uppercase",
                fontSize: "10px", letterSpacing: "0.24em", color: "#f59e0b",
              }}>
                Core Principles
              </span>
              <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {PRINCIPLES.map(p => (
                  <li key={p} style={{
                    fontFamily: "var(--font-space-grotesk)", fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                  }}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <RocketRing reduced={reduced} />
            </div>
          </div>
        </div>

        {/* ── Right: intake form ── */}
        <div className="lg:col-span-6 relative">
          <div
            ref={panelRef}
            style={{
              position: "relative",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "14px",
              padding: "clamp(28px,4vw,48px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
              opacity: isVisible ? 1 : 0,
              transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1) 0.15s, transform 0.15s ease-out",
              willChange: "transform",
            }}
          >
            {/* rim light */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px", borderRadius: "14px 14px 0 0",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            }}/>

            <div style={{ marginBottom: "32px" }}>
              <h3 className="font-display font-bold uppercase text-white" style={{ fontSize: "clamp(20px,2.4vw,28px)" }}>
                Project Intake
              </h3>
              <p style={{
                marginTop: "6px", fontFamily: "var(--font-space-grotesk)", fontSize: "12px",
                letterSpacing: "0.04em", color: "rgba(255,255,255,0.40)",
              }}>
                Takes two minutes. We reply within 48 hours.
              </p>
            </div>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle} htmlFor="fw-name">Name</label>
                  <input
                    id="fw-name" className="fw-input" style={inputStyle}
                    placeholder="Your name" required
                    value={form.name} onChange={onChange("name")}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="fw-company">Company</label>
                  <input
                    id="fw-company" className="fw-input" style={inputStyle}
                    placeholder="Organization" value={form.company} onChange={onChange("company")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle} htmlFor="fw-industry">Industry</label>
                  <select
                    id="fw-industry" className="fw-select" style={inputStyle}
                    value={form.industry} onChange={onChange("industry")}
                  >
                    <option value="">Select sector</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle} htmlFor="fw-budget">Budget Range</label>
                  <select
                    id="fw-budget" className="fw-select" style={inputStyle}
                    value={form.budget} onChange={onChange("budget")}
                  >
                    {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="fw-brief">Project Brief</label>
                <textarea
                  id="fw-brief" className="fw-textarea" rows={4} required
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="What are you launching?"
                  value={form.brief} onChange={onChange("brief")}
                />
              </div>

              <button
                type="submit"
                disabled={submitState !== "idle"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  width: "100%", padding: "18px", borderRadius: "8px", border: "none",
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 700, textTransform: "uppercase",
                  fontSize: "13px", letterSpacing: "0.16em",
                  background: submitState === "sent" ? "#16a34a" : "#f97316",
                  color: "#0c0a09", cursor: submitState === "idle" ? "pointer" : "default",
                  boxShadow: submitState === "idle" ? "0 0 24px rgba(249,115,22,0.25)" : "none",
                  transition: "background 0.4s ease, box-shadow 0.35s ease, transform 0.15s ease",
                }}
                onMouseEnter={e => { if (submitState === "idle") { e.currentTarget.style.boxShadow = "0 0 40px rgba(249,115,22,0.45)"; e.currentTarget.style.transform = "scale(1.015)"; } }}
                onMouseLeave={e => { if (submitState === "idle") { e.currentTarget.style.boxShadow = "0 0 24px rgba(249,115,22,0.25)"; e.currentTarget.style.transform = "scale(1)"; } }}
              >
                {submitState === "idle" && <>Initiate Mission <span aria-hidden>→</span></>}
                {submitState === "sending" && <>Uploading Data…</>}
                {submitState === "sent" && <>Mission Initiated ✓</>}
              </button>
            </form>
          </div>

          {/* floating glow accent, bottom-right of the panel */}
          <div aria-hidden className="hidden xl:block" style={{
            position: "absolute", right: "-28px", bottom: "-28px", width: "96px", height: "96px",
            borderRadius: "50%", background: "rgba(249,115,22,0.14)", filter: "blur(24px)",
            animation: reduced ? "none" : "contactGlow 4s ease-in-out infinite",
            pointerEvents: "none",
          }}/>
        </div>
      </div>
    </section>
  );
}
