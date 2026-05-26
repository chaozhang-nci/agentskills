# Agent Skills Repository

This repository stores installed agent skills under `skills/` and tracks versions in `skills-lock.json`.

## Prerequisites

- Node.js 18+ (or newer LTS)
- `npx` available in your shell

## Skills CLI

Use the Skills CLI with `npx skills` (plural):

```bash
npx skills --help
```

## Add a Skill

Install a specific skill package from a source repo:

```bash
npx skills add <owner/repo@skill>
```

For this repository, prefer skills from:

- `https://github.com/chaozhang-nci/agentskills`

Example:

```bash
npx skills add chaozhang-nci/agentskills@code-reviewer
```

Non-interactive install (useful for automation):

```bash
npx skills add <owner/repo@skill> -y
```

More examples using this repo:

```bash
npx skills add chaozhang-nci/agentskills@git-commit
npx skills add chaozhang-nci/agentskills@implementation-executor
```

After adding a skill, verify the repo changed:

- New/updated files in `skills/<skill-name>/`
- Updated `skills-lock.json`

## Check for Updates

See whether any installed skills have newer versions:

```bash
npx skills check
```

## Update Skills

Update installed skills to the latest compatible versions:

```bash
npx skills update
```

Then review what changed:

```bash
git status --short
git diff -- skills-lock.json skills/
```

## Typical Workflow

1. Add or update skills with `npx skills add ...` or `npx skills update`.
2. Review modifications in `skills/` and `skills-lock.json`.
3. Run your normal validation checks.
4. Commit the changes.

## Troubleshooting

If `npx skills` is not found:

- Check Node installation: `node -v`
- Check npm/npx installation: `npm -v`
- Retry with a clean cache if needed:

```bash
npm cache verify
```
