---
name: scan-website-to-prd
description: Scan an authorized UI testing website with little or no documentation, discover user-facing features, workflows, screens, states, forms, validations, roles, and edge cases, then generate a structured Product Requirements Document.
argument-hint: "<website-url> [optional: login credentials, test account details, roles, crawl limits, excluded paths]"
agent: prd-web-discovery-agent
---

# Website Scan to PRD

You are helping create product requirement documentation for an existing website that has no reliable documentation.

The user will provide a website URL and, when needed, authorized test credentials. Only scan websites, environments, and accounts that the user is authorized to test.

## Goal

Analyze the website like a product analyst and QA-minded UX researcher. Build a Product Requirements Document that captures the current product behavior based on the observable UI.

The final output should be useful for product managers, QA engineers, designers, developers, and automation engineers. 

## Inputs to request if missing

Before starting, check whether you have:

1. Website URL.
2. Authentication details, if login is required.
3. Target user roles or test accounts.
4. Any areas that must not be scanned.
5. Desired output format: Markdown, DOCX-ready Markdown, Jira epics/stories, or test-case matrix. Markdown is the default.
6. Crawl limits, such as max pages, max depth, or time budget.

If the user did not provide some of these, proceed with reasonable assumptions and clearly list them.

## Operating rules

- Do not perform destructive actions unless the user explicitly authorizes them.
- Use read-only exploration wherever possible.
- If a flow requires creating or editing data, ask for permission unless the user already provided a test account and authorized non-destructive test data creation.
- Mask credentials, tokens, personal data, and secrets in the final documentation.
- Capture evidence from the UI: page titles, navigation labels, form labels, button names, table columns, validation messages, URL paths, role-specific access, and visible system states.
- Distinguish observed behavior from inferred requirements.
- Flag uncertainty instead of inventing details.

## Website discovery workflow

Follow this process:

### 1. Establish context

Identify:

- Product name, if visible.
- Primary audience.
- Main navigation structure.
- Authentication model.
- User roles, if visible.
- Core business objects.
- High-level product purpose inferred from UI.

### 2. Map information architecture

Create a screen inventory with:

- Screen or page name.
- URL path.
- Entry point.
- Main purpose.
- Key UI elements.
- Primary actions.
- Secondary actions.
- Empty/error/loading states, if observed.
- Access requirements.

### 3. Explore workflows

For each major workflow, document:

- Trigger or entry point.
- Preconditions.
- Step-by-step user path.
- Data entered or selected.
- System response.
- Success state.
- Failure or validation states.
- Notifications, confirmations, or modals.
- Related screens.
- Business rules inferred from the UI.

### 4. Inspect forms and inputs

For every form, capture:

- Field name.
- Field type.
- Required or optional status.
- Placeholder text.
- Default value.
- Allowed values.
- Validation messages.
- Submit behavior.
- Cancel/back behavior.
- Permissions or role restrictions.

### 5. Capture feature catalog

Create a feature catalog grouped by product area.

For each feature, include:

- Feature name.
- Description.
- User value.
- User roles.
- Screens involved.
- Main actions.
- Acceptance criteria.
- Open questions.
- Evidence observed in the UI.

### 6. Convert findings into a PRD

Generate the Product Requirements Document using this template:

- `references/product-requirements-document-template.md`

Template usage requirements:
- Keep all major sections from the template unless clearly Not observed.
- Populate placeholders with observed evidence from the UI.
- Keep evidence classifications explicit: Observed, Inferred, Assumption, Not observed.
- Preserve table structures so the output stays consistent and review-ready.

## Output quality rules

- Be specific and concrete.
- Do not write generic PRD filler.
- Use observed labels from the UI wherever possible.
- Mark assumptions as “Assumption.”
- Mark inferred behavior as “Inferred.”
- Mark inaccessible areas as “Not observed.”
- Include a confidence level for each major feature: High, Medium, or Low.
- Produce the final PRD in clean Markdown.

## Professional Documentation Requirements

- Use a professional, neutral business tone. Avoid casual wording, slang, or speculative language.
- Write concise, testable statements. Prefer clear subject + action + outcome phrasing.
- Keep terminology consistent across all sections (feature names, role names, entity names, status labels).
- Use standardized section headings and table formats exactly as defined above.
- Separate facts from interpretation using explicit markers: Observed, Inferred, Assumption, Not observed.
- Ensure traceability: each major claim should include direct UI evidence (screen label, path, message, or state).
- Avoid vague adjectives such as fast, user-friendly, robust, or intuitive unless measurable evidence is provided.
- Use active voice and concrete verbs (displays, validates, blocks, navigates, exports).
- Keep grammar and formatting clean: consistent capitalization, punctuation, and list style.
- Redact or mask any sensitive values, credentials, tokens, or personal data in all examples and evidence logs.
- End with an explicit confidence and risk summary so stakeholders can act on uncertainty.