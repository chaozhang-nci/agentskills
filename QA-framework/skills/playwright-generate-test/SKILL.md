---
name: playwright-generate-test
description: Generate Playwright TypeScript tests from user-provided browser scenarios using Playwright MCP. Use when the user asks to create, record, generate, validate, or self-heal an end-to-end Playwright test by interacting with a real web app through Playwright MCP, taking screenshots at each step, deriving robust locators, saving the test in the configured Playwright test directory, and running it until it passes when execution is available.
---

# Generate Playwright Tests with Playwright MCP

Use this skill to generate a Playwright TypeScript test from a user-provided scenario by first interacting with the target application through Playwright MCP.

## Required Inputs

Before starting, ensure the user has provided:

- Scenario or user flow to test
- Target URL or app entry point
- Any required credentials, setup data, or environment notes
- Expected outcome or assertion

If any required input is missing, ask for it before generating code.

## Workflow

1. Use Playwright MCP to open the target page.
2. Take a screenshot before the first interaction.
3. Execute the scenario step by step in the browser.
4. After every meaningful step or UI transition, take a screenshot.
5. Inspect the UI and identify stable locators.
6. Observe the expected end state and determine assertions.
7. Only after completing browser exploration, generate a Playwright TypeScript test using `@playwright/test`.
8. Determine the project test directory by inspecting the Playwright config.
9. Save the generated test file inside the configured test directory, creating the directory if needed.
10. Run the generated test.
11. If the test fails, inspect the failure, compare the latest screenshot with the expected UI state, update the test, and rerun it.
12. Stop when the test passes or when a blocker prevents further progress.

## Output Directory

Determine the test output directory before saving the generated test.

- If a Playwright config exists, inspect it to identify the configured `testDir`.
- Save the generated test inside the configured `testDir`.
- If no `testDir` is configured, save the test under `tests/`.
- If the directory does not exist, create it.
- Use a descriptive filename based on the scenario, such as `login-flow.spec.ts`.
- Do not assume `tests/` if the project config defines a different test directory.

## Screenshot Requirements

- Capture screenshots for every scenario step.
- Use screenshots to validate that each action caused the expected UI change.
- Save screenshots with descriptive names when possible, such as:
  - `step-01-home-page.png`
  - `step-02-login-form.png`
  - `step-03-dashboard-loaded.png`
- Use screenshots during debugging to compare expected and actual page state.
- Do not skip screenshots unless the environment does not support screenshot capture.
- Include screenshot capture in the generated test for each major scenario step.

## Self-Healing Requirements

When a generated test fails, attempt to self-heal before reporting failure.

Self-healing may include:

- Re-inspecting the current page with Playwright MCP.
- Comparing the failing state against previously captured screenshots.
- Replacing brittle selectors with more stable locators.
- Updating text locators when visible labels changed but intent is clear.
- Adding appropriate waits for navigation, loading states, animations, or async UI updates.
- Adjusting assertions to match the actual user-visible success state.
- Replaying the affected scenario step to confirm the corrected locator or assertion.

Do not self-heal by:

- Removing meaningful assertions just to make the test pass.
- Ignoring real product failures.
- Inventing behavior that was not observed.
- Hardcoding unstable implementation details unless no better option exists.

If self-healing cannot safely fix the test, report the blocker clearly.

## Test Authoring Standards

- Use `test` and `expect` from `@playwright/test`.
- Prefer accessible locators such as `getByRole`, `getByLabel`, `getByText`, and `getByPlaceholder`.
- Avoid brittle CSS or XPath selectors unless no better locator exists.
- Add clear assertions for the user-visible expected outcome.
- Keep the test focused on the provided scenario.
- Do not invent credentials, data, routes, or expected behavior.
- Do not generate test code prematurely or based solely on the scenario without completing the Playwright MCP exploration steps.
- Use screenshots and observed UI state to support locator and assertion choices.

## Final Response

After the workflow is complete, provide:

- The path of the saved test file
- A brief summary of what the test covers
- The screenshots captured
- Whether the test passed
- Any self-healing changes applied
- Any blockers or assumptions, if applicable