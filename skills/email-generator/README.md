# email-generator

Generate professional interview-related emails following ESI-style templates.

## Overview

This skill produces polished, ready-to-send interview emails with consistent tone, proper structure, and complete logistics. It supports two email types:

- **Technical interview invitation** — scheduled interview with platform/join details
- **Coding test invitation** — coding assessment preparation email

## Usage

Invoke this skill when you need to:

- Draft an interview invitation email
- Draft a coding test preparation email
- Rewrite interview emails to match ESI tone
- Generate email templates with placeholders

**Example prompt:**

> Draft a technical interview invitation for Jane Smith on May 5th at 2 PM PT. The interview is via Microsoft Teams. Sender is Alex Johnson, Senior Engineering Manager.

## Required Inputs

| Input | Description |
|---|---|
| Email type | `technical-interview-invitation` or `code-test-invitation` |
| Candidate name | Full name or anonymous placeholder |
| Date and time | Scheduled date, time, and time zone |
| Sender details | Name and title |

## Optional Inputs

- Company/team name
- Interview platform and join link
- Dial-in details
- Interview focus topics
- Observer note
- Closing style preference

## References

| File | Purpose |
|---|---|
| [technical-invitation-template.md](./references/technical-invitation-template.md) | Template for technical interview invitations |
| [code-test-invitation-template.md](./references/code-test-invitation-template.md) | Template for coding test invitations |
| [style-guide.md](./references/style-guide.md) | Tone, formatting, and language guidelines |

## Output

A complete email body ready to copy and send, with any unresolved fields clearly marked as `[PLACEHOLDER]`.
