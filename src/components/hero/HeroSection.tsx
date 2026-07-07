"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import HeroOverlay from "./HeroOverlay";
import EmberTrail from "./EmberTrail";

const RocketCanvas = dynamic(() => import("./RocketCanvas"), {
  ssr: false,
  loading: () => null,
});

/* ══════════════════════════════════════════════════════════
   HERO SECTION — layered cinematic exit
   • On scroll, the HTML overlay and the 3D canvas leave at
     DIFFERENT speeds (overlay faster, canvas slower + slight
     zoom) — a depth-parallax handoff into the next section
     instead of a hard cut.
   • Film-grain overlay on top of everything: subtle animated
     noise that reads as celluloid, kills the "clean digital"
     flatness. pointer-events:none, transform-only animation.
══════════════════════════════════════════════════════════ */

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /* Overlay exits fast; canvas trails behind and gently zooms —
     two layers moving at different rates = perceived depth. */
  const overlayY       = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const canvasY        = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const canvasScale    = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const bgOpacity      = useTransform(scrollYProgress, [0, 1], [1, 0.55]);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[100dvh] overflow-hidden"
      style={{ cursor: "crosshair" }}
    >
      {/* ── Deep space base — amber-tinted grid ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          opacity: reduced ? 1 : bgOpacity,
          background: "#04040a",
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Nebula glows — amber/fire atmosphere around rocket ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 70% at 72% 58%, rgba(249,115,22,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 38% 50% at 86% 22%, rgba(234,88,12,0.08)  0%, transparent 55%),
            radial-gradient(ellipse 30% 40% at 18% 72%, rgba(249,115,22,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 55% 80%, rgba(220,60,0,0.030)  0%, transparent 55%),
            radial-gradient(ellipse 88% 88% at 50% 50%, transparent 32%, rgba(4,4,10,0.65) 100%)
          `,
        }}
      />

      {/* ── HTML overlay: headline + CTA (z-10) — fast exit layer ── */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={reduced ? undefined : { y: overlayY, opacity: overlayOpacity }}
      >
        <HeroOverlay />
      </motion.div>

      {/* ── Three.js rocket canvas (z-15) — slow exit layer ── */}
      <motion.div
        className="absolute inset-0 z-[15] pointer-events-none"
        style={reduced ? undefined : { y: canvasY, scale: canvasScale }}
      >
        <RocketCanvas />
      </motion.div>

      {/* ── Ember cursor trail — sparks pour off the pointer (z-18) ── */}
      <EmberTrail />

      {/* ── Film grain — celluloid texture over the whole frame ── */}
      <div aria-hidden="true" className="film-grain z-20" />
    </section>
  );
}
