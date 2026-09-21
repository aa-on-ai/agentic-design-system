---
name: whimsical-design
description: Develop purposeful personality, delight or brand expression when requested or established by the brief. Skip routine utility UI and settled product aesthetics.
---

# Whimsical Design Skill

## Conditional specialist

Use when the requested experience calls for personality, delight or expressive brand direction. A marketing page, portfolio or variation exercise is not sufficient on its own: the user job and brief must support the choice. Skip routine utility UI, state repairs and settled aesthetics. ADS owns the task and review; do not start another loop.

Recover the desired character and any accepted examples before inventing an aesthetic. Calm, static and familiar can be the right result. No decorative dots or all-caps visual treatments; preserve current user preferences and project tokens. Techniques below are options, not required ingredients.

## The bar

Does the chosen character help this audience understand, remember or enjoy the experience without obstructing the task? Novelty and the agent's smile test are not user acceptance.

## Core Principles

### 1. Whimsy Over Sterile
Default away from corporate SaaS. Toward warmth, personality, surprise. Think: the feeling of opening a Playdate box, or the first time you saw a Teenage Engineering product page.
- Pixel art, hand-drawn textures, playful illustrations
- Warm color palettes over cold neutral grays
- Personality in empty states, loading screens, error messages
- Small details that reward people who look closely

### 2. Responsive character

Meaningful feedback can reinforce tactility or personality. Use [web-animation-design](../web-animation-design/SKILL.md) for timing, interruption, reduced motion and target-browser verification. Preserve no-motion for high-frequency controls. Do not add idle bobbing, perpetual pulses, moving table rows or animated data simply to make a surface feel alive.

Optional recipes include subtle press feedback on a suitable control, a bounded reveal that explains new content, or a gesture-driven spring when the brief permits it. Match existing tokens, preserve keyboard/focus and do not delay real content. Sound is opt-in and must not be necessary to understand the result.

### 3. Bold Aesthetic Commitment
For a new expressive direction, name a specific aesthetic in the existing brief. Reuse a settled direction rather than forcing another decision. Possibilities include:

- brutally minimal (nothing that doesn't earn its place)
- maximalist chaos (dense, layered, overwhelming in the best way)
- retro-futuristic (old tech aesthetics, modern capability)
- organic/natural (textures, warmth, imperfection)
- luxury/refined (thin weights, generous space, precious materials)
- playful/toy-like (rounded, bouncy, colorful, tactile)
- editorial/magazine (type-forward, dramatic scale, reading rhythm)
- brutalist/raw (exposed structure, no decoration, confrontational)
- industrial/utilitarian (functional, dense, no-nonsense)

Intentionality matters more than intensity. A restrained treatment can be the most specific choice; avoid an arbitrary mixture of unrelated styles.

Make a direction check only if the missing choice is material. Do not turn a scoped craft edit into an aesthetic interview.

### 4. Background Atmosphere
A background can establish mood. Keep flat color when it supports clarity; add texture only if it contributes to the intended material or atmosphere.

techniques:
- **noise/grain texture** ; `background-image: url("data:image/svg+xml,...")` with a subtle noise pattern at 3-5% opacity. makes flat colors feel tactile.
- **gradient mesh** ; 2-3 radial gradients layered at low opacity. creates depth without being gaudy.
- **subtle pattern** ; lines or geometric shapes at 2-4% opacity. adds texture without distraction.
- **layered transparencies** ; overlapping semi-transparent shapes in the background. creates depth and atmosphere.

```css
/* noise texture overlay */
.textured {
  position: relative;
}
.textured::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

/* gradient mesh */
.atmospheric {
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(232, 114, 58, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(45, 106, 79, 0.06) 0%, transparent 50%),
    #FAFAF8;
}
```

don't: use these on every surface. use them on the page background and hero sections. inner components should be clean.

### 5. Craft Signals
Choose only craft details that fit the product and reference. These are possible techniques, not provenance or quality tests:
- Grain textures, noise overlays, subtle paper feel
- Intentional imperfection ; slightly uneven, hand-placed, organic
- Serif accents mixed with clean sans (not all one or the other)
- Asymmetric layouts that feel composed, not random
- Custom illustrations over stock icons where possible
- SVG elements that respond to cursor or scroll

### 6. Color With Feeling
Color should create mood, not just differentiate elements.
- **Dominant + accent, not evenly distributed** ; one dominant color owns the page. one sharp accent draws attention to what matters. a timid, evenly-spread palette is an agent default. commit: what's the ONE color someone remembers?
- Studio Ghibli palettes: warm earth tones, saturated sky blues, forest greens
- Pantone-chip energy: specific, intentional, named
- Avoid: gray-on-white corporate void, neon-on-dark "developer tool"
- Dark modes should feel cozy (deep indigos, warm blacks), not cold

**Concrete recipes:**
- Warm light mode: background `#FAFAF8` (not pure white), text `#1A1A1A` (not pure black), accent `#E8723A` (warm orange) or `#2D6A4F` (forest green)
- Cozy dark mode: background `#1C1917` (warm black, not zinc-900), text `#E7E5E4`, accent `#F59E0B` (amber) or `#818CF8` (soft indigo)
- Illustrative data palette (warm, verify series separation and contrast in context): `#E8723A`, `#2D6A4F`, `#D4A373`, `#588157`, `#BC6C25` ; earthy; accessibility is not established by the hex values alone
- Data viz palette (cool): `#3B82F6`, `#8B5CF6`, `#06B6D4`, `#6366F1`, `#14B8A6` ; techy but not cold
- Status colors: success `#16A34A` (not neon green), warning `#D97706` (not yellow), error `#DC2626` (not pink), info `#2563EB`
- Gradient (subtle, not gaudy): `from-amber-50 to-orange-50` for warm sections, `from-slate-50 to-blue-50` for cool sections ; backgrounds only, never on text

### 7. Typography as Character
Type carries personality before anyone reads a word.
- Mix weights dramatically (thin headlines + chunky body, or vice versa)
- Consider display faces for headers ; not just system fonts
- Letterspacing and line-height are design decisions, not defaults
- Monospace for data/code, but make it feel intentional (not "I forgot to style this")

## References (study these)

**Product / Physical**
- Teenage Engineering ; products as objects of desire, every surface designed
- Panic / Playdate ; joy in every interaction, surprise and delight as core values
- Nothing Phone ; glyphs, transparency, making tech feel human

**Digital**
- Perplexity marketing pages ; confident whitespace, editorial feel, illustrations
- Linear changelog ; density with craft, every detail considered
- Vercel ship pages ; motion, drama, typographic confidence
- Raycast ; command palette as art form
- Arc Browser ; sidebar as expression

**Visual Language**
- Old Apple ads (Think Different era) ; simplicity with soul
- Studio Ghibli color grading ; warm, lived-in, natural light
- Indie game UIs (Celeste, Hollow Knight, Slay the Spire) ; personality in every pixel
- Poolsuite / Poolsuite FM ; retro-futurism, nostalgia as design language

## Patterns to question in context
- Glassmorphism for its own sake (blur ≠ design)
- Neon gradients as a substitute for personality
- Generic card grids with drop shadows
- Unexamined framework styling that conflicts with the intended product
- "Clean and modern" as the entire design brief
- Generic imagery that does not explain this product
- Gray-200 backgrounds with gray-300 borders everywhere
- Tailwind defaults without customization
- Cookie-cutter hero sections (headline + subhead + CTA + mockup)
- Animations that don't serve meaning (spinning logos, floating shapes)

## Review within ADS

Inspect the selected character against the original brief and preserve what already works. Check legibility, primary action, truthful error/empty-state copy, responsive composition and any actual motion. Remove decoration that competes with content. Texture, multiple fonts, animation and easter eggs are not acceptance requirements.

Record accepted examples with the specific reason they work and their actual approval status. Classify feedback: explicit preference, project decision, repeated defect or one-off correction. Update the existing owner only when justified; do not add a permanent rule after every build.
