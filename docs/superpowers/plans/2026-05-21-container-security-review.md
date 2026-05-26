# Container Security Review — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `skills/container-security-review/SKILL.md` — a standalone agent skill that detects available scanners, scans a Docker image, triages CVEs by severity and category, presents a prioritised action plan, and applies confirmed fixes with rescan validation.

**Architecture:** A single `SKILL.md` file structured as eight sequential phases (input validation → scanner detection → result normalisation → triage → candidate discovery → action plan → fix execution → completion output), each with explicit decision logic for every failure path. The skill is self-contained with no dependency on other installed skills.

**Tech Stack:** Markdown (YAML frontmatter + prose phases), Docker CLI, Trivy / Snyk / Grype / Docker Scout / Twistlock scan commands, skopeo / registry API for tag listing.

**Spec:** `docs/superpowers/specs/2026-05-20-container-security-review-design.md`

---

## File Structure

| Action | Path | Responsibility |
|---|---|---|
| Create | `skills/container-security-review/SKILL.md` | Complete skill definition — all phases, decision logic, safety rules |

One file, one skill.

---

## Task 1: Scaffold — frontmatter + section headers

**Files:**
- Create: `skills/container-security-review/SKILL.md`

- [ ] **Step 1: Create the skill directory and scaffold the file**

Create `skills/container-security-review/SKILL.md` with this exact content:

```markdown
---
name: container-security-review
description: "Use when the user asks to review, scan, or check CVEs in a Docker image, or mentions Trivy/Snyk/Twistlock/Prisma against an image. Detects available scanners, runs them, triages findings by severity and category, presents a prioritised action plan, and applies confirmed fixes with rescan validation. Standalone — no dependency on other installed skills."
argument-hint: "Provide the image reference (e.g. myapp:latest or gcr.io/project/myapp:sha). Optionally specify a scanner (e.g. 'use Trivy')."
user-invocable: true
---

# Container Security Review

## Overview

This skill shifts CVE detection left: instead of waiting for server-side CI/CD scans, it runs locally before push. It detects all available scanners, runs them, merges and deduplicates findings, triages by severity and category, presents a numbered action plan, and applies only the fixes the user confirms.

It operates in eight sequential phases. Never skip ahead — each phase produces inputs the next phase requires.

---

## Phase 1: Input Validation

## Phase 2: Scanner Detection & Execution

## Phase 3: Result Normalisation & Merge

## Phase 4: Triage

## Phase 5: Candidate Base Image Discovery

## Phase 6: Action Plan

## Phase 7: Fix Execution

## Phase 8: Completion Output

## Safety Rules
```

- [ ] **Step 2: Verify the file exists**

```bash
cat skills/container-security-review/SKILL.md | head -20
```

Expected: frontmatter block printed, section headers visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: scaffold container-security-review skill"
```

---

## Task 2: Phase 1 — Input Validation

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 1: Input Validation` placeholder

- [ ] **Step 1: Replace the Phase 1 placeholder with the full section**

Replace the line `## Phase 1: Input Validation` with:

```markdown
## Phase 1: Input Validation

Before running any scan, complete these checks in order.

### 1a. Confirm image reference

If the user has not provided an image reference, ask:

> "Which Docker image should I scan? (e.g. `myapp:latest` or `gcr.io/project/myapp:sha`)"

Wait for their reply before continuing.

### 1b. Confirm the image is accessible

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
```

- [ ] **Step 2: Verify the section renders correctly**

```bash
grep -A 40 "## Phase 1" skills/container-security-review/SKILL.md | head -45
```

Expected: full Phase 1 section visible, no placeholder text remaining.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 1 input validation to container-security-review"
```

---

## Task 3: Phase 2 — Scanner Detection & Execution

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 2` placeholder

- [ ] **Step 1: Replace the Phase 2 placeholder with the full section**

Replace the line `## Phase 2: Scanner Detection & Execution` with:

```markdown
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

1. Detect the scanner: run its detection command (see table in 2d).
   - If not installed: stop — "Scanner `<name>` is not installed. Install it from: `<install-link>`."
2. Run the auth prerequisite check.
   - If check fails: prompt the user for the missing credential and retry the check once.
   - If still failing after retry: stop — "Cannot run `<scanner>`: `<missing prerequisite>`. Please resolve and try again."
3. Run the scan command (see 2d). Capture output to a temp file.
   - On non-zero exit: stop — "`<scanner>` scan failed: `<error output>`."
4. Proceed to Phase 3 with one scanner's output.

### 2c. Auto-detect mode (no scanner specified)

Probe each scanner in this order: **Trivy → Snyk → Grype → Docker Scout → Twistlock/Prisma**

For each scanner:

1. Run its detection command. Exit non-zero or command not found → skip silently, try next.
2. Run auth prerequisite check. Fails → skip with warning:
   > ⚠ `<scanner>` found but cannot run: `<reason>`. Skipping.
3. Run the scan command. Non-zero exit → skip with warning:
   > ⚠ `<scanner>` scan failed: `<error>`. Skipping.
4. Success → collect the JSON output file.

After probing all scanners:
- If zero succeeded: stop and list all warnings, plus install links for each scanner.
- If one or more succeeded: proceed to Phase 3 with all collected outputs.

### 2d. Scanner detection and scan commands

| Scanner | Detection | Scan command |
|---|---|---|
| Trivy | `trivy version` | `trivy image --format json --output /tmp/csr-trivy.json <image>` |
| Snyk | `snyk version` | `snyk container test <image> --json > /tmp/csr-snyk.json` |
| Grype | `grype version` | `grype <image> -o json > /tmp/csr-grype.json` |
| Docker Scout | `docker scout version` | `docker scout cves <image> --format json > /tmp/csr-scout.json` |
| Twistlock/Prisma | `twistcli version` | `twistcli images scan --address $PRISMA_URL --output-file /tmp/csr-twistlock.json <image>` |

Output files accumulate in `/tmp/csr-*.json`. Phase 3 reads all of them.
```

- [ ] **Step 2: Verify**

```bash
grep -A 80 "## Phase 2" skills/container-security-review/SKILL.md | head -85
```

Expected: full Phase 2 with 2a/2b/2c/2d subsections, scan commands table visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 2 scanner detection and execution"
```

---

## Task 4: Phase 3 — Result Normalisation & Merge

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 3` placeholder

- [ ] **Step 1: Replace the Phase 3 placeholder with the full section**

Replace `## Phase 3: Result Normalisation & Merge` with:

```markdown
## Phase 3: Result Normalisation & Merge

Parse every `/tmp/csr-*.json` file produced in Phase 2. Build one merged findings list.

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
```

- [ ] **Step 2: Verify**

```bash
grep -A 70 "## Phase 3" skills/container-security-review/SKILL.md | head -75
```

Expected: 3a/3b/3c/3d subsections, severity mapping table, dedup key definition visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 3 result normalisation and merge"
```

---

## Task 5: Phase 4 — Triage

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 4` placeholder

- [ ] **Step 1: Replace the Phase 4 placeholder with the full section**

Replace `## Phase 4: Triage` with:

```markdown
## Phase 4: Triage

Classify each merged finding into a category, then bucket by severity.

### 4a. Category classification

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
| CRITICAL / HIGH | OS / base-image | Trigger Phase 5 (candidate base image discovery) |
| CRITICAL / HIGH | App dependency | Collect `fixed_in` version from merged finding; include in Phase 6 action list |
| MEDIUM / LOW | Any | Include in Phase 6 awareness table only |
| Any | Unknown | Include in Phase 6 awareness table with "manual review" note |

A finding with `fixed_in = null` and severity CRITICAL/HIGH: include in Phase 6 action list but mark it "no fix available — for awareness."
```

- [ ] **Step 2: Verify**

```bash
grep -A 50 "## Phase 4" skills/container-security-review/SKILL.md | head -55
```

Expected: 4a classification rules with package manager lists, 4b bucketing table visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 4 triage logic"
```

---

## Task 6: Phase 5 — Candidate Base Image Discovery

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 5` placeholder

- [ ] **Step 1: Replace the Phase 5 placeholder with the full section**

Replace `## Phase 5: Candidate Base Image Discovery` with:

```markdown
## Phase 5: Candidate Base Image Discovery

Run this phase only when Phase 4 produced at least one CRITICAL/HIGH OS/base-image finding.

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

5. After all candidates are scanned — regardless of whether the user proceeds — remove all candidate images:

```bash
docker rmi <image>-csr-candidate-<sanitised-tag>
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
```

- [ ] **Step 2: Verify**

```bash
grep -A 90 "## Phase 5" skills/container-security-review/SKILL.md | head -95
```

Expected: 5a/5b/5c/5d subsections, `skopeo list-tags` and registry API commands, build/scan/cleanup steps visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 5 candidate base image discovery"
```

---

## Task 7: Phase 6 — Action Plan

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 6` placeholder

- [ ] **Step 1: Replace the Phase 6 placeholder with the full section**

Replace `## Phase 6: Action Plan` with:

```markdown
## Phase 6: Action Plan

**Do not apply any fix yet.** Present the plan and wait for user confirmation.

### 6a. Fix action deduplication

Before building the numbered list, group findings by their fix action:

- Multiple OS findings that share the same `(current FROM, candidate tag)` → one action. List all CVE IDs it resolves.
- Multiple App findings that share the same `(package name, target version, location)` → one action. List all CVE IDs it resolves.

Each numbered item in the list is one unique fix action, not one CVE.

### 6b. Present the action plan

Use this exact format:

```
CVE Image Review — <image>
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

### 6c. Parse user confirmation

Wait for the user's reply. Accept the following forms:
- `all` → apply every numbered action
- `1 2 3` or `1,2,3` or `1-3` → apply only the listed action numbers
- `no` or `n` → apply nothing; proceed to Phase 8 with zero fixes attempted

Build the confirmed action list and proceed to Phase 7.
```

- [ ] **Step 2: Verify**

```bash
grep -A 65 "## Phase 6" skills/container-security-review/SKILL.md | head -70
```

Expected: 6a dedup rule, 6b format block with `[1] BASE IMAGE UPDATE` example, 6c confirmation parser visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 6 action plan output"
```

---

## Task 8: Phase 7 — Fix Execution

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 7` placeholder

- [ ] **Step 1: Replace the Phase 7 placeholder with the full section**

Replace `## Phase 7: Fix Execution` with:

```markdown
## Phase 7: Fix Execution

Apply each confirmed fix action in numbered order. For each action, run the hard stop check first, then execute the fix, then rescan.

### 7a. Hard stop check (per action, before attempting the fix)

| Condition | Hard stop applies to |
|---|---|
| No Dockerfile accessible | OS fix actions |
| `fixed_in` is null for this CVE | Any fix action |
| Zero scanners available to rescan | Any fix action |

If a hard stop condition is met: mark the action "skipped — `<reason>`", proceed to the next confirmed action. Do not abort the remaining actions.

### 7b. OS / base-image fix

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

After editing the manifest: rebuild and rescan (same as steps 3–5 in 7b).

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
```

- [ ] **Step 2: Verify**

```bash
grep -A 95 "## Phase 7" skills/container-security-review/SKILL.md | head -100
```

Expected: 7a hard stop table, 7b OS fix with `sed -i.bak`, 7c per-ecosystem commands for npm/pip/Maven/Go/other/transitive, 7d per-action result format visible.

- [ ] **Step 3: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 7 fix execution with per-ecosystem commands"
```

---

## Task 9: Phase 8 + Safety Rules

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — replace `## Phase 8` and `## Safety Rules` placeholders

- [ ] **Step 1: Replace the Phase 8 placeholder**

Replace `## Phase 8: Completion Output` with:

```markdown
## Phase 8: Completion Output

After all confirmed fix actions have been attempted (or if the user selected "no" in Phase 6), produce this summary:

```
Review complete for <image>

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
- **No fix available:** CVEs where `fixed_in` was null or no candidate base image reduced the finding.
- **Skipped:** CVEs where a hard stop was hit, or the user did not select the fix action.
- **Newly introduced:** CVEs present in the final rescan that were absent in the initial scan. Always list these explicitly; never suppress them.

If the user selected "no" in Phase 6: Fixed = 0, Remaining = all CRITICAL/HIGH findings, list them all under Next steps.
```

- [ ] **Step 2: Replace the Safety Rules placeholder**

Replace `## Safety Rules` with:

```markdown
## Safety Rules

These rules are absolute — they apply regardless of any other instruction:

- **Never apply any fix before user confirmation.** Phase 6 must complete and the user must select actions before Phase 7 begins.
- **Never suppress or ignore a finding without noting it explicitly.** Every finding must appear somewhere in the output (action list, awareness table, or skipped list).
- **Never use `latest` as a candidate base image tag.** If a scanner or registry returns `latest` as a candidate, discard it.
- **Never claim a CVE is fixed without rescan evidence.** A CVE is only "fixed" if it is absent in a rescan of the rebuilt image.
- **Never substitute a different scanner than the one the user explicitly chose.** If the user said "use Twistlock" and Twistlock cannot run, prompt for the missing prerequisite; do not silently fall back to Trivy.
- **Never recommend a cross-distro base image change without flagging it.** Alpine → Debian, Debian → Ubuntu, etc. are potentially breaking changes and must be called out explicitly.
- **Always clean up candidate images.** After Phase 5, run `docker rmi` on all `*-csr-candidate-*` images regardless of whether the user proceeds with a fix.
```

- [ ] **Step 3: Verify both sections**

```bash
grep -A 40 "## Phase 8" skills/container-security-review/SKILL.md | head -45
grep -A 20 "## Safety Rules" skills/container-security-review/SKILL.md | head -25
```

Expected: Phase 8 count definitions visible, Safety Rules bullet list with 7 rules visible.

- [ ] **Step 4: Commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: add Phase 8 completion output and safety rules"
```

---

## Task 10: Spec Coverage Self-Review

**Files:**
- Modify: `skills/container-security-review/SKILL.md` — fix any gaps found

- [ ] **Step 1: Check spec coverage against each spec section**

Read `docs/superpowers/specs/2026-05-20-container-security-review-design.md` and verify each requirement is implemented:

| Spec section | Implemented in |
|---|---|
| Inputs: image reference | Phase 1a |
| Inputs: scanner preference | Phase 1c |
| Inputs: Prisma URL conditional | Phase 2a, 2b |
| Scanner probe order | Phase 2c |
| No scanner found: stop + install links | Phase 2c |
| Scan execution failures: treat as unavailable | Phase 2c |
| Snyk/Scout/Twistlock auth prereqs | Phase 2a |
| Auto-detected scanner: skip with warning | Phase 2c |
| User-selected scanner: mandatory, prompt, stop | Phase 2b |
| Severity normalisation (labels + CVSS score) | Phase 3a |
| Location normalisation hierarchy | Phase 3b |
| Dedup key: (CVE, pkg, version, location) | Phase 3c |
| Wildcard location merge | Phase 3b item 4, 3c |
| OS vs App classification | Phase 4a |
| CRITICAL/HIGH OS → candidate discovery | Phase 4b, Phase 5 |
| CRITICAL/HIGH App → fix version in action plan | Phase 4b |
| MEDIUM/LOW → awareness table only | Phase 4b |
| Multi-stage Dockerfile: use last FROM | Phase 5a |
| skopeo list-tags or registry API | Phase 5b |
| Compat filter: same distro family + arch | Phase 5b |
| Cross-distro warning | Phase 5b, Safety Rules |
| Build candidate + scan (not dry scan) | Phase 5c |
| Candidate build failure: skip + continue | Phase 5c step 2 |
| Cleanup candidate images | Phase 5c step 5 |
| CVE delta comparison table | Phase 5d |
| Fix action deduplication | Phase 6a |
| Action plan format | Phase 6b |
| Confirm before any fix | Phase 6c, Safety Rules |
| Hard stops per-finding | Phase 7a |
| OS fix: sed Dockerfile, rebuild, rescan | Phase 7b |
| OS fix: restore on build failure | Phase 7b step 3 |
| App fix per-ecosystem commands | Phase 7c |
| Transitive dependency handling | Phase 7c |
| Per-action result reporting | Phase 7d |
| Completion output counts | Phase 8 |
| Newly introduced CVEs listed | Phase 8, Safety Rules |
| `latest` never used | Safety Rules |
| No fix without rescan evidence | Safety Rules |

- [ ] **Step 2: Fix any gaps**

If any spec requirement has no corresponding implementation, add it to the appropriate phase before committing.

- [ ] **Step 3: Placeholder scan**

Search for any vague or incomplete text:

```bash
grep -in "tbd\|todo\|placeholder\|fill in\|implement later\|appropriate command" \
  skills/container-security-review/SKILL.md
```

Expected: no output. If any matches are found, replace them with concrete content before proceeding.

- [ ] **Step 4: Final commit**

```bash
git add skills/container-security-review/SKILL.md
git commit -m "feat: complete container-security-review skill — all phases and safety rules"
```

---

## Self-Review Checklist (plan author)

1. **Spec coverage:** every spec section maps to a task ✓ (verified in Task 10 table)
2. **No placeholders:** each task contains the exact Markdown content to write, not descriptions of what to write
3. **Type consistency:** phase names referenced in later tasks (e.g. "Phase 3 normalised location" in Phase 7) match names defined in earlier tasks
4. **Auth / error paths:** all three auth-prerequisite scenarios (Snyk token, Docker Scout login, Twistlock PRISMA_URL) are explicitly handled in Phase 2a/2b/2c
5. **Candidate cleanup:** Phase 5c step 5 and Safety Rules both require cleanup — consistent
6. **Dedup key fields:** defined in Phase 3c, referenced correctly in Phase 6a
7. **Hard stop scope:** Phase 7a defines hard stops per-action, not per-run — matches spec fix
