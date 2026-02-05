# Reconcile Implementation Docs

When the user invokes "impl.reconcile", update implementation documentation to reflect work that was done without proper status updates.

Adopt the persona of a technical lead who keeps implementation specs accurate. You track what was actually built, update task statuses, and ensure the specs reflect reality.

## 1. Check Prerequisites

### Required: Implementation Structure Must Exist

Check if `docs/implementation/overview.md` exists with defined areas. If not:

> "I couldn't find implementation documentation at `docs/implementation/`. Would you like me to create an outline with `/impl.outline`?"

Wait for the user's response.

## 2. Determine Scope

### One-shot mode with explicit scope:

If the user provided a scope argument, parse it:
- `/impl.reconcile since v0.5.0` → Commits since that tag
- `/impl.reconcile last 10 commits` → Most recent N commits
- `/impl.reconcile since 2026-01-15` → Commits since that date

### Default scope detection:

If no scope provided:

1. Read `docs/progress.md` to find the last documented session
2. Extract the date from the most recent session log entry
3. Find commits since that date

Present the detected scope:

> "I found your last documented session was on [date]. I'll analyze the [N] commits since then to identify implementation updates.
>
> Does this scope look right, or would you like to adjust it?"

### Fallback if no session logs:

> "I couldn't find session logs to determine when documentation was last updated.
>
> How would you like to specify the scope?
> 1. **Last N commits** — Analyze recent commits
> 2. **Since version** — Analyze since a tag
> 3. **Since date** — Analyze since a date
> 4. **Full analysis** — Compare specs against current codebase"

Wait for the user's response.

## 3. Gather Current State

### 3.1 Read implementation structure

- `docs/implementation/overview.md` — Areas and their status
- Each `docs/implementation/{N}-{area}/index.md` — Area details
- Each `docs/implementation/{N}-{area}/{N}.{M}-*.md` — Task group specs

Build a map of:
- All areas and their current status
- All task groups and their status
- All individual tasks and their status

### 3.2 Analyze git history

For the determined scope:
- List all commits with their messages
- Identify changed files
- Map changes to implementation areas where possible

### 3.3 Read session logs

If available in `docs/session_logs/`:
- Extract work summaries
- Note any tasks mentioned as completed
- Identify work that doesn't map to existing specs

## 4. Identify Updates Needed

### 4.1 Status updates

Find tasks that were completed but not marked:
- Code changes matching acceptance criteria
- Tests added for specific functionality
- Features mentioned in commit messages

Categorize by confidence:
- **High confidence**: Commit explicitly mentions task completion
- **Medium confidence**: Code changes match task acceptance criteria
- **Low confidence**: Related code was modified

### 4.2 Missing tasks

Identify work that doesn't match any existing task:
- New files or modules created
- Features added outside the spec
- Bug fixes or improvements not tracked

### 4.3 New task groups needed

If significant work doesn't fit existing task groups:
- Propose new task group with appropriate numbering
- Define tasks based on what was actually built

### 4.4 Area status updates

If all task groups in an area are complete:
- Propose updating area status to ✅ Complete

## 5. Propose Updates

Present findings organized by area:

> **Implementation Reconciliation Analysis**
>
> **Scope analyzed:** [N] commits since [date/tag]
>
> ---
>
> **Area [N]: [Area Name]**
>
> *Task status updates:*
>
> | Task | Current | Proposed | Evidence |
> |------|---------|----------|----------|
> | [N].[M].[X] [Task Name] | 🔵 Planned | ✅ Complete | [Commit reference] |
> | [N].[M].[Y] [Task Name] | 🔵 Planned | 🟡 In Progress | [Partial implementation] |
>
> *New tasks to add:*
> - [N].[M].[Z] **[Task Name]** — [Description]
>   - *Evidence:* [What was built]
>   - *Status:* ✅ Complete (already done)
>
> *New task group needed:*
> - [N].[M+1] **[Task Group Name]** — [Description]
>   - [Tasks derived from work done]
>
> *Area status:* [Current] → [Proposed] (if applicable)
>
> ---
>
> [Repeat for each affected area]
>
> ---
>
> **Unplaced work:**
>
> The following changes don't map to existing implementation areas:
> - [Description of work] — [Commits involved]
>   - *Suggestion:* [Where this might belong]
>
> ---
>
> Would you like me to apply these changes?

**Do not update files until the user confirms.**

## 6. Apply Changes

Once confirmed:

### 6.1 Update task statuses

In each task group file, update status indicators:
- `🔵 Planned` → `🟡 In Progress` or `✅ Complete`

### 6.2 Add new tasks

If approved, add new tasks to existing task group files:
```markdown
## [N].[M].[X]. [New Task Name]

**Goal**: [What was accomplished]

**Approach**: [How it was implemented]

**Acceptance Criteria**:
- [Derived from what was built]

**Status**: ✅ Complete
```

### 6.3 Create new task groups

If approved, create new task group files following the standard template.

### 6.4 Update area indexes

Add references to new task groups in area `index.md` files.

### 6.5 Update overview

Update `docs/implementation/overview.md` with area status changes.

## 7. Report Results

> **Implementation Docs Reconciled**
>
> **Updates applied:**
> - Updated [N] task statuses
> - Added [N] new tasks
> - Created [N] new task groups
> - Updated [N] area statuses
>
> **Areas affected:**
> - [List areas that were modified]
>
> **Based on:**
> - [N] commits analyzed
> - Scope: [date range or version range]
>
> **Next steps:**
> - Run `/prd.reconcile` to update the PRD
> - Run `/docs.reconcile` for cross-document consistency check

## Key Behaviors

Throughout this command:

- **Match to specs** — Try to map work to existing tasks before creating new ones
- **Show evidence** — Every status change should reference commits or code
- **Preserve structure** — Add new tasks at the end of task groups
- **Flag uncertainty** — When confidence is low, ask rather than assume
- **Update hierarchically** — Task → Task Group → Area → Overview
- **Respect numbering** — Don't renumber existing tasks
- **Note completions** — Already-done work should be marked complete, not planned
