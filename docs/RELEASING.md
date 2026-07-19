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

The gate verifies metadata, all five agent installations, bundled assets/templates/runbooks, the
deterministic rendered-evidence smokes, and the checksum-locked adjacent-action regression baseline.
Pull requests that change ADS behavior paths must also add a passing append-only candidate packet
under `testing/regression/adjacent-actions-v1.3.1/runs/`. Do not tag a commit that fails this command.

## Publish

After the release PR is merged to `main` and the GitHub release-gate check passes:

```bash
RELEASE_VERSION=1.2.0
git switch main
git pull --ff-only
git tag -a "v$RELEASE_VERSION" -m "Agentic Design System v$RELEASE_VERSION"
git push origin "v$RELEASE_VERSION"
gh release create "v$RELEASE_VERSION" \
  --verify-tag \
  --title "Agentic Design System v$RELEASE_VERSION" \
  --notes-file "docs/releases/v$RELEASE_VERSION.md"
```

Verify the tag and release point at the same commit as `main`. A release is complete only after a
fresh public-source run passes:

```bash
testing/install-matrix.sh aa-on-ai/agentic-design-system
```
