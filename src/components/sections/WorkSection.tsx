"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   WORK — "Selected Work" project gallery
   Each card is video-first: the clip's own first frame is the resting
   thumbnail (grayscale), and it plays in color on hover. No separate
   poster image needed — the thumbnail always matches the video.

   👉 TO ADD / CHANGE A PROJECT:
      1. Put the file at  public/videos/my-project.mp4  (or .webm / .gif)
      2. Set  media: "/videos/my-project.mp4"  on that project below,
         and edit its `title` / `client` / `category`.
      3. (optional) set `poster` to a still (e.g. "/videos/my-project.jpg")
         — only needed as a fallback for browsers that don't paint a
         paused video's first frame, or for reduced-motion users.

   FORMAT — `media` accepts either:
      • .mp4 / .webm  ← RECOMMENDED. A muted, looping video IS the
        modern GIF: autoplays silently on hover, stays a few MB, keeps
        full color, and gets sound + controls in the lightbox.
      • .gif / .webp / .apng  ← supported, but heavy + 256-color.
══════════════════════════════════════════════════════════════ */

/** True for sources a <video> can play; false for animated images (gif/webp/apng). */
const isVideoSrc = (src: string) => /\.(mp4|webm|mov|m4v|ogg)$/i.test(src);

interface Project {
  id: string;
  /** Editorial index shown on the card — purely cosmetic. */
  num: string;
  title: string;
  /** Client / brand line. */
  client: string;
  /** Short category tag shown as a chip. */
  category: string;
  /** Optional still fallback. Empty = use the video's own first frame. */
  poster: string;
  /** object-position for the poster/video (wide clips cropped into cards). */
  posterPos: string;
  /** 👈 Clip. ".mp4"/".webm" (recommended) or ".gif"/".webp". */
  media: string;
}

/* Order matches the real footage: Gym → Residence → Yarn/Taka → Anime.
   Titles/categories are editable placeholders — rename freely. */
const PROJECTS: Project[] = [
  {
    id: "gym",
    num: "01",
    title: "Peak Form",
    client: "Gym Brand Film",
    category: "Fitness",
    poster: "",
    posterPos: "center",
    media: "/videos/gymVideo.mp4",
  },
  {
    id: "residence",
    num: "02",
    title: "Skyline Residences",
    client: "Property Launch Reel",
    category: "Real Estate",
    poster: "",
    posterPos: "center",
    media: "/videos/skyLineRecidence.mp4",
  },
  {
    id: "taka",
    num: "03",
    title: "Taka",
    client: "Yarn & Textile Film",
    category: "Textile",
    poster: "",
    posterPos: "center",
    media: "/videos/dhagaVideo.mp4",
  },
  {
    id: "animae",
    num: "04",
    title: "Animae",
    client: "Character Animation",
    category: "Animation",
    poster: "",
    posterPos: "center",
    media: "/videos/animae.mp4",
  },
];

/* ─── Hover media. For VIDEO: the element stays visible showing its first
   frame at rest (grayscale), and plays in full color on hover. For an
   animated IMAGE (gif/webp): it mounts only while active so it starts
   from frame 0 on hover rather than looping in the background. ─── */
function MediaPreview({ src, active, posterPos }: { src: string; active: boolean; posterPos: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = isVideoSrc(src);

  useEffect(() => {
    const v = videoRef.current;
    if (!isVideo || !v) return;
    if (active) {
      v.play().catch(() => {});
    } else {
      v.pause();
      /* Snap back to a first frame so the resting thumbnail is the clip
         itself, not a black box, and so the next hover starts clean. */
      try { v.currentTime = 0.05; } catch { /* not seekable yet */ }
    }
  }, [active, isVideo]);

  if (!src) return null;

  /* Animated image (GIF / animated WebP / APNG) */
  if (!isVideo) {
    return active ? (
      <img
        src={src}
        alt=""
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          objectPosition: posterPos,
          zIndex: 1,
        }}
      />
    ) : null;
  }

  /* Muted looping video — visible at rest (first frame), color on hover */
  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      /* Nudge the browser to decode & paint a frame while paused, so the
         resting card shows the clip instead of black (esp. Safari). */
      onLoadedMetadata={(e) => { if (!active) { try { e.currentTarget.currentTime = 0.05; } catch {} } }}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%", objectFit: "cover",
        objectPosition: posterPos,
        filter: active ? "grayscale(0) brightness(1.02) saturate(1.08)" : "grayscale(1) brightness(0.55)",
        transform: active ? "scale(1.04)" : "scale(1)",
        transition: "filter 0.7s ease, transform 1.1s cubic-bezier(0.23,1,0.32,1)",
        zIndex: 1,
      }}
    />
  );
}

function PlayGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

/* ─── One project card — owns its own hover state so only the hovered
   card's preview plays. Rendered as a <button> for keyboard access. ─── */
function WorkCard({
  project, index, visible, reduced, onOpen,
}: {
  project: Project;
  index: number;
  visible: boolean;
  reduced: boolean;
  onOpen: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !reduced;

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`Play ${project.title} — ${project.client}`}
      style={{
        display: "block", textAlign: "left", padding: 0, cursor: "pointer",
        background: "transparent", border: "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s cubic-bezier(0.23,1,0.32,1) ${index * 90}ms, transform 0.8s cubic-bezier(0.23,1,0.32,1) ${index * 90}ms`,
      }}
    >
      {/* Media frame */}
      <div
        style={{
          position: "relative", width: "100%", aspectRatio: "16 / 10",
          borderRadius: "14px", overflow: "hidden", background: "#0a0a12",
          border: active ? "1px solid rgba(249,115,22,0.55)" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: active ? "0 22px 60px -20px rgba(249,115,22,0.35)" : "0 10px 30px -18px rgba(0,0,0,0.8)",
          transform: active ? "translateY(-6px)" : "translateY(0)",
          transition: "border-color 0.5s ease, box-shadow 0.5s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* Optional poster still underlay — only when a `poster` is set
            (the video's own first frame covers this once decoded). */}
        {project.poster && (
          <img
            src={project.poster}
            alt=""
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: project.posterPos,
              filter: active ? "grayscale(0) brightness(1.02) saturate(1.08)" : "grayscale(1) brightness(0.55)",
              transform: active ? "scale(1.04)" : "scale(1)",
              transition: "filter 0.7s ease, transform 1.1s cubic-bezier(0.23,1,0.32,1)",
              zIndex: 0,
            }}
          />
        )}

        {/* Hover preview (video shows its first frame at rest; gif on hover) */}
        <MediaPreview src={project.media} active={active} posterPos={project.posterPos} />

        {/* Legibility scrim for the overlaid text */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(4,4,10,0.82) 0%, rgba(4,4,10,0.10) 46%, rgba(4,4,10,0.28) 100%)",
        }} />

        {/* Category chip — top-left */}
        <span style={{
          position: "absolute", top: "14px", left: "14px", zIndex: 3,
          fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
          fontSize: "9.5px", letterSpacing: "0.16em", textTransform: "uppercase",
          color: "#fdf2f2",
          padding: "6px 10px", borderRadius: "999px",
          background: "rgba(4,4,10,0.55)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          {project.category}
        </span>

        {/* Play badge — top-right, lights up on hover */}
        <span style={{
          position: "absolute", top: "12px", right: "12px", zIndex: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "40px", height: "40px", borderRadius: "50%",
          color: active ? "#04040a" : "#fdf2f2",
          background: active ? "#f97316" : "rgba(4,4,10,0.5)",
          border: active ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(6px)",
          transform: active ? "scale(1.08)" : "scale(1)",
          transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        }}>
          <PlayGlyph />
        </span>

        {/* Title block — bottom-left */}
        <div style={{ position: "absolute", left: "16px", right: "16px", bottom: "14px", zIndex: 3 }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: "10px",
          }}>
            <span style={{
              fontFamily: "var(--font-syne)", fontWeight: 800,
              fontSize: "12px", color: "#f97316",
              fontVariantNumeric: "tabular-nums",
            }}>
              {project.num}
            </span>
            <h3 style={{
              fontFamily: "var(--font-syne)", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "-0.01em",
              fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.05, color: "#fdf2f2",
            }}>
              {project.title}
            </h3>
          </div>
          <p style={{
            marginTop: "4px", paddingLeft: "22px",
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "12px", color: "rgba(255,255,255,0.62)",
          }}>
            {project.client}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function WorkSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [openProject, setOpenProject] = useState<Project | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const open = useCallback((p: Project) => setOpenProject(p), []);
  const close = useCallback(() => setOpenProject(null), []);

  /* Lock body scroll + wire Esc-to-close while the lightbox is open, and
     move focus to the close button so keyboard users land inside it. */
  useEffect(() => {
    if (!openProject) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openProject, close]);

  const openIsVideo = openProject ? isVideoSrc(openProject.media) : false;

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative"
      style={{
        background: "#04040a", overflow: "hidden",
        paddingTop: "clamp(96px,12vh,140px)", paddingBottom: "clamp(96px,12vh,140px)",
        scrollMarginTop: "64px",
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }} className="px-5 sm:px-8 md:px-14 lg:px-20">

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          gap: "24px", flexWrap: "wrap",
          marginBottom: "clamp(40px,5vh,64px)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1)",
        }}>
          <div style={{ maxWidth: "680px" }}>
            <span style={{
              display: "block", marginBottom: "16px",
              fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
              textTransform: "uppercase", fontSize: "10px",
              letterSpacing: "0.30em", color: "#f59e0b",
            }}>
              Selected Work
            </span>
            <h2 style={{
              fontFamily: "var(--font-syne)", fontWeight: 700,
              textTransform: "uppercase", fontSize: "clamp(30px,4vw,54px)",
              letterSpacing: "-0.02em", lineHeight: 1.04, color: "#fdf2f2",
              textWrap: "balance",
            }}>
              The work that{" "}
              <span style={{ color: "var(--amber-deep)", fontStyle: "italic", fontWeight: 900 }}>
                moves
              </span>
            </h2>
          </div>
          <p style={{
            maxWidth: "360px", paddingBottom: "6px",
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "clamp(14px,1.05vw,16px)", lineHeight: 1.65,
            color: "rgba(255,255,255,0.62)",
          }}>
            A reel of recent films, launches and campaigns. Hover to preview — click any project to watch it full-screen.
          </p>
        </div>

        {/* ── Grid — 2×2 on tablet/desktop, single column on mobile ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{ gap: "clamp(18px,2.2vw,28px)" }}
        >
          {PROJECTS.map((p, i) => (
            <WorkCard
              key={p.id}
              project={p}
              index={i}
              visible={isVisible}
              reduced={reduced}
              onOpen={open}
            />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          LIGHTBOX — full player with sound
      ════════════════════════════════════════════════════ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={openProject ? `${openProject.title} — ${openProject.client}` : undefined}
        onClick={close}
        style={{
          position: "fixed", inset: 0, zIndex: 110,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "clamp(16px,4vw,56px)",
          background: "rgba(2,2,6,0.92)", backdropFilter: "blur(12px)",
          opacity: openProject ? 1 : 0,
          pointerEvents: openProject ? "auto" : "none",
          transition: "opacity 0.4s ease",
        }}
      >
        {openProject && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "1100px",
              transform: openProject ? "scale(1)" : "scale(0.96)",
              transition: reduced ? "none" : "transform 0.45s cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            {/* Caption row */}
            <div style={{
              display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              gap: "16px", marginBottom: "14px", flexWrap: "wrap",
            }}>
              <div>
                <span style={{
                  display: "block", marginBottom: "6px",
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
                  fontSize: "10px", letterSpacing: "0.20em", textTransform: "uppercase",
                  color: "#f97316",
                }}>
                  {openProject.category}
                </span>
                <h3 style={{
                  fontFamily: "var(--font-syne)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "-0.01em",
                  fontSize: "clamp(20px,2.4vw,32px)", lineHeight: 1.05, color: "#fdf2f2",
                }}>
                  {openProject.title}
                </h3>
                <p style={{
                  marginTop: "4px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "13px", color: "rgba(255,255,255,0.6)",
                }}>
                  {openProject.client}
                </p>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                aria-label="Close video"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
                  fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  padding: "10px 16px", borderRadius: "999px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  cursor: "pointer",
                }}
              >
                Close ✕
              </button>
            </div>

            {/* Player frame */}
            <div style={{
              position: "relative", width: "100%", aspectRatio: "16 / 9",
              borderRadius: "16px", overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#000",
            }}>
              {openProject.media ? (
                openIsVideo ? (
                  <video
                    key={openProject.id}
                    src={openProject.media}
                    poster={openProject.poster || undefined}
                    controls
                    autoPlay={!reduced}
                    playsInline
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  />
                ) : (
                  /* Animated image (gif/webp) — no controls/sound possible */
                  <img
                    key={openProject.id}
                    src={openProject.media}
                    alt={openProject.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  />
                )
              ) : (
                /* No clip yet — poster + a clear stand-in note. */
                <>
                  {openProject.poster && (
                    <img
                      src={openProject.poster}
                      alt={openProject.title}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
                    />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: "12px", textAlign: "center", padding: "24px",
                  }}>
                    <span style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "56px", height: "56px", borderRadius: "50%",
                      background: "rgba(249,115,22,0.16)", border: "1px solid rgba(249,115,22,0.5)",
                      color: "#f97316",
                    }}>
                      <PlayGlyph size={22} />
                    </span>
                    <p style={{
                      fontFamily: "var(--font-space-grotesk)", fontSize: "13px",
                      color: "rgba(255,255,255,0.7)", maxWidth: "34ch", lineHeight: 1.5,
                    }}>
                      Video coming soon — drop <code style={{ color: "#f97316" }}>/videos/{openProject.id}.mp4</code> in and it plays here.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
