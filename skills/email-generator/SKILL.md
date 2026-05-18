---
name: email-generator
description: "generate professional interview emails from ESI-style templates, including technical interview invitations and coding test preparation emails, with clear placeholders, polished tone, and complete meeting logistics."
argument-hint: "Email type, candidate name, schedule, interview details, and sender information"
---

# Purpose

Generate clear, professional interview-related email content that follows the style shown in:

- `technical-email-example.md` (ESI Technical Interview Invitation)
- `code-test-email-example.md` (Coding test preparation email)

The output should be ready to send or require only minimal detail substitution.

Reference: [Technical invitation template](./references/technical-invitation-template.md)
Reference: [Code test invitation template](./references/code-test-invitation-template.md)
Reference: [Style guide](./references/style-guide.md)

# When to Use

Use this skill when the user asks to:

- draft an interview invitation email
- draft a coding test preparation email
- rewrite interview emails to match ESI tone
- generate email templates with placeholders
- customize interview communication for different candidates

# Required Inputs

- Email type:
  - `technical-interview-invitation`, or
  - `code-test-invitation`
- Candidate name (or anonymous format if not available)
- Scheduled date and time (or placeholder if scheduling is pending)
- Sender name and title

# Optional Inputs

- Company/team name
- Interview platform details (Teams, CoderPad)
- Meeting join link and dial-in details
- Interview focus topics
- Backup phone-call note
- Observer note
- Time zone
- Closing style preference

# Clarification Rules

If required inputs are missing, ask concise follow-up questions before finalizing.

Ask for these first:

1. Which email type should be generated?
2. Candidate name and preferred greeting style?
3. Date, time, and time zone?
4. Sender signature details?

If meeting logistics are missing:

- For `technical-interview-invitation`, include placeholder fields for join details.
- For `code-test-invitation`, mention that Teams invite will be sent separately.

# Workflow

1. Classify the request.
   Determine whether the user needs `technical-interview-invitation` or `code-test-invitation`.
2. Gather details.
   Collect scheduling, platform, candidate, and sender details.
3. Choose template.
   Load the matching template from `references/`.
4. Fill required sections.
   Ensure all required sections are present and placeholders are resolved when values are available.
5. Apply tone and formatting.
   Keep language warm, concise, and professional.
6. Validate completeness.
   Run the quality checklist and return the final email.

# Decision Rules

## Email Type Branching

- If the goal is to invite the candidate to a specific meeting with concrete Teams details, use `technical-interview-invitation`.
- If the goal is to prepare the candidate for the coding session workflow and tools, use `code-test-invitation`.
- If the request mixes both goals, generate two emails in order:
  1. code-test invitation
  2. technical interview invitation with meeting details

## Detail Inclusion Rules

- Include exact date/time and time zone when available.
- If date/time is unknown, keep an explicit placeholder like `{{INSERT DATE AND TIME}}`.
- Include backup phone note when requested or when meeting reliability is important.
- Include observer note only when explicitly requested.
- Include Teams dial-in block only when details are provided.

## Tone Rules

- Use direct, friendly, professional language.
- Avoid overly casual phrases and avoid legalistic wording.
- Keep paragraphs short and scan-friendly.
- Prefer active voice and concrete instructions.

# Output Requirements

Return output in this structure:

## 1. Subject

A clear subject line aligned to the email type.

## 2. Email Body

Plain text email body with paragraph spacing.

## 3. Signature

Sender name, role, and organization.

## 4. Placeholder Audit

List unresolved placeholders, if any.

# Quality Checklist

Before finalizing, verify:

- correct email type is used
- all required sections are present
- candidate name is correct and consistently used
- schedule details are clear and include time zone
- platform/tool instructions are accurate
- tone matches the ESI-style examples
- no contradictory instructions exist
- unresolved placeholders are clearly listed

# Completion Standard

The skill is complete when the output email:

- matches one of the supported email types
- is ready to send with minimal editing
- has complete logistics or explicit placeholders
- maintains a professional and reassuring tone

# Example Prompts

- Draft a technical interview invitation email for Alex Chen on May 2, 2:00-3:00 PM EDT with full Teams details.
- Write a code test invitation email for Priya, include CoderPad prep guidance and note that Teams invite will come separately.
- Create both emails for a candidate and keep the language similar to ESI templates.
