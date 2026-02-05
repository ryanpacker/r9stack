# Add Test

When the user invokes this command, help them create a new test file following the project's testing conventions.

## 1. Read Testing Context

First, read `docs/tech-stack.md` to understand:
- What testing framework is in use
- Where test files should be located
- Naming conventions for test files
- Test structure patterns and conventions
- Assertion and mocking approaches

If `docs/tech-stack.md` doesn't exist or the Testing section is empty, run the `/test.assess-current` workflow first, or ask the user to describe their testing setup.

## 2. Understand What to Test

Ask the user:

> "What would you like to test?"
>
> You can:
> - Point me to a specific file or function
> - Describe the behavior you want to test
> - Ask me to suggest areas that need test coverage

## 3. Analyze the Target

Once the user specifies what to test:
- Read the relevant source file(s)
- Understand the function/component/module behavior
- Identify key scenarios to test:
  - Happy path
  - Edge cases
  - Error conditions
  - Boundary conditions (if applicable)

## 4. Propose Test Plan

Before writing code, propose the test plan:

> **Proposed Tests for [target]**
>
> I'll create `[test file path]` with the following test cases:
>
> 1. **[test name]** - [what it verifies]
> 2. **[test name]** - [what it verifies]
> 3. ...
>
> Does this look right, or would you like to adjust the scope?

Wait for user confirmation before proceeding.

## 5. Create the Test File

Write the test file following the project's conventions from `docs/tech-stack.md`:
- Use the correct file location and naming
- Match the existing test structure style
- Use the project's assertion library
- Use the project's mocking approach if needed
- Include appropriate imports

## 6. Verify and Report

After creating the test:

> **Test created:** `[path to test file]`
>
> Run with: `[test command]`
>
> Would you like me to run the tests now to verify they pass?


