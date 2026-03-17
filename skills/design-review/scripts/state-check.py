#!/usr/bin/env python3
"""
State completeness checker for UI components.
Verifies that loading, empty, and error states are implemented.

Usage: python3 state-check.py <file.tsx>
"""

import sys
import re
from pathlib import Path

STATES = {
    "loading": {
        "patterns": [
            r"loading",
            r"isLoading",
            r"skeleton",
            r"Skeleton",
            r"spinner",
            r"Spinner",
            r"Loader",
            r"\.\.\.loading",
            r"fetching",
            r"pending",
        ],
        "message": "loading state — what does the user see while data loads?"
    },
    "empty": {
        "patterns": [
            r"empty",
            r"no\s+data",
            r"no\s+results",
            r"nothing\s+(?:here|to|found)",
            r"No\s+\w+\s+(?:found|yet|available)",
            r"get\s+started",
            r"create\s+your\s+first",
            r"\.length\s*===?\s*0",
        ],
        "message": "empty state — what happens when there's no data? guide the user to the next action."
    },
    "error": {
        "patterns": [
            r"error",
            r"Error",
            r"failed",
            r"failure",
            r"went\s+wrong",
            r"try\s+again",
            r"couldn't",
            r"unable\s+to",
            r"catch\s*\(",
            r"onError",
        ],
        "message": "error state — what happens when something breaks? say what happened and what to do."
    },
}


def check_file(filepath: str) -> dict:
    content = Path(filepath).read_text()
    results = {}

    for state_name, config in STATES.items():
        found = False
        for pattern in config["patterns"]:
            if re.search(pattern, content, re.IGNORECASE):
                found = True
                break
        results[state_name] = {
            "found": found,
            "message": config["message"]
        }

    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 state-check.py <file.tsx> [file2.tsx ...]")
        sys.exit(1)

    all_pass = True

    for filepath in sys.argv[1:]:
        if not Path(filepath).exists():
            print(f"  ERROR: {filepath} not found")
            continue

        print(f"\n  Checking states: {filepath}")
        print(f"  {'=' * 50}")

        results = check_file(filepath)
        missing = []

        for state_name, result in results.items():
            if result["found"]:
                print(f"  ✓ {state_name}")
            else:
                print(f"  ✗ {state_name} — MISSING")
                print(f"    {result['message']}")
                missing.append(state_name)

        if missing:
            all_pass = False
            print(f"\n  FAIL — missing: {', '.join(missing)}")
        else:
            print(f"\n  PASS — all states present")

    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
