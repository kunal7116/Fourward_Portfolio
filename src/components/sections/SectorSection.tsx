"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   SERVICE SECTION
   Media priority (panels and dive both follow this order):
   video > image > gradient. Drop an MP4 into videoSrc/diveVideos
   any time — until then, `image` carries the panel and the dive
   reveal so the dive effect is fully verifiable today.
══════════════════════════════════════════════════════════════ */

interface Sector {
  id: string;
  num: string;
  label: string;
  title: string;
  tagline: string;
  bg: string;
  /** Static panel/dive image. Used whenever no video is set. */
  image: string;
  /** Panel background video (muted loop). Leave "" to use the image. */
  videoSrc: string;
  /** Dive-in full-screen video. Falls back to videoSrc if empty. */
  diveVideoSrc: string;
  /** Reel: multiple dive videos played back-to-back, auto-advancing.
   *  Leave empty to fall back to a single video (diveVideoSrc || videoSrc). */
  diveVideos: string[];
  services: string[];
}

const SECTORS: Sector[] = [
  {
    id: "fashion",
    num: "01",
    label: "Fashion",
    title: "Fashion & Apparel",
    tagline: "Where identity becomes the product.",
    bg: `radial-gradient(ellipse 140% 120% at 35% 85%,
           #7c1f4e 0%, #4d0a32 35%, #1a0512 65%, #0c0a09 100%)`,
    image: "/services/fashion.png",
    videoSrc: "",       // 👈 Add your fashion sector video URL here
    diveVideoSrc: "",   // 👈 Add your fashion dive-in video URL here
    diveVideos: [],     // 👈 Add multiple reel URLs here to auto-advance through them
    services: ["Product Launch Videos","Collection Announcements","Lifestyle Campaigns","AI Fashion Models","Instagram Carousels","Festive Promotions"],
  },
  {
    id: "realestate",
    num: "02",
    label: "Real Estate",
    title: "Real Estate",
    tagline: "Architecture made irresistible.",
    bg: `radial-gradient(ellipse 140% 120% at 65% 35%,
           #0d3266 0%, #061b3a 40%, #030d1c 70%, #0c0a09 100%)`,
    image: "/services/realestate.png",
    videoSrc: "",       // 👈 Add your real estate sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    services: ["Luxury Property Showcases","Walkthrough Videos","Investment Campaigns","Builder Branding","Drone-Style AI Visuals","Before/After Interior"],
  },
  {
    id: "culinary",
    num: "03",
    label: "Culinary",
    title: "Restaurants & Cafés",
    tagline: "Every dish deserves a world premiere.",
    bg: `radial-gradient(ellipse 140% 130% at 50% 90%,
           #9c3d00 0%, #4d1e00 38%, #1c0a00 65%, #0c0a09 100%)`,
    image: "/services/culinary.png",
    videoSrc: "",       // 👈 Add your culinary sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    services: ["Food Commercials","Menu Launch Films","Festive Offers","Experience Reels","AI Food Photography","Brand Storytelling"],
  },
  {
    id: "beauty",
    num: "04",
    label: "Beauty",
    title: "Beauty & Wellness",
    tagline: "The glow that campaigns can't contain.",
    bg: `radial-gradient(ellipse 140% 120% at 40% 65%,
           #6b0a4a 0%, #360525 40%, #160210 70%, #0c0a09 100%)`,
    image: "/services/beauty.png",
    videoSrc: "",       // 👈 Add your beauty sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    services: ["Product Commercials","Skincare Routine Films","Influencer-Style Videos","Packaging Reveals","Brand Storytelling","Wellness Campaigns"],
  },
  {
    id: "automotive",
    num: "05",
    label: "Automotive",
    title: "Automotive",
    tagline: "Zero to launched in 60 seconds.",
    bg: `radial-gradient(ellipse 150% 140% at 55% 75%,
           #c44a00 0%, #7c2800 28%, #2d1000 55%, #0c0a09 85%)`,
    image: "/services/automotive.png",
    videoSrc: "",       // 👈 Add your automotive sector video URL here
    diveVideoSrc: "",
    diveVideos: [],
    services: ["Car Cinematic Ads","Bike Launch Films","Garage Promotions","Service Center Branding","Luxury Vehicle Showcases","Motorsport Content"],
  },
];

const TICKER_ITEMS = [
  "Fitness & Gyms","Hotels & Resorts","Healthcare","Interior Designers",
  "Jewelry","Education & EdTech","Finance","Travel & Tourism",
  "Tech & SaaS","Sports & Gaming","Music & Events","E-Commerce",
];

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
function PanelImage({ src, active }: { src: string; active: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
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

/* ══════════════════════════════════════════════════════════════ */
export default function SectorSection() {
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<Sector | null>(null);
  const [showDive,     setShowDive]     = useState(false);
  const [reelIndex,    setReelIndex]    = useState(0);
  const [activeTag,    setActiveTag]    = useState(0);
  const [hudCoords,    setHudCoords]    = useState({ x: "000.00", y: "000.00" });
  const [isVisible,    setIsVisible]    = useState(false);
  /* Where the dive visually launches from — the clicked card's center,
     captured as a viewport percentage so the zoom reads as plunging
     into that exact spot rather than an anonymous centered fade. */
  const [diveOrigin,   setDiveOrigin]   = useState({ x: 50, y: 50 });
  const [diveKey,      setDiveKey]      = useState(0);

  const sectionRef  = useRef<HTMLElement>(null);
  const tagTimer    = useRef<ReturnType<typeof setInterval> | null>(null);

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

  /* ── Tag cycling ── */
  useEffect(() => {
    if (!activeSector) return;
    setActiveTag(0);
    tagTimer.current = setInterval(
      () => setActiveTag(p => (p + 1) % activeSector.services.length),
      2000
    );
    return () => { if (tagTimer.current) clearInterval(tagTimer.current); };
  }, [activeSector]);

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
    if (tagTimer.current) clearInterval(tagTimer.current);
    setShowDive(false);
    setTimeout(() => setActiveSector(null), 900);
  }, []);

  const pw = (id: string) =>
    !hoveredId ? "20%" : hoveredId === id ? "60%" : "10%";
  const pf = (id: string) =>
    !hoveredId || hoveredId === id ? "none" : "grayscale(1) brightness(0.18) blur(1.5px)";
  const pt = (idx: number) =>
    [
      "width 0.82s cubic-bezier(0.23,1,0.32,1)",
      "filter 0.82s ease",
      "box-shadow 0.5s ease",
      `opacity 0.90s cubic-bezier(0.23,1,0.32,1) ${idx * 0.10}s`,
      `transform 0.90s cubic-bezier(0.23,1,0.32,1) ${idx * 0.10}s`,
    ].join(", ");

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

            {/* Vignette */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 18%, rgba(12,10,9,0.88) 100%)",
            }}/>

            {/* Content */}
            <div style={{
              position: "relative", zIndex: 20,
              height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "space-between",
              padding: "clamp(48px,8vh,96px) clamp(24px,5vw,80px)",
            }}>
              {/* Title */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  display: "block", marginBottom: "16px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700, textTransform: "uppercase",
                  fontSize: "11px", letterSpacing: "0.32em", color: "#f97316",
                  fontVariantNumeric: "tabular-nums",
                  animation: showDive ? "sectorFadeIn 0.7s ease forwards 0.7s" : "none",
                  opacity: showDive ? 0 : 1,
                }}>
                  Industry // {activeSector.num}
                </span>
                <h2 style={{
                  fontFamily: "var(--font-syne)", fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "clamp(26px, 3.8vw, 42px)",
                  letterSpacing: "-0.02em", lineHeight: 1.08,
                  color: "#fdf2f2", textWrap: "balance",
                  animation: showDive ? "sectorReveal 1.0s cubic-bezier(0.23,1,0.32,1) forwards 0.82s" : "none",
                  opacity: showDive ? 0 : 1,
                }}>
                  {activeSector.title}
                </h2>
                <p style={{
                  marginTop: "16px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "clamp(14px,1.2vw,17px)",
                  color: "rgba(255,255,255,0.62)", letterSpacing: "0.01em",
                  animation: showDive ? "sectorFadeIn 0.7s ease forwards 1.05s" : "none",
                  opacity: showDive ? 0 : 1,
                }}>
                  {activeSector.tagline}
                </p>
              </div>

              {/* Service tags */}
              <div style={{
                display: "flex", flexWrap: "wrap",
                justifyContent: "center", gap: "12px", maxWidth: "860px",
              }}>
                {activeSector.services.map((svc, i) => (
                  <span key={svc} style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700, textTransform: "uppercase",
                    fontSize: "11px", letterSpacing: "0.18em",
                    padding: "12px 24px", whiteSpace: "nowrap",
                    border: "1px solid",
                    borderColor: i === activeTag ? "#f97316" : "rgba(255,255,255,0.10)",
                    background: i === activeTag ? "#f97316" : "rgba(255,255,255,0.04)",
                    color: i === activeTag ? "#0c0a09" : "rgba(255,255,255,0.40)",
                    boxShadow: i === activeTag ? "0 0 18px rgba(249,115,22,0.55)" : "none",
                    transform: i === activeTag ? "scale(1.07)" : "scale(1)",
                    transition: "background 0.55s cubic-bezier(0.23,1,0.32,1), border-color 0.55s cubic-bezier(0.23,1,0.32,1), color 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s cubic-bezier(0.23,1,0.32,1), transform 0.55s cubic-bezier(0.23,1,0.32,1)",
                    animation: showDive ? `tagPop 0.6s cubic-bezier(0.23,1,0.32,1) forwards ${1.25 + i * 0.045}s` : "none",
                    opacity: showDive ? 0 : 1,
                  }}>
                    {svc}
                  </span>
                ))}
              </div>

              {/* SURFACE button */}
              <button
                onClick={surfaceBack}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "12px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700, textTransform: "uppercase",
                  fontSize: "11px", letterSpacing: "0.24em",
                  padding: "18px 40px",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  color: "#ffffff", cursor: "pointer",
                  opacity: showDive ? 1 : 0,
                  transform: showDive ? "translateY(0)" : "translateY(18px)",
                  transition: showDive
                    ? "background 0.45s cubic-bezier(0.23,1,0.32,1), border-color 0.45s cubic-bezier(0.23,1,0.32,1), color 0.45s cubic-bezier(0.23,1,0.32,1), opacity 0.7s cubic-bezier(0.23,1,0.32,1) 1.4s, transform 0.7s cubic-bezier(0.23,1,0.32,1) 1.4s"
                    : "background 0.45s cubic-bezier(0.23,1,0.32,1), border-color 0.45s cubic-bezier(0.23,1,0.32,1), color 0.45s cubic-bezier(0.23,1,0.32,1), opacity 0.35s ease, transform 0.35s ease",
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget;
                  t.style.background = "#f97316";
                  t.style.borderColor = "#f97316";
                  t.style.color = "#0c0a09";
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget;
                  t.style.background = "rgba(255,255,255,0.05)";
                  t.style.borderColor = "rgba(255,255,255,0.20)";
                  t.style.color = "#ffffff";
                }}
              >
                ← SURFACE
              </button>
            </div>

            {/* HUD corners — outer wrapper carries the one-time entrance
                fade, inner span carries the perpetual blink so the two
                opacity animations don't fight each other */}
            <div style={{
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
                color: "rgba(249,115,22,0.55)",
                display: "inline-block",
                animation: "hudBlink 2.5s ease-in-out infinite",
              }}>
                STATUS: IMMERSIVE_MODE_ACTIVE // SIGNAL_LOCKED
              </span>
            </div>
            <div style={{
              position: "absolute", bottom: "clamp(20px,4vh,40px)",
              right: "clamp(20px,4vw,64px)", zIndex: 20,
              fontFamily: "var(--font-space-grotesk)", fontSize: "10px",
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(249,115,22,0.55)",
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
          transform: showDive ? "scale(0.94)" : "scale(1)",
          filter: showDive ? "blur(8px) brightness(0.5)" : "blur(0) brightness(1)",
          transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1), filter 0.9s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* Noise texture */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.032,
        }}/>

        {/* ── Header ── */}
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

        {/* ── ACCORDION PANELS (desktop/tablet — hover-driven) ── */}
        <div
          className="hidden md:block md:px-14 lg:px-20"
          style={{
            position: "relative", zIndex: 10,
            maxWidth: "1440px", margin: "0 auto",
            height: "clamp(420px,52vh,620px)",
          }}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div style={{
            display: "flex", width: "100%", height: "100%", gap: "4px",
          }}>
            {SECTORS.map((sector, idx) => {
              const isHov = hoveredId === sector.id;
              return (
                <div
                  key={sector.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore ${sector.title}`}
                  onClick={e => initiateDive(sector, e.currentTarget)}
                  onKeyDown={e => e.key === "Enter" && initiateDive(sector, e.currentTarget)}
                  onMouseEnter={() => setHoveredId(sector.id)}
                  style={{
                    width: pw(sector.id),
                    height: "100%",
                    position: "relative", overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.065)",
                    background: "rgba(28,25,23,0.38)",
                    backdropFilter: "blur(20px)",
                    filter: pf(sector.id),
                    boxShadow: isHov ? "0 0 55px rgba(249,115,22,0.22)" : "none",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(64px)",
                    transition: pt(idx),
                    outline: "none",
                  }}
                >
                  {/* ── Panel background: video > image > gradient ── */}
                  {sector.videoSrc ? (
                    <PanelVideo src={sector.videoSrc} active={isHov} poster="" />
                  ) : sector.image ? (
                    <PanelImage src={sector.image} active={isHov} />
                  ) : (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: sector.bg,
                      opacity: isHov ? 1 : 0.42,
                      transform: isHov ? "scale(1.0)" : "scale(1.08)",
                      transition: "opacity 1s ease, transform 1s ease",
                    }}/>
                  )}

                  {/* Amber overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(249,115,22,0.14)",
                    mixBlendMode: "overlay",
                    opacity: isHov ? 0 : 1,
                    transition: "opacity 0.55s ease",
                  }}/>

                  {/* Scanlines */}
                  <div aria-hidden style={{
                    position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                    background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.28) 50%)",
                    backgroundSize: "100% 4px",
                    opacity: isHov ? 0.40 : 0.18,
                    transition: "opacity 0.5s ease",
                  }}/>

                  {/* Top amber line */}
                  <div aria-hidden style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                    zIndex: 6,
                    background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.70), transparent)",
                    opacity: isHov ? 1 : 0,
                    transition: "opacity 0.55s ease",
                  }}/>

                  {/* Shine sweep — a single bar of light crosses the panel
                      the moment it's hovered, "none" -> name always restarts
                      the keyframe even on repeat hovers */}
                  <div aria-hidden style={{
                    position: "absolute", inset: "-20% -10%",
                    zIndex: 4, pointerEvents: "none",
                    background: "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.45) 50%, transparent 58%)",
                    mixBlendMode: "overlay",
                    animation: isHov ? "shineSweep 0.9s cubic-bezier(0.16,1,0.3,1) 1" : "none",
                  }}/>

                  {/* Video badge pill (panel) */}
                  {sector.videoSrc && isHov && (
                    <div style={{
                      position: "absolute", top: "16px", right: "16px",
                      zIndex: 15, display: "flex", alignItems: "center", gap: "5px",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700, fontSize: "9px", letterSpacing: "0.2em",
                      textTransform: "uppercase", color: "#0c0a09",
                      background: "#f97316", padding: "4px 10px",
                      animation: "sectorFadeIn 0.4s ease",
                    }}>
                      ▶ HD
                    </div>
                  )}

                  {/* Vertical label */}
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: isHov ? 0 : 1, transition: "opacity 0.38s ease",
                    pointerEvents: "none",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-syne)", fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "clamp(11px,1.1vw,15px)", letterSpacing: "0.30em",
                      color: "rgba(255,255,255,0.24)",
                      writingMode: "vertical-rl", textOrientation: "mixed",
                    }}>
                      {sector.label}
                    </span>
                  </div>

                  {/* Expanded overlay */}
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    display: "flex", flexDirection: "column",
                    justifyContent: "flex-end", padding: "28px",
                    opacity: isHov ? 1 : 0,
                    transform: isHov ? "translateY(0)" : "translateY(22px)",
                    transition: "opacity 0.6s cubic-bezier(0.23,1,0.32,1) 0.08s, transform 0.6s cubic-bezier(0.23,1,0.32,1) 0.08s",
                  }}>
                    <div style={{
                      background: "rgba(0,0,0,0.82)",
                      backdropFilter: "blur(28px)",
                      borderTop: "2px solid #f97316",
                      padding: "24px 24px 20px",
                      boxShadow: "0 0 44px rgba(249,115,22,0.22)",
                    }}>
                      <span style={{
                        display: "block", marginBottom: "6px",
                        fontFamily: "var(--font-space-grotesk)",
                        fontWeight: 500, fontSize: "11px",
                        letterSpacing: "0.06em", color: "#f59e0b",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        INDUSTRY // {sector.num}
                      </span>
                      <h3 style={{
                        fontFamily: "var(--font-syne)", fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "clamp(16px,1.8vw,22px)",
                        letterSpacing: "-0.01em", lineHeight: 1.15,
                        color: "#fdf2f2", marginBottom: "10px",
                      }}>
                        {sector.title}
                      </h3>
                      <p style={{
                        fontFamily: "var(--font-space-grotesk)",
                        fontSize: "12px", lineHeight: 1.55,
                        color: "rgba(255,255,255,0.60)", marginBottom: "16px",
                      }}>
                        {sector.tagline}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); initiateDive(sector, e.currentTarget); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "8px",
                          fontFamily: "var(--font-space-grotesk)",
                          fontWeight: 700, textTransform: "uppercase",
                          fontSize: "10px", letterSpacing: "0.18em",
                          padding: "10px 20px",
                          border: "1px solid rgba(249,115,22,0.38)",
                          color: "#f97316", background: "transparent",
                          cursor: "pointer", transition: "all 0.32s ease",
                        }}
                        onMouseEnter={e => {
                          const t = e.currentTarget;
                          t.style.background = "#f97316";
                          t.style.color = "#0c0a09";
                          t.style.borderColor = "#f97316";
                        }}
                        onMouseLeave={e => {
                          const t = e.currentTarget;
                          t.style.background = "transparent";
                          t.style.color = "#f97316";
                          t.style.borderColor = "rgba(249,115,22,0.38)";
                        }}
                      >
                        {sector.diveVideoSrc || sector.videoSrc ? "▶ WATCH & DIVE" : "DIVE IN →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
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
