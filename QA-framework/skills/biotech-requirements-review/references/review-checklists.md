# Review Checklists

Use this reference when reviewing biotech clinical-data requirements, PRDs, BRDs, FRDs, user stories, acceptance criteria, change requests, meeting notes, or requirement comments.

The purpose of these checklists is to help identify gaps, ambiguity, risks, missing business rules, missing data rules, missing testability, and missing compliance or validation considerations.

Do not use these checklists as final approval criteria. They support review and improvement only.

---

# 1. Requirement Quality Checklist

Use this checklist for every requirement.

## Clarity

Check whether the requirement:

- Uses clear and specific language
- Avoids vague words such as “fast,” “easy,” “robust,” “seamless,” “as needed,” or “user-friendly” without measurable criteria
- Defines the actor, system, or process responsible for the action
- Defines the expected outcome
- Avoids combining multiple requirements into one statement
- Uses consistent terminology

Review questions:

- Who needs this capability?
- What exactly should happen?
- What system or process performs the action?
- What is the expected result?
- Are any terms undefined?

---

## Completeness

Check whether the requirement includes:

- Business objective
- Scope
- User role or persona
- Data source
- Data domain
- Expected behavior
- Business rules
- Exceptions
- Dependencies
- Acceptance criteria
- Priority
- Owner or stakeholder
- Assumptions
- Open questions

Review questions:

- Is enough information provided for development?
- Is enough information provided for testing?
- Are edge cases and exceptions described?
- Are missing decisions clearly marked as `TBD`?

---

## Testability

Check whether the requirement can be tested.

A testable requirement should include:

- Clear trigger or condition
- Clear expected result
- Defined input
- Defined output
- Defined pass / fail criteria
- Defined data conditions
- Defined user role or access condition

Review questions:

- Can QA write a test case from this requirement?
- Can UAT users confirm whether the requirement passed?
- Are expected results measurable?
- Are acceptance criteria written in Given / When / Then format?

---

## Measurability

Check whether the requirement includes measurable criteria when needed.

Examples:

Weak:

`The dashboard should load quickly.`

Improved:

`The dashboard should load within 10 seconds for studies with up to 10,000 subjects.`

Weak:

`The report should refresh regularly.`

Improved:

`The report shall refresh daily at 6:00 AM Eastern Time.`

Review questions:

- Is performance measurable?
- Is timing measurable?
- Is refresh frequency defined?
- Is success measurable?
- Are thresholds or limits defined?

---

## Consistency

Check whether the requirement is consistent with:

- Other requirements
- PRD or BRD objectives
- Business rules
- Data definitions
- Source system logic
- User access model
- Workflow expectations
- Terminology used elsewhere

Review questions:

- Does this requirement conflict with another requirement?
- Are the same terms used consistently?
- Are the same data fields defined the same way across requirements?
- Are priorities aligned?

---

## Feasibility

Check whether the requirement appears feasible based on available information.

Consider:

- Source data availability
- System capability
- Integration constraints
- Data quality limitations
- Vendor limitations
- Timeline constraints
- Access restrictions
- Validation or compliance effort

Review questions:

- Is the required data available?
- Is the source system capable of providing the data?
- Does the workflow depend on another team or vendor?
- Are there known technical constraints?

---

## Traceability

Check whether the requirement can be traced to:

- Business objective
- PRD section
- BRD requirement
- Functional requirement
- User story
- Acceptance criteria
- Test case
- Validation document
- Change request
- Jira epic or ticket
- Source-to-target mapping
- Data dictionary

Review questions:

- What business objective does this requirement support?
- Which test case validates this requirement?
- Which source data supports this requirement?
- Is traceability missing or unclear?

---

# 2. Clinical Data Checklist

Use this checklist when requirements involve clinical trial data, operational clinical data, study metadata, reporting, dashboards, integrations, or data pipelines.

## Study and Protocol Context

Check whether the requirement defines:

- Study or program
- Protocol context
- Study phase, if relevant
- Countries or sites in scope
- Subject population in scope
- Visit schedule dependency
- Study-specific rules
- Cross-study standardization needs

Review questions:

- Which study or studies are included?
- Does the requirement apply across all studies or only selected studies?
- Are protocol-specific rules involved?
- Is the requirement impacted by protocol amendments?

---

## Data Source

Check whether the requirement defines the source system.

Common source systems:

- EDC
- eSource
- CTMS
- IRT / RTSM
- eTMF
- Safety system
- Lab vendor
- Imaging vendor
- Central lab
- Data warehouse
- Manual upload
- Study metadata repository

Review questions:

- What is the system of record?
- Is the data sourced directly or through a warehouse?
- Is the source system approved for this use?
- Who owns the source data?
- Is source data timing defined?

---

## Data Domain

Check whether the data domain is defined.

Common clinical data domains:

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
- Data cleaning
- Database lock

Review questions:

- Which data domains are included?
- Which data domains are excluded?
- Are domain definitions aligned with the source system?
- Are domain-specific rules needed?

---

## Key Data Fields

Check whether key fields are defined.

For each field, confirm:

- Field name
- Business definition
- Source system
- Source table or file, if known
- Required or optional status
- Data type
- Valid values
- Transformation logic
- Owner
- Downstream consumer

Review questions:

- Are required fields identified?
- Are field definitions clear?
- Are source and target fields mapped?
- Are derived fields explained?
- Are controlled terminology values defined?

---

## Data Refresh and Timing

Check whether timing expectations are defined.

Confirm:

- Refresh frequency
- Refresh time
- Time zone
- Source file arrival time
- Data latency
- Cutoff time
- Late-arriving data behavior
- Historical data behavior

Review questions:

- How often should the data refresh?
- What happens if the source data is late?
- What timestamp should users see?
- Are users informed when data is stale?

---

## Transformation Rules

Check whether transformation logic is defined.

Examples:

- Date conversions
- Status mappings
- Derived flags
- Aggregations
- Cross-system joins
- Visit window calculations
- Missing data calculations
- Duplicate resolution
- Inclusion or exclusion logic

Review questions:

- Are derived values clearly explained?
- Are calculations testable?
- Are mappings documented?
- Are exceptions defined?

---

## Data Quality Rules

Check whether data quality rules are defined.

Examples:

- Required fields must not be null
- Dates must be valid
- Subject IDs must match approved format
- Visit records must map to valid study metadata
- Duplicate records must be flagged
- Invalid values must be excluded or flagged
- Missing source files must trigger an error notification

Review questions:

- What makes a record valid or invalid?
- How should missing values be handled?
- How should duplicate records be handled?
- Should invalid records be excluded, flagged, or loaded with warning?
- Who reviews data quality exceptions?

---

## Reconciliation Rules

Check whether reconciliation requirements are defined.

Possible reconciliation points:

- EDC vs lab vendor
- EDC vs CTMS
- EDC vs safety system
- IRT vs EDC
- Vendor file vs warehouse
- Dashboard output vs source extract
- Subject visits vs visit schedule
- AE / SAE data vs safety database

Review questions:

- Which systems must reconcile?
- What matching keys are used?
- What discrepancies should be flagged?
- Who owns discrepancy resolution?
- Are reconciliation results reportable?

---

## Reporting and Export

Check whether reporting needs are defined.

Confirm:

- Report name
- Metrics
- Filters
- Groupings
- Drill-downs
- Export format
- Export fields
- Scheduled distribution
- Access restrictions
- Refresh timestamp
- Data source timestamp
- Report owner

Review questions:

- What should users see?
- What filters are required?
- Are exports allowed?
- Should subject-level data be included?
- Should exports preserve filters?
- Should report usage be auditable?

---

# 3. Acceptance Criteria Checklist

Use this checklist when reviewing or generating acceptance criteria.

Good acceptance criteria should be:

- Specific
- Testable
- Business-relevant
- Written from the user or system behavior perspective
- Connected to the requirement
- Clear about expected results
- Clear about role or access conditions
- Clear about data conditions
- Clear about exception behavior

Use Given / When / Then format when possible.

## Acceptance Criteria Review Questions

- Does each requirement have at least one acceptance criterion?
- Are positive and negative scenarios included?
- Are access control scenarios included?
- Are data exception scenarios included?
- Are export scenarios included, if relevant?
- Are refresh or timing scenarios included, if relevant?
- Are calculations or business rules testable?
- Are expected results specific enough for QA and UAT?

## Example Acceptance Criteria

### AC-001: Authorized Access

Given I am an authorized Clinical Data Manager,  
When I access the dashboard,  
Then I can view data for studies assigned to my role.

### AC-002: Unauthorized Access

Given I am not authorized to view subject-level data,  
When I access the dashboard,  
Then subject-level data is not displayed.

### AC-003: Missing Data Logic

Given a subject has an expected visit date in the past,  
When no corresponding visit record exists in the EDC,  
Then the subject appears in the missing visit data output.

### AC-004: Export

Given I apply filters to the dashboard,  
When I export the results,  
Then the exported file contains only records matching the applied filters.

---

# 4. Business Rules Checklist

Use this checklist when reviewing business logic.

Check whether business rules define:

- Inclusion criteria
- Exclusion criteria
- Status mappings
- Date logic
- Thresholds
- Calculations
- Hierarchies
- Matching keys
- Exception handling
- Default values
- Override rules
- Ownership of rule decisions

Review questions:

- Who owns the business rule?
- Is the rule approved?
- Is the rule study-specific or global?
- Does the rule depend on protocol version?
- What happens when data does not meet the rule?
- How should exceptions be displayed or reported?
- How will QA test the rule?

Weak rule:

`Show missing visits.`

Improved rule:

`A visit is considered missing when the expected visit date has passed and no corresponding visit record exists in EDC for the subject, unless the subject has withdrawn before the expected visit date.`

---

# 5. Compliance, Validation, and Privacy Checklist

Use this checklist when the requirement may involve regulated workflows, clinical data, subject-level data, system changes, reports, integrations, or inspection-relevant outputs.

## GxP and CSV

Check whether the requirement may impact:

- GxP-regulated processes
- Computer System Validation
- Validated systems
- Validated reports
- Data used for regulated decision-making
- Change control
- Release documentation
- Test evidence
- Traceability matrix
- SOP updates

Review questions:

- Is the output used for regulated decision-making?
- Is the system validated?
- Does this change require validation assessment?
- Is QA or validation review needed?
- Are test scripts and evidence required?
- Does the requirement need traceability to test cases?

Do not make final validation decisions. Flag items for QA / validation review.

---

## Audit Trail

Check whether the requirement needs auditability.

Potential audit needs:

- Data change audit trail
- User action audit trail
- Export audit trail
- Login or access audit trail
- Configuration change audit trail
- File processing audit trail
- Error handling log
- Refresh timestamp
- Source data timestamp

Review questions:

- What actions need to be logged?
- Who needs access to audit logs?
- How long should audit logs be retained?
- Are audit logs reviewable during inspection?

---

## Data Integrity

Consider ALCOA+ principles.

Check whether data is:

- Attributable
- Legible
- Contemporaneous
- Original
- Accurate
- Complete
- Consistent
- Enduring
- Available

Review questions:

- Can output be traced to source?
- Are transformations documented?
- Are source timestamps available?
- Are manual changes controlled?
- Are records complete and retained?

---

## Privacy and Access

Check whether the requirement involves:

- PHI
- PII
- Subject-level data
- Site-level restrictions
- Study-level restrictions
- External users
- Vendor access
- Export restrictions
- Data masking
- De-identification
- Role-based access control

Review questions:

- Who can access the data?
- Is access restricted by study, site, country, or role?
- Is subject-level data required?
- Should PHI / PII be masked?
- Are exports restricted?
- Can external users access the output?

---

# 6. Integration Requirements Checklist

Use this checklist when reviewing data movement between systems.

Check whether the requirement defines:

- Source system
- Target system
- Integration type
- File format or API
- Authentication
- Frequency
- Trigger
- Schedule
- Data mapping
- Transformation rules
- Validation rules
- Error handling
- Retry logic
- Monitoring
- Alerts
- Reconciliation
- Ownership
- Support model

Review questions:

- What happens if the file is missing?
- What happens if the file is late?
- What happens if required fields are missing?
- What happens if duplicate records are received?
- What happens if authentication fails?
- What happens if the target system is unavailable?
- Who receives error notifications?
- Who resolves failed integrations?

---

# 7. Reporting and Dashboard Checklist

Use this checklist when reviewing dashboard, report, analytics, or export requirements.

Check whether the requirement defines:

- Report or dashboard name
- Purpose
- Primary users
- Metrics
- Definitions
- Calculations
- Filters
- Groupings
- Drill-downs
- Export functionality
- Refresh frequency
- Access groups
- Data source
- Data lineage
- Report owner
- Performance expectations
- Validation expectations

Review questions:

- What business question does the report answer?
- Which metrics are required?
- Are metric definitions approved?
- What filters are required?
- Are drill-downs needed?
- Are exports allowed?
- Are export fields defined?
- Is the report operational or regulatory-supporting?
- Does the report need validation assessment?

---

# 8. Non-Functional Requirements Checklist

Use this checklist to review performance, usability, availability, scalability, maintainability, auditability, and supportability.

## Performance

Review questions:

- How fast should the page, report, or process load?
- What data volume should be supported?
- What is the expected number of users?
- What is the expected export size?
- What are acceptable processing times?

## Availability

Review questions:

- When should the system be available?
- Are business hours defined?
- Are downtime windows acceptable?
- Are alerts needed for downtime?

## Usability

Review questions:

- Who are the users?
- What tasks should be easy to complete?
- Are filters, labels, and outputs understandable?
- Is training required?

## Scalability

Review questions:

- Will more studies, users, or data sources be added later?
- Should the solution support multiple programs or regions?
- Are data volume growth expectations defined?

## Maintainability

Review questions:

- Who maintains the configuration?
- How are business rules updated?
- How are study-specific rules managed?
- Are SOPs or support documents needed?

## Supportability

Review questions:

- Who supports users?
- How are incidents reported?
- What support hours apply?
- Are runbooks or support documentation needed?

## Auditability

Review questions:

- What needs to be logged?
- What needs to be traceable?
- What evidence is needed for review or inspection?

---

# 9. Risk Review Checklist

Use this checklist to identify delivery, data, compliance, and adoption risks.

Possible risk categories:

- Source data unavailable
- Source data poor quality
- Business rules unclear
- Study-specific variation
- Vendor dependency
- Integration failure
- Mapping errors
- Access approval delay
- Validation impact underestimated
- UAT data unavailable
- Stakeholder misalignment
- Timeline dependency
- Export privacy risk
- Report used beyond intended purpose

For each risk, capture:

| Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

Review questions:

- What could prevent delivery?
- What could affect data quality?
- What could create compliance risk?
- What could delay UAT?
- What could cause users to reject the solution?
- What dependencies are outside the project team’s control?

---

# 10. Readiness Decision Checklist

Use this checklist before assigning a review decision.

## Ready for Test Design

Use only when:

- Expected behavior is clear
- Acceptance criteria are testable
- Data source is defined
- Business rules are defined
- Dependencies are known
- No blocking questions remain
- Access and privacy expectations are clear enough for test planning
- Compliance or validation questions are either resolved or clearly routed to QA / validation

## Needs Clarification

Use when:

- Requirement intent is mostly understandable
- Some details are missing
- Acceptance criteria need improvement
- Business rules need confirmation
- Data rules need clarification
- Some assumptions need validation
- Development or testing could proceed only after clarification

## Blocked

Use when:

- Requirement intent is unclear
- Critical business rules are missing
- Required data source is unknown
- Required system behavior is undefined
- Compliance, privacy, or validation risk is unresolved and blocking
- Major dependency is unknown or unavailable
- QA or UAT cannot design meaningful tests

---

# 11. Common Rewrite Patterns

Use these patterns to improve weak requirements.

## Pattern 1: Vague to Testable

Weak:

`The system should show data quickly.`

Improved:

`The dashboard shall load study-level summary data within 10 seconds for studies containing up to 10,000 subjects.`

## Pattern 2: Missing Actor

Weak:

`Export the report to Excel.`

Improved:

`The system shall allow authorized Clinical Data Managers to export filtered report results to Excel.`

## Pattern 3: Missing Data Source

Weak:

`Show enrollment status by site.`

Improved:

`The dashboard shall display enrollment status by site using CTMS as the source system, refreshed daily at 6:00 AM Eastern Time.`

## Pattern 4: Missing Business Rule

Weak:

`Display missing visits.`

Improved:

`The dashboard shall display a subject visit as missing when the expected visit date has passed and no corresponding visit record exists in EDC, excluding subjects withdrawn before the expected visit date.`

## Pattern 5: Missing Access Control

Weak:

`Users can view subject-level data.`

Improved:

`The system shall display subject-level data only to users with approved role-based access for the assigned study and site.`

---

# 12. Required Final Reminder

Every review output should end with:

`Human QA Review Required: Yes - QA should review, correct, and approve this output before it becomes final.`