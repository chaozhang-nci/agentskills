#!/usr/bin/env bash
set -euo pipefail

HARNESS_DIR="${CSR_MOCK_HARNESS_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SCENARIO="${CSR_SCENARIO:-happy}"

fixture_file() {
  local scanner="$1"
  local path="${HARNESS_DIR}/fixtures/${SCENARIO}/${scanner}.json"
  if [[ ! -f "${path}" ]]; then
    echo "Mock fixture not found: ${path}" >&2
    exit 2
  fi
  echo "${path}"
}
