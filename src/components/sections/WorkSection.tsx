"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, Plus, Volume2, VolumeX } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   WORK — "Selected Work" 3D rotating gallery
   Desktop: a perspective carousel (drag or auto-rotate to spin) where
   every visible card's clip plays continuously, muted, as its own
   live preview — not gated by hover, since in a rotating carousel
   every card takes its turn facing the viewer. Click any card to
   open it full-screen with sound in the lightbox.
   Mobile: the same continuously-playing cards in a horizontal
   snap-scroll strip (a 3D perspective carousel doesn't suit touch
   drag well at small sizes / lower-power devices).
   prefers-reduced-motion: a static, non-autoplaying row — no spin,
   no autoplay, first frame only, still fully clickable.

   👉 TO ADD / CHANGE A PROJECT:
      1. Put the file at  public/videos/my-project.mp4  (or .webm / .gif)
      2. Set  media: "/videos/my-project.mp4"  on that project below,
         and edit its `title` / `client` / `category`.
      3. (optional) set `poster` to a still (e.g. "/videos/my-project.jpg")
         — only needed as a fallback for browsers that don't paint a
         paused video's first frame, or for reduced-motion users.

   FORMAT — `media` accepts either:
      • .mp4 / .webm  ← RECOMMENDED. A muted, looping video IS the
        modern GIF: autoplays silently, stays a few MB, keeps full
        color, and gets sound + controls in the lightbox.
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

/* ─── Always-on preview clip. Unlike a hover-gated preview, `playing`
   here just means "not reduced-motion" — every card plays continuously
   as it rotates through, which is the whole point of the carousel. ─── */
function LoopingClip({ src, playing, posterPos }: { src: string; playing: boolean; posterPos: string }) {
  const videoRef = useRef < HTMLVideoElement > (null);
  const isVideo = isVideoSrc(src);

  useEffect(() => {
    const v = videoRef.current;
    if (!isVideo || !v) return;
    if (playing) {
      v.play().catch(() => { });
    } else {
      v.pause();
      try { v.currentTime = 0.05; } catch { /* not seekable yet */ }
    }
  }, [playing, isVideo]);

  if (!src) return null;

  if (!isVideo) {
    return playing ? (
      <img
        src={src} alt="" aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: posterPos, zIndex: 1 }}
      />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) => { if (!playing) { try { e.currentTarget.currentTime = 0.05; } catch { } } }}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%", objectFit: "cover",
        objectPosition: posterPos,
        filter: playing ? "grayscale(0) brightness(1.0) saturate(1.05)" : "grayscale(1) brightness(0.55)",
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

/* ─── The visual face shared by every layout (3D card, mobile strip,
   reduced-motion row) — chip, always-playing clip, play badge, title. ─── */
function ProjectFace({
  project, playing, hovered, onOpen,
}: {
  project: Project;
  playing: boolean;
  hovered: boolean;
  onOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play ${project.title} — ${project.client}`}
      style={{
        display: "block", width: "100%", height: "100%", padding: 0, cursor: "pointer",
        background: "transparent", border: "none", textAlign: "left",
      }}
    >
      <div
        style={{
          position: "relative", width: "100%", height: "100%",
          borderRadius: "14px", overflow: "hidden", background: "#0a0a12",
          border: hovered ? "1px solid rgba(249,115,22,0.65)" : "1px solid rgba(255,255,255,0.10)",
          boxShadow: hovered ? "0 24px 60px -18px rgba(249,115,22,0.40)" : "0 14px 40px -22px rgba(0,0,0,0.85)",
          transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        {project.poster && (
          <img
            src={project.poster} alt="" aria-hidden
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              objectPosition: project.posterPos,
              filter: playing ? "grayscale(0)" : "grayscale(1) brightness(0.55)",
              zIndex: 0,
            }}
          />
        )}

        <LoopingClip src={project.media} playing={playing} posterPos={project.posterPos} />

        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(4,4,10,0.86) 0%, rgba(4,4,10,0.08) 46%, rgba(4,4,10,0.30) 100%)",
        }} />

        <span style={{
          position: "absolute", top: "12px", left: "12px", zIndex: 3,
          fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
          fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase",
          color: "#fdf2f2",
          padding: "5px 9px", borderRadius: "999px",
          background: "rgba(4,4,10,0.55)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          {project.category}
        </span>

        <span style={{
          position: "absolute", top: "10px", right: "10px", zIndex: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "34px", height: "34px", borderRadius: "50%",
          color: hovered ? "#04040a" : "#fdf2f2",
          background: hovered ? "#f97316" : "rgba(4,4,10,0.5)",
          border: hovered ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(6px)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
        }}>
          <PlayGlyph size={13} />
        </span>

        <div style={{ position: "absolute", left: "14px", right: "14px", bottom: "12px", zIndex: 3 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{
              fontFamily: "var(--font-syne)", fontWeight: 800,
              fontSize: "11px", color: "#f97316", fontVariantNumeric: "tabular-nums",
            }}>
              {project.num}
            </span>
            <h3 style={{
              fontFamily: "var(--font-syne)", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "-0.01em",
              fontSize: "clamp(14px,1.3vw,17px)", lineHeight: 1.05, color: "#fdf2f2",
            }}>
              {project.title}
            </h3>
          </div>
          <p style={{
            marginTop: "3px", paddingLeft: "19px",
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "11px", color: "rgba(255,255,255,0.62)",
          }}>
            {project.client}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── Desktop 3D carousel — drag or wait to spin, every card's clip
   plays continuously as it rotates. Rotation is NOT tied to page
   scroll (Services already owns a scroll-jack elsewhere on this page;
   a second one tied to whole-document scroll would fight it and lose
   all meaning once the visitor scrolls past this section anyway).
   Portrait cards, radius tuned tight relative to card width so
   neighbours stay close instead of leaving a dead gap between them. ─── */
const CARD_W = 320;
const CARD_H = 440;
const RADIUS = 400;
const AUTO_SPEED = 9;     // deg/sec cruise speed
const VELOCITY_EASE = 1.6; // how fast a flick's momentum settles back to cruise

function Carousel3D({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project, originEl?: HTMLElement) => void }) {
  const [rotation, setRotation] = useState(0);
  const [hoveredId, setHoveredId] = useState < string | null > (null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(AUTO_SPEED);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const rafRef = useRef(0);
  /* Continuous auto-rotation means a card is a moving target: by the time
     a real pointer travels to it and clicks, it may have rotated out from
     under the cursor (getBoundingClientRect at click time no longer
     matches where the user aimed) — synthetic .click() calls in testing
     don't hit-test position so they mask this, but real mouse/touch
     clicks miss. Freezing rotation on hover (and resuming on leave) gives
     the pointer a stationary target, same pattern used by virtually every
     auto-rotating carousel. */
  const hoveringRef = useRef(false);

  /* Physics-based spin: dragging tracks the pointer 1:1 in real time and
     records its instantaneous velocity; on release that velocity carries
     on as momentum and eases smoothly back to the auto-rotate cruise
     speed (not to zero, not an abrupt jump) — a flick keeps spinning and
     gently settles, rather than stopping dead the instant you let go. */
  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      if (!draggingRef.current && !hoveringRef.current) {
        velocityRef.current += (AUTO_SPEED - velocityRef.current) * Math.min(dt * VELOCITY_EASE, 1);
        rotationRef.current += velocityRef.current * dt;
        setRotation(rotationRef.current);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* setPointerCapture redirects the eventual "click" to the captor too
     (not just pointermove/up), so capturing on every pointerdown — even a
     plain click with no movement — silently ate every card's onClick.
     Deferring capture until the pointer has actually moved past a small
     threshold means a real click never captures at all, while a genuine
     drag still gets full out-of-bounds tracking once it's underway. */
  const capturedRef = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    capturedRef.current = false;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    if (!capturedRef.current) {
      capturedRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    const now = performance.now();
    const dt = Math.max((now - lastTRef.current) / 1000, 0.001);
    const dx = e.clientX - lastXRef.current;
    const dAngle = -dx * 0.4;
    rotationRef.current += dAngle;
    setRotation(rotationRef.current);
    velocityRef.current = Math.max(-260, Math.min(260, dAngle / dt));
    lastXRef.current = e.clientX;
    lastTRef.current = now;
  }, []);
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    if (capturedRef.current) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      capturedRef.current = false;
    }
  }, []);

  const angleStep = 360 / projects.length;

  return (
    <div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseEnter={() => { hoveringRef.current = true; }}
        onMouseLeave={() => { hoveringRef.current = false; }}
        style={{
          position: "relative", width: "100%",
          height: `${CARD_H + 140}px`,
          perspective: "1700px",
          cursor: draggingRef.current ? "grabbing" : "grab",
          touchAction: "pan-y",
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {projects.map((p, i) => {
            const itemAngle = i * angleStep;
            const rel = ((itemAngle + rotation) % 360 + 360) % 360;
            const norm = rel > 180 ? 360 - rel : rel;
            const facing = 1 - norm / 180; // 1 = dead center-front, 0 = directly behind
            const opacity = Math.max(0.35, facing);
            const scale = (0.82 + 0.18 * facing) * (hoveredId === p.id ? 1.04 : 1);
            const isHovered = hoveredId === p.id;

            return (
              <div
                key={p.id}
                role="group"
                aria-label={p.title}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId((h) => (h === p.id ? null : h))}
                style={{
                  position: "absolute",
                  width: `${CARD_W}px`, height: `${CARD_H}px`,
                  left: "50%", top: "70px",
                  marginLeft: `-${CARD_W / 2}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(${RADIUS}px) scale(${scale})`,
                  opacity,
                  zIndex: Math.round(facing * 100),
                  transition: "opacity 0.3s linear",
                }}
              >
                <ProjectFace project={p} playing={true} hovered={isHovered} onOpen={(e) => onOpen(p, e.currentTarget)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile: horizontal snap strip, same always-playing cards ─── */
function MobileStrip({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project, originEl?: HTMLElement) => void }) {
  return (
    <div
      className="flex"
      style={{
        gap: "14px", overflowX: "auto", scrollSnapType: "x mandatory",
        paddingBottom: "8px", WebkitOverflowScrolling: "touch",
      }}
    >
      {projects.map((p) => (
        <div
          key={p.id}
          style={{ flex: "0 0 78%", scrollSnapAlign: "start", aspectRatio: "16 / 10" }}
        >
          <ProjectFace project={p} playing={true} hovered={false} onOpen={(e) => onOpen(p, e.currentTarget)} />
        </div>
      ))}
    </div>
  );
}

/* ─── prefers-reduced-motion: static, no autoplay, no spin ─── */
function StaticRow({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project, originEl?: HTMLElement) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "18px" }}>
      {projects.map((p) => (
        <div key={p.id} style={{ aspectRatio: "16 / 10" }}>
          <ProjectFace project={p} playing={false} hovered={false} onOpen={(e) => onOpen(p, e.currentTarget)} />
        </div>
      ))}
    </div>
  );
}

const scrubberBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "32px", height: "32px", flexShrink: 0,
  background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 0,
};

/* ─── Lightbox player — plain <video> + a hand-built control bar wired
   directly to the element via native play/pause/timeupdate/volumechange
   events. (media-chrome's web components were tried first: fully wired
   — clicks correctly reached the underlying video — but the controller
   never reflected state back onto the buttons, so icons never appeared.
   A ref + native events sidesteps that class of bug entirely.) The bar
   uses mix-blend-mode: exclusion so it reads against any footage
   underneath without its own background chrome. ─── */
function LightboxVideoPlayer({ project, reduced }: { project: Project; reduced: boolean }) {
  const videoRef = useRef < HTMLVideoElement > (null);
  const barRef = useRef < HTMLDivElement > (null);
  const [playing, setPlaying] = useState(!reduced);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolume = () => setMuted(v.muted || v.volume === 0);
    const onTime = () => { if (v.duration) setProgress(v.currentTime / v.duration); };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVolume);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVolume);
      v.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => { }); else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, []);

  const seek = useCallback((clientX: number) => {
    const v = videoRef.current;
    const bar = barRef.current;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        key={project.id}
        src={project.media}
        poster={project.poster || undefined}
        autoPlay={!reduced}
        playsInline
        onClick={togglePlay}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", cursor: "pointer" }}
      />

      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
          display: "flex", alignItems: "center", gap: "14px",
          padding: "14px 16px",
          mixBlendMode: "exclusion", color: "#fff",
        }}
      >
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} style={scrubberBtnStyle}>
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>

        <div
          ref={barRef}
          onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); seek(e.clientX); }}
          onPointerMove={(e) => { if (e.buttons === 1) seek(e.clientX); }}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          style={{ position: "relative", flex: 1, height: "18px", display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <div aria-hidden style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.35)", borderRadius: "999px" }} />
          <div aria-hidden style={{ position: "absolute", left: 0, width: `${progress * 100}%`, height: "2px", background: "#fff", borderRadius: "999px" }} />
          <div aria-hidden style={{
            position: "absolute", left: `${progress * 100}%`,
            width: "9px", height: "9px", marginLeft: "-4.5px", borderRadius: "50%", background: "#fff",
          }} />
        </div>

        <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} style={scrubberBtnStyle}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function WorkSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [openProject, setOpenProject] = useState < Project | null > (null);
  /* clip-path the reveal animates FROM — computed from whichever card was
     actually clicked, so the lightbox feels like it grows out of that
     specific card regardless of where it sits in the carousel, rather
     than always unfolding from a fixed spot on screen. */
  const [clipOrigin, setClipOrigin] = useState("inset(38% 38% 38% 38%)");

  const sectionRef = useRef < HTMLElement > (null);
  const closeBtnRef = useRef < HTMLButtonElement > (null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    /* Conditionally RENDER (not just CSS-hide) the desktop vs. mobile
       layout — both mount the same 4 videos, so CSS-hiding one set
       still leaves it decoding/playing off-screen, doubling video
       decode load for no visible benefit. */
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => { io.disconnect(); mq.removeEventListener("change", onChange); };
  }, []);

  const open = useCallback((p: Project, originEl?: HTMLElement) => {
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      const top = Math.max(0, (r.top / window.innerHeight) * 100);
      const bottom = Math.max(0, 100 - (r.bottom / window.innerHeight) * 100);
      const left = Math.max(0, (r.left / window.innerWidth) * 100);
      const right = Math.max(0, 100 - (r.right / window.innerWidth) * 100);
      setClipOrigin(`inset(${top}% ${right}% ${bottom}% ${left}%)`);
    }
    setOpenProject(p);
  }, []);
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
              textTransform: "uppercase", fontSize: "clamp(38px,5vw,72px)",
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
            {reduced
              ? "A reel of recent films, launches and campaigns. Click any project to watch it full-screen."
              : "A reel of recent films, launches and campaigns, playing on a loop. Drag to spin — click any project to watch it full-screen."}
          </p>
        </div>

        {/* ── Gallery ── */}
        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1) 0.1s, transform 0.9s cubic-bezier(0.23,1,0.32,1) 0.1s",
        }}>
          {reduced ? (
            <StaticRow projects={PROJECTS} onOpen={open} />
          ) : isDesktop ? (
            <Carousel3D projects={PROJECTS} onOpen={open} />
          ) : (
            <MobileStrip projects={PROJECTS} onOpen={open} />
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          LIGHTBOX — media-chrome player, spring clip-path reveal
          growing out of whichever card was actually clicked.
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {openProject && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${openProject.title} — ${openProject.client}`}
            style={{ position: "fixed", inset: 0, zIndex: 110 }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
              style={{ position: "absolute", inset: 0, background: "rgba(2,2,6,0.92)", backdropFilter: "blur(16px)" }}
            />

            <div style={{
              position: "relative", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "clamp(16px,4vw,56px)",
            }}>
              {/* Reveal — clips open from the clicked card's exact screen
                  position, not a generic centered fade */}
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={reduced ? false : { clipPath: clipOrigin, opacity: 0 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
                exit={reduced ? { opacity: 0 } : {
                  clipPath: clipOrigin, opacity: 0,
                  transition: { duration: 0.7, type: "spring", stiffness: 120, damping: 22, opacity: { duration: 0.2, delay: 0.35 } },
                }}
                transition={{ duration: 0.9, type: "spring", stiffness: 120, damping: 22 }}
                style={{ width: "100%", maxWidth: "1100px" }}
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
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "38px", height: "38px", borderRadius: "999px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: "rgba(255,255,255,0.85)", cursor: "pointer",
                    }}
                  >
                    <Plus size={17} style={{ transform: "rotate(45deg)" }} />
                  </button>
                </div>

                {/* Player frame */}
                <div style={{
                  position: "relative", width: "100%", aspectRatio: "16 / 9",
                  borderRadius: "16px", overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#000",
                }}>
                  {openProject.media && openIsVideo ? (
                    <LightboxVideoPlayer project={openProject} reduced={reduced} />
                  ) : openProject.media ? (
                    /* Animated image (gif/webp) — no controls/sound possible */
                    <img
                      key={openProject.id}
                      src={openProject.media}
                      alt={openProject.title}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                    />
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
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
