#!/usr/bin/env python3
"""
Accessibility & semantic HTML checker for agent-generated UI code.
Catches the things agents consistently miss that Lighthouse/axe don't
flag well at the source level.

Usage: python3 accessibility-check.py <file.tsx> [file2.tsx ...]
"""

import sys
import re
import os
import urllib.request
from pathlib import Path


def ping_telemetry(script_name: str):
    """Fire-and-forget telemetry ping. Fails silently."""
    endpoint = os.environ.get("ADS_TELEMETRY_URL")
    if not endpoint:
        return
    try:
        urllib.request.urlopen(f"{endpoint}/skill-fired/{script_name}", timeout=2)
    except Exception:
        pass


CHECKS = [
    # Semantic HTML
    {
        "name": "No semantic landmarks",
        "pattern": r"<(?:nav|main|section|article|aside|header|footer)[\s>]",
        "severity": "missing",
        "message": "No semantic HTML landmarks found. Use <nav>, <main>, <section>, <article> instead of bare <div> wrappers."
    },
    {
        "name": "Div soup",
        "pattern": r"<div",
        "severity": "ratio",
        "compare_pattern": r"<(?:nav|main|section|article|aside|header|footer|ul|ol|li|table|form|fieldset|figure|details|summary|dialog)[\s>]",
        "threshold": 0.9,
        "message": "~{ratio}% of container elements are <div>. Use semantic elements where they apply — <nav> for navigation, <section> for grouped content, <article> for standalone content."
    },
    # Interactive accessibility
    {
        "name": "Buttons without accessible labels",
        "pattern": r"<button[^>]*>\s*<(?:svg|img|Icon)",
        "severity": "warning",
        "message": "Icon-only button without visible text. Add aria-label or sr-only text so screen readers and agents know what it does."
    },
    {
        "name": "onClick on non-interactive elements",
        "pattern": r"<(?:div|span|p|td|li)[^>]*onClick",
        "severity": "warning",
        "message": "onClick on a non-interactive element (<div>, <span>, etc.). Use <button> or <a> instead — they get keyboard focus, screen reader announcements, and agent interaction for free."
    },
    {
        "name": "Missing aria-label on icon buttons",
        "pattern": r"aria-label",
        "severity": "missing-if-icons",
        "icon_pattern": r"<(?:button|a)[^>]*>\s*<(?:svg|img|Icon|Lucide)",
        "message": "Icon-only interactive elements found but no aria-label anywhere. Agents and screen readers can't identify these controls."
    },
    # Images
    {
        "name": "Images missing alt text",
        "pattern": r"<img(?![^>]*alt=)[^>]*>",
        "severity": "warning",
        "message": "Image without alt attribute. Every <img> needs alt text (or alt=\"\" for decorative images)."
    },
    {
        "name": "Empty alt on meaningful images",
        "pattern": r'<img[^>]*alt=""[^>]*(?:src=)[^>]*>',
        "severity": "info",
        "message": "Image with empty alt=\"\". This is correct for decorative images, but verify — if the image conveys information, it needs descriptive alt text."
    },
    # Links
    {
        "name": "Generic link text",
        "pattern": r"""(?:>click here<|>here<|>learn more<|>read more<|>link<|"click here"|"here"|"learn more"|"read more")""",
        "severity": "warning",
        "message": "Generic link text detected. Links should describe their destination — 'View pricing' not 'Click here'."
    },
    # Forms
    {
        "name": "Inputs without labels",
        "pattern": r"<(?:input|select|textarea)(?![^>]*aria-label)(?![^>]*id=['\"]([^'\"]+)['\"])",
        "severity": "check",
        "label_pattern": r"<label[^>]*(?:htmlFor|for)=",
        "message": "Form inputs found without associated labels. Use <label htmlFor> or aria-label on every input."
    },
    {
        "name": "Missing form input types",
        "pattern": r'<input(?![^>]*type=)[^>]*>',
        "severity": "info",
        "message": "Input without explicit type attribute. Specify type (email, tel, number, search, etc.) for correct mobile keyboards and validation."
    },
    # Heading hierarchy
    {
        "name": "Multiple h1 elements",
        "pattern": r"<(?:h1|H1)[\s>]",
        "severity": "count",
        "threshold": 2,
        "message": "{count} h1 elements found. One h1 per page — use h2/h3 for subsections."
    },
    {
        "name": "Skipped heading levels",
        "pattern": None,
        "severity": "custom-headings",
        "message": "Heading levels skipped (e.g., h1 → h3). Use sequential heading levels for proper document outline."
    },
    # Focus and keyboard
    {
        "name": "tabIndex > 0",
        "pattern": r"tabIndex=['\"]?[1-9]",
        "severity": "warning",
        "message": "Positive tabIndex detected. This overrides natural tab order and causes confusion. Use tabIndex={0} or tabIndex={-1} only."
    },
    {
        "name": "No focus-visible styles",
        "pattern": r"focus-visible|focus:",
        "severity": "missing",
        "message": "No focus styles detected. Interactive elements need visible focus indicators for keyboard navigation."
    },
]


def check_file(filepath: str) -> list:
    content = Path(filepath).read_text()
    findings = []

    for check in CHECKS:
        severity = check["severity"]

        if severity == "missing":
            matches = re.findall(check["pattern"], content, re.IGNORECASE)
            if not matches:
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"],
                })

        elif severity == "warning":
            matches = re.findall(check["pattern"], content, re.IGNORECASE)
            if matches:
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"],
                    "count": len(matches),
                })

        elif severity == "info":
            matches = re.findall(check["pattern"], content, re.IGNORECASE)
            if matches:
                findings.append({
                    "severity": "info",
                    "name": check["name"],
                    "message": check["message"],
                    "count": len(matches),
                })

        elif severity == "count":
            matches = re.findall(check["pattern"], content, re.IGNORECASE)
            if len(matches) >= check.get("threshold", 2):
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"].format(count=len(matches)),
                })

        elif severity == "ratio":
            div_count = len(re.findall(check["pattern"], content, re.IGNORECASE))
            semantic_count = len(re.findall(check["compare_pattern"], content, re.IGNORECASE))
            total = div_count + semantic_count
            if total > 5 and semantic_count == 0:
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"].format(ratio=100),
                })
            elif total > 10:
                ratio = round(div_count / total * 100)
                if ratio >= check.get("threshold", 0.9) * 100:
                    findings.append({
                        "severity": "info",
                        "name": check["name"],
                        "message": check["message"].format(ratio=ratio),
                    })

        elif severity == "missing-if-icons":
            icons = re.findall(check["icon_pattern"], content, re.IGNORECASE)
            labels = re.findall(check["pattern"], content, re.IGNORECASE)
            if icons and not labels:
                findings.append({
                    "severity": "warning",
                    "name": check["name"],
                    "message": check["message"],
                })

        elif severity == "check":
            inputs = re.findall(check["pattern"], content, re.IGNORECASE)
            labels = re.findall(check["label_pattern"], content, re.IGNORECASE)
            if inputs and not labels:
                findings.append({
                    "severity": "info",
                    "name": check["name"],
                    "message": check["message"],
                })

        elif severity == "custom-headings":
            heading_levels = [int(m) for m in re.findall(r"<[hH]([1-6])[\s>]", content)]
            if heading_levels:
                seen = sorted(set(heading_levels))
                for i in range(len(seen) - 1):
                    if seen[i + 1] - seen[i] > 1:
                        findings.append({
                            "severity": "warning",
                            "name": check["name"],
                            "message": check["message"],
                        })
                        break

    return findings


def main():
    ping_telemetry("accessibility-check")

    if len(sys.argv) < 2:
        print("Usage: python3 accessibility-check.py <file.tsx> [file2.tsx ...]")
        sys.exit(1)

    total_warnings = 0
    total_info = 0

    for filepath in sys.argv[1:]:
        if not Path(filepath).exists():
            print(f"  ERROR: {filepath} not found")
            continue

        print(f"\n  Checking accessibility: {filepath}")
        print(f"  {'=' * 60}")

        findings = check_file(filepath)

        if not findings:
            print(f"  PASS — no accessibility issues detected")
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
