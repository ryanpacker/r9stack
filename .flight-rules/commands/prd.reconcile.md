# Reconcile PRD

When the user invokes "prd.reconcile", update the Product Requirements Document to reflect work that was done without proper documentation updates.

Adopt the persona of a product manager who ensures requirements documents stay aligned with reality. You identify gaps between what was planned and what was built, and propose updates that maintain the PRD's integrity as a source of truth.

## 1. Check Prerequisites

### Required: PRD Must Exist

Read `docs/prd.md`. If it doesn't exist:

> "I couldn't find a PRD at `docs/prd.md`. Would you like me to create one with `/prd.create`?"

Wait for the user's response.

## 2. Determine Scope

### One-shot mode with explicit scope:

If the user provided a scope argument, parse it:
- `/prd.reconcile since v0.5.0` → Commits since that tag
- `/prd.reconcile last 10 commits` → Most recent N commits
- `/prd.reconcile since 2026-01-15` → Commits since that date

### Default scope detection:

If no scope provided:

1. Read `docs/progress.md` to find the last documented session
2. Extract the date from the most recent session log entry
3. Find commits since that date

Present the detected scope:

> "I found your last documented session was on [date]. I'll analyze the [N] commits since then to identify PRD updates.
>
> Does this scope look right, or would you like to adjust it?"

### Fallback if no session logs:

> "I couldn't find session logs to determine when documentation was last updated.
>
> How would you like to specify the scope?
> 1. **Last N commits** — Analyze recent commits
> 2. **Since version** — Analyze since a tag
> 3. **Since date** — Analyze since a date
> 4. **Full analysis** — Compare PRD against current codebase"

Wait for the user's response.

## 3. Analyze Changes

Based on the determined scope:

### 3.1 Gather commit information

Analyze git history to understand what was built:
- Commit messages (often describe features/fixes)
- Changed files and their nature
- Session logs in `docs/session_logs/` (if any)

### 3.2 Identify PRD-relevant changes

Categorize findings:

**New capabilities** — Features that were built but aren't in Goals:
- New commands, APIs, or functionality
- Significant enhancements to existing features

**Scope changes** — Work that touches Non-Goals:
- Features that were explicitly out of scope but got built
- Constraints that were relaxed or tightened

**User-facing changes** — Work relevant to User Stories:
- New user workflows
- Changed interaction patterns

**Measurable outcomes** — Work relevant to Success Criteria:
- New metrics or observable behaviors
- Completed goals that should be marked as achieved

### 3.3 Compare against current PRD

Read the PRD and identify:
- Goals that were implemented but not listed
- Non-goals that were violated (feature creep)
- User stories that are now incomplete or outdated
- Success criteria that can now be evaluated

## 4. Propose Updates

Present findings organized by PRD section:

> **PRD Reconciliation Analysis**
>
> **Scope analyzed:** [N] commits since [date/tag]
>
> ---
>
> **Goals**
>
> *Proposed additions:*
> - [N+1]. **[New Goal]** — [Description based on what was built]
>   - *Measured by:* [Derived from implementation]
>   - *Evidence:* [Commit(s) that implemented this]
>
> *Proposed updates:*
> - Goal [N]: [Current text] → [Updated text]
>   - *Reason:* [Why the update is needed]
>
> ---
>
> **Non-Goals**
>
> *Potential violations detected:*
> - Non-goal "[X]" may have been violated by [commit/feature]
>   - Should we: Remove the non-goal / Revert the feature / Acknowledge the change?
>
> *Proposed additions:*
> - [New non-goal based on decisions made during implementation]
>
> ---
>
> **User Stories**
>
> *Proposed additions:*
> - As a [user type], I want [new capability] so that [benefit]
>   - *Evidence:* [What was built]
>
> ---
>
> **Constraints**
>
> *Proposed updates:*
> - [Constraint changes based on implementation decisions]
>
> ---
>
> **Success Criteria**
>
> *Proposed additions:*
> - [New measurable criteria]
>
> *Status updates:*
> - [Criteria that can now be marked as achieved]
>
> ---
>
> Would you like me to apply these changes?

**Do not update the PRD until the user confirms.**

## 5. Handle Non-Goal Violations

If non-goal violations are detected, require explicit resolution:

> "I noticed that work was done in an area marked as a non-goal:
>
> **Non-goal:** [The non-goal statement]
> **Work done:** [Description of the violation]
>
> This requires a decision:
> 1. **Remove the non-goal** — This is now in scope
> 2. **Modify the non-goal** — Narrow its scope
> 3. **Flag for discussion** — Note the tension but don't resolve yet
>
> How would you like to handle this?"

Wait for the user's response before proceeding.

## 6. Apply Changes

Once confirmed:

1. Update `docs/prd.md` with approved changes
2. Add new goals at the end (preserve numbering)
3. Update existing sections as approved
4. Document any non-goal resolutions

## 7. Report Results

> **PRD Reconciled**
>
> **Updates applied:**
> - Added [N] new goals
> - Updated [N] existing goals
> - Added [N] user stories
> - [Resolved N non-goal violations / No violations detected]
>
> **Based on:**
> - [N] commits analyzed
> - Scope: [date range or version range]
>
> **Next steps:**
> - Run `/impl.reconcile` to update implementation docs
> - Run `/docs.reconcile` for cross-document consistency check

## Key Behaviors

Throughout this command:

- **Preserve structure** — Add to the end, don't renumber existing goals
- **Flag violations** — Non-goal violations require explicit resolution
- **Show evidence** — Every proposed change should reference the work that drove it
- **Be specific** — Goals and criteria must be measurable, not vague
- **Maintain tone** — Match the existing PRD's writing style
- **Connect to commits** — Reference specific commits as evidence
- **Don't assume** — When uncertain, ask rather than guess at intent
