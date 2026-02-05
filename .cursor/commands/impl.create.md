# Create Implementation Detail

When the user invokes "impl.create", add detailed task groups and tasks to the implementation specs.

This command works at different scopes:
- **Full project** – Detail all areas (for smaller projects)
- **One area** – Detail a specific area's task groups
- **One task group** – Add tasks to a specific task group

## 1. Determine Scope

Check if the user provided a scope argument:
- `/impl.create` → Ask what scope they want
- `/impl.create 1-authentication` → Detail that area
- `/impl.create 1.2` → Detail that task group

If no argument provided, ask:
> "What would you like to detail?
> 1. **Full project** – Create detailed specs for all areas
> 2. **One area** – Pick an area to flesh out (e.g., `1-authentication`)
> 3. **One task group** – Add detail to a specific task group (e.g., `1.2`)
>
> Which scope, or enter an area/task group identifier?"

## 2. Verify Prerequisites

### For full project or area scope:
- Check `docs/implementation/overview.md` exists
- If not, suggest running `/impl.outline` first

### For task group scope:
- Check the parent area exists
- If not, suggest creating the area first

### Always:
- Read `docs/prd.md` for context on goals and constraints
- Scan relevant existing code to understand what's already built

## 3. Propose the Detail

Based on scope, propose task groups and/or tasks:

### For Area Scope

Propose task groups within the area:

```
Detailing Area: 1. Authentication

Proposed Task Groups:

1.1 **User Registration** – Account creation flow
    - Email validation, password requirements, confirmation

1.2 **Login/Logout** – Session management
    - Credential verification, session tokens, logout cleanup

1.3 **Password Reset** – Recovery flow
    - Reset requests, email tokens, password update

Does this breakdown make sense? Would you like to adjust before I create the specs?
```

### For Task Group Scope

Propose tasks within the task group:

```
Detailing Task Group: 1.2 Login/Logout

Proposed Tasks:

1.2.1 **Login Form UI** – Create the login interface
1.2.2 **Credential Verification** – Backend auth logic
1.2.3 **Session Token Management** – Create and validate tokens
1.2.4 **Logout Flow** – Clear session and redirect

Does this breakdown make sense?
```

### For Full Project Scope

Show the complete structure across all areas, then confirm.

**Do not create files until the user confirms.**

## 4. Create the Spec Files

Once approved, create or update:

### Task Group Files

For each task group, create `docs/implementation/{N}-{area}/{N}.{M}-topic.md`:

```markdown
# {N}.{M} Task Group Name

Brief description of what this task group covers and why it matters.

## Goals
- What this task group accomplishes
- How it maps to PRD goals

## Constraints
- Technical limitations or requirements
- Dependencies on other task groups (if any)

## Dependencies
- **Requires**: List any task groups that must be completed first
- **Enables**: List any task groups that depend on this one

---

## {N}.{M}.1. First Task Name

**Goal**: What this specific task accomplishes

**Approach**: High-level technical approach (2-3 sentences)

**Acceptance Criteria**:
- Specific, testable criteria
- What "done" looks like

**Status**: 🔵 Planned

---

## {N}.{M}.2. Second Task Name

**Goal**: ...

**Approach**: ...

**Acceptance Criteria**:
- ...

**Status**: 🔵 Planned
```

### Update Area Index

Update `docs/implementation/{N}-{area}/index.md` to list the task groups:

```markdown
## Task Groups

- **[1.1 User Registration](./1.1-user-registration.md)** – Account creation flow
- **[1.2 Login/Logout](./1.2-login-logout.md)** – Session management
- ...
```

### Update Overview (if needed)

Update area status in `docs/implementation/overview.md` if moving from planned to detailed.

## 5. Summarize What Was Created

After creating files, present:
- List of files created/updated
- Total number of tasks defined
- Suggested starting point
- Any noted dependencies

Ask:
> "The specs have been created. Would you like to:
> - Start a coding session with `/dev-session.start`?
> - Detail another area with `/impl.create {area}`?
> - Review and adjust any of the specs?"

## Guidelines

- **Right-size tasks** – Each task should be roughly one focused coding session
- **Clear acceptance criteria** – Every task needs testable "done" conditions
- **Note dependencies** – If Task B requires Task A, document it explicitly
- **Map to PRD** – Reference which PRD goals each task group supports
- **Start simple** – Placeholder descriptions are fine; they'll be refined during sessions
- **All tasks start 🔵 Planned** – Status updates happen during `/dev-session.start` and `/dev-session.end`
- **Respect existing work** – If specs already exist for a scope, ask before overwriting
