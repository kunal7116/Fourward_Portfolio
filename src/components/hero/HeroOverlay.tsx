"use client";

import { useEffect, useRef } from "react";

const KEYWORDS = [
  { text: "INNOVATE",     top: "13%", left: "32%", anim: "drift-up 7s ease-in-out infinite",    delay: "0.2s", size: "11px" },
  { text: "EXPERIENCE",   top: "14%", left: "65%", anim: "drift-down 9s ease-in-out infinite",  delay: "0.7s", size: "12px" },
  { text: "INNOVATE",     top: "23%", left: "84%", anim: "drift-side 8s ease-in-out infinite",  delay: "1.2s", size: "10px" },
  { text: "CREATE",       top: "40%", left: "77%", anim: "drift-up 10s ease-in-out infinite",   delay: "0.9s", size: "11px" },
  { text: "FOURWARD",     top: "55%", left: "81%", anim: "drift-down 8s ease-in-out infinite",  delay: "1.5s", size: "12px" },
  { text: "INNOVATE",     top: "60%", left: "16%", anim: "drift-side 9s ease-in-out infinite",  delay: "0.4s", size: "10px" },
  { text: "STORYTELLING", top: "73%", left: "73%", anim: "drift-up 8.5s ease-in-out infinite",  delay: "1.1s", size: "11px" },
  { text: "MOMENTUM",     top: "81%", left: "56%", anim: "drift-down 7.5s ease-in-out infinite",delay: "1.7s", size: "10px" },
] as const;

export default function HeroOverlay() {
  const labelRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subRef   = useRef<HTMLParagraphElement>(null);
  const tagsRef  = useRef<HTMLDivElement>(null);
  const ctaRef   = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const items = [
      { el: labelRef.current, delay: 200  },
      { el: line1Ref.current, delay: 400, blur: true },
      { el: line2Ref.current, delay: 550, blur: true },
      { el: subRef.current,   delay: 750  },
      { el: tagsRef.current,  delay: 900  },
      { el: ctaRef.current,   delay: 1050 },
    ];

    items.forEach(({ el, delay, blur }) => {
      if (!el) return;
      el.style.opacity   = "0";
      el.style.transform = "translateY(20px)";
      if (blur) el.style.filter = "blur(8px)";
      el.style.transition =
        `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
         transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` +
        (blur ? `, filter 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` : "");
      requestAnimationFrame(() => {
        el.style.opacity   = "1";
        el.style.transform = "translateY(0)";
        if (blur) el.style.filter = "blur(0)";
      });
    });
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden">

      {/* ── Floating ambient keywords ── */}
      {KEYWORDS.map((kw, i) => (
        <span
          key={i}
          className="absolute font-sans font-semibold uppercase"
          style={{
            top: kw.top, left: kw.left,
            fontSize: kw.size,
            letterSpacing: "0.24em",
            color: "rgba(249,115,22,0.10)",
            animation: kw.anim,
            animationDelay: kw.delay,
            whiteSpace: "nowrap",
          }}
        >
          {kw.text}
        </span>
      ))}

      {/* ────────────────────────────────────────────────────
          HEADER BLOCK — eyebrow + headline share one flow-based
          container with a consistent gap, so the rhythm holds
          regardless of font-load timing or viewport height.
      ──────────────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 px-5 sm:px-8 md:px-14 lg:px-20 flex flex-col"
        style={{ top: "calc(64px + 28px)", gap: "20px" }}
      >
        <div ref={labelRef} className="flex items-center gap-3">
          <span
            className="font-sans font-bold uppercase"
            style={{ fontSize: "11px", letterSpacing: "0.32em", color: "#f97316" }}
          >
            Creative Agency
          </span>
          <span
            className="block h-px"
            style={{ width: "40px", background: "rgba(249,115,22,0.40)" }}
          />
        </div>

        <div>
          <div ref={line1Ref}>
            <h1
              className="font-display font-black text-white leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: "clamp(28px, 3.6vw, 52px)", textWrap: "balance" }}
            >
              WE LAUNCH
            </h1>
          </div>
          <div ref={line2Ref}>
            <h1
              className="font-display font-black leading-[1.05] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(28px, 3.6vw, 52px)",
                color: "var(--amber-deep)",
                textWrap: "balance",
              }}
            >
              BRANDS
            </h1>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────
          BOTTOM-LEFT block  — subtitle + tags + CTA
          Absolute bottom so it's always in the lower viewport.
      ──────────────────────────────────────────────────── */}
      <div
        className="absolute left-5 sm:left-8 md:left-14 lg:left-20 flex flex-col gap-5"
        style={{ bottom: "clamp(48px, 8vh, 80px)", maxWidth: "420px" }}
      >
        <p
          ref={subRef}
          className="font-sans leading-relaxed"
          style={{
            fontSize: "clamp(14px, 1.05vw, 17px)",
            color: "rgba(255,255,255,0.66)",
            maxWidth: "34ch",
          }}
        >
          Cinematic videos, sharp design, and digital builds that make brands impossible to scroll past.
        </p>

        {/* Service tags */}
        <div ref={tagsRef} className="flex items-center flex-wrap gap-x-3">
          {["Video", "Design", "Web", "Social"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && (
                <span style={{ color: "rgba(249,115,22,0.40)", fontSize: "10px" }}>·</span>
              )}
              <span
                className="font-sans font-medium uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.46)" }}
              >
                {s}
              </span>
            </span>
          ))}
        </div>

        {/* CTA — pill with nested icon (Button-in-Button) */}
        <a
          ref={ctaRef}
          href="#work"
          className="pointer-events-auto inline-flex items-center gap-3 self-start
                     font-sans font-semibold uppercase group"
          style={{
            fontSize: "11px",
            letterSpacing: "0.16em",
            padding: "14px 16px 14px 24px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.05)",
            color: "#ffffff",
            backdropFilter: "blur(8px)",
            transition: "background 350ms cubic-bezier(0.16,1,0.3,1), border-color 350ms cubic-bezier(0.16,1,0.3,1), box-shadow 350ms cubic-bezier(0.16,1,0.3,1)",
          }}
          onMouseEnter={(e) => {
            const t = e.currentTarget;
            t.style.background  = "rgba(249,115,22,0.16)";
            t.style.borderColor = "rgba(249,115,22,0.60)";
            t.style.boxShadow   = "0 0 32px rgba(249,115,22,0.22)";
          }}
          onMouseLeave={(e) => {
            const t = e.currentTarget;
            t.style.background  = "rgba(255,255,255,0.05)";
            t.style.borderColor = "rgba(255,255,255,0.22)";
            t.style.boxShadow   = "none";
          }}
        >
          <span>Start Your Launch</span>
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: "28px", height: "28px",
              background: "rgba(255,255,255,0.10)",
              transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path
                d="M2 9L9 2M9 2H3.5M9 2V7.5"
                stroke="currentColor" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>

      {/* ── Scrolling FOURWARD watermark ── */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ height: "68px" }}
      >
        <div
          className="font-display font-black whitespace-nowrap"
          style={{
            fontSize: "clamp(48px, 5.5vw, 68px)",
            color: "rgba(249,115,22,0.06)",
            letterSpacing: "-0.02em",
            animation: "marquee 22s linear infinite",
            display: "inline-block",
          }}
        >
          FOURWARD&nbsp;&nbsp;&nbsp;FOURWARD&nbsp;&nbsp;&nbsp;FOURWARD&nbsp;&nbsp;&nbsp;FOURWARD&nbsp;&nbsp;&nbsp;FOURWARD&nbsp;&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
}
