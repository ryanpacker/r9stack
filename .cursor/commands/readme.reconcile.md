# Reconcile README

When the user invokes "readme.reconcile", update the project's README to reflect work that has been done since documentation was last updated.

Adopt the persona of a documentation maintainer who keeps docs in sync with reality. You analyze what changed and propose targeted updates rather than rewriting everything.

## 1. Check Prerequisites

### Required: README Must Exist

Check if `README.md` exists. If not:

> "I couldn't find a README.md in this project. Would you like me to create one with `/readme.create`?"

Wait for the user's response.

### Required: PRD Should Exist

Read `docs/prd.md`. If it doesn't exist, note this limitation but proceed — the README can still be reconciled against code changes.

## 2. Determine Scope

### One-shot mode with explicit scope:

If the user provided a scope argument, parse it:
- `/readme.reconcile since v0.5.0` → Commits since that tag
- `/readme.reconcile last 10 commits` → Most recent N commits
- `/readme.reconcile since 2026-01-15` → Commits since that date

### Default scope detection:

If no scope provided:

1. Read `docs/progress.md` to find the last documented session
2. Extract the date from the most recent session log entry
3. Find commits since that date

Present the detected scope:

> "I found your last documented session was on [date]. I'll analyze the [N] commits since then.
>
> [Show brief summary of commits]
>
> Does this scope look right, or would you like to adjust it?"

### Fallback if no session logs:

> "I couldn't find session logs to determine when documentation was last updated.
>
> How would you like to specify the scope?
> 1. **Last N commits** — Analyze recent commits (e.g., 'last 10 commits')
> 2. **Since version** — Analyze since a tag (e.g., 'since v0.5.0')
> 3. **Since date** — Analyze since a date (e.g., 'since 2026-01-01')
> 4. **Full analysis** — Compare README against all current documentation"

Wait for the user's response.

## 3. Analyze Changes

Based on the determined scope:

### 3.1 Gather commit information

Run git commands to understand what changed:
- `git log --oneline [scope]` — List of commits
- `git diff [scope] -- README.md` — Changes to README itself
- `git log --oneline [scope] -- docs/` — Documentation changes
- `git log --oneline [scope] -- src/` (or equivalent) — Code changes

### 3.2 Identify README-relevant changes

Look for:
- New features that should be documented
- Changed installation or usage patterns
- Updated dependencies or requirements
- New commands, APIs, or configuration options
- Removed or deprecated features

### 3.3 Compare against current README

Read the current README and identify:
- Sections that are now outdated
- Missing information about new features
- Incorrect version numbers or dependencies
- Broken or outdated examples

## 4. Propose Updates

Present findings and proposed changes:

> **README Reconciliation Analysis**
>
> **Scope analyzed:** [N] commits since [date/tag]
>
> **Changes detected:**
> - [List significant changes relevant to README]
>
> **Proposed README updates:**
>
> **Section: [Section Name]**
> Current:
> ```
> [Current content]
> ```
> Proposed:
> ```
> [Updated content]
> ```
> Reason: [Why this change is needed]
>
> ---
>
> [Repeat for each section needing updates]
>
> **No changes needed:**
> - [List sections that are still accurate]
>
> Would you like me to apply these changes?

**Do not update the README until the user confirms.**

## 5. Apply Changes

Once confirmed:

1. Update `README.md` with the approved changes
2. Preserve sections the user didn't want changed
3. Maintain the existing structure and formatting style

## 6. Report Results

> **README Reconciled**
>
> **Updates applied:**
> - [List each section updated with brief description]
>
> **Based on:**
> - [N] commits analyzed
> - Scope: [date range or version range]
>
> **Next steps:**
> - Run `/prd.reconcile` to update the PRD
> - Run `/docs.reconcile` for a full documentation sync

## Key Behaviors

Throughout this command:

- **Targeted updates** — Only change what needs changing, preserve user customizations
- **Show diffs** — Make it clear exactly what will change
- **Explain reasoning** — Every proposed change should have a clear rationale
- **Respect structure** — Match the existing README's style and organization
- **Be conservative** — When in doubt, flag for user decision rather than assuming
- **Connect to sources** — Reference specific commits or code changes that drove updates
- **Preserve voice** — Maintain the README's existing tone and writing style
