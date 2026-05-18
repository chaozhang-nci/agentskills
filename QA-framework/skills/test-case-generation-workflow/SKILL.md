---
name: test-case-generation-workflow
description: Use when generating QA test cases from requirements with readiness checks, scenario design, traceability, test data planning, and human-review handoff.
argument-hint: "Paste requirement or acceptance criteria and desired output format"
---

# QA Test Case Generation Workflow Skill

## Purpose
Provide a consistent end-to-end workflow for generating draft QA test cases.

## When To Use
Use this skill when the user asks to create test cases from requirements, stories, design notes, Jira items, or acceptance criteria.

## Workflow
1. Run requirement readiness check using `requirement-readiness-check.skill.md`.
2. If not ready, return `Needs Clarification` or `Blocked` with targeted questions.
3. If ready, draft test cases using `test-case-design.skill.md`.
4. Identify required data using `test-data-needs-analysis.skill.md`.
5. Validate mapping and coverage using `traceability-and-coverage.skill.md`.
6. End with human review handoff using `human-review-handoff.skill.md`.

## Required Output Sections
- Requirement Summary
- Readiness Check
- Test Coverage Matrix
- Test Cases
- Test Data Needs
- Regression Areas
- Human QA Review Notes

## Quality Rules
- Keep expected results deterministic and testable.
- Separate positive, negative, edge, regression, integration, and error-handling scenarios where relevant.
- Mark assumptions and open questions explicitly.
- Keep all output as draft until human QA review.
