#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_DIR="${ROOT_DIR}/reports"
SCENARIOS=(happy dedupe no_fix mixed)

IMAGE="python:3.11-slim"
SKIP_PULL=0
OUT_FILE=""

usage() {
  cat <<'EOF'
Usage:
  scripts/container-security-review-mock/batch-test.sh [--image <image>] [--skip-pull] [--out <file>]

Examples:
  scripts/container-security-review-mock/batch-test.sh
  scripts/container-security-review-mock/batch-test.sh --skip-pull
  scripts/container-security-review-mock/batch-test.sh --image node:20-slim
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      if [[ -z "${2:-}" || "${2:-}" == --* ]]; then
        echo "Error: --image requires a value" >&2; usage; exit 1
      fi
      IMAGE="$2"
      shift 2
      ;;
    --skip-pull)
      SKIP_PULL=1
      shift
      ;;
    --out)
      if [[ -z "${2:-}" || "${2:-}" == --* ]]; then
        echo "Error: --out requires a value" >&2; usage; exit 1
      fi
      OUT_FILE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

mkdir -p "${REPORT_DIR}"

if [[ -z "${OUT_FILE}" ]]; then
  ts="$(date +"%Y%m%d-%H%M%S")"
  OUT_FILE="${REPORT_DIR}/batch-test-${ts}.md"
fi

source "${ROOT_DIR}/setup-env.sh" >/dev/null

if [[ "${SKIP_PULL}" -eq 0 ]]; then
  docker pull "${IMAGE}" >/dev/null
fi

write_assertions() {
  local scenario="$1"
  case "${scenario}" in
    happy)
      cat <<'EOF'
- [ ] Includes `CVE-2024-1111` and at least one additional CVE.
- [ ] Includes at least one concrete fix version.
- [ ] Reflects multi-scanner merge behavior.
EOF
      ;;
    dedupe)
      cat <<'EOF'
- [ ] Merges `CVE-2025-0101` into one logical finding.
- [ ] Avoids duplicate remediation lines for that CVE/package.
- [ ] Uses one consolidated severity/prioritization.
EOF
      ;;
    no_fix)
      cat <<'EOF'
- [ ] Explicitly states no package-level fixed version for `CVE-2025-4040`.
- [ ] Provides fallback guidance (monitor/upstream/base-image strategy).
- [ ] Does not claim a direct package upgrade path for that CVE.
EOF
      ;;
    mixed)
      cat <<'EOF'
- [ ] Handles `UNKNOWN` / `Negligible` severities without failing.
- [ ] Produces normalized triage or clear priority order.
- [ ] Includes both OS-style and app-style findings.
EOF
      ;;
  esac
}

{
  echo "# Container Security Review Batch Test Report"
  echo
  echo "- Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  echo "- Image: \`${IMAGE}\`"
  echo "- Harness: \`${ROOT_DIR}\`"
  echo
  echo "Use this report as a runbook + results log for manual skill validation."
  echo
} > "${OUT_FILE}"

for scenario in "${SCENARIOS[@]}"; do
  export CSR_SCENARIO="${scenario}"

  trivy_ok="fail"
  snyk_ok="fail"
  grype_ok="fail"

  trivy image --format json "${IMAGE}" >/dev/null 2>&1 && trivy_ok="ok"
  snyk container test "${IMAGE}" --json >/dev/null 2>&1 && snyk_ok="ok"
  grype "${IMAGE}" -o json >/dev/null 2>&1 && grype_ok="ok"

  {
    echo "## Scenario: \`${scenario}\`"
    echo
    echo "- Scanner smoke: trivy=\`${trivy_ok}\`, snyk=\`${snyk_ok}\`, grype=\`${grype_ok}\`"
    echo "- Prompt to run:"
    echo "  - \`review CVEs for image ${IMAGE}\`"
    echo
    echo "### Expected Assertions"
    write_assertions "${scenario}"
    echo
    echo "### Actual Output Notes"
    echo "- [ ] Paste/describe skill output highlights here."
    echo "- [ ] Capture mismatches, regressions, or unclear behavior."
    echo
  } >> "${OUT_FILE}"
done

echo "Batch report written to: ${OUT_FILE}"
