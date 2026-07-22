"use client";

import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   ABOUT — who FOURWARD is
   Copy is drawn from PRODUCT.md's stated brand (bold / kinetic /
   "always moving, always ahead", a 4-person creative agency) — no
   invented metrics or fabricated bios.

   👉 TO ADD THE REAL TEAM:
      Replace each member's `name` / `role` below, and (optional) drop
      a square headshot at  public/team/<id>.jpg  and set `photo` to
      "/team/<id>.jpg". Until a photo is set, a monogram tile shows.
      The four cards are intentionally placeholders — swap in the real
      four people.
══════════════════════════════════════════════════════════════ */

interface Member {
  id: string;
  name: string;
  role: string;
  /** 👈 "/team/<id>.jpg" — leave "" to show the initials monogram. */
  photo: string;
}

const TEAM: Member[] = [
  { id: "member-1", name: "Add Name", role: "Creative Director", photo: "" },
  { id: "member-2", name: "Add Name", role: "Design Lead",       photo: "" },
  { id: "member-3", name: "Add Name", role: "Motion & 3D",       photo: "" },
  { id: "member-4", name: "Add Name", role: "Strategy & Growth",  photo: "" },
];

/* Honest positioning statements — not falsifiable vanity numbers.
   Team size (4) is real; the rest are stance, not metrics. */
const PILLARS: { k: string; v: string }[] = [
  { k: "01", v: "One accent, total commitment — restraint that reads as confidence." },
  { k: "02", v: "Weight is hierarchy — we lead with type, motion and space, not clutter." },
  { k: "03", v: "Every element earns its place, or it gets cut." },
];

function monogram(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length || parts[0] === "Add") return "FW";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function TeamCard({ m, index, visible }: { m: Member; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(0.23,1,0.32,1) ${index * 80 + 120}ms, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${index * 80 + 120}ms`,
      }}
    >
      {/* Portrait tile — photo if present, else a monogram on tinted glass */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: "1 / 1",
        borderRadius: "14px", overflow: "hidden",
        border: hovered ? "1px solid rgba(249,115,22,0.5)" : "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(160deg, rgba(249,115,22,0.10), rgba(4,4,10,0.4))",
        transition: "border-color 0.4s ease, transform 0.4s cubic-bezier(0.23,1,0.32,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {m.photo ? (
          <img
            src={m.photo}
            alt={m.name}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
              filter: hovered ? "grayscale(0)" : "grayscale(1) brightness(0.85)",
              transition: "filter 0.5s ease",
            }}
          />
        ) : (
          <span style={{
            fontFamily: "var(--font-syne)", fontWeight: 800,
            fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.02em",
            color: hovered ? "#f97316" : "rgba(255,255,255,0.28)",
            transition: "color 0.4s ease",
          }}>
            {monogram(m.name)}
          </span>
        )}
      </div>
      <div style={{ marginTop: "14px" }}>
        <div style={{
          fontFamily: "var(--font-syne)", fontWeight: 700,
          fontSize: "16px", color: "#fdf2f2", letterSpacing: "-0.01em",
        }}>
          {m.name}
        </div>
        <div style={{
          marginTop: "3px",
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "12px", letterSpacing: "0.04em",
          color: "rgba(255,255,255,0.5)",
        }}>
          {m.role}
        </div>
      </div>
    </div>
  );
}

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative"
      style={{
        background: "#06060d", overflow: "hidden",
        paddingTop: "clamp(96px,12vh,140px)", paddingBottom: "clamp(96px,12vh,140px)",
        scrollMarginTop: "64px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }} className="px-5 sm:px-8 md:px-14 lg:px-20">

        {/* ── Two-column intro: manifesto left, pillars right ── */}
        <div className="flex flex-col md:flex-row" style={{ gap: "clamp(40px,6vw,96px)" }}>
          {/* Left — the story */}
          <div style={{
            flex: "1 1 58%", minWidth: 0,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1)",
          }}>
            <span style={{
              display: "block", marginBottom: "16px",
              fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
              textTransform: "uppercase", fontSize: "10px",
              letterSpacing: "0.30em", color: "#f59e0b",
            }}>
              About FOURWARD
            </span>
            <h2 style={{
              fontFamily: "var(--font-syne)", fontWeight: 700,
              textTransform: "uppercase", fontSize: "clamp(30px,4vw,54px)",
              letterSpacing: "-0.02em", lineHeight: 1.04, color: "#fdf2f2",
              textWrap: "balance",
            }}>
              Four people.{" "}
              <span style={{ color: "var(--amber-deep)", fontStyle: "italic", fontWeight: 900 }}>
                One trajectory.
              </span>
            </h2>
            <p style={{
              marginTop: "24px", maxWidth: "54ch",
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.7,
              color: "rgba(255,255,255,0.72)",
            }}>
              FOURWARD is a four-person creative studio built for brands that
              refuse to sit still. We make bold, kinetic work — the kind that
              wins the room before a single word is read.
            </p>
            <p style={{
              marginTop: "18px", maxWidth: "54ch",
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(14px,1.05vw,16px)", lineHeight: 1.7,
              color: "rgba(255,255,255,0.55)",
            }}>
              No account layers, no template thinking — just direct access to
              the four people actually making the work. Always moving, always
              ahead. That&apos;s the whole idea behind the name.
            </p>
          </div>

          {/* Right — pillars */}
          <div style={{
            flex: "1 1 42%", minWidth: 0,
            display: "flex", flexDirection: "column", gap: "18px",
            justifyContent: "center",
          }}>
            {PILLARS.map((p, i) => (
              <div
                key={p.k}
                style={{
                  display: "flex", gap: "18px", alignItems: "flex-start",
                  paddingBottom: "18px",
                  borderBottom: i < PILLARS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(24px)",
                  transition: `opacity 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 100 + 200}ms, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 100 + 200}ms`,
                }}
              >
                <span style={{
                  fontFamily: "var(--font-syne)", fontWeight: 800,
                  fontSize: "14px", color: "#f97316",
                  fontVariantNumeric: "tabular-nums", flexShrink: 0, paddingTop: "2px",
                }}>
                  {p.k}
                </span>
                <p style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "clamp(14px,1.1vw,16px)", lineHeight: 1.55,
                  color: "rgba(255,255,255,0.78)",
                }}>
                  {p.v}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Team ── */}
        <div style={{ marginTop: "clamp(56px,8vh,96px)" }}>
          <span style={{
            display: "block", marginBottom: "clamp(24px,3vh,36px)",
            fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
            textTransform: "uppercase", fontSize: "10px",
            letterSpacing: "0.28em", color: "rgba(255,255,255,0.4)",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.8s ease 0.1s",
          }}>
            The Team — Four Strong
          </span>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
            gap: "clamp(18px,2vw,28px)",
          }}>
            {TEAM.map((m, i) => (
              <TeamCard key={m.id} m={m} index={i} visible={isVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
