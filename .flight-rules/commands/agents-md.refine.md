# Refine AGENTS.md

When the user invokes this command, help them refactor their AGENTS.md file to follow progressive disclosure principles — keeping the root file minimal and linking to detailed category files.

## 1. Read Existing AGENTS.md

Look for AGENTS.md in these locations (in order):
1. `.flight-rules/AGENTS.md`
2. `AGENTS.md` (project root)
3. User-specified path (if provided with command)

If no AGENTS.md is found:

> "I couldn't find an AGENTS.md file. Please specify the path to the file you want to refine."

Stop and wait for the user's response.

## 2. Find Contradictions

Scan the file for instructions that conflict with each other. Common contradiction patterns:

- "Always do X" vs. "Never do X" in different sections
- Conflicting style preferences (e.g., "use semicolons" vs. "no semicolons")
- Contradictory workflow instructions
- Overlapping rules with different specifics

For each contradiction found, present it to the user:

> **Contradiction Found:**
>
> **Instruction A** (line ~XX):
> > [quote the instruction]
>
> **Instruction B** (line ~YY):
> > [quote the instruction]
>
> Which version should we keep?
> 1. Keep Instruction A
> 2. Keep Instruction B
> 3. Merge them (explain how)
> 4. Remove both

Wait for user input before proceeding. Repeat for each contradiction.

If no contradictions are found:

> "No contradictions found. Proceeding to identify essential content."

## 3. Identify the Essentials

Extract only what belongs in a minimal root AGENTS.md. The essentials are:

- **One-sentence project description** — What is this project?
- **Package manager** — Only if not npm (e.g., pnpm, yarn, bun)
- **Non-standard build/test/typecheck commands** — Only if they differ from defaults
- **Truly universal instructions** — Things that apply to literally every task

Present what you've identified as essential:

> **Proposed Essential Content (Root AGENTS.md):**
>
> ```markdown
> # Project Name
>
> [One-sentence description]
>
> ## Quick Reference
>
> - Package manager: [pnpm/yarn/bun, or omit if npm]
> - Build: [command, or omit if standard]
> - Test: [command, or omit if standard]
> - Typecheck: [command, or omit if standard]
>
> ## Detailed Guidelines
>
> For specific topics, see:
> - [Category 1](./agents/category-1.md)
> - [Category 2](./agents/category-2.md)
> ```
>
> Does this capture the essentials, or should something be added/removed?

Wait for user approval before proceeding.

## 4. Group the Rest

Organize remaining (non-essential) instructions into logical categories. Common groupings:

| Category | What belongs here |
|----------|-------------------|
| `typescript.md` | Type conventions, generics usage, strict mode rules |
| `testing.md` | Test patterns, mocking strategies, coverage expectations |
| `api-design.md` | Endpoint conventions, error handling, response formats |
| `git-workflow.md` | Commit message format, branch naming, PR conventions |
| `code-style.md` | Formatting, naming conventions, file organization |
| `error-handling.md` | Exception patterns, logging, user-facing errors |
| `dependencies.md` | Approved libraries, version policies, security rules |

Present the proposed groupings:

> **Proposed Category Files:**
>
> **1. `agents/typescript.md`**
> - [List of instructions that will go here]
>
> **2. `agents/testing.md`**
> - [List of instructions that will go here]
>
> [Continue for each category...]
>
> Does this grouping make sense? Would you like to:
> - Merge any categories?
> - Split any categories?
> - Rename any categories?
> - Move specific instructions between categories?

Wait for user approval before proceeding.

## 5. Flag for Deletion

Identify instructions that should be removed entirely. Flag items that are:

**Redundant** — The agent already knows this:
- "Write clean, readable code"
- "Use meaningful variable names"
- "Follow best practices"
- "Handle errors appropriately"

**Too vague to be actionable:**
- "Keep things simple"
- "Be consistent"
- "Use good architecture"

**Overly obvious:**
- "Don't introduce bugs"
- "Test your code"
- "Read the requirements"

Present flagged items:

> **Flagged for Deletion:**
>
> | Instruction | Reason |
> |-------------|--------|
> | "Write clean code" | Redundant — agents already optimize for readability |
> | "Be consistent with existing patterns" | Too vague — which patterns? |
> | "Use TypeScript" | Obvious — the project is already TypeScript |
>
> Should I remove these, or would you like to keep any of them?

Wait for user approval.

## 6. Create the File Structure

After all approvals, create the files:

1. **Create the `agents/` directory** (or use existing location)
2. **Write each category file** with its grouped instructions
3. **Rewrite the root AGENTS.md** with:
   - Essential content only
   - Links to category files
   - Brief description of what each category contains

## 7. Report Changes

Summarize what was created:

> **AGENTS.md Refactored**
>
> **Root file:** `[path]/AGENTS.md`
> - Reduced from ~XXX lines to ~YY lines
> - Contains: project description, quick reference, links to details
>
> **Category files created:**
> - `agents/typescript.md` — X instructions
> - `agents/testing.md` — Y instructions
> - [etc.]
>
> **Removed:** Z redundant/vague instructions
>
> **Contradictions resolved:** N

## Key Behaviors

Throughout this command:

- **Progressive disclosure** — Root file should be skimmable in 30 seconds
- **Ask before deleting** — Never remove content without explicit approval
- **Preserve intent** — When reorganizing, don't lose the user's original meaning
- **Link, don't duplicate** — Each instruction lives in exactly one place
- **Be specific about vagueness** — When flagging for deletion, explain why it's not actionable
