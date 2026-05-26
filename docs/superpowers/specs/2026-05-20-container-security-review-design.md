# Container Security Review Skill — Design Spec

**Date:** 2026-05-20
**Status:** Approved

---

## Problem

CVE findings in container images are currently caught server-side (CI/CD build, Twistlock/Prisma scan). By that point the feedback loop is slow. This skill shifts that check left: run locally before push, triage immediately, and confirm before acting.

---

## Scope

- **In scope:** Docker image CVE review — detect installed scanners, run them, merge results, triage by severity, produce a prioritised action plan, confirm before any fix
- **Out of scope:** Non-image scanning (filesystem, IaC, code), automated deployment, CI/CD pipeline integration

---

## Skill Identity

| Field | Value |
|---|---|
| Name | `container-security-review` |
| Trigger | User asks to review/scan/check CVEs in a Docker image, or mentions Trivy/Snyk/Twistlock/Prisma against an image |
| Portability | Standalone — no dependency on other installed skills |
| Installation | `npx skills add chaozhang-nci/agentskills@container-security-review` |

---

## Inputs

- **Image reference** (required): local image name/tag, or registry path (e.g. `myapp:latest`, `gcr.io/project/myapp:sha`)
- **Scanner** (optional): user may specify one scanner explicitly (e.g. "use Twistlock", "run Prisma scan"); otherwise auto-detect
- **Prisma/Twistlock URL** (conditional): required when `twistcli` is the scanner; read from `PRISMA_URL` env var or prompt user

---

## Scanner Detection & Execution

Probe for installed scanners in this order. Run all found scanners unless the user specifies one.

| Scanner | Detection | Scan command |
|---|---|---|
| Trivy | `trivy version` | `trivy image --format json <image>` |
| Snyk | `snyk version` | `snyk container test <image> --json` |
| Grype | `grype version` | `grype <image> -o json` |
| Docker Scout | `docker scout version` | `docker scout cves <image> --format json` |
| Twistlock / Prisma | `twistcli version` | `twistcli images scan --address $PRISMA_URL <image>` |

**If no scanner is found:** stop, list the above options with install links, do not proceed.

**Unavailable scanner fallback (auto-detected scanners):** if a scanner was auto-detected but cannot run (e.g. `twistcli` found but `PRISMA_URL` not set), skip it with an explicit warning and continue with the remaining available scanners. Only block the entire review if zero scanners can run.

**Scan execution failures:** a scanner that is detected and launched may still fail during the scan itself (auth token missing, network timeout, registry unreachable, insufficient permissions). Treat a scan execution failure the same as an unavailable scanner: skip with an explicit warning (`<scanner> scan failed: <error>`), continue with remaining scanners. Known prerequisites to check before running:
- Snyk: requires `snyk auth` or `SNYK_TOKEN` env var
- Docker Scout: requires `docker login`
- Twistlock/Prisma: requires `PRISMA_URL` and valid credentials

**User-selected scanner is mandatory:** if the user explicitly chose a scanner (e.g. "use Twistlock") and it cannot run, do not silently fall back — prompt for the missing prerequisite (e.g. `PRISMA_URL`) and retry. If the prerequisite is still unavailable after prompting, stop and report the blocker. Never substitute a different scanner without user consent.

**Multi-scanner merge:** deduplicate findings by a normalised `(CVE ID, package name, package version, location)` key. A single CVE can affect multiple packages or layers; deduping by CVE ID alone would collapse distinct remediation items.

Location normalisation hierarchy (apply the first that is available):
1. **Layer digest** — use the image layer digest (e.g. `sha256:abc…`) if the scanner emits it.
2. **Canonical package path** — use the absolute file path of the package manifest or binary (e.g. `/usr/lib/python3/dist-packages/requests-2.28.0.dist-info`).
3. **Package manager scope** — use the ecosystem + lockfile path (e.g. `npm:/app/package-lock.json`).
4. **No location** — if the scanner omits location entirely, treat location as `*` (wildcard) and merge with any other finding that shares the same `(CVE, package, version)` regardless of location; note in output that location was unavailable.

**Severity normalisation:** before merging, normalise all severity values to a canonical ordered set: `CRITICAL > HIGH > MEDIUM > LOW`. Map CVSS scores to labels when a label is absent: 9.0–10.0 → CRITICAL, 7.0–8.9 → HIGH, 4.0–6.9 → MEDIUM, 0.1–3.9 → LOW. Normalise label casing (e.g. `critical` → `CRITICAL`).

If the same normalised tuple appears in multiple scanner outputs, use the highest normalised severity and note which scanners flagged it.

---

## Triage Logic

Classify each finding into one of two categories:

- **OS / base-image layer:** CVEs in OS packages, system libraries, or the base image itself (e.g. `libc`, `openssl`, distro packages)
- **App dependency:** CVEs in language-ecosystem packages (npm, pip, Maven, Go modules, etc.)

Then bucket by severity:

| Severity | Category | Action |
|---|---|---|
| CRITICAL / HIGH | OS / base-image | Case-by-case: show CVE + affected package + candidate base image tags (see discovery step below); ask user which (if any) to apply |
| CRITICAL / HIGH | App dependency | Show CVE + package + recommended upgrade version; ask user to confirm before applying |
| MEDIUM / LOW | Any | Summarise in a table; no action proposed unless user asks |

---

## Candidate Base Image Discovery

When a CRITICAL/HIGH CVE is in the OS/base-image layer, identify candidate replacement tags before presenting the action plan:

1. **Determine current base:** identify the final stage `FROM` line in the Dockerfile (the last `FROM` in the file, which produces the final image). Note the distro family, major version, and variant (e.g. `ubuntu`, `22.04`, `slim`). If intermediate build stages also carry CRITICAL/HIGH CVEs, note them separately — but candidate replacement applies only to the final stage.
2. **List candidate tags:** use `skopeo list-tags docker://<registry>/<image>` (not `skopeo inspect`) to retrieve available tags. For Docker Hub official images, the registry is `docker.io/library/<image>`. For private registries, read auth from `~/.docker/config.json`. If `skopeo` is unavailable, call the registry tags API directly: `GET https://<registry>/v2/<name>/tags/list`. Filter results to patch/minor tags in the same distro family and LTS line (e.g. `ubuntu:22.04.x`, `ubuntu:24.04`). Exclude `latest` and non-LTS tags.
3. **Filter by compatibility:** only surface candidates that share the same distro family and CPU architecture. Do not recommend a different distro (e.g. Alpine → Debian) or a major runtime version bump (e.g. `python:3.11` → `python:3.12`) without flagging it explicitly as a potentially breaking change.
4. **Build and scan each candidate:** for each shortlisted candidate tag (limit to top 2–3 by registry metadata freshness to keep build time reasonable), substitute the final-stage `FROM` line and build a temporary image (e.g. `docker build -t <image>-csr-candidate-<tag> .`). If a candidate build fails (e.g. a package in a `RUN` step is unavailable in the new base), mark it "build failed — not comparable", skip it, and continue with the next candidate. Scan each successfully built candidate with the same scanner(s) and report the CVE delta against the current image. After the comparison table is presented — regardless of the user's choice — remove all candidate images: `docker rmi <image>-csr-candidate-<tag>`.
5. **If no compatible candidate reduces CVEs:** report that no safe base upgrade is available for this CVE; list it under "No fix available."

---

## Action Plan Output

Present a numbered, prioritised list before touching anything:

```
CVE Image Review — <image>
Scanners used: Trivy, Snyk

CRITICAL / HIGH — Action Required (N findings)

[1] CVE-2024-XXXX · CRITICAL · OS · openssl 3.0.2 (base: ubuntu:22.04)
    Fixed in: openssl 3.0.7
    Candidate base images: ubuntu:22.04.3, ubuntu:24.04
    → Recommend: update FROM to ubuntu:22.04.3 (fewer CVEs, same LTS line)

[2] CVE-2023-YYYY · HIGH · App · lodash 4.17.20 (package.json)
    Fixed in: lodash 4.17.21
    → Recommend: upgrade lodash to 4.17.21

MEDIUM / LOW — For Awareness (M findings)
[table summary — CVE, severity, package, fix available y/n]

Proceed with the action plan above? (all / select numbers / no)
```

**Fix action deduplication:** before presenting the list, group findings by their fix action — multiple CVEs that share the same `(package, target-version)` or `(FROM-line, candidate-tag)` are resolved by one fix. Present one numbered action per unique fix, listing all CVE IDs it resolves. Apply each fix action once, not once per CVE.

User selects which items to apply. The skill applies them in order, one at a time, and reports the result of each before moving to the next.

---

## Fix Behaviour (Post-Confirmation)

### OS / base-image fixes
1. Update the `FROM` line in the Dockerfile to the confirmed candidate
2. Rebuild the image: `docker build -t <image> .`
3. Rescan with the same scanner(s) to confirm the CVE is gone
4. Report: fixed / still present / newly introduced

### App dependency fixes
1. Apply the package upgrade using the ecosystem-appropriate command:
   - **npm/yarn:** `npm install <pkg>@<version>` (commit updated `package-lock.json` / `yarn.lock`)
   - **pip:** update the version pin in `requirements.txt` or `pyproject.toml`; run `pip-compile` if pip-tools is in use
   - **Maven:** update the `<version>` tag in `pom.xml`
   - **Go:** `go get <module>@<version>` then `go mod tidy` (commit updated `go.sum`)
   - **Other ecosystems:** identify the manifest file from the scanner's reported location and edit the version constraint directly
   - **Transitive dependencies:** if the vulnerable package is not a direct dependency, either upgrade the direct dependency that pulls it in (if a version exists that uses a safe transitive), or pin the transitive dependency directly. Note in the output which approach was taken.
2. Rebuild the image: `docker build -t <image> .`
3. Rescan with the same scanner(s) to confirm
4. Report result

### Hard stops (per finding — skip this item, continue remaining)
- No Dockerfile is accessible for this OS fix
- No fixed version exists for this CVE
- Scanner rescan cannot be run after this fix

When a hard stop is hit on a finding, mark it "skipped — [reason]" in the completion output and move to the next confirmed action. Do not abort the entire run.

---

## Completion Output

After all confirmed actions are attempted:

```
Review complete for <image>

Fixed:             N CVEs
Remaining:         M CVEs (details below)
No fix available:  K CVEs (listed for awareness)
Skipped:           S CVEs (reason per item)
Newly introduced:  P CVEs (listed below if P > 0)

Next steps: [list any remaining HIGH+ that could not be fixed]
```

---

## Safety Rules

- Never apply any fix before user confirmation
- Never suppress or ignore a finding without noting it explicitly
- Never use `latest` as a candidate base image tag
- Never claim a CVE is fixed without rescan evidence
- If `PRISMA_URL` is not set and Twistlock is the **user-chosen** scanner, prompt for it — do not silently skip or substitute another scanner
