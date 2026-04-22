# DESIGN.md

## 1. visual theme & atmosphere

choose 2-4 adjectives that describe the feel:
- atmosphere:
- emotional register:
- density: spacious / balanced / dense
- overall posture: editorial / utilitarian / playful / cinematic / analytical / calm / sharp

short description:

## 2. color roles

list the role first, then the color.

- primary action:
- primary background:
- secondary surface:
- primary text:
- secondary text:
- accent:
- success:
- warning:
- destructive:

notes:
- where should color be restrained?
- where is color allowed to carry emphasis?
- what color habits should the agent avoid?

## 3. typography character

- primary typeface:
- secondary typeface:
- display/headline character:
- body text character:
- preferred weights:
- hierarchy notes:
- letter-spacing notes:
- text tone:

## 4. spacing philosophy

- overall spacing posture: generous / standard / compact
- section rhythm:
- panel/card padding:
- edge padding:
- max content width:
- layout density notes:

what should the UI feel like before you read a word?

## 5. component tone

### buttons
- shape:
- visual weight:
- hover/focus feel:

### cards / panels
- flat or elevated:
- radius:
- border strategy:
- shadow strategy:

### inputs / forms
- input feel:
- focus treatment:
- error treatment:

### navigation
- preferred pattern:
- density:
- active state treatment:

## 6. responsive stance

answer the ambiguous forks up front.

- mobile should preserve: density / focus / atmosphere / comparison / speed
- sidebar strategy on mobile:
- table strategy on mobile:
- dashboard strategy on mobile:
- sticky strategy on mobile:
- modal strategy on mobile:

notes:
- what should collapse aggressively?
- what must remain visible?
- what should never be duplicated across mobile/desktop variants?

## 7. anti-goals

list the things the agent should actively avoid.

- do not use:
- should never feel like:
- avoid these common AI defaults:
- avoid these product-specific mistakes:

## 8. implementation notes

- design system / component library:
- token source:
- existing references to match:
- accessibility floor:
- production constraints:

## 9. example prompting language

write 3-6 lines of natural language the agent can reuse.

example:
- "keep the interface calm, precise, and slightly dense"
- "use restraint. hierarchy should come from spacing and type before color"
- "mobile should preserve focus, not desktop density"
- "cards should feel structural, not decorative"
