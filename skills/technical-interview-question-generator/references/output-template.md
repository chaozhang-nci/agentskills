# Output Template

Use this template to generate the final interview packet in Markdown unless the user asks for a different structure.

## Template

```markdown
# Technical Interview Packet

## Interview Brief
- Candidate:
- Target role:
- Interview stage:
- Seniority target:
- Sources used:
- Assumptions:

## Candidate Snapshot
- Strengths:
- Gaps or unknowns:
- Claims to validate:
- Role-relevant background:

## Rating Matrix
| Area | Why It Matters | Weight | 1 - Weak | 3 - Acceptable | 5 - Strong |
| --- | --- | --- | --- | --- | --- |

## Focus Areas

### 1. [Area Name]
- Why this area matters:
- Evidence driving this area:
- Suggested time allocation:

## Questions

### [Area Name]

1. Question: ...
   Why ask: ...
   What you want to hear: ...
   Red flags: ...
   Follow-ups: ...

## Overall Recommendation Notes
- Confirm:
- Probe:
- Missing context:
```

## Output Rules

- Keep the packet concise enough for live interview use.
- Prefer concrete evaluator guidance over long prose.
- Keep assumptions visible near the top.
- If the context is partial, preserve the structure but note uncertainty explicitly.
- Every question must include both `What you want to hear` and `Red flags`.

## File Naming Guidance

If the user asks to save the output, prefer a clear filename such as:

- `candidate-name-role-interview-packet.md`
- `candidate-name-technical-screen.md`
- `candidate-name-final-loop.md`
