# End Coding Session

When the user invokes "end coding session", follow this process:

## 1. Review Work Done

Identify:
- What code was written or modified
- Any sandbox/scratch files that need to be kept or discarded
- Any temporary debugging code that should be removed

Ask the user about anything uncertain.

## 2. Summarize the Session

Draft a summary covering:
- **What was accomplished** – Key deliverables
- **Key decisions** – Especially any deviations from the original plan
- **Implementation details** – Notable technical choices
- **Challenges and solutions** – Problems encountered and how they were resolved
- **Proposed next steps** – What should happen in future sessions

Present the summary to the user for review and approval.

## 3. Update the Session Log

Update the session log file in `docs/session_logs/YYYYMMDD_HHMM_session.md`

Use the template at `.flight-rules/doc-templates/session-log.md` as a guide if creating a new log.

Include:
- Summary
- Goal completion status
- Detailed description of work
- Key decisions
- Challenges and solutions
- Code areas touched
- Spec updates needed
- Next steps

## 4. Update Progress

Append a short entry to `docs/progress.md`:

```markdown
### YYYY-MM-DD HH:MM

- Brief summary point 1
- Brief summary point 2
- See: [session_logs/YYYYMMDD_HHMM_session.md](session_logs/YYYYMMDD_HHMM_session.md)
```

## 5. Propose Spec Updates

If implementation deviated from specs or completed spec items:
- Identify which spec files need updates
- Propose the specific changes to the user for approval
- Update specs when approved

## 6. Promote Critical Learnings

Scan the session for reusable insights:
- Patterns that worked well
- Mistakes to avoid
- Important decisions that should inform future work

Propose additions to `docs/critical-learnings.md` and update when approved.

## 7. Offer to Commit

Ask the user:
> "Would you like to commit these changes now?"

If yes, help prepare a commit message that:
- Summarizes what was accomplished
- References the session log file
- Is concise but meaningful
