# Area 4: Testing Infrastructure

## Overview

This area covers the testing strategy for the r9stack CLI, including unit tests and end-to-end tests.

## Goals

1. Establish testing framework (Vitest)
2. Create E2E tests that verify project creation
3. Ensure generated projects match expected structure

## Key Directories

| Path | Purpose |
|------|---------|
| `/tests/e2e/` | End-to-end tests |
| `/tests/output/` | Temporary test output (gitignored) |

## Task Groups

- `4.1-test-setup.md` - Configuring Vitest and test utilities
- `4.2-e2e-tests.md` - End-to-end project creation tests

## Testing Strategy

### Unit Tests
- CLI argument parsing
- Prompt validation
- Logger output formatting

### E2E Tests
1. Invoke r9stack CLI with test project name
2. Verify project is created in `tests/output/`
3. Check file structure matches expected output
4. Compare key files against starter source
5. Clean up after successful run

## Example E2E Test

```typescript
import { describe, it, expect, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import { join } from 'path'

const OUTPUT_DIR = join(__dirname, '../output')
const PROJECT_NAME = 'test-project'

describe('r9stack init', () => {
  afterAll(() => {
    rmSync(join(OUTPUT_DIR, PROJECT_NAME), { recursive: true, force: true })
  })

  it('creates a project with expected structure', () => {
    execSync(`r9stack init ${PROJECT_NAME}`, { cwd: OUTPUT_DIR })
    
    expect(existsSync(join(OUTPUT_DIR, PROJECT_NAME, 'package.json'))).toBe(true)
    expect(existsSync(join(OUTPUT_DIR, PROJECT_NAME, 'src/routes'))).toBe(true)
    expect(existsSync(join(OUTPUT_DIR, PROJECT_NAME, 'convex'))).toBe(true)
  })
})
```

## Dependencies

- vitest (to be added)
- Node.js child_process for CLI invocation

