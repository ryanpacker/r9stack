# Create README

When the user invokes "readme.create", generate a comprehensive README for the project based on existing documentation and project state.

Adopt the persona of a technical writer who creates clear, well-structured documentation. You understand that a good README is often the first thing developers see, so it needs to be accurate, scannable, and immediately useful.

## 1. Check Prerequisites

### Required: PRD Should Exist

Read `docs/prd.md`. If it doesn't exist:

> "I couldn't find a PRD at `docs/prd.md`. The PRD provides the project overview, goals, and key concepts that form the foundation of a good README.
>
> Would you like to:
> 1. **Create a PRD first** — Run `/prd.create` to establish the foundation
> 2. **Proceed anyway** — I'll generate a basic README from what I can find
>
> Which would you prefer?"

Wait for the user's response.

### Check for Existing README

If `README.md` exists at project root:

> "I found an existing README.md. Would you like me to:
> 1. **Replace it** — Generate a fresh README from current documentation
> 2. **Update it** — Use `/readme.reconcile` to update specific sections
>
> Which would you prefer?"

Wait for the user's response.

## 2. Gather Context

Read available sources to understand the project:

- `docs/prd.md` — Overview, goals, key concepts
- `package.json` or equivalent — Name, version, dependencies, scripts
- `docs/implementation/overview.md` — Current implementation status
- Existing code structure — Major directories and their purpose
- `.flight-rules/AGENTS.md` — If present, understand the project workflow

Note key elements:
- Project name and one-line description
- Primary goals and use cases
- Installation requirements
- How to run/use the project
- Development workflow

## 3. Determine Mode

**One-shot mode:** If the user provided specific instructions (e.g., "/readme.create focus on API documentation"), incorporate those instructions.

**Conversational mode:** If invoked without instructions:

> "I'm going to generate a README based on your project's documentation.
>
> Before I proceed, are there any specific sections you want me to emphasize or exclude? For example:
> - API documentation
> - Contributing guidelines
> - Detailed installation options
>
> Or I can proceed with a standard structure."

Wait for the user's response or proceed if they indicate standard is fine.

## 4. Draft the README

Generate a README with the following structure (adapt based on project type):

```markdown
# [Project Name]

[One-line description from PRD overview]

## Overview

[2-3 paragraph summary from PRD, explaining what the project is and why it exists]

## Features

[Bullet list derived from PRD goals]

## Installation

[Based on package.json, requirements.txt, or equivalent]

## Usage

[Basic usage examples, derived from documentation or code analysis]

## Development

[How to set up for development, run tests, etc.]

## Project Structure

[Brief overview of key directories, if helpful]

## License

[From package.json or LICENSE file]
```

## 5. Present Draft

Show the complete draft:

> **Draft README:**
>
> [Show the complete README content]
>
> **Sources used:**
> - [List which files informed each section]
>
> Would you like me to:
> 1. **Save as-is** — Write to README.md
> 2. **Adjust sections** — Tell me what to change
> 3. **Add more detail** — Expand specific sections

**Do not write the file until the user confirms.**

## 6. Save and Report

Once confirmed, write to `README.md` and report:

> **README Created:** `README.md`
>
> **Sections included:**
> - [List each section]
>
> **Derived from:**
> - [List source files]
>
> To keep this README in sync with your project, run `/readme.reconcile` after making significant changes.

## Key Behaviors

Throughout this command:

- **Derive, don't fabricate** — Every claim in the README should come from actual documentation or code
- **Keep it scannable** — Use headers, bullets, and short paragraphs
- **Front-load value** — Put the most important information first
- **Match the project's tone** — Technical projects get technical READMEs; friendly projects get friendly READMEs
- **Include examples** — Usage examples are more valuable than descriptions
- **Link to docs** — Reference detailed documentation rather than duplicating it
- **Show, don't tell** — Prefer code examples over prose explanations
