#!/usr/bin/env python3
"""
ADS advisory source-preflight wrapper.
Runs gameable source heuristics against TSX files in your project. A green exit
means only that these source checks found no configured warnings; it is not
evidence that the rendered UI is accessible, functional, or visually good.

Usage:
  python3 ci/design-eval.py                  # scan default paths
  python3 ci/design-eval.py --strict         # fail on any warning
  python3 ci/design-eval.py --paths src/     # scan specific directory
  python3 ci/design-eval.py --files a.tsx b.tsx  # scan specific files
"""

import sys
import os
import subprocess
import glob
import argparse
from pathlib import Path
from datetime import datetime, timezone


def find_scripts_dir():
    """Find the verification scripts directory."""
    candidates = [
        "skills/design-review/scripts",
        ".cursor/skills/design-review/scripts",
        ".claude/skills/design-review/scripts",
        ".codex/skills/design-review/scripts",
        "node_modules/agentic-design-system/skills/design-review/scripts",
    ]
    for c in candidates:
        if Path(c).is_dir():
            return c
    return None


def find_tsx_files(paths):
    """Find all .tsx files in the given paths, excluding node_modules and test dirs."""
    files = []
    for p in paths:
        if Path(p).is_file() and p.endswith(".tsx"):
            files.append(p)
        elif Path(p).is_dir():
            for f in glob.glob(f"{p}/**/*.tsx", recursive=True):
                if "node_modules" not in f and "__tests__" not in f and ".test." not in f:
                    files.append(f)
    return sorted(set(files))


def run_script(script_path, tsx_files):
    """Run a verification script and return (exit_code, output)."""
    try:
        result = subprocess.run(
            ["python3", script_path] + tsx_files,
            capture_output=True, text=True, timeout=60
        )
        output = (result.stdout + result.stderr).strip()
        return result.returncode, output
    except subprocess.TimeoutExpired:
        return 1, "Script timed out after 60s"
    except Exception as e:
        return 1, f"Script failed: {e}"


def main():
    parser = argparse.ArgumentParser(description="ADS advisory source preflight")
    parser.add_argument("--strict", action="store_true",
                        help="Fail on any heuristic warning or missing checker")
    parser.add_argument("--paths", nargs="+", default=["app", "src", "components", "pages"],
                        help="Directories to scan (default: app src components pages)")
    parser.add_argument("--files", nargs="+", help="Specific files to check")
    parser.add_argument("--scripts-dir",
                        help="Override the design-review scripts directory (primarily for testing)")
    args = parser.parse_args()

    scripts_dir = args.scripts_dir or find_scripts_dir()
    if not scripts_dir:
        print("SOURCE PREFLIGHT UNVERIFIED — could not find the design-review scripts directory.")
        print("Install the agentic design system skills first.")
        sys.exit(1)

    tsx_files = args.files if args.files else find_tsx_files(args.paths)
    if not tsx_files:
        print("SOURCE PREFLIGHT NO_OP — no eligible .tsx files found.")
        print("Rendered UI was not evaluated; this result is not a design-quality verdict.")
        sys.exit(0)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"ADS source preflight (advisory) — {now}")
    print(f"Skills: {scripts_dir}")
    print(f"Files: {len(tsx_files)}")
    print("Scope: gameable source heuristics only; rendered UI was not evaluated.")
    print()

    scripts = [
        ("anti-pattern-check.py", "Anti-pattern check"),
        ("state-check.py", "State completeness check"),
        ("accessibility-check.py", "Accessibility check"),
    ]

    any_failed = False
    had_findings = False
    missing_scripts = []

    for script_name, label in scripts:
        script_path = os.path.join(scripts_dir, script_name)
        if not Path(script_path).exists():
            missing_scripts.append(script_name)
            print(f"=== {label} (UNVERIFIED — {script_name} not found) ===\n")
            continue

        exit_code, output = run_script(script_path, tsx_files)
        status = "exit 0" if exit_code == 0 else f"exit {exit_code}"
        print(f"=== {script_name} ({status}) ===\n")
        if output:
            print(output)
        print()

        if exit_code != 0:
            had_findings = True
            if args.strict:
                any_failed = True

    if args.strict and missing_scripts:
        print("SOURCE PREFLIGHT FAILED — strict mode cannot verify all configured source checks.")
        print("Missing checker(s): " + ", ".join(missing_scripts))
        print("Rendered evidence remains required for any design-quality verdict.")
        sys.exit(1)
    if any_failed:
        print("SOURCE PREFLIGHT FAILED — heuristic warnings found in strict mode.")
        print("Rendered evidence remains required for any design-quality verdict.")
        sys.exit(1)
    if missing_scripts:
        print("SOURCE PREFLIGHT UNVERIFIED — one or more advisory checkers were unavailable.")
    elif had_findings:
        print("SOURCE PREFLIGHT COMPLETE WITH FINDINGS — review the advisory output above.")
    else:
        print("SOURCE PREFLIGHT COMPLETE — no heuristic findings in the checked source.")
    print("ADVISORY ONLY — this does not verify rendered UI quality; use capture.mjs for authoritative evidence.")
    sys.exit(0)


if __name__ == "__main__":
    main()
