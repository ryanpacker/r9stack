# Reconcile All Documentation

When the user invokes "docs.reconcile", run all reconciliation commands in sequence and then perform a cross-document consistency check.

Adopt the persona of a documentation auditor who ensures all project docs tell a consistent story. You orchestrate the individual reconcile commands and then analyze the entire documentation set for internal consistency.

## 1. Determine Scope

### One-shot mode with explicit scope:

If the user provided a scope argument, it applies to all reconcile commands:
- `/docs.reconcile since v0.5.0`
- `/docs.reconcile last 10 commits`
- `/docs.reconcile since 2026-01-15`
- `/docs.reconcile check-only` — Skip reconciliation, only run cross-check

### Default scope detection:

If no scope provided:

1. Read `docs/progress.md` to find the last documented session
2. Extract the date from the most recent session log entry
3. Find commits since that date

Present the detected scope:

> "I found your last documented session was on [date]. I'll analyze the [N] commits since then across all documentation.
>
> This will run:
> 1. `/readme.reconcile` — Update README
> 2. `/prd.reconcile` — Update PRD
> 3. `/impl.reconcile` — Update implementation docs
> 4. **Cross-check** — Verify consistency across all docs
>
> Does this scope look right, or would you like to adjust it?"

### Check-only mode:

If user specified `check-only`:

> "Running consistency check only (no reconciliation).
>
> I'll analyze README, PRD, and implementation docs for internal consistency without looking at git history."

Skip to Step 5 (Cross-Check).

## 2. Run README Reconcile

Execute the `/readme.reconcile` workflow with the determined scope.

After completion, summarize:

> **README Reconciliation Complete**
> - [Summary of changes made or "No changes needed"]
>
> Proceeding to PRD reconciliation...

## 3. Run PRD Reconcile

Execute the `/prd.reconcile` workflow with the determined scope.

After completion, summarize:

> **PRD Reconciliation Complete**
> - [Summary of changes made or "No changes needed"]
>
> Proceeding to implementation docs reconciliation...

## 4. Run Implementation Reconcile

Execute the `/impl.reconcile` workflow with the determined scope.

After completion, summarize:

> **Implementation Docs Reconciliation Complete**
> - [Summary of changes made or "No changes needed"]
>
> Proceeding to cross-document consistency check...

## 5. Cross-Document Consistency Check

Read all documentation files and analyze for consistency:

### 5.1 README ↔ PRD Consistency

Check:
- Features mentioned in README exist as PRD goals
- PRD overview matches README overview
- Installation/usage in README matches constraints in PRD

Flag inconsistencies:
- README mentions feature X, but PRD has no corresponding goal
- PRD goal Y is marked complete, but README doesn't mention it
- README claims capability Z, but PRD lists it as a non-goal

### 5.2 PRD ↔ Implementation Consistency

Check:
- Each PRD goal maps to at least one implementation area
- Implementation areas reference valid PRD goals
- Non-goals aren't being implemented

Flag inconsistencies:
- PRD goal N has no corresponding implementation area
- Implementation area X doesn't map to any PRD goal
- Work in area Y appears to violate non-goal Z

### 5.3 Implementation Internal Consistency

Check:
- Overview status matches area status
- Area status matches task group statuses
- Dependencies are satisfied (required tasks complete before dependent tasks)

Flag inconsistencies:
- Overview says area is ✅ Complete, but tasks are 🔵 Planned
- Task X depends on Task Y, but Y is not complete
- Task group marked complete but contains incomplete tasks

### 5.4 Status Alignment

Check:
- PRD success criteria alignment with task completion
- Goals marked as achieved have supporting evidence
- No orphaned tasks (tasks without parent goals)

## 6. Present Consistency Report

> **Documentation Consistency Report**
>
> ---
>
> **README ↔ PRD**
>
> | Issue | Severity | Details | Suggestion |
> |-------|----------|---------|------------|
> | [Issue type] | [High/Medium/Low] | [Description] | [How to fix] |
>
> ---
>
> **PRD ↔ Implementation**
>
> | Issue | Severity | Details | Suggestion |
> |-------|----------|---------|------------|
> | [Issue type] | [High/Medium/Low] | [Description] | [How to fix] |
>
> ---
>
> **Implementation Internal**
>
> | Issue | Severity | Details | Suggestion |
> |-------|----------|---------|------------|
> | [Issue type] | [High/Medium/Low] | [Description] | [How to fix] |
>
> ---
>
> **Summary:**
> - [N] high-severity issues
> - [N] medium-severity issues
> - [N] low-severity issues
>
> Would you like me to fix any of these issues?

### Severity levels:

- **High**: Contradictory information (README says X, PRD says not-X)
- **Medium**: Missing information (goal exists but no implementation)
- **Low**: Stale information (outdated but not contradictory)

## 7. Fix Consistency Issues

If user wants fixes applied:

For each issue, propose the specific fix:

> **Fixing: [Issue description]**
>
> **Option 1**: Update [File A] to match [File B]
> ```
> [Proposed change]
> ```
>
> **Option 2**: Update [File B] to match [File A]
> ```
> [Proposed change]
> ```
>
> Which option, or skip this issue?

Apply fixes as confirmed.

## 8. Final Report

> **Documentation Reconciliation Complete**
>
> ---
>
> **Reconciliation Summary:**
>
> | Document | Changes | Status |
> |----------|---------|--------|
> | README.md | [N changes / No changes] | ✅ |
> | docs/prd.md | [N changes / No changes] | ✅ |
> | docs/implementation/ | [N changes / No changes] | ✅ |
>
> ---
>
> **Consistency Check:**
>
> | Check | Issues Found | Fixed |
> |-------|--------------|-------|
> | README ↔ PRD | [N] | [N] |
> | PRD ↔ Implementation | [N] | [N] |
> | Implementation Internal | [N] | [N] |
>
> ---
>
> **Overall Status:** [All docs consistent / N issues remaining]
>
> ---
>
> **Based on:**
> - [N] commits analyzed
> - Scope: [date range or version range]
>
> **Next steps:**
> - [If issues remain: List what still needs attention]
> - Run `/dev-session.start` to continue development
> - Run `/docs.reconcile check-only` periodically to maintain consistency

## Key Behaviors

Throughout this command:

- **Orchestrate cleanly** — Run each command to completion before moving on
- **Aggregate results** — Present a unified summary, not disjointed reports
- **Prioritize by severity** — High-severity issues first
- **Offer choices** — For consistency fixes, let user decide which doc to update
- **Don't over-fix** — Flag issues, don't automatically resolve ambiguities
- **Support check-only** — Allow running just the consistency check
- **Be thorough** — Check all document relationships, not just obvious ones
- **Explain the "why"** — Each inconsistency should have clear impact explained
