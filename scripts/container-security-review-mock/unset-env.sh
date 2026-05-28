#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${CSR_MOCK_OLD_PATH:-}" ]]; then
  export PATH="${CSR_MOCK_OLD_PATH}"
  unset CSR_MOCK_OLD_PATH
fi

unset CSR_MOCK_HARNESS_DIR
unset CSR_SCENARIO

echo "Container-security-review mock harness disabled."
