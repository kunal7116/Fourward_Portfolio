# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

There are no automated tests. Verify visual/interactive work by booting a real browser against the app — headless Chromium lacks H.264 decode and throttles rAF-heavy scenes, so use Playwright/Puppeteer with `channel: "chrome"` (or an explicit Chrome executable path) and HTTP URLs, not `file://`. `puppeteer` is already a devDependency for this purpose.

Dev-server hygiene: stale/zombie `node` processes from previous `npm run dev`/`start` runs are a recurring problem on this machine — they hold ports 3000+ and cause misleading "(stale)" Next.js overlay errors (e.g. "Cannot find module '[turbopack]_runtime.js'"). Before debugging such errors, kill all node processes and delete `.next`, then start one clean server.

## What this project is

Single-page portfolio for FOURWARD, a 4-person creative agency. `src/app/page.tsx` composes the whole page in order: `LoadingScreen` → `Navbar` → `HeroSection` → `WorkSection` → `AboutSection` → `SectorSection` (Services) → `ContactSection`. Read `PRODUCT.md` before design work — it defines the brand (bold/kinetic, "SpaceX launch control meets editorial spread"), explicit anti-references, and design principles (one accent color, weight-as-hierarchy, generous negative space, WCAG AA).

**Project-wide content rule:** never invent performance numbers, client counts, or testimonials for this real, small, currently-early-stage agency. Where a stat-shaped UI element exists (About's pillars, Services' capability stats), the values are either genuinely true (team size = 4, capability count) or explicit positioning statements ("100% Custom Concepts"), never fabricated metrics. Placeholder content (team photos, work videos, contact email) is clearly marked with `👈`/`👉` comments at its source — search for those markers before assuming a field is finished.

## Architecture

- **Next.js 16 App Router + Tailwind v4 + TypeScript.** Tailwind v4 has no `tailwind.config` — theme lives in `src/app/globals.css` via `@theme inline` and CSS custom properties. The palette is deep-space `#04040a` with a single amber accent family (`--electric-amber: #f97316` and variants). Fonts: Syne (display, `.font-display`) and Space Grotesk (body) loaded via `next/font` in `layout.tsx` and wired to Tailwind through `--font-display`/`--font-sans`.
- **Do not add a universal `* { margin/padding: 0 }` reset to `globals.css`.** Tailwind v4's own preflight already does this inside `@layer base`; an unlayered star-selector reset outranks every Tailwind utility class (unlayered beats layered) and silently strips all padding site-wide. Similarly, keep `html { height:100%; overflow-x:hidden }` and `body { min-height:100% }` on separate rules — putting `height:100%` + `overflow-x:hidden` directly on `body` turns `body` into its own scroll container, which breaks `window.scrollY` for every scroll-linked effect on the page.
- **Server/client split:** `page.tsx` and `layout.tsx` are server components; every interactive component is `"use client"`. The Three.js canvas (`RocketCanvas`) is additionally loaded with `next/dynamic` + `ssr: false` from `HeroSection`.
- **Hydration discipline:** anything random must be deterministic (e.g. `LoadingScreen`'s fixed star coordinates) so SSR and client markup match. `<body>` has `suppressHydrationWarning` for browser-extension attribute injection — don't remove it.
- **Reduced motion:** `globals.css` globally zeroes animation/transition durations under `prefers-reduced-motion`, and every section additionally checks `matchMedia("(prefers-reduced-motion: reduce)")` in JS to skip its own scroll-jacking/parallax/particle logic. New motion must respect both paths.
- The animation library installed is `motion` (the successor package), not `framer-motion` — import from `"motion/react"`.
- This codebase does not use CSS modules or styled-components — one-off styling is inline `style={{}}` objects; Tailwind classes are used only for layout primitives (flex/grid, responsive padding breakpoints like `md:px-14 lg:px-20`).

### Hero (`src/components/hero/`)

Raw imperative Three.js in `RocketCanvas.tsx` (no react-three-fiber): manual scene/renderer/RAF setup, GLTF rocket (`public/rocket.glb`) whose Blender flame meshes are identified by `emissiveIntensity > 3` and animated every frame. The hero is a small reactive system, not a static scene:
- Hovering the CTA in `HeroOverlay.tsx` dispatches a `window` CustomEvent (`fw:throttle`) that `RocketCanvas` listens for to surge the engine flame — cross-component coordination via a DOM event, since the canvas and the overlay are independently-mounted siblings, not parent/child.
- Scrolling past the hero triggers the same launch sequence the click handler uses.
- `EmberTrail.tsx` is a separate 2D `<canvas>` particle layer (cursor sparks), independent of the WebGL rocket canvas.
- `HeroSection.tsx` layers the background/overlay/3D-canvas at different scroll-parallax speeds (overlay fastest, 3D canvas slower + zooming, background slowest) for a depth handoff into the next section, via `motion`'s `useScroll`/`useTransform`.

### Services (`src/components/sections/SectorSection.tsx`)

The most complex component in the app. Two coupled subsystems:

1. **Horizontal scroll-jack gallery** — 3 industry cards visible at once; scrolling drives the row left-to-right through all 5, then releases into normal page scroll. **Deliberately not CSS `position: sticky`**: the parent `<section>` needs `overflow: hidden` for its own effects, and any ancestor with non-`visible` overflow silently breaks `position: sticky` in every browser. Instead a `pinPhase` state (`"before" | "pinned" | "after"`) is computed from scroll position every frame and toggled between `position: fixed`/`absolute` in JS. This in turn requires the parent `<section>`'s `transform`/`filter` to be literal `"none"` when inactive (not `"scale(1)"`/`"blur(0)"`) — any non-`none` value on either property makes that ancestor the containing block for `position: fixed` descendants, silently detaching the "fixed" gallery from the viewport. Card width/height math reads `getComputedStyle(...).paddingLeft/paddingRight` explicitly rather than trusting `clientWidth` alone, since `clientWidth` includes padding the cards don't actually get to use. Hover-"grow" on a card is a pure `transform: scale()`, never a width change — scaling only affects paint, so it can't desync the pinned scroll math the way changing layout width would.
2. **Per-sector color harmonization** — each `Sector` carries `tint` (a muted `"r,g,b"` triple, reused from that sector's `bg` gradient) and `tintBright` (a vivid hex derived from it). The expanded "dive" overlay's scrim, capability-row backgrounds/icons, the big number, the primary CTA, and the HUD telemetry text all key off these two values, so a sector's accent color visually matches its own photo instead of a fixed brand color regardless of image. `capabilities: {icon, title, desc}[]` uses a small fixed vocabulary of hand-drawn SVG icons (`CapabilityIcon`) rather than one-off icons per capability.

### Work (`WorkSection.tsx`) and About (`AboutSection.tsx`)

Simpler siblings following the same conventions as Services: `IntersectionObserver`-driven reveal-on-scroll, inline-style cards. Work's cards are video-first — the muted looping clip itself is the resting thumbnail (paused at ~0.05s so it never shows black, grayscale-filtered), plays in color on hover, and opens full-screen with sound in a lightbox on click.

### Contact (`ContactSection.tsx`)

Adapted from the design reference in `public/Contact_Us/` (kept there for provenance, not read by the app at runtime). No form backend exists — submissions go out via a `mailto:` link built from the field values; `CONTACT_EMAIL` at the top of the file is a placeholder that needs replacing with the real inbox before this is genuinely useful.

## Repo hygiene

- `.claude/`, `.agents/`, `.codex/`, and `skills-lock.json` are agent-tooling directories (installed skills/plugins), not app code — leave them untracked/uncommitted unless asked otherwise.
- `.mcp.json` contains an API key and is deliberately gitignored — never commit it or remove the `.gitignore` entry.
- Branch `backup/session-2026-07-05` holds an earlier, since-abandoned hero redesign (shaders, video pipelines, custom fonts) — recover files from it with `git restore --source=backup/session-2026-07-05 -- <path>` if ever needed, but it is not part of the current design direction.
- This repo has more than one active contributor — check `git log` before assuming a file's history/intent, rather than relying only on prior conversation context.
