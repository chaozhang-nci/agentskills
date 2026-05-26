# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a personal skills practice repository. It stores agent skills under `skills/` and a QA automation framework under `QA-framework/`. No build system or test runner — it's a collection of Markdown-based skill definitions and agent configurations.

## Skills CLI

Skills are managed via the `npx skills` CLI (requires Node.js 18+):

```bash
# Install a skill from a source repo
npx skills add chaozhang-nci/agentskills@<skill-name>

# Non-interactive install
npx skills add chaozhang-nci/agentskills@<skill-name> -y

# Check for updates to installed skills
npx skills check

# Update all installed skills
npx skills update
```

After adding/updating skills, review changes in `skills/<skill-name>/` and `skills-lock.json`.

## Repository Structure

### `skills/`
Each subdirectory is a standalone skill with a `SKILL.md` as its entry point. The frontmatter in `SKILL.md` defines metadata (`name`, `description`, `allowed-tools`, `license`). Skills may also include:
- `agents/` — sub-agent definitions for multi-agent workflows
- `references/` — supporting reference documents
- `scripts/` — helper scripts the skill invokes

### `QA-framework/`
A self-contained AI-assisted QA framework with its own `AGENTS.md` (global rules), `agents/` (specialized agent definitions), and `skills/` (QA-specific skills). The framework follows a human-in-the-loop policy — all AI outputs are advisory and require human QA approval before becoming final.

**QA Agent chain (typical flow):**
1. `prd-web-discovery` → scans a website into a PRD
2. `requirements-review` → assesses readiness (Ready / Needs Clarification / Blocked)
3. `test-case-generator` → drafts test cases with traceability
4. `test-script-generator` → delegates to Playwright agents for automation
5. `playwright-test-healer` → fixes failing Playwright tests

## Skill Authoring Conventions

- `SKILL.md` frontmatter must include `name` and `description`; optionally `allowed-tools` and `license`
- Skill descriptions are used by Claude Code to decide when to invoke the skill — write them precisely
- Skills reference other skills by invoking them (e.g., brainstorming → writing-plans → executing-plans); avoid circular dependencies
- Hard gates (`<HARD-GATE>`) in a skill block implementation until an explicit user approval step is passed
