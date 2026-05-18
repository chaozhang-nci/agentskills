# User Story Template

Use this reference when rewriting incomplete, informal, unclear, or poorly structured user stories for biotech clinical-data projects.

The goal is to produce a user story that is clear, testable, traceable, and ready for stakeholder review, development, UAT planning, and validation review.

## When to Use This Template

Use this template when the user provides:

- A rough user story
- A requirement that should be converted into a user story
- Meeting notes that imply a user need
- A PRD or BRD section that should be broken into user stories
- A clinical data, reporting, integration, dashboard, or workflow requirement

If information is missing, use `TBD`. Do not invent details.

---

# User Story Structure

## 1. Story ID

Use an existing story ID if provided.

If no ID is provided, use:

`US-TBD`

## 2. Story Title

Provide a short, clear title that describes the capability.

Example:

`View Missing Subject Visit Data by Study and Site`

## 3. Epic / Feature

Identify the larger feature, project, system, report, integration, or workflow this story belongs to.

If unknown, use:

`TBD`

Examples:

- Clinical Data Review Dashboard
- EDC Data Integration
- Lab Data Reconciliation
- Missing Data Report
- Study Enrollment Dashboard
- Protocol Deviation Workflow

## 4. Business Area

Identify the business function impacted by the story.

Examples:

- Clinical Data Management
- Clinical Operations
- Biostatistics
- Regulatory
- Safety
- Medical Affairs
- Data Engineering
- Reporting
- Quality Assurance
- IT
- Vendor Management

If unknown, use:

`TBD`

## 5. User Persona / Role

Identify the primary user or stakeholder.

Examples:

- Clinical Data Manager
- Study Lead
- Clinical Operations Manager
- Biostatistician
- Safety Reviewer
- Data Steward
- CRA
- Medical Monitor
- Regulatory Reviewer
- System Administrator
- Vendor Data Manager

If unknown, use:

`TBD`

## 6. User Story Statement

Use this format:

`As a [role], I want [capability or action], so that [business value or outcome].`

Example:

`As a Clinical Data Manager, I want to view missing subject visit data by study and site, so that I can identify data collection gaps and follow up before database lock.`

## 7. Business Objective

Explain why the story is needed.

Include:

- Business problem being solved
- Operational value
- Data quality value
- Compliance or inspection-readiness value, if relevant
- Decision-making value

Example:

`This story supports proactive clinical data review by allowing study teams to identify missing visit data before downstream reporting, data cleaning milestones, or database lock.`

## 8. Current State / Background

Describe the current process, limitation, pain point, or manual workaround.

Examples:

- Users currently review missing data manually in spreadsheets.
- Study teams must compare EDC extracts against visit schedules manually.
- There is no consolidated dashboard for missing visit data.
- Data quality issues are identified late in the study lifecycle.

If unknown, use:

`TBD`

## 9. Future State / Desired Outcome

Describe the expected future process or capability after implementation.

Example:

`Authorized users can access a dashboard that displays missing visit data by study, country, site, subject, and visit, with filters and export capability.`

## 10. Scope

### In Scope

List what is included.

Examples:

- Display missing visit data for active studies.
- Support filtering by study, country, site, subject, and visit.
- Include EDC and study metadata as source data.
- Allow authorized users to export filtered results.

### Out of Scope

List what is excluded.

Examples:

- Automated query creation in EDC.
- Direct update of source system data.
- Historical studies not loaded into the data warehouse.
- Regulatory submission formatting.

If scope is unknown, use:

`TBD`

## 11. Data Requirements

Describe the clinical or operational data needed for the story.

### Data Source

Examples:

- EDC
- CTMS
- IRT / RTSM
- eTMF
- Safety system
- Lab vendor file
- Data warehouse
- Manual upload
- Study metadata repository

### Data Domain

Examples:

- Subject
- Site
- Visit
- Enrollment
- Randomization
- Lab
- Adverse Event
- Serious Adverse Event
- Concomitant Medication
- Medical History
- Protocol Deviation
- Query
- eCRF
- Study milestone

### Key Data Fields

Use this format:

| Field Name | Definition | Source System | Required / Optional | Transformation Logic |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

### Data Refresh Frequency

Examples:

- Real-time
- Hourly
- Daily
- Weekly
- Manual upload
- TBD

### Data Quality Rules

Include applicable rules:

- Required fields
- Valid values
- Missing data handling
- Duplicate handling
- Reconciliation rules
- Date logic
- Exception handling
- Source-to-target mapping validation

Use `TBD` if rules are not provided.

## 12. Functional Requirements

List what the system, report, dashboard, workflow, or integration must do.

Use requirement IDs.

Examples:

`FR-001: The system shall display missing subject visit data by study, country, site, subject, and visit.`

`FR-002: The system shall allow authorized users to filter results by study, country, site, visit, and data domain.`

`FR-003: The system shall allow authorized users to export filtered results to Excel.`

## 13. Business Rules

List business logic that must be followed.

Examples:

- A visit is considered missing if the expected visit date has passed and no corresponding visit record exists in the EDC.
- Screen failure subjects should be excluded unless otherwise specified.
- Withdrawn subjects should be flagged separately.
- Only active studies should be included unless historical study inclusion is approved.
- Data should be grouped by study, country, site, subject, and visit.

If business rules are missing, use:

`TBD`

## 14. Non-Functional Requirements

Include relevant performance, usability, availability, scalability, auditability, and support needs.

Examples:

- The dashboard should load within 10 seconds for studies with up to 10,000 subjects.
- The solution should be available to authorized users during business hours.
- The export should preserve applied filters.
- The system should support role-based access control.
- The solution should maintain traceability to source data.

If not provided, use:

`TBD`

## 15. Compliance / Validation / Privacy Considerations

Include relevant biotech and clinical-data controls.

Examples:

- Role-based access is required.
- Subject-level data access must be restricted to authorized users.
- PHI / PII must not be exposed unless approved.
- Data should be traceable to the source system.
- Audit trail requirements should be assessed.
- GxP impact should be assessed.
- CSV impact should be assessed.
- Data lineage should be documented.
- UAT evidence may be required.
- Change control requirements should be confirmed.

Do not make final compliance or validation decisions. Mark unknown items as `TBD`.

## 16. Dependencies

List systems, teams, vendors, approvals, data feeds, or related work needed to deliver the story.

Examples:

- EDC data feed must be available.
- Study metadata mapping must be completed.
- Data warehouse table must be created.
- Vendor file specification must be approved.
- QA must confirm validation impact.
- Business owner must approve missing data logic.

If unknown, use:

`TBD`

## 17. Assumptions

List assumptions clearly and separately.

Examples:

- Assumption: Visit schedule metadata is available in the data warehouse.
- Assumption: Users accessing the dashboard already have approved system access.
- Assumption: EDC is the source of truth for subject visit records.
- Assumption: Study metadata is accurate and maintained.

Do not hide assumptions inside requirements.

## 18. Acceptance Criteria

Use Given / When / Then format.

Examples:

### AC-001

Given I am an authorized Clinical Data Manager,  
When I open the missing visit data dashboard,  
Then I can view missing visit records by study, country, site, subject, and visit.

### AC-002

Given a subject has an expected visit date in the past,  
When no corresponding visit record exists in the EDC,  
Then the subject should appear in the missing visit data report.

### AC-003

Given I apply a site filter,  
When the dashboard refreshes,  
Then only missing visit data for the selected site should be displayed.

### AC-004

Given I am not authorized to view subject-level data,  
When I attempt to access the dashboard,  
Then subject-level data should not be displayed.

## 19. UAT Test Scenarios

List practical test scenarios.

Examples:

- Verify that authorized users can access the user story functionality.
- Verify that unauthorized users cannot access restricted data.
- Verify that users can filter by study.
- Verify that users can filter by site.
- Verify that missing records are calculated according to the approved business rule.
- Verify that withdrawn subjects are handled according to the approved business rule.
- Verify that exported data matches dashboard results.
- Verify that missing or invalid source data is handled according to the defined exception logic.

## 20. Traceability

Link the story to related items when available.

Examples:

- Business Objective ID
- PRD Section
- BRD Requirement
- Functional Requirement
- Test Case
- Validation Document
- Change Request
- Jira Epic
- Source-to-Target Mapping
- Data Dictionary

If traceability is missing, use:

`TBD`

## 21. Priority

Use one of the following:

- Must Have
- Should Have
- Could Have
- Won’t Have
- TBD

## 22. Risks

List risks that could affect delivery, quality, compliance, or adoption.

Use this format:

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

Examples:

- Source data may not contain reliable visit schedule information.
- Business rules may differ across studies.
- Subject-level data access may require additional approval.
- Report logic may require validation if used for regulated decision-making.
- Vendor data may not arrive on the expected schedule.

## 23. Open Questions

List questions that must be answered before the story is ready.

Examples:

- Which studies are included in scope?
- Which data source is the system of record?
- Who is the business owner?
- Who can access subject-level data?
- What is the official source for expected visit dates?
- Should screen failure subjects be included?
- Should withdrawn subjects be included or excluded?
- Is the output intended for operational review only or regulatory submission support?
- What refresh frequency is required?
- Does this functionality require validation documentation?

---

# Output Rules

When using this template:

- Preserve the original business intent.
- Do not invent missing details.
- Use `TBD` for missing information.
- Separate assumptions from confirmed facts.
- Add clarifying questions for missing or ambiguous information.
- Make acceptance criteria testable.
- Include clinical data and compliance considerations when relevant.
- Keep the rewritten story practical and ready for stakeholder review.

Always end the rewritten user story with:

`Human QA Review Required: Yes - QA should review, correct, and approve this output before it becomes final.`