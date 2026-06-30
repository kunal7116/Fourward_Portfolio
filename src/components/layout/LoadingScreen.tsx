"use client";

import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════
   IGNITION SEQUENCE LOADER
   • Wordmark assembles letter-by-letter (blur → focus)
   • Mission-clock countdown replaces a generic percentage:
     T-MINUS 03 → 02 → 01 → IGNITION
   • Finishes when window 'load' fires AND a minimum display
     time has elapsed — never flashes, never hangs (hard cap)
   • Exit is a blast-door wipe: content blurs out, then the
     screen splits open top/bottom to reveal the page beneath
   • Fully respects prefers-reduced-motion (global rule zeroes
     every transition/animation duration below)
══════════════════════════════════════════════════════════ */

const WORD = "FOURWARD";
const SPLIT = 4; // FOUR | WARD

/* Deterministic star scatter — fixed, not random, so SSR and
   client markup match exactly (no hydration mismatch). */
const STARS_TOP = [
  [8, 70], [16, 22], [27, 55], [34, 14], [42, 80], [51, 38],
  [60, 64], [68, 18], [77, 48], [85, 75], [91, 28], [95, 58],
] as const;
const STARS_BOTTOM = [
  [5, 30], [13, 68], [23, 12], [31, 50], [40, 84], [49, 24],
  [58, 60], [66, 90], [74, 36], [82, 14], [89, 66], [96, 42],
] as const;

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"counting" | "ignition" | "exiting">("counting");
  const [hidden, setHidden] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Deterministic, fixed-length run — does NOT wait on window 'load'.
       The old version eased toward 96% and then parked there until the
       'load' event fired, which on a heavy dev bundle (Turbopack +
       Three.js + the GLB rocket model) can lag well past that point —
       reading as a stuck progress bar. A fixed duration always finishes
       smoothly on schedule; the hero content underneath keeps loading
       in the background regardless and is already mounted by the time
       the doors open. */
    const DURATION = reduced ? 300 : 1700;
    let rafId = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setPhase("ignition");
      const ignitionMs = reduced ? 0 : 220;
      const exitMs = reduced ? 150 : 980;
      setTimeout(() => setPhase("exiting"), ignitionMs);
      setTimeout(() => setHidden(true), ignitionMs + exitMs);
    };

    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setProgress(eased * 100);
      if (t >= 1) { finish(); return; }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (hidden) return null;

  const fraction = progress / 100;
  const secondsLeft = Math.max(1, Math.ceil(3 - fraction * 3));
  const exiting = phase !== "counting";
  const split = phase === "exiting";

  return (
    <div
      aria-hidden={exiting}
      style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: exiting ? "none" : "auto" }}
    >
      <style>{`
        @keyframes letterReveal {
          from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);     filter: blur(0);  }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.7;  }
        }
        @keyframes seamPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.8;  }
        }
      `}</style>

      {/* Upper blast door */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: "#04040a", overflow: "hidden", zIndex: 0,
        transform: split ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.95s cubic-bezier(0.76,0,0.24,1)",
      }}>
        {STARS_TOP.map(([x, y], i) => (
          <span key={i} style={{
            position: "absolute", left: `${x}%`, top: `${y}%`,
            width: "2px", height: "2px", borderRadius: "50%", background: "#ffffff",
            animation: `starTwinkle ${3.2 + (i % 4) * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.28}s`,
          }}/>
        ))}
      </div>

      {/* Lower blast door */}
      <div aria-hidden style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
        background: "#04040a", overflow: "hidden", zIndex: 0,
        transform: split ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.95s cubic-bezier(0.76,0,0.24,1)",
      }}>
        {STARS_BOTTOM.map(([x, y], i) => (
          <span key={i} style={{
            position: "absolute", left: `${x}%`, top: `${y}%`,
            width: "2px", height: "2px", borderRadius: "50%", background: "#ffffff",
            animation: `starTwinkle ${3.2 + (i % 4) * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.28 + 0.4}s`,
          }}/>
        ))}
      </div>

      {/* Seam — glows ambient while counting, flares at ignition, fades as doors part */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", left: 0, right: 0, height: "1px", zIndex: 1,
        background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.9), transparent)",
        boxShadow: phase === "ignition" ? "0 0 46px 7px rgba(249,115,22,0.85)" : "0 0 16px rgba(249,115,22,0.4)",
        opacity: split ? 0 : 1,
        animation: phase === "counting" ? "seamPulse 2.2s ease-in-out infinite" : "none",
        transition: "box-shadow 0.25s ease, opacity 0.3s ease",
      }}/>

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: exiting ? 0 : 1,
        filter: exiting ? "blur(10px)" : "blur(0)",
        transform: exiting ? "scale(1.06)" : "scale(1)",
        transition: "opacity 0.45s ease, filter 0.5s ease, transform 0.55s cubic-bezier(0.23,1,0.32,1)",
      }}>
        <div style={{ display: "flex" }}>
          {WORD.split("").map((ch, i) => (
            <span key={i} style={{
              display: "inline-block",
              fontFamily: "var(--font-syne)", fontWeight: 900,
              fontSize: "clamp(30px, 5vw, 50px)", letterSpacing: "-0.03em",
              color: i < SPLIT ? "#ffffff" : "#f97316",
              animation: "letterReveal 0.7s cubic-bezier(0.16,1,0.3,1) backwards",
              animationDelay: `${i * 0.045}s`,
            }}>
              {ch}
            </span>
          ))}
        </div>

        <div style={{
          marginTop: "30px", display: "flex", alignItems: "center", gap: "14px",
          fontFamily: "var(--font-space-grotesk)",
        }}>
          <span aria-hidden style={{ width: "26px", height: "1px", background: "rgba(249,115,22,0.4)" }}/>
          <span style={{
            fontWeight: 600, fontSize: "11px", letterSpacing: "0.32em",
            textTransform: "uppercase", color: "rgba(249,115,22,0.78)",
            fontVariantNumeric: "tabular-nums", minWidth: "112px", textAlign: "center",
          }}>
            {phase === "counting" ? `T-MINUS 0${secondsLeft}` : "IGNITION"}
          </span>
          <span aria-hidden style={{ width: "26px", height: "1px", background: "rgba(249,115,22,0.4)" }}/>
        </div>

        <div style={{
          position: "relative", marginTop: "22px",
          width: "min(180px, 40vw)", height: "2px",
          background: "rgba(255,255,255,0.08)", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: "0 auto 0 0", width: `${progress}%`,
            background: "linear-gradient(90deg, #ea580c, #f97316)",
            transition: "width 160ms linear",
            boxShadow: "0 0 10px rgba(249,115,22,0.55)",
          }}/>
        </div>
      </div>
    </div>
  );
}
