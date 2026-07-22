"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   SERVICE SECTION
   Media priority (panels and dive both follow this order):
   video > image > gradient. Drop an MP4 into videoSrc/diveVideos
   any time — until then, `image` carries the panel and the dive
   reveal so the dive effect is fully verifiable today.
══════════════════════════════════════════════════════════════ */

/* Ultra-light line-icon set for the capability list — kept to a small
   fixed vocabulary so every sector's capabilities visually match. */
type IconKind =
  | "sparkle" | "film" | "layout" | "rocket" | "share" | "badge"
  | "cube" | "eye" | "globe" | "megaphone" | "camera" | "tag" | "car" | "heart";

interface Capability {
  icon: IconKind;
  title: string;
  desc: string;
}

interface SectorStat {
  value: string;
  label: string;
}

interface Sector {
  id: string;
  num: string;
  label: string;
  title: string;
  tagline: string;
  /** One-line capability summary shown under the tagline. */
  description: string;
  bg: string;
  /** Static panel/dive image. Used whenever no video is set. */
  image: string;
  /** object-position for the image — these are wide cinematic renders
   *  cropped into tall narrow cards, so horizontal focal point matters
   *  far more than vertical (cover crops the wide axis, not the tall
   *  one). Defaults to centered. */
  imagePos: string;
  /** Sector accent tint (as an "r,g,b" triple) — pulled from this
   *  sector's own `bg` gradient. Used to tint the dive overlay's scrim
   *  and the "WHAT WE DO" row chrome so they read as color-matched to
   *  that sector's own photo instead of a generic dark box dropped on
   *  top regardless of mood. */
  tint: string;
  /** A vivid, saturated version of `tint` for things that need to read
   *  as text/fill (the big number, the primary CTA, the HUD telemetry)
   *  — the raw `tint` triple is too dark/muted to use directly as a
   *  foreground color. Full harmonization: every accent in the dive
   *  page now matches this sector, not just the capability rows. */
  tintBright: string;
  /** Panel background video (muted loop). Leave "" to use the image. */
  videoSrc: string;
  /** Dive-in full-screen video. Falls back to videoSrc if empty. */
  diveVideoSrc: string;
  /** Reel: multiple dive videos played back-to-back, auto-advancing.
   *  Leave empty to fall back to a single video (diveVideoSrc || videoSrc). */
  diveVideos: string[];
  capabilities: Capability[];
  /** Deliberately NOT invented performance numbers (no fake "Projects" /
   *  "Reach" / "Client Satisfaction" counts for a young 4-person agency —
   *  see prior conversation). Team size and capability count are real and
   *  derived; the rest are honest positioning claims, not metrics. */
  stats: SectorStat[];
}

/* Same four honest stat tiles for every sector — team size and
   capability count are real facts, the other two are positioning
   claims (not falsifiable numbers), never invented vanity metrics. */
const baseStats = (capCount: number): SectorStat[] => [
  { value: "4",              label: "Team Members" },
  { value: String(capCount), label: "Core Capabilities" },
  { value: "100%",           label: "Custom Concepts" },
  { value: "1:1",            label: "Direct Access" },
];

const SECTORS: Sector[] = [
  {
    id: "fashion",
    num: "01",
    label: "Fashion",
    title: "Fashion & Apparel",
    tagline: "Where identity becomes the product.",
    description: "We create AI fashion models, campaigns, lookbooks, and product experiences that convert attention into desire.",
    bg: `radial-gradient(ellipse 140% 120% at 35% 85%,
           #7c1f4e 0%, #4d0a32 35%, #1a0512 65%, #0c0a09 100%)`,
    image: "/services/Service_card_fashion_image.png",
    imagePos: "48% center",
    tint: "124,31,78",
    tintBright: "#e85fb0",
    videoSrc: "",       // 👈 Add your fashion sector video URL here
    diveVideoSrc: "",   // 👈 Add your fashion dive-in video URL here
    diveVideos: [],     // 👈 Add multiple reel URLs here to auto-advance through them
    capabilities: [
      { icon: "sparkle",    title: "AI Fashion Models",    desc: "Hyper-real AI models for campaigns and ads" },
      { icon: "film",       title: "Campaign Films",       desc: "Cinematic fashion films that move" },
      { icon: "layout",     title: "Lookbooks",            desc: "Digital lookbooks that engage and convert" },
      { icon: "rocket",     title: "Product Launches",     desc: "Launch experiences that create buzz" },
      { icon: "share",      title: "Social Media Content", desc: "Scroll-stopping content for every platform" },
      { icon: "badge",      title: "Brand Identity",       desc: "Fashion branding that stands out" },
    ],
    stats: baseStats(6),
  },
  {
    id: "realestate",
    num: "02",
    label: "Real Estate",
    title: "Real Estate",
    tagline: "Architecture made irresistible.",
    description: "We craft visual stories and digital experiences that sell spaces before they're built.",
    bg: `radial-gradient(ellipse 140% 120% at 65% 35%,
           #0d3266 0%, #061b3a 40%, #030d1c 70%, #0c0a09 100%)`,
    image: "/services/Service_card_real_estate_image.png",
    imagePos: "42% center",
    tint: "13,50,102",
    tintBright: "#4da3ff",
    videoSrc: "",       // 👈 Add your real estate sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    capabilities: [
      { icon: "cube",       title: "3D Visualizations",    desc: "Photoreal 3D renders that sell" },
      { icon: "film",       title: "Property Films",       desc: "Cinematic tours that create emotion" },
      { icon: "eye",        title: "Virtual Tours",        desc: "Immersive 360° tours for every device" },
      { icon: "globe",      title: "Interactive Websites", desc: "High-converting real estate websites" },
      { icon: "sparkle",    title: "AI Staging",           desc: "AI-powered staging that transforms" },
      { icon: "megaphone",  title: "Marketing Campaigns",  desc: "Data-driven campaigns that close deals" },
    ],
    stats: baseStats(6),
  },
  {
    id: "culinary",
    num: "03",
    label: "Culinary",
    title: "Restaurants & Cafés",
    tagline: "Every dish deserves a world premiere.",
    description: "We create mouth-watering content and brand experiences that fill tables and build loyalty.",
    bg: `radial-gradient(ellipse 140% 130% at 50% 90%,
           #9c3d00 0%, #4d1e00 38%, #1c0a00 65%, #0c0a09 100%)`,
    image: "/services/Service_card_restaurant_image.png",
    imagePos: "46% center",
    tint: "156,61,0",
    tintBright: "#ff8a3d",
    videoSrc: "",       // 👈 Add your culinary sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    capabilities: [
      { icon: "camera",     title: "Food Photography",     desc: "Scroll-stopping food photography" },
      { icon: "film",       title: "Restaurant Films",      desc: "Cinematic films that capture the vibe" },
      { icon: "layout",     title: "Menu Design",           desc: "Menus that look as good as they taste" },
      { icon: "share",      title: "Social Media Content",  desc: "Engaging content that drives foot traffic" },
      { icon: "badge",      title: "Brand Identity",        desc: "Restaurant branding that leaves a mark" },
      { icon: "tag",        title: "Promotions",            desc: "Campaigns that bring customers back" },
    ],
    stats: baseStats(6),
  },
  {
    id: "beauty",
    num: "04",
    label: "Beauty",
    title: "Beauty & Wellness",
    tagline: "The glow that campaigns can't contain.",
    description: "We build trust through content, storytelling, and design that makes wellness brands unforgettable.",
    bg: `radial-gradient(ellipse 140% 120% at 40% 65%,
           #6b0a4a 0%, #360525 40%, #160210 70%, #0c0a09 100%)`,
    image: "/services/Service_card_beauty_%26_wellness_image.png",
    imagePos: "52% center",
    tint: "107,10,74",
    tintBright: "#ff6fc4",
    videoSrc: "",       // 👈 Add your beauty sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    capabilities: [
      { icon: "heart",      title: "Product Commercials",       desc: "Commercials that make products desirable" },
      { icon: "film",       title: "Skincare Routine Films",     desc: "Routine films that build trust" },
      { icon: "share",      title: "Influencer-Style Videos",    desc: "Content that feels authentic" },
      { icon: "layout",     title: "Packaging Reveals",          desc: "Reveals that build anticipation" },
      { icon: "badge",      title: "Brand Storytelling",         desc: "Stories that build brand loyalty" },
      { icon: "megaphone",  title: "Wellness Campaigns",         desc: "Campaigns that promote wellbeing" },
    ],
    stats: baseStats(6),
  },
  {
    id: "automotive",
    num: "05",
    label: "Automotive",
    title: "Automotive",
    tagline: "Zero to launched in 60 seconds.",
    description: "We create high-octane content and digital experiences that accelerate brands.",
    bg: `radial-gradient(ellipse 150% 140% at 55% 75%,
           #c44a00 0%, #7c2800 28%, #2d1000 55%, #0c0a09 85%)`,
    image: "/services/Service_card_car_image.png",
    imagePos: "64% center",
    tint: "196,74,0",
    tintBright: "#ff5a3d",
    videoSrc: "",       // 👈 Add your automotive sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    capabilities: [
      { icon: "car",        title: "Car Commercials",      desc: "High-impact car commercials" },
      { icon: "cube",       title: "3D & CGI",             desc: "Photoreal 3D and CGI that impress" },
      { icon: "rocket",     title: "Product Launches",     desc: "Launch campaigns that drive hype" },
      { icon: "share",      title: "Social Content",       desc: "Content built for engagement" },
      { icon: "badge",      title: "Brand Identity",       desc: "Automotive branding that stands out" },
      { icon: "film",       title: "Experiential Films",   desc: "Films that create emotional connection" },
    ],
    stats: baseStats(6),
  },
];

const TICKER_ITEMS = [
  "Fitness & Gyms","Hotels & Resorts","Healthcare","Interior Designers",
  "Jewelry","Education & EdTech","Finance","Travel & Tourism",
  "Tech & SaaS","Sports & Gaming","Music & Events","E-Commerce",
];

/* Horizontal gallery contract: how many industry cards are visible
   at once inside the pinned viewport, and the gap between them. */
const NUM_VISIBLE_CARDS = 3;
const CARD_GAP_PX = 20;
/* Distance from viewport top the gallery pins at while scrolling —
   clears the fixed navbar (64px) plus a little breathing room. */
const GALLERY_TOP_OFFSET = 96;
/* Extra scroll distance the gallery stays pinned on the LAST card before
   releasing into the next section. Without this, the horizontal reveal
   consumes the entire runway, so the pin unpins on the very next scroll
   tick after the last card lands — the industries ticker starts entering
   the viewport while the gallery is still large/pinned-looking, with no
   pause in between. This buys a beat of "all cards shown, holding" before
   the next section is allowed to scroll into view. */
const HOLD_AFTER_LAST_CARD_PX = 320;

/* ─── Video element (muted background loop) ─── */
function PanelVideo({
  src, active, poster,
}: { src: string; active: boolean; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (active) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [active]);

  if (!src) return null;

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        opacity: active ? 0.92 : 0.38,
        transform: active ? "scale(1.0)" : "scale(1.06)",
        transition: "opacity 1s ease, transform 1s ease",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Static panel image — fully grey at rest, blooms to full color
   the instant it's hovered/active. Scale uses a slight spring
   overshoot so the bloom feels alive rather than mechanical. ─── */
function PanelImage({ src, active, position = "center" }: { src: string; active: boolean; position?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover", objectPosition: position,
        opacity: active ? 1 : 0.6,
        filter: active ? "grayscale(0) brightness(1.04) saturate(1.1)" : "grayscale(1) brightness(0.5)",
        transform: active ? "scale(1.0)" : "scale(1.12)",
        transition: "opacity 0.9s ease, filter 0.9s ease, transform 1.1s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Dive video (full-screen reel item) ───
   loop is only on when it's the sole clip in the reel; with multiple
   clips, onEnded drives auto-advance to the next one instead. ─── */
function DiveVideo({
  src, playing, loop, onEnded, origin,
}: { src: string; playing: boolean; loop: boolean; onEnded?: () => void; origin: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (playing) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [playing, src]);

  if (!src) return null;

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop={loop}
      onEnded={onEnded}
      playsInline
      preload="metadata"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        transformOrigin: origin,
        opacity: playing ? 1 : 0,
        transform: playing ? "scale(1)" : "scale(3.0)",
        transition: "opacity 0.7s ease, transform 1.75s cubic-bezier(0.65,0,0.35,1)",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Capability icon — one small ultra-light stroke glyph per kind,
   shared across all sectors so the "WHAT WE DO" list stays visually
   consistent (no per-sector icon styles to maintain). ─── */
function CapabilityIcon({ kind }: { kind: IconKind }) {
  const common = {
    width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const,
    stroke: "currentColor", strokeWidth: 1.5,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "sparkle":
      return <svg {...common}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>;
    case "film":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>;
    case "layout":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>;
    case "rocket":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 3.5h-2.5V16h-2v-4.5H8.5L12 8z"/></svg>;
    case "share":
      return <svg {...common}><circle cx="6" cy="12" r="2.2"/><circle cx="17" cy="6" r="2.2"/><circle cx="17" cy="18" r="2.2"/><path d="M8 11l7-3.5M8 13l7 3.5"/></svg>;
    case "badge":
      return <svg {...common}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3z"/></svg>;
    case "cube":
      return <svg {...common}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 3v9m0 9v-9m0 0L4 7.5M12 12l8-4.5"/></svg>;
    case "eye":
      return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>;
    case "megaphone":
      return <svg {...common}><path d="M3 11v2a2 2 0 002 2h1l2 5h2l-1-5h2l8 4V7l-8 4H6a2 2 0 00-2 2z"/></svg>;
    case "camera":
      return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.6-2.5h4.8L16 7"/><circle cx="12" cy="13.5" r="3.5"/></svg>;
    case "tag":
      return <svg {...common}><path d="M12 3h6a2 2 0 012 2v6l-9 9-8-8 9-9z"/><circle cx="15.5" cy="7.5" r="1.2"/></svg>;
    case "car":
      return <svg {...common}><path d="M4 16l1.5-5.5A2 2 0 017.4 9h9.2a2 2 0 011.9 1.5L20 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><circle cx="7.5" cy="20" r="1.4"/><circle cx="16.5" cy="20" r="1.4"/></svg>;
    case "heart":
      return <svg {...common}><path d="M12 20s-7-4.35-9.5-9C.9 7.3 3 4 6.5 4c2 0 3.5 1.2 4.5 2.6C12 5.2 13.5 4 15.5 4 19 4 21.1 7.3 21.5 11c-2.5 4.65-9.5 9-9.5 9z"/></svg>;
  }
}

/* ══════════════════════════════════════════════════════════════ */
export default function SectorSection() {
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<Sector | null>(null);
  const [showDive,     setShowDive]     = useState(false);
  const [reelIndex,    setReelIndex]    = useState(0);
  const [hudCoords,    setHudCoords]    = useState({ x: "000.00", y: "000.00" });
  const [isVisible,    setIsVisible]    = useState(false);
  /* Where the dive visually launches from — the clicked card's center,
     captured as a viewport percentage so the zoom reads as plunging
     into that exact spot rather than an anonymous centered fade. */
  const [diveOrigin,   setDiveOrigin]   = useState({ x: 50, y: 50 });
  const [diveKey,      setDiveKey]      = useState(0);

  const sectionRef  = useRef<HTMLElement>(null);

  /* ── Horizontal gallery — scroll-mapped pin, not a wheel-event
     hijack. 3 cards visible; scrolling drives the row left-to-right
     via a sticky container + a scroll-position-derived transform, so
     native scroll (trackpad momentum, keyboard, screen readers) never
     gets intercepted. The pin naturally releases into normal vertical
     scroll once the wrapper's runway ends. ── */
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cardWidth,     setCardWidth]     = useState(280);
  const [maxOffset,     setMaxOffset]     = useState(0);
  const [trackOffset,   setTrackOffset]   = useState(0);
  const [stickyHeightPx,setStickyHeightPx]= useState(520);
  /* Height of the section header ("FIVE INDUSTRIES / SERVICES OF IMPACT")
     that pins together with the card row. It lives INSIDE the pinned box —
     if it sat above in normal flow it would scroll off-screen before the
     pin engages, leaving the pinned gallery header-less (the exact bug
     this fixes). Measured because it wraps responsively. */
  const [headerHeight,  setHeaderHeight]  = useState(0);
  const [pinPhase,      setPinPhase]      = useState<"before" | "pinned" | "after">("before");
  const [cursorPos,     setCursorPos]     = useState({ x: 0, y: 0 });
  const [cursorOver,    setCursorOver]    = useState(false);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const stickyRef     = useRef<HTMLDivElement>(null);
  const headerRef     = useRef<HTMLDivElement>(null);

  /* ── Scroll-reveal ── */
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  /* ── HUD mouse coords ── */
  useEffect(() => {
    if (!showDive) return;
    const fn = (e: MouseEvent) =>
      setHudCoords({
        x: String(e.clientX.toFixed(2)).padStart(6, "0"),
        y: String(e.clientY.toFixed(2)).padStart(6, "0"),
      });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [showDive]);

  /* ── Respect reduced motion: no scroll-jack, plain scroll fallback ── */
  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* ── Card width, total horizontal overflow, and sticky-box height —
     all derived analytically from the visible-card-count contract and
     viewport size (no scrollWidth DOM read, so there's no measure-
     after-paint race). Re-measured on resize. ── */
  useEffect(() => {
    if (reducedMotion) return;
    const measure = () => {
      if (!stickyRef.current) return;
      /* clientWidth INCLUDES the element's own left/right padding
         (md:px-14 lg:px-20) — the cards render inside that padded
         content box, so the true visible window is narrower than
         clientWidth by exactly the padding. Using raw clientWidth here
         overestimated available space, which clipped the 3rd visible
         card at the padding edge. */
      const cs = getComputedStyle(stickyRef.current);
      const w = stickyRef.current.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      /* Capped narrower than the container allows (380, not the old 440)
         so the card reads as a tall portrait rectangle, matching the
         reference mockup's proportions, instead of a near-square. */
      const cw = Math.max(220, Math.min(380, (w - CARD_GAP_PX * (NUM_VISIBLE_CARDS - 1)) / NUM_VISIBLE_CARDS));
      setCardWidth(cw);
      const trackWidth = SECTORS.length * cw + (SECTORS.length - 1) * CARD_GAP_PX;
      setMaxOffset(Math.max(0, trackWidth - w));
      /* Sticky-box height must leave room for the pinned header ABOVE the
         cards (both pin as one block at GALLERY_TOP_OFFSET) — cap it so
         header + cards fit the viewport instead of pushing the card row's
         bottom off-screen. */
      const headerH = headerRef.current?.offsetHeight ?? 0;
      setHeaderHeight(headerH);
      const availH = window.innerHeight - GALLERY_TOP_OFFSET - headerH - 16;
      setStickyHeightPx(Math.min(680, Math.max(420, Math.min(window.innerHeight * 0.58, availH))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stickyRef.current) ro.observe(stickyRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [reducedMotion]);

  /* ── Scroll-linked pin + horizontal offset ──
     Deliberately NOT CSS `position: sticky` — the parent <section>
     sets `overflow: hidden` (needed for its noise/dive-transform
     layers), and ANY ancestor with non-visible overflow breaks sticky
     positioning in every browser (it silently stops tracking the
     viewport). Instead this computes an explicit "before / pinned /
     after" phase from scroll position every frame and toggles
     fixed/absolute positioning in JS — immune to the overflow gotcha,
     and gives exact control over the pin's start/end. ── */
  useEffect(() => {
    if (reducedMotion || maxOffset <= 0) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = scrollWrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        /* The pinned block = header + card row stacked, so the scroll
           runway left over for pin travel excludes BOTH heights. */
        const totalPinnable = Math.max(0, rect.height - stickyHeightPx - headerHeight);
        /* The last HOLD_AFTER_LAST_CARD_PX of the pinned range is a static
           hold on the fully-revealed last card — trackOffset should reach
           maxOffset before that hold starts, not at the very end of it. */
        const horizontalRange = Math.max(0, totalPinnable - HOLD_AFTER_LAST_CARD_PX);
        if (rect.top > GALLERY_TOP_OFFSET) {
          setPinPhase("before");
          setTrackOffset(0);
        } else if (rect.top <= GALLERY_TOP_OFFSET - totalPinnable) {
          setPinPhase("after");
          setTrackOffset(maxOffset);
        } else {
          setPinPhase("pinned");
          const progress = horizontalRange > 0 ? (GALLERY_TOP_OFFSET - rect.top) / horizontalRange : 1;
          setTrackOffset(Math.min(1, Math.max(0, progress)) * maxOffset);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxOffset, stickyHeightPx, headerHeight, reducedMotion]);

  /* Prev/next controls — advance by roughly one reveal-step of
     scroll distance, so mouse-click and keyboard users aren't
     dependent on having a scroll wheel. */
  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollWrapRef.current;
    if (!el || maxOffset <= 0) return;
    const rect = el.getBoundingClientRect();
    const totalPinnable = Math.max(0, rect.height - stickyHeightPx - headerHeight);
    const horizontalRange = Math.max(0, totalPinnable - HOLD_AFTER_LAST_CARD_PX);
    const steps = Math.max(1, SECTORS.length - NUM_VISIBLE_CARDS);
    window.scrollBy({ top: (dir * horizontalRange) / steps, behavior: "smooth" });
  }, [maxOffset, stickyHeightPx, headerHeight]);

  /* ── Dive in — launches FROM the clicked card, not a centered fade.
     Mount with the overlay at its "closed" (scaled way up / opacity 0)
     state, then flip showDive on the next two frames so the browser
     actually paints that starting state before the zoom-in transition
     kicks off — otherwise React can batch both updates into one paint
     and the dive never visibly animates. ── */
  const initiateDive = useCallback((sector: Sector, originEl?: HTMLElement | null) => {
    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      setDiveOrigin({
        x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
        y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
      });
    }
    setDiveKey(k => k + 1);
    setReelIndex(0);
    setActiveSector(sector);
    requestAnimationFrame(() => requestAnimationFrame(() => setShowDive(true)));
  }, []);

  /* ── Surface: return — overlay stays mounted through its own fade-out
     so the exit reads as a smooth surface, not a hard unmount. ── */
  const surfaceBack = useCallback(() => {
    setShowDive(false);
    setTimeout(() => setActiveSector(null), 900);
  }, []);

  /* CTA navigation — surface out of the dive first, then scroll to the
     target section once the overlay has finished fading (900ms, matches
     surfaceBack's own unmount delay). */
  const goTo = useCallback((anchorId: string) => {
    surfaceBack();
    setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" });
    }, 950);
  }, [surfaceBack]);

  /* Reel: explicit diveVideos[] if provided, else a single-item fallback
     built from diveVideoSrc/videoSrc — so existing sectors with just one
     clip behave exactly as before (loop that one clip, no advancing). */
  const reelList = activeSector
    ? (activeSector.diveVideos.length
        ? activeSector.diveVideos
        : [activeSector.diveVideoSrc || activeSector.videoSrc].filter(Boolean))
    : [];
  const diveVideoSrc = reelList[reelIndex] ?? "";
  const isReel = reelList.length > 1;
  const advanceReel = useCallback(() => {
    setReelIndex(i => (i + 1) % reelList.length);
  }, [reelList.length]);

  /* Section header — rendered in TWO places: in normal flow for mobile,
     and inside the pinned gallery block on md+. It must live inside the
     pinned block on desktop: in normal flow above the gallery it scrolls
     off-screen before the pin engages, so the whole pinned card show
     played out with its own title invisible. */
  const galleryHeader = (
    <div
      className="px-5 sm:px-8 md:px-14 lg:px-20"
      style={{
        position: "relative", zIndex: 10,
        maxWidth: "1440px", margin: "0 auto",
        paddingBottom: "clamp(48px,6vh,72px)",
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", gap: "24px", flexWrap: "wrap",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(48px)",
        transition: "opacity 0.95s cubic-bezier(0.23,1,0.32,1), transform 0.95s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div style={{ maxWidth: "640px" }}>
        <span style={{
          display: "block", marginBottom: "16px",
          fontFamily: "var(--font-space-grotesk)",
          fontWeight: 700, textTransform: "uppercase",
          fontSize: "10px", letterSpacing: "0.30em", color: "#f59e0b",
        }}>
          Five Industries We Serve
        </span>
        <h2 style={{
          fontFamily: "var(--font-syne)", fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "clamp(22px, 2.6vw, 36px)",
          letterSpacing: "-0.01em", lineHeight: 1.12, color: "#fdf2f2",
          textWrap: "balance",
          display: "flex", flexWrap: "wrap", columnGap: "0.3em",
        }}>
          {["Services", "of"].map((w, i) => (
            <span key={w} style={{
              display: "inline-block",
              opacity: isVisible ? 1 : 0,
              filter: isVisible ? "blur(0)" : "blur(8px)",
              transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms`,
            }}>
              {w}
            </span>
          ))}
          <span style={{
            display: "inline-block", color: "var(--amber-deep)", fontStyle: "italic",
            fontWeight: 900,
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? "blur(0)" : "blur(8px)",
            transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 220ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 220ms",
          }}>
            Impact
          </span>
        </h2>
      </div>
      <div style={{ maxWidth: "360px", paddingBottom: "4px" }}>
        <p style={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "clamp(14px,1.05vw,16px)",
          lineHeight: 1.65, color: "rgba(255,255,255,0.62)",
        }}>
          From fashion drops to showroom launches, we build the campaigns these industries actually talk about.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes sectorTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes sectorReveal {
          from { opacity: 0; transform: translateY(44px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes sectorFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hudBlink {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 0.95; }
        }
        @keyframes videoBarPulse {
          0%,100% { transform: scaleX(1);   opacity: 0.7; }
          50%      { transform: scaleX(1.04); opacity: 1.0; }
        }
        @keyframes diveBlurPulse {
          0%   { filter: blur(0px); }
          20%  { filter: blur(34px); }
          55%  { filter: blur(10px); }
          100% { filter: blur(0px); }
        }
        @keyframes portalBurst {
          0%   { transform: scale(0.25); opacity: 1; }
          100% { transform: scale(26);   opacity: 0; }
        }
        @keyframes warpRing {
          0%   { transform: scale(0.3);  opacity: 0.85; }
          100% { transform: scale(38);   opacity: 0;    }
        }
        @keyframes shineSweep {
          0%   { transform: translateX(-130%) skewX(-14deg); }
          100% { transform: translateX(130%)  skewX(-14deg); }
        }
        @keyframes tagPop {
          from { opacity: 0; transform: translateY(14px) scale(0.92); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0)     scale(1);   filter: blur(0);   }
        }
        @keyframes glowPulse {
          0%, 100% { transform: scale(1) translateY(0);     opacity: 0.85; }
          50%      { transform: scale(1.18) translateY(-3%); opacity: 1;    }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════
          DIVE OVERLAY — full-screen immersive + video
      ════════════════════════════════════════════════════ */}
      <div
        aria-modal="true"
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "#0c0a09",
          opacity: showDive ? 1 : 0,
          pointerEvents: showDive ? "auto" : "none",
          transition: "opacity 0.85s cubic-bezier(0.23,1,0.32,1)",
          overflow: "hidden",
        }}
      >
        {activeSector && (
          <>
            {/* ── Media stack — everything here zooms FROM diveOrigin (the
                clicked card's center), so the motion reads as plunging into
                that exact spot. The wrapper alone carries a one-shot motion-
                blur pulse timed to the zoom, like a fast forward lunge. ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 0,
              animation: showDive ? "diveBlurPulse 1.6s cubic-bezier(0.45,0,0.55,1) forwards" : "none",
            }}>
              {/* Gradient BG (always present as base layer) */}
              <div style={{
                position: "absolute", inset: 0,
                background: activeSector.bg,
                transformOrigin: `${diveOrigin.x}% ${diveOrigin.y}%`,
                transform: showDive ? "scale(1)" : "scale(3.4)",
                transition: "transform 1.75s cubic-bezier(0.65,0,0.35,1)",
              }}/>

              {/* Dive image — same zoom-in dive as the video layer below,
                  so the effect is fully verifiable before real footage exists */}
              {activeSector.image && (
                <img
                  src={activeSector.image}
                  alt=""
                  aria-hidden
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%", objectFit: "cover",
                    objectPosition: activeSector.imagePos,
                    transformOrigin: `${diveOrigin.x}% ${diveOrigin.y}%`,
                    opacity: showDive ? (diveVideoSrc ? 0 : 1) : 0,
                    transform: showDive ? "scale(1)" : "scale(3.0)",
                    transition: "opacity 0.7s ease, transform 1.75s cubic-bezier(0.65,0,0.35,1)",
                  }}
                />
              )}

              {/* Dive video (pure zoom-in reveal, covers gradient when loaded) */}
              <DiveVideo
                src={diveVideoSrc}
                playing={showDive}
                loop={!isReel}
                onEnded={isReel ? advanceReel : undefined}
                origin={`${diveOrigin.x}% ${diveOrigin.y}%`}
              />
            </div>

            {/* ── Portal flash + warp rings — a burst of light from the exact
                point the user clicked, followed by expanding rings that sell
                the sensation of plunging forward through that point ── */}
            {showDive && (
              <div key={diveKey} aria-hidden style={{
                position: "fixed", left: `${diveOrigin.x}%`, top: `${diveOrigin.y}%`,
                zIndex: 6, width: 0, height: 0, pointerEvents: "none",
              }}>
                <div style={{
                  position: "absolute", left: "-30px", top: "-30px",
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(253,242,242,0.95) 0%, rgba(249,115,22,0.55) 38%, transparent 72%)",
                  animation: "portalBurst 0.65s cubic-bezier(0.16,1,0.3,1) forwards",
                }}/>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    position: "absolute", left: "-22px", top: "-22px",
                    width: "44px", height: "44px", borderRadius: "50%",
                    border: `${1.5 - i * 0.3}px solid rgba(249,115,22,${0.65 - i * 0.12})`,
                    animation: `warpRing ${0.95 + i * 0.18}s cubic-bezier(0.16,1,0.3,1) ${i * 0.13}s forwards`,
                  }}/>
                ))}
              </div>
            )}

            {/* ── Reel progress — one segment per clip, Reels/Stories-style ── */}
            {isReel && showDive && (
              <div style={{
                position: "absolute", top: "clamp(16px,3vh,28px)",
                left: "clamp(20px,4vw,64px)", right: "clamp(20px,4vw,64px)",
                zIndex: 25, display: "flex", gap: "6px",
              }}>
                {reelList.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: "2px", borderRadius: "1px",
                    background: "rgba(255,255,255,0.18)", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: i < reelIndex ? "100%" : i === reelIndex ? "100%" : "0%",
                      background: "#f97316",
                      opacity: i === reelIndex ? 1 : i < reelIndex ? 0.6 : 0,
                      transition: i === reelIndex ? "opacity 0.3s ease" : "none",
                      animation: i === reelIndex ? "videoBarPulse 2s ease-in-out infinite" : "none",
                    }}/>
                  </div>
                ))}
              </div>
            )}

            {/* Content scrim — dark enough to guarantee legibility over ANY
                image (a flat neutral overlay alone read as a generic grey
                box dropped onto the photo regardless of its mood — this
                washes it with the sector's own tint instead, so the
                darkening feels like part of that sector's atmosphere
                rather than an unrelated layer on top of it). The radial
                vignette below adds extra depth at the frame edges only. */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              background: `linear-gradient(155deg, rgba(${activeSector.tint},0.50) 0%, rgba(12,10,9,0.70) 42%, rgba(12,10,9,0.64) 100%)`,
            }}/>

            {/* Vignette — extra depth at the frame edges, on top of the flat scrim */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 18%, rgba(12,10,9,0.75) 100%)",
            }}/>

            {/* Content — two-column "inside page": title/description/
                stats/CTAs on the left, static "WHAT WE DO" capability
                list on the right. Back link top-left, scroll cue
                bottom-center. */}
            <div style={{
              position: "relative", zIndex: 20,
              height: "100%",
              /* No alignItems:"center" here — centering a flex child taller
                 than its box clips the overflow with no way to scroll to
                 it (the overlay's own overflow:hidden makes this worse).
                 overflowY:auto + a plain block child lets tall mobile
                 content (6-item capability list + stats + dual CTA) stay
                 fully reachable by scrolling within the dive. */
              display: "flex", flexDirection: "column",
              overflowY: "auto", WebkitOverflowScrolling: "touch",
              padding: "clamp(72px,12vh,120px) clamp(24px,5vw,80px) clamp(56px,8vh,88px)",
            }}>
              <div
                className="flex flex-col md:flex-row"
                style={{
                  width: "100%", maxWidth: "1240px", gap: "clamp(32px,5vw,80px)",
                  /* auto vertical margins center this column when it fits
                     its box, same visual result as align-items:center, but
                     without that property's overflow-clipping trap */
                  marginLeft: "auto", marginRight: "auto",
                  marginTop: "auto", marginBottom: "auto",
                }}
              >
                {/* ── Left column ── */}
                <div style={{ flex: "1 1 60%", minWidth: 0 }}>
                  <span style={{
                    display: "block", marginBottom: "10px",
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 800, letterSpacing: "-0.02em",
                    fontSize: "clamp(30px,3.4vw,44px)", color: activeSector.tintBright,
                    fontVariantNumeric: "tabular-nums",
                    animation: showDive ? "sectorFadeIn 0.7s ease forwards 0.7s" : "none",
                    opacity: showDive ? 0 : 1,
                  }}>
                    {activeSector.num}
                  </span>
                  <h2 style={{
                    fontFamily: "var(--font-syne)", fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "clamp(28px, 3.6vw, 46px)",
                    letterSpacing: "-0.02em", lineHeight: 1.05,
                    color: "#fdf2f2", textWrap: "balance",
                    animation: showDive ? "sectorReveal 1.0s cubic-bezier(0.23,1,0.32,1) forwards 0.82s" : "none",
                    opacity: showDive ? 0 : 1,
                  }}>
                    {activeSector.title}
                  </h2>
                  <p style={{
                    marginTop: "14px",
                    fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
                    fontSize: "clamp(14px,1.15vw,17px)",
                    color: "rgba(255,255,255,0.85)",
                    animation: showDive ? "sectorFadeIn 0.7s ease forwards 0.95s" : "none",
                    opacity: showDive ? 0 : 1,
                  }}>
                    {activeSector.tagline}
                  </p>
                  <p style={{
                    marginTop: "10px", maxWidth: "46ch",
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(13px,1.05vw,15px)", lineHeight: 1.6,
                    color: "rgba(255,255,255,0.55)",
                    animation: showDive ? "sectorFadeIn 0.7s ease forwards 1.05s" : "none",
                    opacity: showDive ? 0 : 1,
                  }}>
                    {activeSector.description}
                  </p>

                  {/* Stats — honest tiles: team size + capability count are
                      real, the rest are positioning claims, never invented
                      performance metrics. */}
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: "clamp(20px,3vw,40px)",
                    marginTop: "clamp(20px,3vh,32px)",
                    animation: showDive ? "sectorFadeIn 0.7s ease forwards 1.15s" : "none",
                    opacity: showDive ? 0 : 1,
                  }}>
                    {activeSector.stats.map((s) => (
                      <div key={s.label}>
                        <div style={{
                          fontFamily: "var(--font-syne)", fontWeight: 700,
                          fontSize: "clamp(18px,1.8vw,24px)", color: "#fdf2f2",
                        }}>
                          {s.value}
                        </div>
                        <div style={{
                          marginTop: "2px",
                          fontFamily: "var(--font-space-grotesk)",
                          fontSize: "11px", letterSpacing: "0.04em",
                          color: "rgba(255,255,255,0.42)",
                        }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dual CTA — filled primary + outlined secondary */}
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: "14px",
                    marginTop: "clamp(28px,4vh,40px)",
                    opacity: showDive ? 1 : 0,
                    transform: showDive ? "translateY(0)" : "translateY(18px)",
                    transition: showDive
                      ? "opacity 0.7s cubic-bezier(0.23,1,0.32,1) 1.35s, transform 0.7s cubic-bezier(0.23,1,0.32,1) 1.35s"
                      : "opacity 0.3s ease, transform 0.3s ease",
                  }}>
                    <button
                      onClick={() => goTo("contact")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "10px",
                        fontFamily: "var(--font-space-grotesk)",
                        fontWeight: 700, textTransform: "uppercase",
                        fontSize: "11px", letterSpacing: "0.16em",
                        padding: "16px 26px", borderRadius: "999px",
                        background: activeSector.tintBright, border: `1px solid ${activeSector.tintBright}`,
                        color: "#0c0a09", cursor: "pointer",
                        transition: "filter 0.35s ease, box-shadow 0.35s ease",
                      }}
                      onMouseEnter={e => {
                        const t = e.currentTarget;
                        t.style.filter = "brightness(1.12)";
                        t.style.boxShadow = `0 0 32px rgba(${activeSector.tint},0.55)`;
                      }}
                      onMouseLeave={e => {
                        const t = e.currentTarget;
                        t.style.filter = "none";
                        t.style.boxShadow = "none";
                      }}
                    >
                      Launch Experience →
                    </button>
                    <button
                      onClick={() => goTo("work")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "10px",
                        fontFamily: "var(--font-space-grotesk)",
                        fontWeight: 700, textTransform: "uppercase",
                        fontSize: "11px", letterSpacing: "0.16em",
                        padding: "16px 26px", borderRadius: "999px",
                        background: "transparent", border: "1px solid rgba(255,255,255,0.24)",
                        color: "#ffffff", cursor: "pointer",
                        transition: "background 0.35s ease, border-color 0.35s ease",
                      }}
                      onMouseEnter={e => {
                        const t = e.currentTarget;
                        t.style.background = "rgba(255,255,255,0.08)";
                        t.style.borderColor = "rgba(255,255,255,0.45)";
                      }}
                      onMouseLeave={e => {
                        const t = e.currentTarget;
                        t.style.background = "transparent";
                        t.style.borderColor = "rgba(255,255,255,0.24)";
                      }}
                    >
                      ▶ View Work
                    </button>
                  </div>
                </div>

                {/* ── Right column — WHAT WE DO ── */}
                <div style={{ flex: "1 1 34%", minWidth: 0 }}>
                  <span style={{
                    display: "block", marginBottom: "14px",
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700, textTransform: "uppercase",
                    fontSize: "10px", letterSpacing: "0.28em",
                    color: "rgba(255,255,255,0.40)",
                  }}>
                    What We Do
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {activeSector.capabilities.map((cap, i) => (
                      <div
                        key={cap.title}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: "14px",
                          padding: "12px 14px", borderRadius: "10px",
                          border: `1px solid rgba(${activeSector.tint},0.40)`,
                          /* Dark base (for contrast/legibility) with the
                             sector's own tint bleeding through underneath —
                             reads as color-matched atmosphere instead of a
                             generic grey box dropped on an unrelated photo. */
                          background: `linear-gradient(rgba(12,10,9,0.62), rgba(12,10,9,0.62)), rgb(${activeSector.tint})`,
                          backdropFilter: "blur(6px)",
                          opacity: showDive ? 1 : 0,
                          transform: showDive ? "translateY(0)" : "translateY(14px)",
                          transition: showDive
                            ? `opacity 0.6s cubic-bezier(0.23,1,0.32,1) ${1.1 + i * 0.07}s, transform 0.6s cubic-bezier(0.23,1,0.32,1) ${1.1 + i * 0.07}s`
                            : "opacity 0.3s ease, transform 0.3s ease",
                        }}
                      >
                        <span style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "34px", height: "34px", flexShrink: 0,
                          border: `1px solid rgba(${activeSector.tint},0.55)`,
                          color: `rgb(${activeSector.tint})`,
                          filter: "brightness(1.8) saturate(1.3)",
                        }}>
                          <CapabilityIcon kind={cap.icon} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
                            fontSize: "13px", color: "#fdf2f2",
                          }}>
                            {cap.title}
                          </div>
                          <div style={{
                            marginTop: "2px",
                            fontFamily: "var(--font-space-grotesk)",
                            fontSize: "11.5px", lineHeight: 1.4,
                            color: "rgba(255,255,255,0.45)",
                          }}>
                            {cap.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Back to industries — top-left */}
            <button
              onClick={surfaceBack}
              style={{
                position: "absolute", top: "clamp(20px,4vh,32px)", left: "clamp(20px,4vw,64px)",
                zIndex: 25,
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700, textTransform: "uppercase",
                fontSize: "10px", letterSpacing: "0.20em",
                color: "rgba(255,255,255,0.60)", background: "none", border: "none", cursor: "pointer",
                opacity: showDive ? 1 : 0,
                transform: showDive ? "translateY(0)" : "translateY(-8px)",
                transition: showDive
                  ? "opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s, color 0.3s ease"
                  : "opacity 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.60)"; }}
            >
              ← Back to Industries
            </button>

            {/* Scroll to explore — bottom-center cue (desktop only: on
                mobile the taller stacked content needs that space to
                scroll, and this cue would collide with it) */}
            <div className="hidden md:flex" style={{
              position: "absolute", bottom: "clamp(20px,4vh,32px)", left: "50%",
              transform: showDive ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
              zIndex: 25, flexDirection: "column", alignItems: "center", gap: "8px",
              opacity: showDive ? 1 : 0,
              transition: showDive
                ? "opacity 0.6s ease 1.5s, transform 0.6s ease 1.5s"
                : "opacity 0.3s ease, transform 0.3s ease",
            }}>
              <span style={{
                fontFamily: "var(--font-space-grotesk)", fontWeight: 600,
                fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.40)",
              }}>
                Scroll to Explore
              </span>
              <span className="scroll-cue" style={{ width: "1px", height: "22px" }} />
            </div>

            {/* HUD corners — desktop only (see scroll-cue note above).
                Outer wrapper carries the one-time entrance fade, inner
                span carries the perpetual blink so the two opacity
                animations don't fight each other. */}
            <div className="hidden md:block" style={{
              position: "absolute", bottom: "clamp(20px,4vh,40px)",
              left: "clamp(20px,4vw,64px)", zIndex: 20,
              opacity: showDive ? 1 : 0,
              transform: showDive ? "translateY(0)" : "translateY(10px)",
              transition: showDive
                ? "opacity 0.6s ease 1.55s, transform 0.6s ease 1.55s"
                : "opacity 0.3s ease, transform 0.3s ease",
            }}>
              <span style={{
                fontFamily: "var(--font-space-grotesk)", fontSize: "10px",
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: activeSector.tintBright,
                display: "inline-block",
                animation: "hudBlink 2.5s ease-in-out infinite",
              }}>
                STATUS: IMMERSIVE_MODE_ACTIVE // SIGNAL_LOCKED
              </span>
            </div>
            <div className="hidden md:block" style={{
              position: "absolute", bottom: "clamp(20px,4vh,40px)",
              right: "clamp(20px,4vw,64px)", zIndex: 20,
              fontFamily: "var(--font-space-grotesk)", fontSize: "10px",
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: activeSector.tintBright,
              opacity: showDive ? 1 : 0,
              transform: showDive ? "translateY(0)" : "translateY(10px)",
              transition: showDive
                ? "opacity 0.6s ease 1.55s, transform 0.6s ease 1.55s"
                : "opacity 0.3s ease, transform 0.3s ease",
            }}>
              X_AXIS: [{hudCoords.x}] // Y_AXIS: [{hudCoords.y}]
            </div>

            {/* Video badge — reel progress already signals "playing" in reel mode */}
            {diveVideoSrc && !isReel && (
              <div style={{
                position: "absolute", top: "clamp(20px,4vh,36px)",
                right: "clamp(20px,4vw,64px)", zIndex: 25,
                display: "flex", alignItems: "center", gap: "8px",
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 700, fontSize: "9px",
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "#0c0a09",
                background: "#f97316",
                padding: "6px 14px",
              }}>
                ● HD VIDEO
              </div>
            )}
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          MAIN SECTION
      ════════════════════════════════════════════════════ */}
      <section
        id="services"
        ref={sectionRef}
        style={{
          position: "relative", background: "#0c0a09",
          overflow: "hidden",
          /* min 128px = navbar(64px) + 64px breathing room — never lets the
             header collide with the fixed navbar regardless of viewport height */
          paddingTop: "clamp(128px,14vh,180px)", paddingBottom: "0",
          scrollMarginTop: "64px",
          opacity: showDive ? 0 : 1,
          /* Literal "none" (not "scale(1)"/"blur(0)") when inactive — ANY
             non-none transform or filter on an ancestor makes it the
             containing block for position:fixed descendants, which broke
             the gallery's fixed-position pin (it was positioning relative
             to this section instead of the viewport). */
          transform: showDive ? "scale(0.94)" : "none",
          filter: showDive ? "blur(8px) brightness(0.5)" : "none",
          transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1), filter 0.9s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* Noise texture */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.032,
        }}/>

        {/* Ambient glow — soft amber radial blobs across the whole section
            for depth (spans header + gallery, not clipped to the narrow
            scrollable card row like a first attempt was — that version
            was invisible because the card row's own overflow:hidden cut
            it down to a sliver). Pure CSS, no particle JS. */}
        {!reducedMotion && (
          <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
            {[
              { left: "6%",  top: "8%",  size: "34vw", op: 0.16, dur: "10s", delay: "0s" },
              { left: "68%", top: "28%", size: "38vw", op: 0.13, dur: "13s", delay: "2s" },
              { left: "38%", top: "45%", size: "30vw", op: 0.12, dur: "15s", delay: "4s" },
            ].map((g, i) => (
              <div key={i} style={{
                position: "absolute", left: g.left, top: g.top,
                width: g.size, height: g.size,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(249,115,22,${g.op}) 0%, transparent 70%)`,
                filter: "blur(40px)",
                animation: `glowPulse ${g.dur} ease-in-out infinite`,
                animationDelay: g.delay,
              }}/>
            ))}
          </div>
        )}

        {/* ── Header — mobile-only copy. On md+ the same header renders
            inside the pinned gallery block below, so it stays on screen
            while the cards scroll horizontally. ── */}
        <div className="md:hidden">{galleryHeader}</div>

        {/* ── HORIZONTAL INDUSTRY GALLERY (desktop/tablet) ──
            3 industries visible at once. Scrolling the wheel/trackpad
            drives the row left-to-right through all 5 — implemented as
            a sticky pin + scroll-mapped transform (native scroll, not
            a wheel-event hijack), so trackpad momentum, keyboard scroll,
            and screen readers all keep working normally. Once the last
            card clears, the wrapper's runway ends and the page continues
            straight into whatever section comes next. prefers-reduced-
            motion gets a plain native horizontal-scroll fallback instead
            of the pin. ── */}
        <div
          ref={scrollWrapRef}
          className="hidden md:block"
          style={{
            position: "relative",
            /* Runway = pinned block (header + card row) + pin travel.
               stickyHeightPx/headerHeight are the same values the pin
               math subtracts, so layout and phase boundaries stay in
               exact sync (the old CSS clamp() here could drift from the
               JS mirror once the header joined the pinned block). */
            height: reducedMotion
              ? "auto"
              : `${headerHeight + stickyHeightPx + Math.max(maxOffset * 1.1, 240) + HOLD_AFTER_LAST_CARD_PX}px`,
          }}
        >
          {/* Positioning phase toggled in JS (not CSS `position: sticky` —
              the parent <section> has `overflow: hidden`, and any ancestor
              with non-visible overflow breaks sticky in every browser). */}
          <div style={{
            position: reducedMotion ? "relative" : pinPhase === "pinned" ? "fixed" : "absolute",
            top: reducedMotion ? "auto" : pinPhase === "pinned" ? `${GALLERY_TOP_OFFSET}px` : pinPhase === "after" ? "auto" : 0,
            bottom: !reducedMotion && pinPhase === "after" ? 0 : "auto",
            left: 0, right: 0, zIndex: 5,
          }}>
            {/* Header pins WITH the cards — this is what keeps
                "FIVE INDUSTRIES / SERVICES OF IMPACT" on screen for the
                whole horizontal reveal instead of scrolling away before
                the pin engages. */}
            <div ref={headerRef}>{galleryHeader}</div>
            <div
              ref={stickyRef}
              className="md:px-14 lg:px-20"
              style={{
                position: "relative",
                /* reduced-motion never runs measure(), so it keeps the CSS
                   clamp; the pinned path uses the JS-measured height the
                   pin math is built on. */
                height: reducedMotion ? "clamp(460px,58vh,680px)" : `${stickyHeightPx}px`,
                /* Vertical breathing room for the hover-grow scale(1.07) —
                   without it, the scaled card's top/bottom (plus its
                   rounded corners) extend past this box and get clipped
                   by overflowY, since cards are height:100% of this same
                   padded content area. box-sizing:border-box keeps the
                   OUTER height fixed; this padding only shrinks the card's
                   own height, leaving exactly enough headroom to grow
                   into on hover without touching the clipped edge. */
                paddingTop: "28px", paddingBottom: "28px",
                maxWidth: "1440px", margin: "0 auto",
                overflowX: reducedMotion ? "auto" : "hidden",
                overflowY: "hidden",
                scrollSnapType: reducedMotion ? "x mandatory" : "none",
                /* Cards at rest exactly fill the padded content box, so the
                   next card in line bleeds into the right-side padding and
                   gets hard-clipped flush against the true edge — while the
                   left side keeps its full padding gutter. That asymmetry
                   (clean gap on one side, a card slammed against the other)
                   is what read as "off-center". A soft fade at both edges
                   makes the partial card read as a deliberate peek instead,
                   and keeps the framing visually balanced on both sides. */
                WebkitMaskImage: reducedMotion ? "none" : "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                maskImage: reducedMotion ? "none" : "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)",
              }}
              onMouseMove={reducedMotion ? undefined : (e => {
                const r = e.currentTarget.getBoundingClientRect();
                setCursorPos({ x: e.clientX - r.left, y: e.clientY - r.top });
              })}
            >
            <div
              style={{
                display: "flex", height: "100%", gap: `${CARD_GAP_PX}px`,
                position: "relative", zIndex: 1,
                transform: reducedMotion ? "none" : `translateX(-${trackOffset}px)`,
                transition: reducedMotion ? "none" : "transform 0.05s linear",
              }}
            >
              {SECTORS.map((sector, idx) => {
                const isHov = cursorOver && hoveredId === sector.id;
                return (
                  <div
                    key={sector.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Explore ${sector.title}`}
                    onClick={e => initiateDive(sector, e.currentTarget)}
                    onKeyDown={e => e.key === "Enter" && initiateDive(sector, e.currentTarget)}
                    onMouseEnter={() => { setHoveredId(sector.id); setCursorOver(true); }}
                    onMouseLeave={() => { setHoveredId(null); setCursorOver(false); }}
                    style={{
                      flex: `0 0 ${cardWidth}px`,
                      width: `${cardWidth}px`,
                      flexShrink: 0,
                      scrollSnapAlign: reducedMotion ? "start" : "none",
                      height: "100%", position: "relative", overflow: "hidden",
                      borderRadius: "18px",
                      cursor: reducedMotion ? "pointer" : "none",
                      border: isHov ? "1px solid rgba(249,115,22,0.70)" : "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(28,25,23,0.4)",
                      boxShadow: isHov ? "0 0 60px rgba(249,115,22,0.30)" : "none",
                      opacity: isVisible ? 1 : 0,
                      /* Hybrid hover-grow: scale via transform only, never the
                         flex-basis width — the scroll-jack's maxOffset/track
                         math depends on a FIXED per-card layout width, so
                         resizing on hover would desync the pinned scroll
                         progress. Scaling is purely visual and layout-free. */
                      transform: !isVisible
                        ? "translateY(48px) scale(1)"
                        : isHov ? "translateY(0) scale(1.07)" : "translateY(0) scale(1)",
                      transformOrigin: idx === 0 ? "0% 50%" : idx === SECTORS.length - 1 ? "100% 50%" : "50% 50%",
                      zIndex: isHov ? 5 : 1,
                      transition: `border-color 0.4s ease, box-shadow 0.4s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.8s cubic-bezier(0.23,1,0.32,1) ${idx * 0.08}s`,
                      outline: "none",
                    }}
                  >
                    {/* bg: video > image > gradient (same priority as before) */}
                    {sector.videoSrc ? (
                      <PanelVideo src={sector.videoSrc} active={isHov} poster="" />
                    ) : sector.image ? (
                      <PanelImage src={sector.image} active={isHov} position={sector.imagePos} />
                    ) : (
                      <div style={{
                        position: "absolute", inset: 0, background: sector.bg,
                        opacity: isHov ? 1 : 0.5,
                        transform: isHov ? "scale(1)" : "scale(1.06)",
                        transition: "opacity 0.8s ease, transform 0.8s ease",
                      }}/>
                    )}

                    {/* readability scrim — dark at top (for the number/title)
                        and a soft floor at the bottom for depth */}
                    <div aria-hidden style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(180deg, rgba(12,10,9,0.88) 0%, rgba(12,10,9,0.20) 34%, rgba(12,10,9,0.04) 58%, rgba(12,10,9,0.45) 100%)",
                    }}/>

                    {/* amber top edge on active */}
                    <div aria-hidden style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                      background: "#f97316",
                      transform: isHov ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "0% 50%",
                      transition: "transform 0.45s cubic-bezier(0.23,1,0.32,1)",
                    }}/>

                    {/* number + title — top-left anchored */}
                    <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "22px 24px", zIndex: 2 }}>
                      <span style={{
                        display: "block", marginBottom: "6px",
                        fontFamily: "var(--font-syne)", fontWeight: 800,
                        fontSize: "clamp(22px,2.2vw,30px)", letterSpacing: "-0.02em",
                        color: isHov ? "#f97316" : "rgba(255,255,255,0.55)",
                        transition: "color 0.4s ease",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {sector.num}
                      </span>
                      <h3 style={{
                        fontFamily: "var(--font-syne)", fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "clamp(14px,1.5vw,18px)",
                        letterSpacing: "-0.01em", lineHeight: 1.18,
                        color: "#fdf2f2", textWrap: "balance",
                      }}>
                        {sector.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* custom "ENTER" cursor — replaces the pointer over cards */}
            {!reducedMotion && (
              <div aria-hidden style={{
                position: "absolute",
                left: cursorPos.x, top: cursorPos.y,
                width: "64px", height: "64px", marginLeft: "-32px", marginTop: "-32px",
                borderRadius: "50%", border: "1px solid rgba(249,115,22,0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
                fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#f97316", background: "rgba(12,10,9,0.4)",
                backdropFilter: "blur(6px)",
                pointerEvents: "none", zIndex: 20,
                opacity: cursorOver ? 1 : 0,
                transform: cursorOver ? "scale(1)" : "scale(0.5)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}>
                Enter
              </div>
            )}

            {/* prev/next — nested inside the pinned box (not a flow
                sibling) so it travels with the box through all three
                positioning phases instead of losing its layout space
                the moment the box goes fixed/absolute. */}
            {!reducedMotion && maxOffset > 0 && (
              <div style={{
                position: "absolute", left: 0, right: 0, bottom: "-64px",
                display: "flex", justifyContent: "center", gap: "12px", zIndex: 6,
              }}>
                {([["Previous industries", -1], ["Next industries", 1]] as const).map(([label, dir]) => (
                  <button
                    key={label}
                    aria-label={label}
                    onClick={() => scrollByCard(dir)}
                    style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      border: "1px solid rgba(249,115,22,0.35)",
                      background: "rgba(255,255,255,0.04)", color: "#f97316",
                      fontSize: "16px", cursor: "pointer",
                      transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                    }}
                    onMouseEnter={e => {
                      const t = e.currentTarget;
                      t.style.background = "#f97316"; t.style.color = "#0c0a09";
                    }}
                    onMouseLeave={e => {
                      const t = e.currentTarget;
                      t.style.background = "rgba(255,255,255,0.04)"; t.style.color = "#f97316";
                    }}
                  >
                    {dir === -1 ? "←" : "→"}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* ── MOBILE SERVICE LIST (touch-first — always expanded, no hover) ── */}
        <div
          className="flex md:hidden flex-col px-5 sm:px-8"
          style={{
            position: "relative", zIndex: 10,
            gap: "14px",
          }}
        >
          {SECTORS.map((sector, idx) => (
            <button
              key={sector.id}
              onClick={e => initiateDive(sector, e.currentTarget)}
              style={{
                position: "relative", overflow: "hidden",
                textAlign: "left", cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(28,25,23,0.5)",
                padding: 0, minHeight: "152px",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.7s cubic-bezier(0.23,1,0.32,1) ${idx * 0.08}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${idx * 0.08}s`,
              }}
            >
              {sector.videoSrc ? (
                <PanelVideo src={sector.videoSrc} active poster="" />
              ) : sector.image ? (
                <img
                  src={sector.image} alt="" aria-hidden
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: sector.imagePos }}
                />
              ) : (
                <div aria-hidden style={{ position: "absolute", inset: 0, background: sector.bg }} />
              )}
              <div aria-hidden style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 100%)",
              }}/>
              <div style={{
                position: "relative", zIndex: 2,
                display: "flex", flexDirection: "column",
                justifyContent: "flex-end", height: "100%",
                padding: "18px 20px",
              }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 500,
                  fontSize: "11px", letterSpacing: "0.06em", color: "#f59e0b",
                  marginBottom: "4px",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  INDUSTRY // {sector.num}
                </span>
                <h3 style={{
                  fontFamily: "var(--font-syne)", fontWeight: 700,
                  textTransform: "uppercase", fontSize: "20px",
                  letterSpacing: "-0.01em", color: "#fdf2f2", marginBottom: "4px",
                }}>
                  {sector.title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-space-grotesk)", fontSize: "13px",
                  color: "rgba(255,255,255,0.62)", marginBottom: "12px",
                }}>
                  {sector.tagline}
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  alignSelf: "flex-start",
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
                  textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.16em",
                  padding: "9px 16px",
                  border: "1px solid rgba(249,115,22,0.45)", color: "#f97316",
                }}>
                  {sector.diveVideoSrc || sector.videoSrc ? "▶ Watch & Dive" : "Dive In →"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ── TICKER ── */}
        <div style={{
          position: "relative", zIndex: 10, marginTop: "56px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 0",
          background: "rgba(28,25,23,0.22)",
          backdropFilter: "blur(4px)",
          overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <div style={{
            display: "inline-block",
            animation: "sectorTicker 38s linear infinite",
          }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "clamp(14px,1.3vw,18px)", letterSpacing: "0.04em",
                  marginRight: "56px",
                  color: "rgba(255,255,255,0.26)",
                  cursor: "default", transition: "color 0.3s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.26)"; }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
