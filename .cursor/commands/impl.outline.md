# Create Implementation Outline

When the user invokes "impl.outline", create a high-level implementation structure from the PRD.

This command creates the skeleton — areas and their brief descriptions — without detailed tasks. Use `/impl.create` afterward to add detail to specific areas.

## 1. Review the PRD

Read `docs/prd.md` thoroughly. Understand:
- **Overview** – What problem are we solving?
- **Goals** – What are the measurable outcomes?
- **Non-Goals** – What's explicitly out of scope?
- **User Stories** – Who benefits and how?
- **Constraints** – What limitations apply?

If no PRD exists, stop and suggest running `/prd.create` first.

## 2. Scan Existing Structure

Check what already exists:
- `docs/implementation/overview.md` – Is there an existing outline?
- `docs/implementation/*/` – Any existing area directories?
- Codebase structure – What patterns exist?

If an outline already exists, ask:
> "An implementation outline already exists. Would you like me to revise it, or extend it with additional areas?"

## 3. Propose Areas

Design 3-7 major implementation areas that map to PRD goals. Consider:
- **Logical grouping** – Related functionality together
- **Dependencies** – Lower numbers = foundational, higher = builds on earlier
- **Scope** – Each area should be substantial but not overwhelming

Present the proposed structure:

```
Proposed Implementation Areas:

1. **Area Name** – Brief description (1-2 sentences)
   Maps to PRD goals: [list relevant goals]

2. **Another Area** – Brief description
   Maps to PRD goals: [list relevant goals]

3. ...
```

Ask:
> "Does this breakdown make sense? Would you like to add, remove, or reorganize any areas before I create the structure?"

**Do not create files until the user confirms.**

## 4. Create the Skeleton

Once approved, create:

### Overview File

Create or update `docs/implementation/overview.md`:

```markdown
# Implementation Overview

This document lists the major implementation areas for this project.

## Implementation Areas

1. **Area Name** – Brief description
   - Status: 🔵 Planned
   - See: `1-area-name/`

2. **Another Area** – Brief description
   - Status: 🔵 Planned
   - See: `2-another-area/`

...
```

### Area Directories

For each area, create:
- Directory: `docs/implementation/{N}-{kebab-name}/`
- Index file: `docs/implementation/{N}-{kebab-name}/index.md`

Index file template:
```markdown
# {N}. Area Name

Brief description of this area and what it accomplishes.

## Goals
- What this area achieves
- How it relates to PRD goals

## Key Considerations
- Important constraints or decisions
- Dependencies on other areas

## Task Groups

_Task groups will be defined when this area is detailed. Run `/impl.create {N}-{area-name}` to add detail._
```

## 5. Summarize and Suggest Next Steps

After creating files, present:
- List of files created
- Suggested order for detailing areas (based on dependencies)

Ask:
> "The implementation outline has been created. Which area would you like to detail first? You can run `/impl.create {area}` to add task groups and tasks."

## Guidelines

- **Keep it high-level** – Don't try to detail tasks yet; that's what `/impl.create` is for
- **Map to PRD goals** – Every area should trace back to at least one PRD goal
- **Respect non-goals** – Don't create areas for out-of-scope work
- **Consider dependencies** – Number areas so foundational work comes first
- **3-7 areas is ideal** – Fewer than 3 suggests the project is simple; more than 7 suggests areas should be consolidated
