---
name: Kinetic Horizon
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0e0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#2a2932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#302f38'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#905b00'
  on-tertiary-container: '#ffe1c0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  headline-xl:
    fontFamily: Syne
    fontSize: 80px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.15em
  mono-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for a high-performance creative agency, emphasizing forward momentum, technical precision, and immersive digital experiences. The brand personality is "The Architect of the Future"—authoritative yet experimental, moving at the speed of light.

The visual style is a fusion of **Glassmorphism** and **High-Contrast / Bold** aesthetics. It utilizes deep layering to simulate a cockpit-like interface, where holographic elements float over a vast, dark void. Expect "Cyber-Luxe" details: ultra-thin borders that catch light, neon-tinted glows that signal interactivity, and a sense of metallic weightlessness. 

**Emotional Response:**
- **Momentum:** The UI should feel like it is constantly accelerating.
- **Precision:** Every pixel serves a function, mirroring technical blueprints.
- **Ambition:** High-contrast color pairings and expansive typography evoke a "world-class" scale.

## Colors

The palette is rooted in the "Deep Space" void, providing a high-contrast canvas that allows vibrant accent colors to appear "self-illuminated."

- **Deep Space (#04040a):** The absolute foundation. Use this for the base background. Avoid lighter greys; use opacity on white or primary colors to create depth.
- **Electric Violet (#7c3aed):** The core brand energy. Used for primary actions, major brand moments, and high-energy gradients.
- **Cyan Thrust (#06b6d4):** The "Tech" secondary. Used for data visualization, secondary interactions, and to provide a cool contrast to the violet.
- **Gold Accent (#f59e0b):** The "Premium" marker. Reserved for high-value conversions, success states, or "Award-winning" callouts. Use sparingly to maintain its impact.
- **Pure White (#ffffff):** Primary text and icons. Ensure high legibility against the dark background.

## Typography

Typography in this design system balances the expressive, avant-garde nature of **Syne** with the utilitarian, technical precision of **Space Grotesk**.

- **Headlines:** Syne should be used with tight tracking (letter-spacing) in large formats to create a "wall of text" impact. It represents the creative soul of the agency.
- **Body & Technical Info:** Space Grotesk provides the "engine" feel. Its geometric construction ensures readability even in complex data layouts or small labels.
- **Hierarchy Rule:** Use `label-caps` for section headers and overlines to establish a structural, navigational rhythm. 
- **Mobile scaling:** Headlines must scale aggressively. A 80px desktop headline should transition to a fluid layout or a max of 40px on mobile to maintain visual balance.

## Layout & Spacing

This design system utilizes a **Fluid Grid** with an 8px baseline rhythm. The layout should feel expansive and cinematic, often breaking the grid for "momentum" elements.

- **Grid System:** 12-column desktop grid with wide 24px gutters to allow the dark background to "breathe" between content blocks.
- **Asymmetry:** Encourage the use of offset columns (e.g., content spanning columns 2-10) to create a more dynamic, editorial feel.
- **Safe Zones:** Use large vertical margins (80px–120px) between sections to signify a premium, high-end agency experience.
- **Mobile Adaptivity:** Collapse to a 4-column grid with reduced margins. Padding within components should remain generous to ensure touch targets feel high-tech and accessible.

## Elevation & Depth

Depth is achieved through **Holographic Glassmorphism** rather than traditional shadows. This creates the illusion of data floating in a 3D space.

- **The Stack:** Background (#04040a) -> Glass Layer (White @ 5-10% opacity) -> Content.
- **Backdrop Blur:** Use a heavy blur (20px - 40px) on any floating surface or navigation bar to create a "frosted tech" appearance.
- **Rim Lighting:** Instead of shadows, use 1px inner borders (linear gradients from White @ 20% to Transparent) to simulate light catching the edge of a glass panel.
- **Glows:** Primary buttons and active states should emit a soft "bloom" or outer glow using the primary Electric Violet color (Blur: 15px, Opacity: 30%).

## Shapes

The shape language is **Soft (0.25rem)**, moving away from "bubbly" consumer apps toward a more engineered, industrial aesthetic.

- **Base Radius:** 4px (0.25rem) for inputs and small buttons.
- **Container Radius:** 8px (0.5rem) for cards and sections. 
- **Technical Cut:** For high-motion elements, consider using 45-degree "clipped" corners or "chamfered" edges to reinforce the futuristic, aeronautic theme.
- **Stroke Weights:** Keep strokes ultra-fine (1px) to maintain a sleek, metallic look.

## Components

- **Buttons:** Primary buttons use a solid Electric Violet fill with a subtle "Cyan Thrust" glow on hover. Secondary buttons are "ghost" style with a 1px white border and a background blur.
- **Cards:** Use a semi-transparent dark fill (White @ 4% opacity) with a 20px backdrop blur. Add a 1px top-left "light leak" border to simulate a metallic edge.
- **Inputs:** Darker than the background (#000000) with a 1px border that turns Cyan Thrust upon focus. Labels should always be in `label-caps` (Space Grotesk).
- **Chips/Badges:** Small, high-contrast pills with monospaced text. Use Gold Accent for "New" or "Hot" tags.
- **Navigation:** A fixed top-bar with a 60px backdrop blur. Use "active" indicators that are 2px horizontal lines in Electric Violet appearing below the menu text.
- **Motion:** All hover states should include a slight `0.2s` scale-up (1.02x) and a transition of the inner glow intensity to suggest "powering up."