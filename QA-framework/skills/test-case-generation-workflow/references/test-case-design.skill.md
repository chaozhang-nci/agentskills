---
name: test-case-design
description: Draft structured, deterministic QA test cases from clarified requirements.
---

# Test Case Design Skill

## Purpose
Draft structured QA test cases from approved or sufficiently clarified requirements.

## Scenario Categories
Include applicable scenarios from these categories:

1. **Positive tests**: expected successful behavior.
2. **Negative tests**: invalid input, invalid state, rejected action, missing permissions.
3. **Edge tests**: boundaries, empty values, max/min values, duplicate values, unusual states.
4. **Regression tests**: existing behavior likely affected by the change.
5. **Integration tests**: behavior across APIs, services, imports, exports, databases, or third-party systems.
6. **Data validation tests**: source-to-target mapping, calculations, formatting, reconciliation.
7. **Role/permission tests**: allowed and disallowed actions by user type.
8. **Error-handling tests**: user-facing errors, logs, retries, fallback behavior.

## Test Case Writing Rules

- Use deterministic expected results.
- Avoid “verify it works” language.
- Keep each test focused on one main behavior.
- Include preconditions and test data needs.
- Use clear action verbs in steps.
- Reference the requirement or acceptance criterion each case covers.
- Mark assumptions when expected behavior is inferred.
- Do not claim coverage is complete if requirement details are missing.

## Priority Guidance

- `P0`: Critical flow, data integrity, release blocker, compliance, security, or severe user impact.
- `P1`: Main functional behavior or common user workflow.
- `P2`: Secondary behavior, edge case, lower-frequency workflow.
- `P3`: Nice-to-have, cosmetic, or low-risk validation.

## Test Case ID Convention
Use this format unless another convention is provided:

`TC-<AREA>-<###>`

Examples:

- `TC-LOGIN-001`
- `TC-EXPORT-003`
- `TC-VALIDATION-002`

## Output Template

```markdown
| Test Case ID | Title | Type | Priority | Requirement Reference | Preconditions | Test Data | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|---|---|---|
| TC-AREA-001 |  | Positive | P1 |  |  |  | 1.  |  |  |
```
