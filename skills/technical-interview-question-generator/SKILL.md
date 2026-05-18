---
name: technical-interview-question-generator
description: "generate a structured technical interview question pack from project information, ESI Career Guides context, a candidate resume, and a target role or possible position. use when hiring teams need interview questions, competency areas, a rating matrix, what to probe and why, ideal signals, and red flags in a markdown file."
argument-hint: "Candidate resume, target role, and project context"
---

# Technical Interview Question Generator

## Purpose

Create a role-aware technical interview packet in Markdown using:

- project context and domain materials
- ESI Career Guides information when provided
- candidate resume or career history
- target role, likely position, or interview loop goal

The output should help an interviewer decide what to ask, why it matters, what good answers sound like, how to score responses, and what warning signs to watch for.

Reference: [ESI Career Guides reference](./references/esi-career-guides.md)
Reference: [Output template](./references/output-template.md)
Reference: [Question design guidelines](./references/question-design-guidelines.md)
Reference: [Role calibration](./references/role-calibration.md)

## When to Use

Use this skill when the user asks to:

- generate technical interview questions
- build an interview guide from a resume
- tailor interview questions to a project or domain
- create a hiring packet for a candidate and role
- produce a markdown interview plan with scoring guidance

## Required Inputs

- Candidate resume, profile, or career summary
- Target role or likely position
- Project context, job context, or team context

## Optional Inputs

- ESI Career Guides materials
- Job description
- Interview stage such as phone screen, technical screen, panel, or final loop
- Seniority target
- Technology stack or architecture notes
- Must-test competencies
- Known risks or concerns from screening

## Clarification Rules

If any of the inputs below are missing, ask concise follow-up questions before drafting the final packet:

1. Target role and seniority
2. Interview stage
3. Candidate resume or background summary
4. Project or domain context

If the user only has partial information:

- infer a provisional scope from the available materials
- label assumptions clearly
- avoid inventing candidate experience or project details

## Workflow

1. Identify the hiring goal.
   Determine whether the packet is for screening, deep technical validation, architecture discussion, domain fit, or final-round decision support.
2. Extract candidate signals.
   Pull out technologies, depth indicators, ownership claims, scale claims, domain experience, leadership signals, and potential weak spots from the resume.
3. Extract role expectations.
   Identify required skills, seniority expectations, domain knowledge, communication demands, and likely decision-making scope for the role.
4. Map project-specific risk areas.
   Use project materials, ESI Career Guides context, and team/domain notes to identify what the candidate must understand to succeed in the actual work.
5. Build the competency matrix.
   Choose the most important interview areas, explain why each area matters, and assign relative weight.
6. Draft questions by area.
   Create focused questions that test claims from the resume against role needs and project reality.
7. Add evaluator guidance.
   For every interview question, include both `What you want to hear` and `Red flags`. Do not leave either field out, even when the question seems straightforward.
8. Produce the markdown packet.
   Save or present the final output as a single Markdown document.

## Decision Rules

### Resume-Driven Tailoring

- If the resume claims direct experience with a tool, system, or architecture relevant to the role, include at least one verification question.
- If the resume shows a broad list of tools but limited depth evidence, include questions that separate keyword familiarity from hands-on ownership.
- If the resume lacks a critical skill for the role, include transfer questions that test adjacent capability rather than pretending the skill exists.

### Role and Seniority Calibration

- For junior roles, prefer implementation reasoning, debugging, testing, and learning ability over system-design breadth.
- For mid-level roles, test delivery ownership, tradeoff reasoning, production debugging, and collaboration across functions.
- For senior or staff roles, test architecture judgment, prioritization, failure handling, mentoring, and business-aware tradeoffs.

Load [role-calibration.md](./references/role-calibration.md) when the role level, title, or interview stage needs more precise calibration.

### Project and Domain Calibration

- If the project is domain-heavy, include domain-informed technical questions, not only generic engineering questions.
- If ESI Career Guides materials indicate specific domain priorities, mirror those in the competency areas and rationale.
- If the role is tied to an active project, prefer questions grounded in the likely work instead of trivia.

When ESI Career Guides context is relevant, load [esi-career-guides.md](./references/esi-career-guides.md) before finalizing the interview packet.

## Output Requirements

Generate a Markdown file or Markdown response with these sections in this order.

## 1. Interview Brief

- Candidate name or identifier
- Target role
- Interview stage
- Seniority target
- Context sources used
- Key assumptions

## 2. Candidate Snapshot

Summarize the candidate in decision-useful terms:

- strongest apparent strengths
- likely gaps or uncertain areas
- claims that need validation
- areas that appear especially relevant to the target role

## 3. Rating Matrix

Provide a scoring table like this:

| Area | Why It Matters | Weight | 1 - Weak | 3 - Acceptable | 5 - Strong |
| --- | --- | --- | --- | --- | --- |
| Example area | Link to role/project risk | 20% | Cannot explain basics or only uses buzzwords | Can explain and give one real example | Shows depth, tradeoffs, and ownership |

Weights should sum to 100% when practical.

## 4. Focus Areas

For each interview area, include:

- Area name
- Why this area should be tested
- Evidence from the resume, role, or project context
- Suggested time allocation if relevant

## 5. Questions

For each focus area, include 3 to 6 questions when enough context exists. For each question include:

- The question
- Why this question is being asked
- What you want to hear
- Red flags
- Optional follow-up prompts

`What you want to hear` and `Red flags` are mandatory for every question.

## 6. Overall Recommendation Notes

Include:

- highest-confidence hire signals to confirm
- highest-risk gaps to probe carefully
- any missing information that limits confidence

## Question Design Rules

Load [question-design-guidelines.md](./references/question-design-guidelines.md) when drafting or refining questions.

- Prefer experience-verification questions over textbook trivia.
- Tie questions to the actual role and project context.
- Ask for concrete examples, tradeoffs, failures, debugging stories, and measurable outcomes.
- Separate theoretical understanding from hands-on ownership.
- Avoid asking only stack-specific questions if the role values broader engineering judgment.
- Avoid inventing domain facts not present in the provided materials.

## Quality Checklist

Before finalizing, verify that:

- every focus area maps to the role or project context
- at least some questions verify resume claims directly
- every question includes both `What you want to hear` and `Red flags`
- the scoring matrix is specific enough for interviewers to use consistently
- strong-answer guidance is concrete, not generic
- red flags identify actual hiring risks, not stylistic preferences
- the output is ready to hand to an interviewer without major rewriting

## Output Template

Load [output-template.md](./references/output-template.md) when generating the final packet unless the user explicitly asks for a different format.

Use this structure unless the user requests a different format:

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

## Completion Standard

The skill is complete when the final Markdown packet:

- is tailored to the candidate and role
- includes a usable rating matrix
- explains what areas to assess and why
- provides concrete questions with evaluator guidance
- highlights both positive signals and red flags
- makes any assumptions explicit

## References

- [ESI Career Guides reference](./references/esi-career-guides.md)
- [Output template](./references/output-template.md)
- [Question design guidelines](./references/question-design-guidelines.md)
- [Role calibration](./references/role-calibration.md)

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

## File Naming Guidance

If the user asks to save the output, prefer a clear filename such as:

- `candidate-name-role-interview-packet.md`
- `candidate-name-technical-screen.md`
- `candidate-name-final-loop.md`
