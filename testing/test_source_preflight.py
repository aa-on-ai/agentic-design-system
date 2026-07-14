#!/usr/bin/env python3
"""Deterministic contract tests for the advisory ADS source preflight."""

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
PREFLIGHT = REPO_ROOT / "ci" / "design-eval.py"
CHECKERS = REPO_ROOT / "skills" / "design-review" / "scripts"
FIXTURES = REPO_ROOT / "testing" / "fixtures"


def run_preflight(*args):
    return subprocess.run(
        [sys.executable, str(PREFLIGHT), *map(str, args)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )


class SourcePreflightContractTest(unittest.TestCase):
    def test_empty_directory_is_explicit_no_op(self):
        with tempfile.TemporaryDirectory(prefix="ads-source-preflight-empty-") as empty:
            result = run_preflight("--strict", "--paths", empty)

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("SOURCE PREFLIGHT NO_OP", result.stdout)
        self.assertIn("Rendered UI was not evaluated", result.stdout)
        self.assertNotIn("all checks clean", result.stdout.lower())

    def test_missing_checker_fails_as_unverified_in_strict_mode(self):
        with tempfile.TemporaryDirectory(prefix="ads-source-preflight-checkers-") as temp:
            scripts_dir = Path(temp)
            for name in ("anti-pattern-check.py", "accessibility-check.py"):
                shutil.copy2(CHECKERS / name, scripts_dir / name)

            result = run_preflight(
                "--strict",
                "--scripts-dir",
                scripts_dir,
                "--files",
                FIXTURES / "variant-broken.tsx",
            )

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("UNVERIFIED", result.stdout)
        self.assertIn("state-check.py", result.stdout)
        self.assertIn("SOURCE PREFLIGHT FAILED", result.stdout)

    def test_broken_fixture_fails_strict_source_preflight(self):
        result = run_preflight(
            "--strict",
            "--files",
            FIXTURES / "variant-broken.tsx",
        )

        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("ADS source preflight (advisory)", result.stdout)
        self.assertIn("SOURCE PREFLIGHT FAILED", result.stdout)
        self.assertIn("Rendered evidence remains required", result.stdout)

    def test_gamed_state_text_is_labeled_advisory_not_authoritative(self):
        result = run_preflight(
            "--files",
            FIXTURES / "source-gamed-states.tsx",
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("✓ loading", result.stdout)
        self.assertIn("✓ empty", result.stdout)
        self.assertIn("✓ error", result.stdout)
        self.assertIn("ADVISORY ONLY", result.stdout)
        self.assertIn("does not verify rendered UI quality", result.stdout)
        self.assertNotIn("PASSED — all checks clean", result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
