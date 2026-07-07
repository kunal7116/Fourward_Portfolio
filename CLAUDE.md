# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run lint    # eslint
```

There are no tests. Verify visual work by booting the dev server and checking in a real browser (headless Chromium lacks H.264 decode and throttles rAF-heavy scenes — use Playwright with `channel: "chrome"` and HTTP URLs, not `file://`).

Dev-server hygiene: stale/zombie `node` processes from previous `npm run dev` runs are a recurring problem on this machine — they hold ports 3000+ and cause misleading "(stale)" Next.js overlay errors (e.g. "Cannot find module '[turbopack]_runtime.js'"). Before debugging such errors, kill all node processes and delete `.next`, then start one clean server.

## What this project is

Single-page portfolio site for FOURWARD, a 4-person creative agency. `src/app/page.tsx` composes the whole page: `LoadingScreen` → `Navbar` → `HeroSection` → `SectorSection`. Read `PRODUCT.md` before design work — it defines the brand (bold/kinetic, "SpaceX launch control meets editorial spread"), explicit anti-references, and design principles (one accent color, weight-as-hierarchy, generous negative space, WCAG AA).

## Architecture

- **Next.js 16 App Router + Tailwind v4 + TypeScript.** Tailwind v4 has no `tailwind.config` — theme lives in `src/app/globals.css` via `@theme inline` and CSS custom properties. The palette is deep-space `#04040a` with a single amber accent family (`--electric-amber: #f97316` and variants). Fonts: Syne (display, `.font-display`) and Space Grotesk (body) loaded via `next/font` in `layout.tsx` and wired to Tailwind through `--font-display`/`--font-sans`.
- **Server/client split:** `page.tsx` and `layout.tsx` are server components; every interactive component is `"use client"`. The Three.js canvas (`RocketCanvas`) is additionally loaded with `next/dynamic` + `ssr: false` from `HeroSection`.
- **Three.js is used raw** (imperative scene setup inside a `useEffect`, manual renderer/RAF/cleanup) — no react-three-fiber. The rocket model is `public/rocket.glb`, loaded with `GLTFLoader`. Flame effects animate the GLB's own emissive materials (see the strategy comment at the top of `RocketCanvas.tsx`).
- **Hero layering contract:** background gradient layers at z-0, `HeroOverlay` (headline/CTA HTML) at z-10, `RocketCanvas` above it with `pointer-events: none` so the overlay stays clickable.
- **Hydration discipline:** anything random must be deterministic (e.g. `LoadingScreen`'s fixed star coordinates) so SSR and client markup match. `<body>` has `suppressHydrationWarning` for browser-extension attribute injection — don't remove it.
- **Reduced motion:** `globals.css` globally zeroes animation/transition durations under `prefers-reduced-motion`, and JS-driven animations also check the media query themselves. New motion must respect both paths.
- The animation library installed is `motion` (the successor package), not `framer-motion` — import from `"motion/react"`.

## Repo hygiene

- `.claude/`, `.agents/`, `.codex/`, and `skills-lock.json` are agent-tooling directories (installed skills/plugins), not app code — leave them alone unless asked.
- `.mcp.json` contains an API key and is deliberately gitignored — never commit it or remove the `.gitignore` entry.
- Branch `backup/session-2026-07-05` holds prior hero-redesign experiments (shaders, video pipelines, fonts); recover files from it with `git restore --source=backup/session-2026-07-05 -- <path>`.
