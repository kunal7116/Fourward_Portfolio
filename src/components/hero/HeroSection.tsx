"use client";

import dynamic from "next/dynamic";
import HeroOverlay from "./HeroOverlay";

const RocketCanvas = dynamic(() => import("./RocketCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[100dvh] overflow-hidden"
      style={{ cursor: "crosshair" }}
    >
      {/* ── Deep space base — amber-tinted grid ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
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

      {/* ── HTML overlay: headline + CTA (z-10) ── */}
      <HeroOverlay />

      {/* ── Three.js rocket canvas (z-15, pointer-events:none) ── */}
      <RocketCanvas />
    </section>
  );
}
