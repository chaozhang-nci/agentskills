# Container Security Review Mock Harness

Deterministic local test harness for the `container-security-review` skill.

This harness provides mock scanner binaries (`trivy`, `snyk`, `grype`) that:
- answer `version` checks
- emit stable JSON scan outputs
- support multiple test scenarios via an env var

It does **not** mock Docker. The skill still uses your real `docker image inspect` / `docker pull` checks.

## Quick Start

1. Switch scenario in one command (recommended):

```bash
source scripts/container-security-review-mock/run-scenario.sh happy
# scenarios: happy, dedupe, no_fix, mixed
```

2. (Alternative) Start a shell with the mock scanners prepended to `PATH`:

```bash
source scripts/container-security-review-mock/setup-env.sh
```

3. Pull a test image once (real Docker):

```bash
docker pull python:3.11-slim
```

4. In chat, invoke the skill:

```text
review CVEs for image python:3.11-slim
```

5. Change scenario and re-run:

```bash
source scripts/container-security-review-mock/run-scenario.sh dedupe
```

## Scenarios

- `happy` (default): mixed OS/app findings with fixable versions
- `dedupe`: duplicate CVEs across scanners to test merge behavior
- `no_fix`: includes high-severity findings with no `fixed_in`
- `mixed`: includes unknown severity and mixed categories

## Mode Support

This harness covers **image mode only**. The mock binaries respond to image-scan commands:

| Scanner | Mocked command |
|---------|---------------|
| Trivy | `trivy image --format json ...` |
| Snyk | `snyk container test ...` |
| Grype | `grype <image> ...` |

**Prebuild mode is not mocked.** Prebuild commands (`trivy fs`, `grype dir:.`, `snyk test --all-projects`) pass through to real scanner binaries. To test prebuild mode, unset the mock harness first:

```bash
source scripts/container-security-review-mock/unset-env.sh
```

Then invoke the skill with a real project directory and real scanners installed.

## What This Validates

- scanner detection flow (`version` probes)
- scanner execution flow and JSON parsing
- severity normalization
- multi-scanner dedupe and merge
- triage/action-plan shaping
- image-mode action plan and fix flow

## Notes

- This harness covers image mode scenarios only. Prebuild mode requires real scanner binaries.
- This harness is intentionally scanner-focused. It does not simulate Docker build failures.
- Scenario-specific pass/fail expectations live in `scripts/container-security-review-mock/ASSERTIONS.md`.
- You can generate a full multi-scenario report with:

```bash
scripts/container-security-review-mock/batch-test.sh --skip-pull
```

- Reports are written to `scripts/container-security-review-mock/reports/`.
- To stop using mocks in current shell:

```bash
source scripts/container-security-review-mock/unset-env.sh
```
