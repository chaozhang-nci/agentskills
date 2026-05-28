#!/usr/bin/env bash
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  set -euo pipefail
fi

SCENARIO="${1:-}"
IMAGE="${2:-python:3.11-slim}"

if [[ -z "${SCENARIO}" ]]; then
  echo "Usage:"
  echo "  source scripts/container-security-review-mock/run-scenario.sh <happy|dedupe|no_fix|mixed> [image]"
  echo
  echo "Example:"
  echo "  source scripts/container-security-review-mock/run-scenario.sh dedupe"
  return 1 2>/dev/null || exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIXTURE_DIR="${ROOT_DIR}/fixtures/${SCENARIO}"

if [[ ! -d "${FIXTURE_DIR}" ]]; then
  echo "Unknown scenario: ${SCENARIO}" >&2
  echo "Available scenarios: happy, dedupe, no_fix, mixed" >&2
  return 1 2>/dev/null || exit 1
fi

# Source harness env in the current shell so PATH and vars persist.
source "${ROOT_DIR}/setup-env.sh"
export CSR_SCENARIO="${SCENARIO}"

echo
echo "Scenario switched."
echo "  IMAGE:    ${IMAGE}"
echo "  SCENARIO: ${CSR_SCENARIO}"
echo
echo "Quick scanner smoke-check:"
trivy image --format json "${IMAGE}" >/dev/null && echo "  - trivy: ok"
snyk container test "${IMAGE}" --json >/dev/null && echo "  - snyk:  ok"
grype "${IMAGE}" -o json >/dev/null && echo "  - grype: ok"
echo
echo "Now invoke the skill in chat:"
echo "  review CVEs for image ${IMAGE}"
echo
echo "Expected assertions for '${CSR_SCENARIO}':"
case "${CSR_SCENARIO}" in
  happy)
    echo "  - Should include CVE-2024-1111 and CVE-2024-9999."
    echo "  - Should show at least one fixable path (fixed version present)."
    echo "  - Should reflect multi-scanner input (same CVE appears in multiple tools)."
    ;;
  dedupe)
    echo "  - CVE-2025-0101 should be merged/deduped (not repeated as separate findings)."
    echo "  - Consolidated severity should be high-level or above."
    echo "  - Action plan should avoid duplicate remediation lines for the same CVE/package."
    ;;
  no_fix)
    echo "  - CVE-2025-4040 should be called out as no fixed package version."
    echo "  - Output should include fallback guidance (monitor/upstream/base-image strategy)."
    echo "  - Should avoid claiming an immediate package-level patch exists."
    ;;
  mixed)
    echo "  - Should handle non-standard severities (UNKNOWN/Negligible) without crashing."
    echo "  - Should still produce normalized triage output with a sensible priority order."
    echo "  - Should include both OS and app-package style findings."
    ;;
esac
