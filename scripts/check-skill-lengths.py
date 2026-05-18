#!/usr/bin/env python3
"""Check SKILL.md files for oversized hot-path context."""

import argparse
import sys
from pathlib import Path


DEFAULT_ALLOWLIST = {
    # Existing debt. This pilot adds the gate before shrinking the next skill.
    "skills/world-build/SKILL.md",
}


def line_count(path: Path) -> int:
    return len(path.read_text(encoding='utf-8').splitlines())


def main() -> int:
    parser = argparse.ArgumentParser(description='Check SKILL.md line counts')
    parser.add_argument('paths', nargs='*', default=['skills'], help='files or directories to scan')
    parser.add_argument('--warn', type=int, default=150, help='warning threshold')
    parser.add_argument('--fail', type=int, default=250, help='failure threshold')
    parser.add_argument('--allow', action='append', default=[], help='allowlisted path substring')
    args = parser.parse_args()

    allowlist = set(args.allow) | DEFAULT_ALLOWLIST
    files = []
    for raw in args.paths:
        path = Path(raw)
        if path.is_file() and path.name == 'SKILL.md':
            files.append(path)
        elif path.is_dir():
            files.extend(path.rglob('SKILL.md'))

    files = sorted(set(files))
    failed = False
    warned = False

    for path in files:
        count = line_count(path)
        allowed = any(token in str(path) for token in allowlist)
        if count > args.fail and not allowed:
            print(f'FAIL {count:4d} {path}')
            failed = True
        elif count > args.warn:
            status = 'WARN-ALLOW' if allowed else 'WARN'
            print(f'{status} {count:4d} {path}')
            warned = True

    if failed:
        return 1
    if warned:
        return 0

    print(f'OK {len(files)} skill files under warn threshold {args.warn}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
