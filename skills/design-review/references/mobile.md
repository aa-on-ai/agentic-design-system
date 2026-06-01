# Mobile Review Reference

For reviewing mobile / responsive / app / PWA / iOS / Android / touch work. Mobile review
runs as **two independent passes that must not blur together**:

- **design judgment** — is this the *right* mobile design? (opinions, ranked by user impact)
- **platform verification** — is it built *correctly* for the device? (objective defects, severity-tiered)

**Hard separation rule:** a preference must never read as a must-fix, and a P0 defect must
never read as a matter of taste. Keep the two passes in separate sections of the report
(see `templates/run-report-template.md` → mobile review). Never merge a preference and a
defect into one ranked list.

> Synthesized from thumb-first (Kyle Zantos, MIT) as prior art — re-expressed as an ADS
> routing profile + reference, not vendored. See `docs/influences.md`.

---

## Pass A — design judgment (opinions)

Read the screen through several lenses. Each is a **question**, not a rule; weight them by
product context (a banking app and a game weight reach and density differently).

- **ergonomic reach** — can the primary action be reached one-thumb on a large phone? what
  got parked in the hard-to-reach top corners?
- **focus** — is there one clear primary action per screen, or does the screen hedge?
- **navigation pattern** — does the chosen pattern (tab bar / drawer / stack / hub) fit the
  app's depth and how often users switch sections?
- **density** — is information density tuned for the screen, or is it desktop density shrunk
  until it technically fits?
- **gesture discoverability** — are gesture-only actions discoverable, or hidden with no
  visible affordance and no fallback?

### Mobile decision forks

Surface the recurring decisions that have **no universal right answer**. Name the fork, state
the tradeoff, point to the signal that favors one branch — then let the human pick. Do not pick
silently and do not present a fork as a defect.

- **primary navigation** — tab bar vs drawer vs stack
- **sheet vs full modal** — partial sheet vs full-screen takeover
- **gesture vs visible control** — swipe/long-press vs an on-screen button
- **primary action placement** — bottom bar vs inline vs floating action button
- **list vs grid** — scannability vs density/visual weight
- **long-form structure** — one long scroll vs sectioned / paged
- **information density** — comfortable vs compact
- **destructive action placement** — how far from the happy path, and behind what confirmation
- **onboarding** — upfront vs progressive vs none

**Output of Pass A:** a short list of opinions, each tagged with **user impact (high / med / low)**
and tied to a fork + the signal behind the call. No `file:line` — these are judgments, not defects.

---

## Pass B — platform verification (objective defects)

Verifiable issues, each with a `file:line` and a concrete fix. For the cross-width layout
checklist (375 / 768 / 1440, overflow, tables→cards) defer to `responsive.md`; this pass adds
the device-specific surface:

- **viewport** — `<meta name="viewport">` present; no horizontal overflow at 375px; layout
  uses dynamic viewport units (`svh`/`dvh`) where it relied on `vh`, so iOS toolbar collapse
  doesn't jump content.
- **safe area** — notch and home-indicator insets honored via `env(safe-area-inset-*)`;
  nothing critical (primary action, close button) sits under the status bar or home indicator.
- **touch targets** — ≥ 44×44 (iOS) / 48×48 (Android) with a visible hit area; enough spacing
  between adjacent targets to avoid mis-taps.
- **hover-only bugs** — every hover reveal has a tap path; hover styling is guarded by
  `@media (hover: hover) and (pointer: fine)` so a tap doesn't leave a stuck hover state.
- **PWA / web defects** — manifest, icons, and `theme-color` present if installable; offline /
  service-worker behavior works if claimed; no sticky-`100vh` scroll jump on iOS Safari.
- **performance / layout** — images sized and lazy-loaded; layout shift (CLS) controlled;
  no runtime jank on scroll/drag; no rigid fixed widths (`max-width`, not `width`).

### Severity tiers

- **P0** — broken or unusable on device: horizontal overflow, an unreachable primary action,
  a target you can't reliably hit, content trapped under the notch/home indicator.
- **P1** — significant friction; ships only with an explicit reason.
- **P2** — minor defect or polish gap.
- **P3** — nit.

**Output of Pass B:** a severity-tiered table, each row a `file:line` + the fix.

---

## Merge

The report keeps the two passes in **separate, clearly-labeled sections**: opinions ranked by
impact in one, defects tiered P0–P3 with `file:line` in the other. The reader must be able to
tell, at a glance, which lines are someone's taste and which are objectively broken.
