---
name: traceability-and-coverage
description: Validate requirement-to-test mapping and identify QA coverage gaps.
---

# Traceability and Coverage Skill

## Purpose
Check whether generated test cases map back to requirements and provide reasonable QA coverage.

## Use This Skill When
Use after drafting test cases and before handing them to human QA for review.

## Coverage Checks
Verify coverage across:

- Each acceptance criterion
- Main user workflows
- Negative paths
- Boundary conditions
- Role and permission behavior
- Data validation rules
- Integration points
- Error handling
- Regression impact

## Coverage Status Values
Use these labels:

- `Covered`: at least one test case directly validates the requirement.
- `Partially Covered`: test cases cover some behavior, but more detail is needed.
- `Not Covered`: no test case currently maps to the requirement.
- `Blocked`: coverage cannot be designed without clarification.

## Output Template

```markdown
## Test Coverage Matrix

| Requirement / Acceptance Criterion | Related Test Case IDs | Coverage Status | Notes |
|---|---|---|---|
|  |  | Covered / Partially Covered / Not Covered / Blocked |  |

## Coverage Gaps
- 

## Recommended Additional Tests
- 
```
