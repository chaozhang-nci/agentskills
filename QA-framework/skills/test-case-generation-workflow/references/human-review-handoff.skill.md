---
name: human-review-handoff
description: Package AI-generated QA outputs for human QA review, decision, and follow-up.
---

# Human Review Handoff Skill

## Purpose
Prepare AI-generated QA output for human QA review and approval.

## Use This Skill When
Use at the end of every test case generation response.

## Rules

- State clearly that generated test cases are draft only.
- Highlight assumptions and open questions.
- Recommend a human QA decision.
- Do not mark output as final or approved.
- Make next steps easy for the QA reviewer.

## Decision Values

- `Ready for Review`: draft is usable for QA review.
- `Needs Clarification`: reviewer should resolve questions before approval.
- `Blocked`: output should not be used until missing information is provided.

## Output Template

```markdown
## Human QA Review Notes

**Draft status:** Draft only — human QA approval required.

**Recommended QA decision:** Ready for Review / Needs Clarification / Blocked

### Assumptions to Confirm
- 

### Open Questions
1. 

### Suggested Next Step
- 
```
