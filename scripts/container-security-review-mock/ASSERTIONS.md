# Scenario Assertions

Use this checklist after each skill run with the mock harness.

> **Scope:** All scenarios below exercise **image mode** only. Prebuild mode (`trivy fs`, `grype dir:.`, `snyk test --all-projects`) is not mocked — test it separately with real scanners and a real project directory.

## `happy`

- Mentions `CVE-2024-1111` and at least one additional CVE (`CVE-2024-9999` or equivalent).
- Includes fixable guidance with a concrete target version for at least one finding.
- Demonstrates multi-scanner merge behavior (same CVE appears in more than one tool input).

## `dedupe`

- Merges `CVE-2025-0101` into a single logical finding.
- Avoids duplicated remediation steps for the same CVE/package pair.
- Uses one consolidated severity/prioritization for the merged finding.

## `no_fix`

- Explicitly states no package-level fixed version is available for `CVE-2025-4040`.
- Provides non-package fallback guidance (monitor vendor advisories, base-image strategy, temporary controls).
- Does not claim a direct package upgrade path for that CVE.

## `mixed`

- Handles `UNKNOWN` and `Negligible` severities without parser/logic failure.
- Produces normalized severity or clear triage ordering despite mixed labels.
- Includes both OS-style and application-style findings in the synthesized output.
