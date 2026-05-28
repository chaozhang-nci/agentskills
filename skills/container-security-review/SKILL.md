---
name: container-security-review
description: "Use when the user asks to review, scan, or check CVEs either before image build (source/dependency prebuild mode) or on a built Docker image. Detects available scanners, runs them in mode-appropriate commands, triages findings by severity and category, presents a prioritised action plan, and applies confirmed fixes with rescan validation. Standalone — no dependency on other installed skills."
argument-hint: "Provide either an image reference (e.g. myapp:latest) for image mode, or ask for prebuild/source scan mode (no image required). Optionally specify a scanner (e.g. 'use Trivy')."
user-invocable: true
---

# Container Security Review

## Overview

This skill shifts CVE detection left: instead of waiting for server-side CI/CD scans, it runs locally before push. It supports two execution modes:
- **Image mode**: scan a built image tag.
- **Prebuild mode**: scan the source/dependency manifests before image build.

In both modes, it detects available scanners, runs them, merges and deduplicates findings, triages by severity and category, presents a numbered action plan, and applies only the fixes the user confirms.

It operates in sequential phases. Never skip ahead — each phase produces inputs the next phase requires.

---

## Phase 0: Mode Selection

Determine execution mode before any scan command.

- **Prebuild mode triggers**: user says "before build", "prebuild", "scan codebase", "scan source", "scan dependencies", or does not provide an image and asks to scan locally before image creation.
- **Image mode trigger**: user provides an image reference, or explicitly asks to scan an image.

If mode is ambiguous, ask one question:
> "Should I run prebuild source/dependency scan (no image required) or image scan (requires image tag)?"

Use this exact question for ambiguous asks such as "scan my app for CVEs."

Record mode as `MODE=prebuild` or `MODE=image`, then continue.

---

## Phase 1: Input Validation

Before running any scan, complete these checks in order.

### 1a. Confirm image reference

If `MODE=image` and the user has not provided an image reference, ask:

> "Which Docker image should I scan? (e.g. `myapp:latest` or `gcr.io/project/myapp:sha`)"

Wait for their reply before continuing.

### 1b. Confirm the image is accessible

If `MODE=prebuild`, skip this step.

Run:

```bash
docker image inspect <image>
```

If this exits non-zero, the image is not available locally. Attempt to pull:

```bash
docker pull <image>
```

If the pull also fails, stop immediately:

> "Image `<image>` was not found locally and could not be pulled from the registry. Please verify the reference and try again."

Do not proceed to Phase 2.

### 1c. Identify scanner preference

Check the user's message for explicit scanner references: "use Trivy", "run Snyk", "with Twistlock/Prisma", "use Grype", "Docker Scout". Recognised names: `trivy`, `snyk`, `grype`, `docker scout`, `twistlock`, `prisma`, `twistcli`.

- If a scanner is explicitly named: record it as the **mandatory scanner**. Go to Phase 2b.
- If no scanner is named: proceed with **auto-detect mode**. Go to Phase 2c.

## Phase 2: Scanner Detection & Execution

### 2a. Auth prerequisite checks

Before running any scanner, verify its prerequisite:

| Scanner | Prerequisite check |
|---|---|
| Trivy | None — runs unauthenticated |
| Snyk | `echo $SNYK_TOKEN` is non-empty, OR `snyk whoami` exits 0 |
| Grype | None — runs unauthenticated |
| Docker Scout | `docker scout version` exits 0 |
| Twistlock/Prisma | `echo $PRISMA_URL` is non-empty |

### 2b. Mandatory scanner mode (user named a scanner)

0. If `MODE=prebuild` and the mandatory scanner is `docker scout`, `twistlock`, `prisma`, or `twistcli`, stop immediately:
   > ⚠ `<scanner>` supports image scanning only. Cannot run in prebuild mode. Switch to image mode or choose Trivy/Snyk/Grype.
1. Detect the scanner: run its detection command (see table in 2d).
   - If not installed: stop — "Scanner `<name>` is not installed. Install it from: `<install-link>`."
2. Run the auth prerequisite check.
   - If check fails: prompt the user for the missing credential and retry the check once.
   - If still failing after retry: stop — "Cannot run `<scanner>`: `<missing prerequisite>`. Please resolve and try again."
3. Run the scan command (see 2d). Capture output to a temp file.
   - On non-zero exit: for Snyk, apply the exit-code handling note in 2d first; for all others, stop — "`<scanner>` scan failed: `<error output>`."
4. Set `SUCCEEDED_SCANNERS = [<scanner>]`.
5. Proceed to Phase 3 with one scanner's output.

### 2c. Auto-detect mode (no scanner specified)

Probe each scanner in this order: **Trivy → Snyk → Grype → Docker Scout → Twistlock/Prisma**

Maintain an ordered list `SUCCEEDED_SCANNERS` (initially empty). Every successful scan appends its scanner name.

For each scanner:

1. Run its detection command. Exit non-zero or command not found → skip silently, try next.
2. Run auth prerequisite check. Fails → skip with warning:
   > ⚠ `<scanner>` found but cannot run: `<reason>`. Skipping.
3. Run the scan command. Non-zero exit → for Snyk, apply the exit-code handling note in 2d before treating as failure; for all others, skip with warning:
   > ⚠ `<scanner>` scan failed: `<error>`. Skipping.
4. Success → collect the JSON output file and append scanner name to `SUCCEEDED_SCANNERS`.

After probing all scanners:
- If zero succeeded: stop and list all warnings, plus install links for each scanner.
- If one or more succeeded: proceed to Phase 3 with all collected outputs and the persisted `SUCCEEDED_SCANNERS` list.

### 2d. Scanner detection and scan commands

Use mode-specific scan commands:

| Scanner | Detection | Image mode scan command | Prebuild mode scan command |
|---|---|---|---|
| Trivy | `trivy version` | `trivy image --format json --output /tmp/csr-trivy.json <image>` | `trivy fs --format json --output /tmp/csr-prebuild-trivy.json .` |
| Snyk | `snyk version` | `snyk container test <image> --json > /tmp/csr-snyk.json` | `snyk test --all-projects --json-file-output=/tmp/csr-prebuild-snyk.json` |
| Grype | `grype version` | `grype <image> -o json > /tmp/csr-grype.json` | `grype dir:. -o json > /tmp/csr-prebuild-grype.json` |
| Docker Scout | `docker scout version` | `docker scout cves <image> --format json > /tmp/csr-scout.json` | Not supported in prebuild mode (skip with warning) |
| Twistlock/Prisma | `twistcli version` | `twistcli images scan --address $PRISMA_URL --output-file /tmp/csr-twistlock.json <image>` | Not supported in prebuild mode (skip with warning) |

In prebuild mode, if a scanner has no prebuild command, skip with warning:
> ⚠ `<scanner>` supports image scanning only. Skipping in prebuild mode.

Snyk exit-code handling (image and prebuild modes):
- `snyk container test` and `snyk test` may exit non-zero when vulnerabilities are found.
- Treat non-zero as a scanner failure only if JSON output is missing or invalid.
- If valid JSON is produced, treat scan as success and continue.

Output files accumulate in `/tmp/csr-*.json` and `/tmp/csr-prebuild-*.json`. Phase 3 reads all of them.

---

## Phase 3: Result Normalisation & Merge

Parse every Phase 2 output file. Build one merged findings list.

### 3a. Severity normalisation

Apply to every finding before merging:

1. If a severity label is present: uppercase it (`critical` → `CRITICAL`).
2. If only a CVSS score is present (no label): map it:
   - 9.0–10.0 → `CRITICAL`
   - 7.0–8.9 → `HIGH`
   - 4.0–6.9 → `MEDIUM`
   - 0.1–3.9 → `LOW`
3. If neither label nor score is present: mark severity `UNKNOWN` and include in the awareness table only.

Canonical order for "highest severity" comparisons: `CRITICAL > HIGH > MEDIUM > LOW > UNKNOWN`.

### 3b. Location normalisation

For each finding, assign a single normalised location value using the first available:

1. **Layer digest** — the image layer digest string (e.g. `sha256:abc123def456`), if the scanner emits it.
2. **Canonical package path** — the absolute filesystem path of the package manifest or binary (e.g. `/usr/lib/python3/dist-packages/requests-2.28.0.dist-info`).
3. **Package manager scope** — ecosystem identifier + lockfile path (e.g. `npm:/app/package-lock.json`, `pip:/app/requirements.txt`).
4. **Wildcard** — if the scanner omits location entirely, use `*`. A finding with location `*` merges with any other finding that shares the same `(CVE ID, package name, package version)` regardless of location. Note "location unavailable" on the merged finding.

### 3c. Deduplication key

The dedup key is: `(CVE ID, package name, package version, normalised location)`

For every finding across all scanner outputs:
- If the key does not exist in the merged list: add it with its normalised severity and scanner name.
- If the key already exists: update with the highest normalised severity; append the scanner name to the "reported by" list.

### 3d. Merged finding fields

Each entry in the merged list carries:

| Field | Source |
|---|---|
| `cve_id` | Scanner output |
| `severity` | Highest normalised severity across all scanners |
| `package_name` | Scanner output |
| `package_version` | Scanner output |
| `location` | Normalised per 3b |
| `fixed_in` | Scanner output; `null` if no fix version reported |
| `reported_by` | List of scanner names that flagged this finding |

---

## Phase 4: Triage

Classify each merged finding into a category, then bucket by severity.

### 4a. Category classification

In `MODE=prebuild`, classify all findings as **App dependency** unless scanner metadata clearly indicates an OS package manager.

**OS / base-image** — assign this category if any of the following is true:
- The package manager field is a distro package manager: `apt`, `dpkg`, `rpm`, `apk`, `yum`, `zypper`, `tdnf`, `microdnf`
- The package location path starts with `/usr/`, `/lib/`, `/bin/`, `/sbin/`, `/etc/`

**App dependency** — assign this category if any of the following is true:
- The package manager field is a language ecosystem: `npm`, `yarn`, `pip`, `pip3`, `poetry`, `maven`, `gradle`, `go`, `cargo`, `nuget`, `composer`, `bundler`, `gem`
- The location path contains `/app/`, `/src/`, `/home/`, or a language-specific manifest filename (`package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Cargo.toml`, `composer.json`, `Gemfile`)

**Unknown** — if classification cannot be determined from the above rules: flag for manual review, do not propose a fix action, include in the awareness table with a note "category unknown — manual review required."

### 4b. Severity bucketing

| Severity | Category | Next step |
|---|---|---|
| CRITICAL / HIGH | OS / base-image | `MODE=image`: Trigger Phase 5 (candidate base image discovery). `MODE=prebuild`: Do not run Phase 5; carry finding as "image-mode remediation required after build." |
| CRITICAL / HIGH | App dependency | Collect `fixed_in` version from merged finding; include in Phase 6 action list |
| MEDIUM / LOW | Any | Include in Phase 6 awareness table only |
| Any | Unknown | Include in Phase 6 awareness table with "manual review" note |

A finding with `fixed_in = null` and severity CRITICAL/HIGH: include in Phase 6 action list but mark it "no fix available — for awareness."

---

## Phase 5: Candidate Base Image Discovery

Run this phase only when `MODE=image` and Phase 4 produced at least one CRITICAL/HIGH OS/base-image finding.

If no Dockerfile is accessible (checked via `ls Dockerfile` or `find . -name Dockerfile -maxdepth 3`): skip this phase. All OS findings will be listed under "No fix available — Dockerfile not found" in Phase 6.

### 5a. Identify the current base

Read the Dockerfile. Identify the **last** `FROM` line (the final stage, which produces the output image). Extract:
- Registry (default: `docker.io`)
- Image name (e.g. `ubuntu`, `library/python`)
- Tag (e.g. `22.04`, `3.11-slim`)
- Distro family and variant

If intermediate build stages also carry CRITICAL/HIGH OS findings, note them in Phase 8 output as "intermediate stage CVEs — beyond scope of base image replacement."

### 5b. List candidate tags

Prefer `skopeo list-tags` if available:

```bash
skopeo list-tags docker://docker.io/library/<image-name>
```

If `skopeo` is not installed, use the registry tags API:

```bash
curl -s "https://registry.hub.docker.com/v2/namespaces/library/repositories/<image-name>/tags?page_size=100" \
  | grep -o '"name":"[^"]*"' | cut -d'"' -f4
```

For private registries: read credentials from `~/.docker/config.json`. Pass `--creds` to `skopeo` or `Authorization` header to the API call.

Filter the returned tag list:
- Keep only tags in the same distro family and variant (e.g. if current is `ubuntu:22.04`, keep `22.04.x` and `24.04` tags; exclude Alpine, Debian, `latest`, `-rc`, `-beta`)
- Exclude EOL and non-LTS tags
- Sort by recency; keep the top 3

Do not recommend a different distro family or a major runtime version bump without flagging it explicitly:
> ⚠ Candidate `python:3.12-slim` is a major version bump from `python:3.11-slim`. This may introduce breaking changes in your application runtime.

### 5c. Build and scan each candidate

For each of the top 2–3 candidates (limit to avoid excessive build time):

1. Create a modified Dockerfile with the final-stage `FROM` line substituted:

```bash
sed "s|FROM <current-base>|FROM <candidate-tag>|" Dockerfile > /tmp/Dockerfile.csr-candidate
```

2. Build the candidate image:

```bash
docker build -f /tmp/Dockerfile.csr-candidate -t <image>-csr-candidate-<sanitised-tag> .
```

If `docker build` exits non-zero: mark this candidate "build failed — not comparable (`<first line of error>`)", skip to next candidate. Do not stop the phase.

3. Scan the successfully built candidate with the same scanners that succeeded in Phase 2:

```bash
# Trivy example:
trivy image --format json --output /tmp/csr-candidate-<tag>-trivy.json <image>-csr-candidate-<sanitised-tag>
```

4. Parse the candidate scan output using the same normalisation from Phase 3. Count CRITICAL and HIGH findings.

5. Immediately remove this candidate's image (regardless of whether the user will proceed with a fix):

```bash
docker rmi <image>-csr-candidate-<sanitised-tag>
```

After all candidates have been built, scanned, and individually cleaned up, remove the shared temp files:

```bash
rm -f /tmp/Dockerfile.csr-candidate /tmp/csr-candidate-*.json
```

### 5d. Select recommendation

Build a comparison table:

| Candidate | CRITICAL | HIGH | vs current (CRITICAL Δ / HIGH Δ) | Notes |
|---|---|---|---|---|
| ubuntu:22.04.3 | 2 | 1 | −3 / −1 | Same LTS line |
| ubuntu:24.04 | 0 | 0 | −5 / −2 | New LTS line |

Recommend the candidate with the fewest CRITICAL+HIGH findings while staying on the same LTS line. If no candidate reduces CRITICAL/HIGH findings: mark all OS findings as "no safe base upgrade found — no fix available."

Present the table in Phase 6 as part of the OS fix action.

---

## Phase 6: Action Plan

**Do not apply any fix yet.** Present the plan and wait for user confirmation.

### 6a. Fix action deduplication

Before building the numbered list, group findings by their fix action:

- Multiple OS findings that share the same `(current FROM, candidate tag)` → one action. List all CVE IDs it resolves.
- Multiple App findings that share the same `(package name, target version, location)` → one action. List all CVE IDs it resolves.

Each numbered item in the list is one unique fix action, not one CVE.

### 6b. Present the action plan

Use this format (target label depends on mode):

```
CVE Review — <target>
Scanners used: <scanner-1>, <scanner-2>

CRITICAL / HIGH — Action Required (<N> fix actions, resolves <X> CVEs)

[1] BASE IMAGE UPDATE · resolves <CVE-IDs>
    Current: <current-FROM>
    Candidates:
      a) <candidate-a> — <CRITICAL Δ> CRITICAL, <HIGH Δ> HIGH vs current (<note e.g. same LTS line>)
      b) <candidate-b> — <CRITICAL Δ> CRITICAL, <HIGH Δ> HIGH vs current (<note>)
    → Recommend: <candidate-a> (<reason>)

[2] <CVE-ID> · <SEVERITY> · App · <package> <version> · <location>
    Fixed in: <fixed_in>
    → <ecosystem fix command>

[N] <CVE-ID> · <SEVERITY> · <category> · <package> · no fix available
    (listed for awareness — no action possible)

MEDIUM / LOW — For Awareness (<M> CVEs)
| CVE | Severity | Category | Package | Version | Fix available |
|---|---|---|---|---|---|
| CVE-... | MEDIUM | OS | curl | 7.68.0 | yes (7.88.1) |
...

Proceed with the action plan above? (all / select numbers / no)
```

If `MODE=prebuild`, omit `BASE IMAGE UPDATE` entries and include this note once:
> "Base-image upgrade actions require image mode after build."

### 6c. Parse user confirmation

Wait for the user's reply. Accept the following forms:
- `all` → apply every numbered action
- `1 2 3` or `1,2,3` or `1-3` → apply only the listed action numbers
- `no` or `n` → apply nothing; proceed to Phase 8 with zero fixes attempted

Build the confirmed action list and proceed to Phase 7.

---

## Phase 7: Fix Execution

Apply each confirmed fix action in numbered order. For each action, run the hard stop check first, then execute the fix, then rescan.

### 7a. Hard stop check (per action, before attempting the fix)

| Condition | Hard stop applies to |
|---|---|
| No Dockerfile accessible | OS fix actions (image mode only) |
| `fixed_in` is null for this CVE | Any fix action |
| Zero scanners available to rescan | Any fix action |

If a hard stop condition is met: mark the action "skipped — `<reason>`", proceed to the next confirmed action. Do not abort the remaining actions.

### 7b. OS / base-image fix

If `MODE=prebuild`, do not attempt this section. Mark OS actions:
> skipped — base-image remediation is image-mode only.

1. Record the original final-stage FROM line.
2. Update the Dockerfile in-place (the real Dockerfile, not a temp copy):

```bash
sed -i.bak "s|FROM <current-base>|FROM <confirmed-candidate>|" Dockerfile
```

3. Rebuild:

```bash
docker build -t <image> .
```

On `docker build` failure: restore the backup (`mv Dockerfile.bak Dockerfile`), mark action "failed — build error: `<first error line>`", proceed to next action.

4. Rescan with every scanner that succeeded in Phase 2 (same commands as Phase 2d, same output paths).

5. For each CVE this action was meant to resolve, report one of:
   - **fixed** — absent in rescan
   - **still present** — present in rescan with same version
   - **newly introduced** — present in rescan but absent in original scan (flag prominently)

6. **Adaptive skip:** after reporting, check the remaining confirmed actions. For each remaining action, if every CVE it was meant to resolve is already absent in this rescan, mark that action "fixed by earlier action — skipping" and remove it from the execution queue. Do not attempt or report it as a separate action.

### 7c. App dependency fix

Determine the ecosystem from the finding's location field (Phase 3 normalised location).

**npm / yarn** (location contains `package.json` or `package-lock.json` or `yarn.lock`):
```bash
cd <directory-containing-package.json>
npm install <package>@<fixed_in>
# commit the updated lock file along with package.json changes
```

**pip** (location contains `requirements.txt`, `pyproject.toml`, or `setup.cfg`):
- Edit the version pin in the manifest file: change `<package>==<current>` to `<package>==<fixed_in>` (or `>=<fixed_in>` if the manifest uses range constraints).
- If `pip-compile` is available (`which pip-compile` exits 0): run `pip-compile` in the same directory.

**Maven** (location contains `pom.xml`):
- Edit `pom.xml`: find the `<dependency>` block for `<artifactId><package></artifactId>` and update `<version>` to `<fixed_in>`.

**Go** (location contains `go.mod` or `go.sum`):
```bash
cd <directory-containing-go.mod>
go get <module>@<fixed_in>
go mod tidy
```

**Other ecosystems:** identify the manifest file from the normalised location path. Edit the version constraint for `<package>` to `<fixed_in>` directly.

**Transitive dependency handling:** if `<package>` does not appear as a direct dependency in the manifest:
1. Check if any direct dependency can be upgraded to a version that uses `<fixed_in>` or later as its transitive. If yes, upgrade the direct dependency instead.
2. If not, pin the transitive dependency directly (add an explicit entry in the manifest at `<fixed_in>`). Note in the completion output: "Pinned transitive dependency `<package>` to `<fixed_in>` directly."

After editing the manifest:
- If `MODE=image`: rebuild and rescan using the same steps as 7b — `docker build -t <image> .`, then rescan with scanner commands from Phase 2d for scanners listed in `SUCCEEDED_SCANNERS`.
- If `MODE=prebuild`: do not run `docker build`. Re-run only prebuild scanner commands from Phase 2d for scanners listed in `SUCCEEDED_SCANNERS`.

Snyk-specific rescan handling:
- During rescan, do not treat Snyk non-zero exit as automatic failure.
- If the expected Snyk JSON output exists and parses, treat the rescan as successful and continue CVE comparison.
- Mark Snyk as failed only when JSON output is missing/invalid.

Then report each CVE as fixed / still present / newly introduced.

### 7d. Per-action result reporting

After each fix action completes (or is skipped), report to the user:

```
Action [N] result: <fixed | failed | skipped>
  Fixed CVEs:           <list>
  Still present CVEs:   <list>
  Newly introduced CVEs: <list> ← investigate before pushing
  Reason (if skipped/failed): <text>
```

Then proceed to the next confirmed action.

---

## Phase 8: Completion Output

After all confirmed fix actions have been attempted (or if the user selected "no" in Phase 6), produce this summary:

```
Review complete for <target>

Scanners used:     <list>

Fixed:             <N> CVEs  — <list of CVE IDs>
Remaining:         <M> CVEs  — <list of CVE IDs + why still present>
No fix available:  <K> CVEs  — <list of CVE IDs>
Skipped:           <S> CVEs  — <list of CVE IDs, reason per item>
Newly introduced:  <P> CVEs  — <list of CVE IDs> ← INVESTIGATE BEFORE PUSHING

Next steps:
<list any CRITICAL/HIGH CVEs that remain unfixed with suggested manual actions>
```

Count definitions:
- **Fixed:** CVEs absent in the final rescan that were present in the initial scan.
- **Remaining:** CVEs confirmed present in the final rescan after an attempted fix.
- **No fix available:** CVEs where `fixed_in` was null, or (in `MODE=image`) no candidate base image reduced the finding, or (in `MODE=prebuild`) remediation requires a later image-mode run.
- **Skipped:** CVEs where a hard stop was hit, or the user did not select the fix action.
- **Newly introduced:** CVEs present in the final rescan that were absent in the initial scan. Always list these explicitly; never suppress them.

If the user selected "no" in Phase 6: Fixed = 0, Remaining = all CRITICAL/HIGH findings, list them all under Next steps.

In `MODE=prebuild`, include one extra next step:
- "After building the image, run image mode to cover OS/base-image CVEs."

## Safety Rules

### Universal rules

- **Never apply any fix before user confirmation.** Phase 6 must complete and the user must select actions before Phase 7 begins.
- **Never suppress or ignore a finding without noting it explicitly.** Every finding must appear somewhere in the output (action list, awareness table, or skipped list).
- **Never claim a CVE is fixed without rescan evidence.** A CVE is only "fixed" if it is absent in a rescan of the rebuilt image (`MODE=image`) or the rescanned source directory (`MODE=prebuild`).
- **Never substitute a different scanner than the one the user explicitly chose.** If the user said "use Twistlock" and Twistlock cannot run, prompt for the missing prerequisite; do not silently fall back to Trivy.

### Mode-specific rules

- **In `MODE=prebuild`:** Never run `docker build`, `docker pull`, or `docker image inspect` unless the user explicitly asks to switch to image mode.
- **In `MODE=image` when candidate tags are evaluated:** Never use `latest` as a candidate base image tag. If a scanner or registry returns `latest`, discard it.
- **In `MODE=image` when base-image changes are recommended:** Never recommend a cross-distro base image change without flagging it. Alpine → Debian, Debian → Ubuntu, etc. are potentially breaking changes and must be called out explicitly.
- **In `MODE=image` when Phase 5 executes:** Always clean up candidate images. See Phase 5c — each candidate image is removed immediately after it is scanned, before building the next one.
