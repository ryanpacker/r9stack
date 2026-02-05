# Bump Version

When the user invokes "version.bump", help them update the project version following semantic versioning conventions. This command supports two modes: one-shot (when the user specifies major/minor/patch) and conversational (analyze commits and recommend).

## 1. Check Prerequisites

### Working Directory Must Be Clean

Run `git status --porcelain` to check for uncommitted changes.

If there are uncommitted changes:

> "There are uncommitted changes in the working directory. Version bumping typically requires a clean working tree.
>
> Would you like me to:
> 1. **Show the changes** — See what's uncommitted
> 2. **Proceed anyway** — Some version tools allow this
> 3. **Stop** — Commit or stash changes first
>
> Which would you prefer?"

Wait for the user's response.

### Project Type Detection

Detect the project type by checking for these files (in order):

1. `package.json` → npm project
2. `pyproject.toml` → Python project (Poetry/modern)
3. `setup.py` → Python project (legacy)
4. `Cargo.toml` → Rust project
5. `go.mod` → Go project

If no recognized project file is found:

> "I couldn't detect the project type. What kind of project is this, and where is the version defined?"

Wait for the user's response.

## 2. Determine Mode

**One-shot mode:** If the user provided a bump level with the command (e.g., "version.bump patch", "version.bump minor", "version.bump major"), proceed to Step 5.

**Conversational mode:** If the user invoked the command without specifying a level, proceed to Step 3.

## 3. Find Latest Version Tag

Run one of these commands to find the most recent version tag:

```bash
git describe --tags --abbrev=0 2>/dev/null
```

Or if that fails (no tags yet):

```bash
git tag --sort=-v:refname | head -1
```

### Handle Tag Formats

Version tags may use different formats:
- `v1.2.3` (with v prefix)
- `1.2.3` (without prefix)

Extract the version number regardless of format.

### No Tags Found

If no version tags exist:

> "I couldn't find any version tags in this repository. This appears to be the first release.
>
> Current version in package.json: [version]
>
> Would you like to:
> 1. **Tag the current version** — Create a tag for the existing version, then bump
> 2. **Bump from current** — Just bump the version in package.json without analyzing history
>
> Which would you prefer?"

Wait for the user's response.

## 4. Analyze Changes Since Last Tag

### Get Commit History

Run:

```bash
git log {tag}..HEAD --oneline
```

Where `{tag}` is the version tag found in Step 3.

### Categorize Changes

Review each commit message and categorize:

**Breaking Changes (→ major bump):**
- Contains "BREAKING CHANGE" or "BREAKING:"
- Commit type with exclamation suffix (e.g., "feat!:", "fix!:")
- Messages indicating removed features, changed APIs, or incompatible changes
- Words like "remove", "delete", "rename" for public APIs

**New Features (→ minor bump):**
- Commit type "feat:" or "feature:"
- Messages containing "add", "new", "implement", "introduce"
- New capabilities that don't break existing functionality

**Fixes and Maintenance (→ patch bump):**
- Commit type "fix:", "bugfix:"
- Commit type "docs:", "style:", "refactor:", "perf:", "test:", "chore:"
- Messages containing "fix", "correct", "patch", "update", "improve"

### Present Analysis

Present the findings:

> **Changes since {tag}:**
>
> **Breaking Changes:** [count]
> - [list each with commit hash prefix]
>
> **New Features:** [count]
> - [list each with commit hash prefix]
>
> **Fixes & Maintenance:** [count]
> - [list each with commit hash prefix]
>
> **Recommendation: {MAJOR|MINOR|PATCH}**
>
> [Explain the reasoning, e.g., "There are breaking changes that require a major version bump" or "New features were added without breaking changes, suggesting a minor bump"]
>
> Current version: {current}
> Recommended version: {recommended}
>
> Would you like to proceed with this recommendation, or specify a different bump level?

Wait for user confirmation or override.

## 5. Apply Version Bump

Based on the confirmed bump level, apply the change using project-appropriate tooling.

### npm Projects

For projects with `package.json`, use npm's version command:

```bash
npm version {patch|minor|major}
```

**Important:** This command:
- Updates the `version` field in `package.json`
- Runs the `version` lifecycle script if defined (e.g., for syncing version to other files)
- Creates a git commit with the version as the message
- Creates a git tag (e.g., `v1.2.4`)

Do NOT manually create a commit or tag — `npm version` handles this.

### Python Projects (pyproject.toml)

For Poetry projects:

```bash
poetry version {patch|minor|major}
```

Then commit and tag manually:

```bash
git add pyproject.toml
git commit -m "{new_version}"
git tag v{new_version}
```

### Python Projects (setup.py)

Update the `version` parameter in `setup.py`, then commit and tag:

```bash
git add setup.py
git commit -m "{new_version}"
git tag v{new_version}
```

### Rust Projects

Update the `version` field in `Cargo.toml`, then commit and tag:

```bash
git add Cargo.toml
git commit -m "{new_version}"
git tag v{new_version}
```

### Other Projects

For unrecognized project types, ask the user which file contains the version and update it manually, then commit and tag.

## 6. Report Result

After applying the version bump:

> **Version bumped successfully**
>
> - Previous version: {old_version}
> - New version: {new_version}
> - Bump type: {patch|minor|major}
>
> **What happened:**
> - Updated version in {file}
> - Created commit: {commit_hash}
> - Created tag: {tag}
>
> **Next steps:**
> - Run `git push && git push --tags` to push the release
> - Run `/project.release` to execute your full release workflow (if configured)

## Key Behaviors

Throughout this command, maintain these behaviors:

- **Default to patch when uncertain** — If commit analysis is ambiguous, recommend patch (safest)
- **Respect existing conventions** — Use the same tag format the project already uses (v-prefix or not)
- **Don't duplicate work** — Let `npm version` or `poetry version` handle what they handle
- **Explain reasoning** — Always explain why you're recommending a particular bump level
- **Allow overrides** — User can always specify a different bump level than recommended
