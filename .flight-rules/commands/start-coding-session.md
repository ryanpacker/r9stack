# Start Coding Session

When the user invokes "start coding session", follow this process:

## 1. Review Project Context

Read and understand:
- `.flight-rules/docs/prd.md` – What is this project?
- `.flight-rules/docs/implementation/overview.md` – What are the implementation areas?
- `.flight-rules/docs/progress.md` – What was done recently?
- The most recent `.flight-rules/docs/session_logs/*_session.md` – What happened last session?

Scan relevant code as needed to understand current state.

## 2. Establish Session Goals

Ask the user:
> "What would you like to accomplish in this session?"

Also suggest goals based on:
- "Next Steps" from the last session
- Spec items with status 🔵 Planned or 🟡 In Progress

Agree on a small set of specific, achievable goals (typically 1-3).

## 3. Create Implementation Plan

Collaborate with the user on:
- **Technical approach** – How will we implement this?
- **Alternatives considered** – What other options exist?
- **Constraints** – What limitations should we keep in mind?
- **Potential challenges** – What might go wrong and how will we handle it?

## 4. Document the Session Plan

Create a new file: `.flight-rules/docs/session_logs/YYYYMMDD_HHMM_session.md`

Use the template at `.flight-rules/doc-templates/session-log.md` as a guide.

Include:
- Session goals
- Related Task Groups and Tasks (by ID)
- Technical approach
- Task breakdown

## 5. Confirm Before Coding

Present the plan to the user and ask:

> "The session plan has been documented in `.flight-rules/docs/session_logs/YYYYMMDD_HHMM_session.md`. Are you ready for me to begin implementing this plan?"

**Do not begin implementation until the user confirms.**

