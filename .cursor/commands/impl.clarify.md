# Clarify Implementation

When the user invokes this command, help them refine and clarify existing implementation specs through targeted questions.

## 1. Read Existing Implementation

Read `docs/implementation/overview.md`. If it doesn't exist or is empty:

> "I couldn't find existing implementation specs at `docs/implementation/overview.md`. Would you like me to create an outline first with `/impl.outline`?"

Stop and wait for the user's response.

Also read `docs/prd.md` for context on goals and constraints.

## 2. Determine Scope

Check if the user specified a scope with the command:
- `/impl.clarify` → Ask what scope they want
- `/impl.clarify 1-authentication` → Clarify that area
- `/impl.clarify 1.2` → Clarify that task group
- `/impl.clarify 1.2.3` → Clarify that specific task

If no argument provided, first analyze the existing specs to identify areas that could benefit from clarification, then ask:

> **Current Implementation Structure:**
>
> [List areas with brief assessment of clarity]
>
> **Areas that may need clarification:**
> - [Area/task group with vague goals or missing acceptance criteria]
> - [Area/task group with unclear dependencies]
>
> Which would you like to clarify? You can specify:
> - An area (e.g., `1-authentication`)
> - A task group (e.g., `1.2`)
> - A specific task (e.g., `1.2.3`)

Wait for the user to specify what to clarify.

## 3. Analyze Current Content

Once a scope is identified, read the relevant files and analyze for clarity issues:

### For Area Scope

Read `docs/implementation/{N}-{area}/index.md` and all task group files within.

Look for:
- Vague or missing area goals
- Task groups without clear scope boundaries
- Missing or incomplete key considerations
- Unclear relationships between task groups

### For Task Group Scope

Read `docs/implementation/{N}-{area}/{N}.{M}-topic.md`.

Look for:
- Vague task group goals
- Tasks without clear acceptance criteria
- Missing or unclear approach descriptions
- Undocumented dependencies
- Tasks that seem too large or too small

### For Task Scope

Read the specific task within its task group file.

Look for:
- Goal that doesn't clearly state what "done" means
- Missing or vague acceptance criteria
- Approach that lacks technical specificity
- Missing dependencies on other tasks

## 4. Present Findings

Summarize the current content and what needs clarification:

> **Current [Area/Task Group/Task]:**
>
> [Quote or summarize the current content]
>
> **Areas needing clarification:**
> - [Specific issue 1]
> - [Specific issue 2]

## 5. Ask Targeted Questions

Ask 1-3 specific questions to draw out more detail. Tailor questions to what's unclear:

**Goals:**
- "What specific outcome does this [area/task group/task] produce?"
- "How does this map to the PRD goals?"
- "What would be different in the codebase when this is complete?"

**Acceptance Criteria:**
- "How would you verify this task is complete?"
- "What specific behavior should be testable?"
- "Are there edge cases that need to be handled?"

**Approach:**
- "What's the high-level technical strategy here?"
- "Are there specific patterns or libraries you want to use?"
- "What files or modules will this touch?"

**Dependencies:**
- "Does this require any other tasks to be completed first?"
- "What other tasks depend on this being done?"
- "Are there external dependencies (APIs, services) to consider?"

**Scope:**
- "This task seems broad — should it be broken into smaller tasks?"
- "This seems very specific — is it part of a larger task group?"

## 6. Push Back on Vagueness

If the user's answers are vague or unmeasurable, push back:

- ❌ "Implement authentication" → ✅ "Create login endpoint that validates credentials against user table and returns JWT token"
- ❌ "Make it work" → ✅ "Function returns correct result for inputs X, Y, Z as verified by unit tests"
- ❌ "Handle errors" → ✅ "Invalid input returns 400 with error message; server errors return 500 and log to error tracking"

> "That's a good direction, but it's hard to verify completion. What specific behavior or output would you check to confirm this is done?"

## 7. Check for Conflicts

As you clarify, watch for conflicts:

- Dependencies that create circular references
- Acceptance criteria that contradict other tasks
- Scope that overlaps with other task groups
- Approaches that conflict with stated constraints in the PRD

If you spot a conflict:

> "I noticed a potential conflict: [describe conflict]. Should we adjust one of these?"

## 8. Propose Updated Content

After gathering more detail, propose the updated spec:

> **Proposed [Area/Task Group/Task]:**
>
> [Show the proposed updated content in full]
>
> Does this capture what we discussed, or would you like to adjust it?

Wait for user approval before proceeding.

## 9. Update the Specs

After the user approves the clarified content:

1. Update the relevant file(s) with the new content
2. Preserve sections that weren't modified
3. Update any related files if dependencies changed

## 10. Report Changes

Summarize what was changed:

> **Implementation Specs Updated:**
>
> **Files modified:**
> - [File 1]: [brief description of changes]
>
> **Sections clarified:**
> - [Section 1]: [what was improved]
> - [Section 2]: [what was improved]
>
> Would you like to clarify anything else?

## Key Behaviors

Throughout this command, maintain these behaviors:

- **Analyze before asking** — Review existing specs to identify what's actually unclear
- **Be specific in questions** — Ask about concrete details, not abstract concepts
- **Push back on vagueness** — Testable > aspirational
- **Watch for conflicts** — Dependencies and acceptance criteria should be consistent
- **Propose, don't impose** — Show proposed changes and wait for approval
- **One scope at a time** — Don't overwhelm with too many changes at once
- **Map to PRD** — Ensure implementation details align with stated goals and constraints
