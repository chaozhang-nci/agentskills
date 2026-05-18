---
name: requirement-readiness-check
description: Assess whether requirements are sufficiently clear and testable before drafting QA test cases.
---

# Requirement Readiness Check Skill

## Purpose
Determine whether a requirement is clear enough for test case generation.

## Use This Skill When
Use before generating test cases from a requirement, story, design, Jira ticket, or acceptance criteria.

## Checklist
Evaluate whether the requirement includes:

- Business objective or user value
- In-scope behavior
- Out-of-scope behavior, if relevant
- Acceptance criteria
- Preconditions
- User roles and permissions
- Workflow states or status transitions
- Validation rules
- Error messages or failure behavior
- Data fields, schemas, mappings, or calculations
- Integration dependencies
- Audit, logging, notification, or reporting requirements
- Performance, security, accessibility, or compatibility constraints, if relevant

## Decision Rules
Return one of these decisions:

- `Ready for Test Design`: enough information exists to draft useful test cases.
- `Needs Clarification`: useful scenarios can be identified, but expected behavior is partially unclear.
- `Blocked`: test cases would require guessing core behavior.

## Output Template

```markdown
## Requirement Readiness Check

**Decision:** Ready for Test Design / Needs Clarification / Blocked

### Confirmed Behavior
- 

### Missing or Ambiguous Information
- 

### Assumptions
- 

### Clarification Questions
1. 

### QA Risk Level
Low / Medium / High

### Suggested Test Areas
- 
```
