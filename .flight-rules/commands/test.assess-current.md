# Assess Current Testing Setup

When the user invokes this command, assess the project's testing environment and update `docs/tech-stack.md`.

## 1. Scan for Test Configuration

Look for test configuration files in the project root and common locations:

**JavaScript/TypeScript:**
- `vitest.config.ts`, `vitest.config.js`
- `jest.config.ts`, `jest.config.js`, `jest.config.mjs`
- `package.json` (check for `jest` or `vitest` config sections)

**Python:**
- `pytest.ini`, `pyproject.toml` (pytest section), `setup.cfg`
- `tox.ini`

**Other:**
- `*.test.*`, `*_test.*`, `*_spec.*` file patterns
- `tests/`, `test/`, `__tests__/`, `spec/` directories

## 2. Analyze Test Files

Examine existing test files to understand:
- **Naming conventions**: How are test files named?
- **Location pattern**: Co-located with source, or in separate directory?
- **Test structure**: describe/it blocks, test classes, function-based?
- **Assertion style**: expect(), assert, should
- **Mocking approach**: What mocking utilities are used?

## 3. Check for Test Scripts

Examine `package.json` (or equivalent) for:
- Test run commands
- Watch mode commands
- Coverage commands

## 4. Update docs/tech-stack.md

Update the **Testing** section of `docs/tech-stack.md` with your findings:
- Framework name and version (if detectable)
- Test location and naming conventions
- Commands for running tests
- Patterns and conventions observed
- A representative example of test structure from the codebase

If `docs/tech-stack.md` doesn't exist, create it using the template from `.flight-rules/doc-templates/tech-stack.md`.

## 5. Report to User

Present a summary to the user covering:

> **Testing Assessment Complete**
>
> **Framework:** [detected framework]
> **Test Location:** [where tests live]
> **Run Command:** [how to run tests]
>
> **Observations:**
> - [key observations about testing patterns]
> - [any gaps or recommendations]
>
> I've updated `docs/tech-stack.md` with these findings.

If no testing setup is detected, report:

> **No Testing Setup Detected**
>
> I couldn't find a testing framework configured in this project.
>
> Would you like me to help you set up testing? If so, let me know:
> 1. What language/framework is this project using?
> 2. Do you have a preferred testing framework?


