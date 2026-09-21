# Transitions.dev candidate recipes

Status: source-assessed candidate, not installed, adopted or shown to improve rendered quality. Consult only when a scoped motion task has a concrete recipe gap beneath [web-animation-design](../SKILL.md). This is not another router, global token system or required trial.

## Pinned source

Upstream commit: `598d3d6ad89dabb4bdf742fd2e887ca53914a888`.

| Recipe | Pinned source | SHA-256 of assessed snapshot |
| --- | --- | --- |
| Dropdown | [05-menu-dropdown.md](https://github.com/Jakubantalik/transitions.dev/blob/598d3d6ad89dabb4bdf742fd2e887ca53914a888/skills/transitions-dev/05-menu-dropdown.md) | `70048541fd6389cfee736bf15a2bb21b062bc59c022562dc8d19773499630243` |
| Modal | [06-modal.md](https://github.com/Jakubantalik/transitions.dev/blob/598d3d6ad89dabb4bdf742fd2e887ca53914a888/skills/transitions-dev/06-modal.md) | `55638bf7e92d54d54cd09ad360442d7433e5b7a4b34bea24138643c76c03339a` |
| Skeleton reveal | [14-skeleton-reveal.md](https://github.com/Jakubantalik/transitions.dev/blob/598d3d6ad89dabb4bdf742fd2e887ca53914a888/skills/transitions-dev/14-skeleton-reveal.md) | `ffa8d66692cb863a05799abab90cdd4f1ad43189833202428ada7385bffcd88f` |

The pinned hashes above preserve the assessed source identity. The timing findings below come from
mocked-DOM reproduction and do not establish browser behavior or taste acceptance.

## Adaptation boundaries

- Select only the useful recipe layer. Keep the existing accessible primitive, state/lifecycle owner, project tokens, content and dependencies. No wholesale `_root.css` import, new global commands or animation on already-clear high-frequency controls.
- Review remains read-only. Upstream `transitions polish` documentation disagrees about write behavior and `transitions review` is claimed by two upstream skills. Use the user's actual review/implementation instruction, not command-name assumptions; do not add redundant permission gates to already-authorized local work.
- Both dropdown and modal snippets have reproduced stale-close-timer and seconds-unit defects. Closing at 0ms, reopening at 50ms and closing at 100ms lets the obsolete timer clear the newer closing state at 150ms instead of 250ms. `parseFloat('0.15s')` also produces a 0.15ms timeout instead of 150ms. Do not copy their orchestration unchanged.
- Keep focus management, keyboard/Escape handling, focus restoration, hidden-content tab order and unmount cleanup in the existing primitive. Opacity and pointer-events do not make an accessible modal/menu.
- Skeleton reveal follows real data and stable content geometry, not the demo replay timer. No forced minimum loader or delayed usable content.
- Baseline motion is brief and non-bouncing. A pinned bounce or blur recipe does not override the local brief, reduced-motion behavior or target-browser performance requirements.

## Optional trial under the existing owner

Only within an owner-selected approved UI flow, compare current guidance alone with one adapted pinned recipe. Hold layout, content, semantics, dependencies, tokens, runtime and repair budget constant. Do not create a separate showcase or make this optional trial block the core acceptance subset.

Exercise rapid retargeting, pointer and keyboard open/close, Escape, focus restoration, hidden tab order, millisecond/second and theme-scoped tokens, reduced motion and target mobile/WebKit. For async reveal include cached/fast data, slow data, failure/retry and long content. Measure blur/layout cost when used and keep a no-added-motion control. Record functional/accessibility results, scope/diff, measured performance and the user's clarity and feel judgment separately. Until those checks support an adaptation, retain candidate status.
