"use client";

import { useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   EMBER TRAIL — amber sparks pour off the cursor
   2D canvas, additive blending, capped particle pool.
   The cursor becomes part of the launch: everywhere you move,
   embers rise and die like sparks off a launch pad.
   Skipped entirely under prefers-reduced-motion.
══════════════════════════════════════════════════════════ */

type P = {
  x: number; y: number;
  vx: number; vy: number;
  life: number; max: number;
  r: number; hue: number;
};

export default function EmberTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      W = cv.width = Math.max(1, Math.round(r.width));
      H = cv.height = Math.max(1, Math.round(r.height));
    };
    resize();
    window.addEventListener("resize", resize);

    const ps: P[] = [];
    let lx = -1, ly = -1;

    const onMove = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (x < 0 || x > W || y < 0 || y > H) { lx = -1; return; }
      const dist = lx < 0 ? 0 : Math.hypot(x - lx, y - ly);
      const n = Math.min(5, 1 + Math.floor(dist / 9));
      for (let i = 0; i < n; i++) {
        if (ps.length > 110) ps.shift();
        const t = n > 1 ? i / (n - 1) : 0; // interpolate along the swipe
        ps.push({
          x: (lx < 0 ? x : lx + (x - lx) * t) + (Math.random() - 0.5) * 5,
          y: (ly < 0 ? y : ly + (y - ly) * t) + (Math.random() - 0.5) * 5,
          vx: (Math.random() - 0.5) * 34,
          vy: -22 - Math.random() * 46,
          life: 0,
          max: 0.55 + Math.random() * 0.75,
          r: 0.8 + Math.random() * 1.7,
          hue: 18 + Math.random() * 20,
        });
      }
      lx = x; ly = y;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0, last = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, W, H);
      if (ps.length === 0) return;
      ctx.globalCompositeOperation = "lighter";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        if (p.life >= p.max) { ps.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= dt * 14;                       // embers float upward
        p.vx += (Math.random() - 0.5) * 26 * dt; // turbulence
        const f = 1 - p.life / p.max;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue},100%,${52 + f * 22}%,${f * 0.85})`;
        ctx.arc(p.x, p.y, p.r * (0.45 + f * 0.85), 0, Math.PI * 2);
        ctx.fill();
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 z-[18] pointer-events-none"
      aria-hidden="true"
    />
  );
}
