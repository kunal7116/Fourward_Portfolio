"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Work",     href: "#work" },
  { label: "About",    href: "#about" },
  { label: "Services", href: "#services" },
  { label: "News",     href: "#news" },
  { label: "Contact",  href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Lock body scroll while the mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[60] transition-all duration-500"
      style={{
        /* Always has SOME backdrop so page content can never visually
           collide with nav text — only the intensity changes on scroll. */
        background: scrolled ? "rgba(4,4,10,0.92)" : "rgba(4,4,10,0.38)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(249,115,22,0.18)"
          : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-14 lg:px-20 h-[64px] flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-display font-black tracking-[-0.04em] transition-opacity duration-300 hover:opacity-80"
          style={{ fontSize: "clamp(17px, 1.5vw, 22px)" }}
          onClick={() => setMenuOpen(false)}
        >
          <span style={{ color: "#ffffff" }}>FOUR</span>
          <span style={{ color: "#f97316" }}>WARD</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="font-sans font-medium transition-colors duration-300"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.50)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.92)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.50)"; }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-2 font-sans font-semibold uppercase transition-all duration-300"
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            padding: "10px 20px",
            borderRadius: "999px",
            border: "1px solid rgba(249,115,22,0.45)",
            color: "#f97316",
          }}
          onMouseEnter={e => {
            const t = e.currentTarget;
            t.style.background  = "rgba(249,115,22,0.12)";
            t.style.borderColor = "rgba(249,115,22,0.70)";
            t.style.boxShadow   = "0 0 22px rgba(249,115,22,0.20)";
          }}
          onMouseLeave={e => {
            const t = e.currentTarget;
            t.style.background  = "transparent";
            t.style.borderColor = "rgba(249,115,22,0.45)";
            t.style.boxShadow   = "none";
          }}
        >
          Let&apos;s Talk
        </a>

        {/* Mobile hamburger — morphs into X */}
        <button
          className="md:hidden relative flex items-center justify-center"
          style={{ width: "36px", height: "36px" }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span
            style={{
              position: "absolute", width: "20px", height: "1.5px",
              background: "#ffffff", borderRadius: "1px",
              transition: "transform 320ms cubic-bezier(0.16,1,0.3,1), top 320ms cubic-bezier(0.16,1,0.3,1)",
              top: menuOpen ? "18px" : "13px",
              transform: menuOpen ? "rotate(45deg)" : "rotate(0deg)",
            }}
          />
          <span
            style={{
              position: "absolute", width: "20px", height: "1.5px",
              background: "#ffffff", borderRadius: "1px", top: "18px",
              transition: "opacity 200ms ease",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              position: "absolute", width: "20px", height: "1.5px",
              background: "#ffffff", borderRadius: "1px",
              transition: "transform 320ms cubic-bezier(0.16,1,0.3,1), top 320ms cubic-bezier(0.16,1,0.3,1)",
              top: menuOpen ? "18px" : "23px",
              transform: menuOpen ? "rotate(-45deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className="md:hidden overflow-hidden"
        style={{
          maxHeight: menuOpen ? "400px" : "0px",
          transition: "max-height 420ms cubic-bezier(0.16,1,0.3,1)",
          background: "rgba(4,4,10,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: menuOpen ? "1px solid rgba(249,115,22,0.18)" : "none",
        }}
      >
        <ul className="flex flex-col px-5 sm:px-8 py-2">
          {navLinks.map((link, i) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block font-sans font-medium uppercase"
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.75)",
                  padding: "14px 0",
                  borderBottom: i < navLinks.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 360ms ease ${menuOpen ? i * 40 + 80 : 0}ms, transform 360ms cubic-bezier(0.16,1,0.3,1) ${menuOpen ? i * 40 + 80 : 0}ms`,
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-4 pb-5">
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center w-full font-sans font-semibold uppercase"
              style={{
                fontSize: "12px",
                letterSpacing: "0.12em",
                padding: "13px 0",
                borderRadius: "999px",
                border: "1px solid rgba(249,115,22,0.50)",
                color: "#f97316",
                opacity: menuOpen ? 1 : 0,
                transition: `opacity 360ms ease ${menuOpen ? 280 : 0}ms`,
              }}
            >
              Let&apos;s Talk
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
