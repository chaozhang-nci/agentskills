Moving Container Security Upstream: Fix CVEs Locally and Early. 

Local CVE remediation with Claude Code — scan, fix, and verify before build and before push, with whichever scanner you already have installed.

Your CI scanner is a smoke alarm that rings after the fire — by the time the pipeline goes red, you've switched tasks and the release has slipped.

There's a tighter loop: scan → prioritized action plan → you approve → fix → rescan evidence. All from your workstation, before push. That's what container-security-review does — a Claude Code skill that turns a CI feedback round-trip into a local review-and-fix pass.

⚡ 1-command setup — `npx skills add essentialsoft/agentskills@container-security-review`. No config or YAML for the skill; Trivy/Grype need zero scanner tokens.

🔍 Auto-detects the compatible scanners you already have — Trivy, Grype, Snyk, Docker Scout, or Prisma — and merges their findings into one prioritized list.

✅ Human-approved fixes with rescan evidence — nothing is touched until you confirm, "fixed" is never claimed without a rescan, and any *newly introduced* CVE is flagged, never suppressed.

Full walkthrough — including a real before/after CVE measurement — here 👇
[LINK TO MEDIUM ARTICLE]

Are you catching CVEs before build, before push — or only after CI runs?

#DevSecOps #ContainerSecurity #ShiftLeft #ClaudeCode #AI

<!-- Attach image: docs/blog/images/01-shift-left-before-after.png
     (before/after pipeline — communicates the value proposition in one glance) -->
