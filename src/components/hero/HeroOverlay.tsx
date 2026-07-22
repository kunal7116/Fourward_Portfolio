"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

/* ══════════════════════════════════════════════════════════
   HERO OVERLAY — editorial launch-control composition

   STRUCTURE (three horizontal axes, one left margin):
   ┌ meta axis ──────────────────────────────────────────┐
   │ CREATIVE AGENCY ——            ● DRAG · CLICK HINT   │
   │ WE LAUNCH            (solid white, display black)   │
   │ BRANDS.              (amber OUTLINE, fills on hover)│
   │                                                      │
   │ subtitle             ·             (rocket space)   │
   │ ⁰¹VIDEO ⁰²DESIGN ⁰³WEB ⁰⁴SOCIAL                     │
   │ [ START YOUR LAUNCH ↗ ]              T+ TELEMETRY   │
   └ watermark marquee ──────────────────────────────────┘
   Bottom-left block and telemetry share ONE baseline.
══════════════════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const;

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

const SERVICES = ["Video", "Design", "Web", "Social"] as const;

/* ── Masked line reveal ── */
function LineReveal({
  children,
  delay,
  reduced,
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
}) {
  return (
    <div style={{ overflow: "hidden" }}>
      <motion.div
        initial={reduced ? false : { y: "112%", rotate: 1.5 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ duration: 1.0, delay, ease: EASE }}
        style={{ transformOrigin: "0% 100%", willChange: "transform" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Fade-up block ── */
function FadeUp({
  children,
  delay,
  reduced,
  className,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Magnetic CTA — spring attraction + engine throttle on hover ── */
function MagneticCTA({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 16, mass: 0.12 });
  const sy = useSpring(my, { stiffness: 160, damping: 16, mass: 0.12 });

  const onMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  /* Hovering the CTA physically revs the rocket's engine —
     RocketCanvas listens for this and surges the flame. */
  const onEnter = () => {
    if (!reduced) window.dispatchEvent(new CustomEvent("fw:throttle", { detail: 1 }));
  };
  const onLeave = () => {
    mx.set(0); my.set(0);
    window.dispatchEvent(new CustomEvent("fw:throttle", { detail: 0 }));
  };

  return (
    <motion.a
      ref={ref}
      href="#work"
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className="cta-launch pointer-events-auto relative inline-flex items-center gap-3 self-start
                 font-sans font-semibold uppercase group"
      style={{
        x: sx, y: sy,
        fontSize: "11px",
        letterSpacing: "0.18em",
        padding: "15px 17px 15px 26px",
        borderRadius: "999px",
        color: "#ffffff",
        backdropFilter: "blur(8px)",
      }}
    >
      <span className="cta-sheen" aria-hidden />
      <span className="relative z-[1]">Start Your Launch</span>
      <span
        className="cta-icon relative z-[1] inline-flex items-center justify-center rounded-full"
        style={{ width: "28px", height: "28px" }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
          <path
            d="M2 9L9 2M9 2H3.5M9 2V7.5"
            stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </span>
    </motion.a>
  );
}

/* ── Live mission clock — deterministic first paint ── */
function Telemetry({ reduced }: { reduced: boolean }) {
  const [t, setT] = useState("00:00:00");
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, "0");
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      setT(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <FadeUp
      delay={1.2}
      reduced={reduced}
      className="hidden md:flex flex-col items-end gap-2 shrink-0"
    >
      <div
        className="font-sans font-semibold"
        style={{
          fontSize: "12px", letterSpacing: "0.26em",
          color: "rgba(249,115,22,0.75)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        T+ {t}
      </div>
      <div
        className="font-sans"
        style={{ fontSize: "9px", letterSpacing: "0.26em", color: "rgba(255,255,255,0.30)" }}
      >
        ALL SYSTEMS NOMINAL
      </div>
      <div
        className="block h-px"
        style={{ width: "56px", background: "rgba(249,115,22,0.35)" }}
      />
      <div className="flex items-center gap-2">
        <span
          className="font-sans"
          style={{ fontSize: "9px", letterSpacing: "0.26em", color: "rgba(255,255,255,0.30)" }}
        >
          SCROLL
        </span>
        <span className="scroll-cue block" style={{ width: "1px", height: "30px" }} />
      </div>
    </FadeUp>
  );
}

export default function HeroOverlay() {
  const reduced = useReducedMotion() ?? false;

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

      {/* ════ TOP AXIS — meta row + display headline ════ */}
      <div
        className="absolute left-0 right-0 px-5 sm:px-8 md:px-14 lg:px-20 flex flex-col"
        style={{ top: "calc(64px + 26px)", gap: "clamp(16px, 2.6vh, 28px)" }}
      >
        {/* meta row: eyebrow left · interaction hint right (one axis) */}
        <div className="flex items-center justify-between">
          <FadeUp delay={0.25} reduced={reduced} className="flex items-center gap-3">
            <span
              className="block"
              style={{ width: "6px", height: "6px", background: "#f97316" }}
            />
            <span
              className="font-sans font-bold uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.42em", color: "#f97316" }}
            >
              Creative Agency
            </span>
            <motion.span
              className="block h-px"
              style={{ background: "rgba(249,115,22,0.40)", transformOrigin: "0% 50%" }}
              initial={reduced ? false : { width: 0 }}
              animate={{ width: 44 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
            />
          </FadeUp>

          <FadeUp delay={2.2} reduced={reduced} className="hidden lg:block">
            <div
              className="hint-pulse flex items-center gap-2 rounded-full"
              style={{
                padding: "8px 14px",
                border: "1px solid rgba(249,115,22,0.22)",
                background: "rgba(4,4,10,0.35)",
                backdropFilter: "blur(6px)",
                whiteSpace: "nowrap",
              }}
            >
              <span
                className="block rounded-full"
                style={{ width: "5px", height: "5px", background: "#f97316" }}
              />
              <span
                className="font-sans font-medium uppercase"
                style={{ fontSize: "9px", letterSpacing: "0.26em", color: "rgba(255,255,255,0.55)" }}
              >
                Drag to orbit · Click to launch
              </span>
            </div>
          </FadeUp>
        </div>

        {/* display headline — tight leading, solid/outline contrast */}
        <div style={{ marginLeft: "-0.06em" }}>
          <LineReveal delay={0.45} reduced={reduced}>
            <h1
              className="font-display font-black text-white uppercase"
              style={{
                fontSize: "clamp(32px, 4.5vw, 78px)",
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                textWrap: "balance",
              }}
            >
              We Launch
            </h1>
          </LineReveal>
          <LineReveal delay={0.58} reduced={reduced}>
            <h1
              className="font-display font-black uppercase"
              style={{
                fontSize: "clamp(32px, 4.5vw, 78px)",
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
              }}
            >
              <span className="h-stroke pointer-events-auto">Brands</span>
              <span style={{ color: "var(--electric-amber)" }}>.</span>
            </h1>
          </LineReveal>
        </div>
      </div>

      {/* ════ BOTTOM AXIS — one shared baseline ════ */}
      <div
        className="absolute left-0 right-0 px-5 sm:px-8 md:px-14 lg:px-20 flex items-end justify-between gap-8"
        style={{ bottom: "clamp(48px, 8vh, 84px)" }}
      >
        <div className="flex flex-col" style={{ gap: "clamp(18px, 3vh, 26px)", maxWidth: "440px" }}>
          <FadeUp delay={0.75} reduced={reduced}>
            <p
              className="font-sans"
              style={{
                fontSize: "clamp(15px, 1.15vw, 18px)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.72)",
                maxWidth: "32ch",
              }}
            >
              Cinematic videos, sharp design, and digital builds that make brands impossible to scroll past.
            </p>
          </FadeUp>

          {/* numbered service index — editorial, not dot-separated */}
          <FadeUp delay={0.9} reduced={reduced} className="flex items-baseline flex-wrap gap-x-6 gap-y-2">
            {SERVICES.map((s, i) => (
              <span key={s} className="flex items-baseline gap-1.5">
                <span
                  className="font-sans font-semibold"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.08em",
                    color: "rgba(249,115,22,0.85)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  0{i + 1}
                </span>
                <span
                  className="font-sans font-medium uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.20em", color: "rgba(255,255,255,0.60)" }}
                >
                  {s}
                </span>
              </span>
            ))}
          </FadeUp>

          <FadeUp delay={1.05} reduced={reduced} className="flex">
            <MagneticCTA reduced={reduced} />
          </FadeUp>
        </div>

        {/* telemetry shares the CTA's baseline */}
        <Telemetry reduced={reduced} />
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
