# Technical Interview Question Generator

This skill generates a structured technical interview packet in Markdown from candidate, role, and project context.

It is designed for cases where the interviewer wants more than a flat list of questions. The output emphasizes:

- rating matrix and scoring guidance
- interview focus areas and why they matter
- tailored technical and behavioral questions
- what strong answers should contain
- red flags and hiring risks to watch for

## Primary File

- `SKILL.md` — main workflow, decision rules, output requirements, and completion criteria

## References

- `references/esi-career-guides.md` — guidance for using ESI Career Guides context when it is part of the hiring scenario
- `references/output-template.md` — default Markdown structure for the interview packet
- `references/question-design-guidelines.md` — rules for writing high-signal questions and evaluator notes
- `references/role-calibration.md` — calibration guidance by seniority and interview stage

The folder may also contain source materials such as resume files, spreadsheets, or role-specific artifacts used as input context.

## Typical Inputs

- candidate resume or background summary
- target role or likely position
- project or team context
- interview stage
- optional ESI Career Guides materials

## Typical Output

A Markdown interview packet with:

- interview brief
- candidate snapshot
- rating matrix
- focus areas
- questions grouped by area
- what to listen for
- red flags
- overall recommendation notes

## Example Prompts

- `Create a technical interview packet for this resume and target role.`
- `Generate interview questions in Markdown using the candidate resume, project context, and ESI Career Guides materials.`
- `Build a final-round interview guide with scoring rubric, focus areas, strong signals, and red flags.`

## Notes

- The skill should tailor questions to the role and supplied materials rather than generating generic trivia.
- If context is incomplete, the output should state assumptions explicitly.
- When ESI Career Guides context is relevant, the skill should load the dedicated reference before finalizing the packet.