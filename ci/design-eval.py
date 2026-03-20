#!/usr/bin/env python3
"""
Design eval CI wrapper.
Runs all verification scripts against TSX files in your project.
Use as a GitHub Actions check to gate PRs on design quality.

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
    parser = argparse.ArgumentParser(description="Design eval CI check")
    parser.add_argument("--strict", action="store_true", help="Fail on any warning")
    parser.add_argument("--paths", nargs="+", default=["app", "src", "components", "pages"],
                        help="Directories to scan (default: app src components pages)")
    parser.add_argument("--files", nargs="+", help="Specific files to check")
    args = parser.parse_args()

    scripts_dir = find_scripts_dir()
    if not scripts_dir:
        print("ERROR: Could not find design-review scripts directory.")
        print("Install the agentic design system skills first.")
        sys.exit(1)

    tsx_files = args.files if args.files else find_tsx_files(args.paths)
    if not tsx_files:
        print("No .tsx files found to check.")
        sys.exit(0)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"Design eval — {now}")
    print(f"Skills: {scripts_dir}")
    print(f"Files: {len(tsx_files)}")
    print()

    scripts = [
        ("anti-pattern-check.py", "Anti-pattern check"),
        ("state-check.py", "State completeness check"),
        ("accessibility-check.py", "Accessibility check"),
    ]

    any_failed = False

    for script_name, label in scripts:
        script_path = os.path.join(scripts_dir, script_name)
        if not Path(script_path).exists():
            print(f"=== {label} (skipped — {script_name} not found) ===\n")
            continue

        exit_code, output = run_script(script_path, tsx_files)
        status = "exit 0" if exit_code == 0 else f"exit {exit_code}"
        print(f"=== {script_name} ({status}) ===\n")
        if output:
            print(output)
        print()

        if exit_code != 0 and args.strict:
            any_failed = True

    if any_failed:
        print("FAILED — warnings found in strict mode")
        sys.exit(1)
    else:
        print("PASSED — all checks clean")
        sys.exit(0)


if __name__ == "__main__":
    main()
