---
name: test-data-needs-analysis
description: Identify and structure test data requirements needed to execute drafted QA test cases.
---

# Test Data Needs Analysis Skill

## Purpose
Identify the data required to execute generated test cases.

## Use This Skill When
Use when drafting test cases or preparing test execution support.

## Data Categories
Identify data needs for:

- Valid happy-path records
- Invalid records
- Boundary values
- Missing required fields
- Duplicate records
- Conflicting records
- Permission-specific users
- Historical records
- Status-specific records
- Source and target reconciliation data
- Regression baseline data

## Rules

- Do not create final test data from unclear business rules.
- Mark synthetic data clearly.
- Avoid sensitive production data unless the user explicitly provides approved sanitized data.
- Include schema or validation dependencies when known.
- Separate “needed data” from “example data.”

## Output Template

```markdown
## Test Data Needs

| Data Need ID | Related Test Case IDs | Data Type | Required Fields / Conditions | Example Value | Notes |
|---|---|---|---|---|---|
| TD-001 |  | Valid / Invalid / Edge / Regression |  |  |  |
```
