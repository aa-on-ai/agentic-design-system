# Whimsical Design Skill

## When to Use
Before any frontend/visual work, read this alongside `skills/design-review/SKILL.md`. Design-review catches quality problems. This skill pushes toward delight.

## The Bar
Would someone screenshot this and send it to a friend? Would it make them smile? If no, push further.

## Core Principles

### 1. Whimsy Over Sterile
Default away from corporate SaaS. Toward warmth, personality, surprise. Think: the feeling of opening a Playdate box, or the first time you saw a Teenage Engineering product page.
- Pixel art, hand-drawn textures, playful illustrations
- Warm color palettes over cold neutral grays
- Personality in empty states, loading screens, error messages
- Small details that reward people who look closely

### 2. Juice
Everything should feel alive. Static interfaces are dead interfaces.
- Micro-interactions on hover, click, drag
- Subtle spring animations on state changes
- Parallax, bob, breathe — things that move even when idle
- Sound design where appropriate (click, whoosh, chirp)
- The difference between "functional" and "delightful" is 50ms of easing

### 3. Craft Signals
The opposite of "AI generated this." Every surface should feel touched by a human.
- Grain textures, noise overlays, subtle paper feel
- Intentional imperfection — slightly uneven, hand-placed, organic
- Serif accents mixed with clean sans (not all one or the other)
- Asymmetric layouts that feel composed, not random
- Custom illustrations over stock icons where possible
- SVG elements that respond to cursor or scroll

### 4. Color With Feeling
Color should create mood, not just differentiate elements.
- Studio Ghibli palettes: warm earth tones, saturated sky blues, forest greens
- Pantone-chip energy: specific, intentional, named
- Avoid: gray-on-white corporate void, neon-on-dark "developer tool"
- Dark modes should feel cozy (deep indigos, warm blacks), not cold

### 5. Typography as Character
Type carries personality before anyone reads a word.
- Mix weights dramatically (thin headlines + chunky body, or vice versa)
- Consider display faces for headers — not just system fonts
- Letterspacing and line-height are design decisions, not defaults
- Monospace for data/code, but make it feel intentional (not "I forgot to style this")

## References (study these)

**Product / Physical**
- Teenage Engineering — products as objects of desire, every surface designed
- Panic / Playdate — joy in every interaction, surprise and delight as core values
- Nothing Phone — glyphs, transparency, making tech feel human

**Digital**
- Perplexity marketing pages — confident whitespace, editorial feel, illustrations
- Linear changelog — density with craft, every detail considered
- Vercel ship pages — motion, drama, typographic confidence
- Raycast — command palette as art form
- Arc Browser — sidebar as expression

**Visual Language**
- Old Apple ads (Think Different era) — simplicity with soul
- Studio Ghibli color grading — warm, lived-in, natural light
- Indie game UIs (Celeste, Hollow Knight, Slay the Spire) — personality in every pixel
- Poolsuite / Poolsuite FM — retro-futurism, nostalgia as design language

## Anti-Patterns (NEVER DO THESE)
- Glassmorphism for its own sake (blur ≠ design)
- Neon gradients as a substitute for personality
- Generic card grids with drop shadows
- Bootstrap energy (you know it when you see it)
- "Clean and modern" as the entire design brief
- Stock illustrations from undraw/humaaans (everyone uses these)
- Gray-200 backgrounds with gray-300 borders everywhere
- Tailwind defaults without customization
- Cookie-cutter hero sections (headline + subhead + CTA + mockup)
- Animations that don't serve meaning (spinning logos, floating shapes)

## Pre-Flight Checklist (run alongside design-review)

### Whimsy Check
- [ ] **The smile test** — does this make you smile? Would you show someone?
- [ ] **Personality audit** — remove one element. Does it still feel like "us"? If yes, you haven't gone far enough.
- [ ] **Empty state check** — what happens when there's no data? Is it delightful or depressing?
- [ ] **Error state check** — is the error message human? Funny? At least warm?
- [ ] **Hover state check** — does hovering over things feel rewarding?

### Craft Check
- [ ] **Texture** — is there grain, noise, or tactile quality? Or is it flat vectors on white?
- [ ] **Typography** — are font choices intentional? Is there contrast in scale/weight?
- [ ] **Color** — does the palette create a mood? Could you name the vibe in one word?
- [ ] **Motion** — do transitions have easing? Do elements enter and exit with intention?
- [ ] **Detail** — is there at least one "easter egg" level detail someone might notice on second look?

### Kill Switch
- [ ] **Not whimsy for whimsy's sake** — does the personality serve the product or distract from it?
- [ ] **Readable** — is body text still legible? Are CTAs still clear?
- [ ] **Accessible** — does color contrast pass WCAG? Do animations respect prefers-reduced-motion?
- [ ] **Performance** — are animations GPU-accelerated? Are textures optimized?

## Updating This Skill
After design reviews where Aaron gives feedback on visual personality, tone, or craft:
- What delighted him → add to Principles or References
- What felt flat → add to Anti-Patterns
- Specific decisions (texture style, color choice, animation timing) → project channel memory

The goal: every build should feel more "us" than the last.
