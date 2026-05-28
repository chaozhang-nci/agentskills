#!/usr/bin/env bash
set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export CSR_MOCK_HARNESS_DIR="$HARNESS_DIR"
export CSR_SCENARIO="${CSR_SCENARIO:-happy}"
if [[ -z "${CSR_MOCK_OLD_PATH:-}" ]]; then
  export CSR_MOCK_OLD_PATH="${PATH}"
  export PATH="${HARNESS_DIR}/bin:${PATH}"
fi

echo "Container-security-review mock harness enabled."
echo "  HARNESS:  ${HARNESS_DIR}"
echo "  SCENARIO: ${CSR_SCENARIO}"
echo "  PATH[0]:  ${HARNESS_DIR}/bin"
