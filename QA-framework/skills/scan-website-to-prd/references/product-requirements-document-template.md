# Product Requirements Document: <Product or Website Name>

## 1. Executive Summary

- Product purpose:
- Primary users:
- Main capabilities:
- Documentation confidence level: High | Medium | Low

## 2. Scope

### In Scope

- <List discovered areas and workflows>

### Out of Scope / Not Observed

- <List areas not accessible or not scanned>

## 3. Personas and Roles

| Role | Capabilities | Restrictions | Evidence | Confidence |
|---|---|---|---|---|
| <Role> | <What role can do> | <What role cannot do> | <Observed UI evidence> | <High/Medium/Low> |

## 4. Information Architecture

### Navigation Hierarchy

- <Top-level navigation>
- <Child pages>

### Screen Inventory

| Screen | URL Path | Entry Point | Main Purpose | Key UI Elements | Primary Actions | States Observed | Access Requirements | Confidence |
|---|---|---|---|---|---|---|---|---|
| <Screen name> | </path> | <How user gets here> | <Purpose> | <Key elements> | <Actions> | <Empty/Error/Loading/Success> | <Role/login needed> | <High/Medium/Low> |

## 5. Feature Catalog

### Feature: <Feature Name>

- Description:
- User problem solved:
- Users / roles:
- Entry points:
- Screens:
- Primary workflow:
- Alternate workflows:
- Business rules:
- Validation rules:
- System states:
- Acceptance criteria:
- Evidence:
- Open questions:
- Confidence: High | Medium | Low

## 6. Detailed User Flows

### Workflow: <Workflow Name>

- Preconditions:
- Trigger:
- Main flow:
1. <Step 1>
2. <Step 2>
3. <Step 3>
- Alternate or exception flows:
- Success criteria:
- Failure or validation states:
- Evidence:
- Confidence: High | Medium | Low

## 7. Data Model Inferred from UI

| Entity | Visible Fields | Relationships | Statuses | Lifecycle Notes | Source Screens | Confidence |
|---|---|---|---|---|---|---|
| <Entity> | <Fields> | <Relationships> | <Statuses> | <Lifecycle transitions> | <Screens> | <High/Medium/Low> |

## 8. Permissions and Access Control

| Role | Visible Navigation | Allowed Actions | Restricted/Disabled Actions | Unauthorized Behavior | Evidence | Confidence |
|---|---|---|---|---|---|---|
| <Role> | <Items visible> | <Allowed actions> | <Restricted actions> | <What happens when blocked> | <Observed evidence> | <High/Medium/Low> |

## 9. Notifications, Errors, and System Messages

| Message | Trigger | Type | Screen/Location | User Action Required | Evidence |
|---|---|---|---|---|---|
| <Message text> | <What triggered it> | <Error/Warning/Info/Success> | <Where shown> | <Required action> | <Observed evidence> |

## 10. Non-Functional Observations

- Accessibility:
- Responsiveness:
- Performance:
- Usability:
- Localization:
- Browser behavior:
- Security-related UX observations:

## 11. QA Test Matrix

| Area | Scenario | Preconditions | Steps | Expected Result | Priority | Notes |
|---|---|---|---|---|---|---|
| <Feature area> | <Scenario> | <Preconditions> | <Steps> | <Expected result> | <P0/P1/P2> | <Notes> |

## 12. Gaps, Risks, and Open Questions

### Product

- <Open gap/question>

### Technical

- <Open gap/question>

### UX

- <Open gap/question>

### Data

- <Open gap/question>

### Security

- <Open gap/question>

### QA Uncertainty

- <Open gap/question>

## 13. Appendix: Evidence Log

| Evidence ID | Screen | URL Path | Observation | Classification | Confidence |
|---|---|---|---|---|---|
| EV-001 | <Screen> | </path> | <Observation> | Observed | <High/Medium/Low> |

## Evidence Classification Rules

- Observed: Directly seen in the UI.
- Inferred: Derived from observed behavior, not directly stated.
- Assumption: Working assumption due to missing access or information.
- Not observed: Not accessible or not executed.

## Documentation Quality Checklist

- Professional, neutral tone used throughout.
- Statements are specific and testable.
- Terminology is consistent across sections.
- Major claims include direct evidence.
- Sensitive information is masked or redacted.
- Confidence is assigned for major findings.
