# Flight Rules – Agent Guidelines

flight_rules_version: 0.1.3

This file defines how agents (Claude Code, Cursor, etc.) should work on software projects using the Flight Rules system.

It explains:
- How project docs are structured
- How implementation specs work
- How to use start / end coding sessions
- Where progress and learnings are tracked

The goal: any agent (or human) should be able to understand the project's lifecycle and contribute without guesswork.

---

## 1. High-level lifecycle

Assume the following lifecycle for projects:

1. **Idea & PRD** – captured in `.flight-rules/docs/prd.md`
2. **Implementation specs (iterative)** – The spec system (Areas → Task Groups → Tasks) lives under `.flight-rules/docs/implementation/`. Usually, Areas and Task Groups are drafted first, but individual Tasks are typically fleshed out incrementally, often at the start of each coding session as part of setting the plan for that session.

3. **Coding sessions** – At the beginning of a session, identify or refine the relevant Tasks within a Task Group, make a clear plan for implementation, and then execute against that plan.
   - Each session should produce:
     - Detailed documentation in `.flight-rules/docs/session_logs/`
     - A brief summary/log entry in `.flight-rules/docs/progress.md` also links to the details in `session_logs`.
4. **Critical learnings** – promoted into `.flight-rules/docs/critical-learnings.md`
5. **Commits & releases** – Git history + tags/releases reflect implementation of the specs

Agents should prefer working *with* this system rather than inventing their own structure.

---

## 2. Project structure

This project contains a `.flight-rules/` directory with the following structure:

### doc-templates/

Templates for project documentation. These are Flight Rules framework files that can be replaced on upgrade.

- `.flight-rules/doc-templates/prd.md` – Template for product requirements
- `.flight-rules/doc-templates/progress.md` – Template for progress log
- `.flight-rules/doc-templates/critical-learnings.md` – Template for learnings
- `.flight-rules/doc-templates/session-log.md` – Template for session logs
- `.flight-rules/doc-templates/implementation/overview.md` – Template for implementation overview

When helping users set up a new project, copy these templates to `docs/`.

### docs/

**This directory contains user-owned project content. Flight Rules upgrades never touch this directory.**

- `.flight-rules/docs/prd.md`  
  - Product requirements and high-level goals.
  - Agents should read this when clarifying "what are we building and why?"
  - Created by copying from `doc-templates/prd.md`

- `.flight-rules/docs/implementation/`  
  - Home of the implementation spec hierarchy (see next section).
  - The **spec is the single source of truth** for what should exist in the codebase and why.
  - Start by copying `doc-templates/implementation/overview.md` here.

- `.flight-rules/docs/progress.md`  
  - A running high-level log of sessions and milestones.
  - Each session gets a short entry + link to its detailed log file.
  - Created by copying from `doc-templates/progress.md`

- `.flight-rules/docs/critical-learnings.md`  
  - A curated list of reusable insights, patterns, and "never again" notes.
  - Agents should propose additions when a session reveals something important or reusable.
  - Created by copying from `doc-templates/critical-learnings.md`

- `.flight-rules/docs/session_logs/`  
  - Session documentation created during coding sessions.
  - Contains plans, summaries, and learnings from each session.
  - Use `doc-templates/session-log.md` as a template for new logs.

### commands/

- `.flight-rules/commands/`  
  - Command files that agents execute when the user invokes specific workflows.
  - Examples: `start-coding-session.md`, `end-coding-session.md`

### prompts/

- `.flight-rules/prompts/`  
  - Reusable prompt templates for common tasks.
  - Store frequently-used prompts here so they can be versioned and shared.

---

## 3. Implementation spec system (Areas, Task Groups, Tasks)

Implementation specs live in `.flight-rules/docs/implementation/` and follow a 3-level hierarchy:

| Level | Name | Example | Description |
|-------|------|---------|-------------|
| 1 | **Area** | `1-foundation-shell/` | A major implementation area (directory) |
| 2 | **Task Group** | `1.4-application-shell.md` | A file containing related tasks |
| 3 | **Task** | `1.4.1. Routing Structure` | A specific unit of work with status |

### Areas (Level 1)

- Listed in `.flight-rules/docs/implementation/overview.md`
- Each Area is a directory: `.flight-rules/docs/implementation/{N}-{kebab-topic}/`
- Contains an `index.md` with overview, goals, and architecture context
- Examples: "Foundation & Shell", "Core Domain Models", "API Integration"

### Task Groups (Level 2)

- Files within an Area directory: `{N}.{M}-topic.md`
- Each Task Group covers a coherent piece of work
- Contains multiple related Tasks

### Tasks (Level 3)

- Sections within a Task Group file (e.g., `1.4.1. Routing Structure`)
- Each Task includes:
  - Clear goals and scope
  - Constraints and decisions
  - A breakdown of steps
  - A `Status:` line

**Status tracking**

- Status is tracked **at the Task level** within Task Group files, not in code comments or random notes.
- Typical status values:
  - `Status: 🔵 Planned`
  - `Status: 🟡 In Progress`
  - `Status: ✅ Complete`

**Core rule: the spec is the single source of truth**

- If the code deviates from the spec (because the user or agent made a change), that's acceptable **only if the spec is updated** to reflect reality.
- In an ideal world, someone could recreate the project from scratch by implementing each spec file one by one.

**Agent behavior with specs**

When working on code:

1. Identify the relevant Area, Task Group, and Task(s) for the work.
2. Explicitly reference the Task ID(s) (e.g., `1.4.2 Left Sidebar Implementation`) in your working notes / session plan.
3. After implementation:
   - Propose updates to the corresponding Task(s) for the user's approval:
     - What was actually done
     - Any deviations from original plan
     - Updated `Status:` values

---

## 4. Coding sessions

The user will explicitly start and end sessions using commands or workflows like:

- **"start coding session"** → use `.flight-rules/commands/start-coding-session.md`
- **"end coding session"**   → use `.flight-rules/commands/end-coding-session.md`

Agents **must not** initiate these workflows on their own; they are only run when the user asks.

### 4.1 Start coding session

When the user triggers a start session command, follow the process defined in `.flight-rules/commands/start-coding-session.md`. The generic behavior:

1. **Review project context**
   - Read `.flight-rules/docs/prd.md`, `.flight-rules/docs/implementation/overview.md`, relevant spec files, and `.flight-rules/docs/progress.md`.
   - Read the most recent session log in `.flight-rules/docs/session_logs/` if present.
   - Scan code as needed to understand current state.

2. **Establish session goals**
   - Ask the user for goals for this session.
   - Suggest goals based on "Next Steps" from the last session and spec statuses.
   - Agree on a small set of specific, achievable goals.

3. **Create a detailed implementation plan**
   - Collaborate with the user on approach:
     - Technical options (with pros/cons)
     - Constraints
     - Potential challenges and mitigations

4. **Document the session plan**
   - Create a session log in `.flight-rules/docs/session_logs/` using the template at `.flight-rules/doc-templates/session-log.md`.
   - Reference relevant Task Group and Task IDs.

5. **Confirm before coding**
   - Show the user the plan (or a summary).
   - Ask explicitly:  
     > "The session plan has been documented. Are you ready for me to begin implementing this plan?"  
   - **Do not** begin implementation until they confirm.

### 4.2 End coding session

When the user triggers an end session command, follow the process in `.flight-rules/commands/end-coding-session.md`. Generic behavior:

1. **Review sandbox / scratch files**  
   - Identify temporary / sandbox code and determine, with the user, what to keep vs delete.

2. **Summarize the session**
   - Draft a summary covering:
     - What was accomplished
     - Key decisions (especially deviations from spec)
     - Implementation details of note
     - Challenges and how they were resolved
     - Proposed next steps
   - Present the summary to the user for edits/approval.

3. **Update the session log**
   - Update the session log in `.flight-rules/docs/session_logs/` with the summary.
   - Link to relevant Task Groups, Tasks, and code areas.

4. **Update progress**
   - Append a short entry to `.flight-rules/docs/progress.md`:
     - Date/time
     - 2–4 bullet summary
     - Link to the session log file.

5. **Promote critical learnings**  
   - Scan the session details for reusable insights or "this will matter again" items.
   - Propose additions to `.flight-rules/docs/critical-learnings.md` and update that file when the user approves.

6. **Offer to commit**
   - Ask if the user wants to commit now.
   - If yes, help prepare a concise, meaningful commit message summarizing the session.

---

## 5. Agent behavior & tone

- **Opinionated but not rigid**  
  - Prefer following this workflow, but do not block the user if they want to "just do X in file Y right now."
  - It's appropriate to say things like:
    - "We *could* create a quick session plan first; want to do that?"
    - "This change touches multiple specs; should we update them before we stop?"

- **Ask questions when uncertain**  
  - If an instruction is ambiguous, ask for clarification rather than guessing.

- **Defer to project-specific overrides**  
  - If the project has its own `AGENTS.local.md` or agent-specific config that extends these rules, follow those where they differ.

---

## 6. Where to look for project-specific instructions

When working in a project that uses this system:

1. Read this `.flight-rules/AGENTS.md` file.
2. Look for project-specific overrides or additions in:
   - `AGENTS.local.md` (if present at project root)
   - Additional docs under `.flight-rules/docs/` (e.g., `architecture.md`, project-specific guides)
3. Treat project-specific content as authoritative where it narrows or extends these global rules.

---

If you are an agent in this project, your default behavior should be:

1. Respect the structure and workflows described here.
2. Use the implementation spec as the single source of truth.
3. Use start/end coding session workflows when the user explicitly invokes them.
4. Help keep PRD, specs, progress, and learnings clean, accurate, and up-to-date.

