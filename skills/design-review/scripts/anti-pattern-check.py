#!/usr/bin/env python3
"""
Anti-pattern checker for agent-generated UI code.
Scans a React/TSX file for common agent defaults that indicate
the design system wasn't followed.

Usage: python3 anti-pattern-check.py <file.tsx>
"""

import sys
import re
from pathlib import Path

CHECKS = [
    # Font defaults
    {
        "name": "Inter font default",
        "pattern": r"""font-family.*Inter|'Inter'|"Inter"|fontFamily.*Inter""",
        "severity": "warning",
        "message": "Inter font detected — agents default to this. pick a distinctive font that matches the product."
    },
    {
        "name": "Arial/Roboto/system font",
        "pattern": r"""font-family.*(?:Arial|Roboto|Helvetica|system-ui)|'(?:Arial|Roboto)'|"(?:Arial|Roboto)"|fontFamily.*(?:Arial|Roboto)""",
        "severity": "warning",
        "message": "Generic font detected. choose something intentional."
    },
    # Color defaults
    {
        "name": "Zinc/Slate palette",
        "pattern": r"(?:zinc|slate)-(?:50|100|200|300|400|500|600|700|800|900|950)",
        "severity": "info",
        "message": "Zinc/slate palette detected — common agent default. consider tinted neutrals with warmth or coolness."
    },
    {
        "name": "Purple gradient",
        "pattern": r"(?:from-purple|to-purple|from-violet|to-violet|purple-(?:400|500|600|700))",
        "severity": "warning",
        "message": "Purple gradient/accent detected — the #1 'AI-generated' color cliche."
    },
    # Layout defaults
    {
        "name": "4 equal stat cards",
        "pattern": r"grid-cols-4.*(?:stat|metric|card|kpi)|(?:stat|metric|card|kpi).*grid-cols-4",
        "severity": "warning",
        "message": "4-column stat card grid detected — the most common agent layout cliche. use asymmetric sizing."
    },
    {
        "name": "Dark mode default",
        "pattern": r"(?:bg-(?:gray|zinc|slate|neutral)-(?:900|950)|bg-\[#(?:0[0-9a-f]|1[0-9a-f]){3}\]|bg-black).*(?:min-h-screen|h-screen)",
        "severity": "info",
        "message": "Dark background on page root — agents default to dark mode for dashboards. light mode is equally valid."
    },
    # Border radius
    {
        "name": "Uniform rounded-lg everywhere",
        "pattern": r"rounded-lg",
        "severity": "count",
        "threshold": 10,
        "message": "rounded-lg used {count} times — likely applied uniformly. vary radius: some sharp, some rounded, match nesting depth."
    },
    # Missing states
    {
        "name": "No loading state",
        "pattern": r"(?:loading|isLoading|skeleton|spinner|Loader)",
        "severity": "missing",
        "message": "No loading state detected — every page needs a loading state."
    },
    {
        "name": "No empty state",
        "pattern": r"(?:empty|no data|no results|nothing|No .* found|No .* yet)",
        "severity": "missing",
        "message": "No empty state detected — what happens when there's no data?"
    },
    {
        "name": "No error state",
        "pattern": r"(?:error|Error|catch|failed|failure|went wrong|try again)",
        "severity": "missing",
        "message": "No error state detected — what happens when something breaks?"
    },
    # Responsive
    {
        "name": "No responsive breakpoints",
        "pattern": r"(?:sm:|md:|lg:|xl:)",
        "severity": "missing",
        "message": "No responsive breakpoints detected — does this work on mobile?"
    },
    # Generic content
    {
        "name": "Placeholder text",
        "pattern": r"(?:Lorem ipsum|placeholder|TODO|FIXME|TBD|Coming soon|N/A)",
        "severity": "warning",
        "message": "Placeholder text detected — use real, specific content."
    },
    # Transition all
    {
        "name": "transition-all usage",
        "pattern": r"transition-all|transition:\s*all",
        "severity": "info",
        "message": "transition-all detected — specify exact properties instead (transform, opacity, etc.)"
    },
    # Submit/OK buttons
    {
        "name": "Generic button labels",
        "pattern": r"""(?:>Submit<|>OK<|>Cancel<|>Click here<|"Submit"|"OK"|"Cancel"|"Click here")""",
        "severity": "info",
        "message": "Generic button label detected — buttons should describe the action ('Send message', 'Save changes', not 'Submit')."
    },
]


def check_file(filepath: str) -> list:
    content = Path(filepath).read_text()
    findings = []

    for check in CHECKS:
        matches = re.findall(check["pattern"], content, re.IGNORECASE)

        if check["severity"] == "missing":
            if not matches:
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"],
                })
        elif check["severity"] == "count":
            count = len(matches)
            if count >= check.get("threshold", 5):
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"].format(count=count),
                })
        else:
            if matches:
                findings.append({
                    "severity": check["severity"],
                    "name": check["name"],
                    "message": check["message"],
                    "count": len(matches),
                })

    return findings


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 anti-pattern-check.py <file.tsx> [file2.tsx ...]")
        sys.exit(1)

    total_warnings = 0
    total_info = 0

    for filepath in sys.argv[1:]:
        if not Path(filepath).exists():
            print(f"  ERROR: {filepath} not found")
            continue

        print(f"\n  Checking: {filepath}")
        print(f"  {'=' * 60}")

        findings = check_file(filepath)

        if not findings:
            print(f"  PASS — no anti-patterns detected")
        else:
            for f in findings:
                icon = "⚠️" if f["severity"] == "warning" else "ℹ️"
                count_str = f" (×{f['count']})" if "count" in f else ""
                print(f"  {icon} {f['name']}{count_str}")
                print(f"     {f['message']}")
                if f["severity"] == "warning":
                    total_warnings += 1
                else:
                    total_info += 1

    print(f"\n  Summary: {total_warnings} warnings, {total_info} info")
    sys.exit(1 if total_warnings > 0 else 0)


if __name__ == "__main__":
    main()
