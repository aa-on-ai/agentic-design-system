# Releasing ADS

ADS uses repository tags and GitHub releases. It is not published to npm; `package.json` is the
private development harness and one of the release-version sources.

## Release sources

Keep these in agreement:

- `package.json` and `package-lock.json`
- `.claude-plugin/plugin.json`
- `CHANGELOG.md`
- `docs/releases/v<version>.md`

The plugin skill manifest must also match every `skills/*/SKILL.md` directory.

## Gate

From a clean checkout:

```bash
npm ci
npm run playwright:install
npm run release:check
```

The gate verifies metadata, all five agent installations, bundled assets/templates/runbooks, and
the deterministic rendered-evidence smokes. Do not tag a commit that fails this command.

## Publish

After the release PR is merged to `main` and the GitHub release-gate check passes:

```bash
git switch main
git pull --ff-only
git tag -a v1.1.0 -m "Agentic Design System v1.1.0"
git push origin v1.1.0
gh release create v1.1.0 \
  --verify-tag \
  --title "Agentic Design System v1.1.0" \
  --notes-file docs/releases/v1.1.0.md
```

Verify the tag and release point at the same commit as `main`. A release is complete only after a
fresh public-source run passes:

```bash
testing/install-matrix.sh aa-on-ai/agentic-design-system
```
