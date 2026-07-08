#!/usr/bin/env node
/**
 * Guard: every template's committed convex/_generated/server.js must map the
 * internal builders to the INTERNAL generics.
 *
 * Why this exists: Convex keys a function's public/internal visibility off the
 * builder used to define it. A hand-written stub that aliases internalQuery/
 * internalMutation/internalAction to the PUBLIC generics (queryGeneric/
 * mutationGeneric/actionGeneric) silently registers every internal function on
 * the public API. Because Convex CLI >= 1.39.0 skips rewriting server.js when
 * the file already exists, a wrong committed stub is what gets bundled and
 * pushed on `convex dev`/`convex deploy` -- so the bug ships to real
 * deployments, not just a fresh scaffold. This check keeps the committed stub
 * honest. See docs/convex-data-plane-auth.md.
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const templatesDir = join(repoRoot, 'templates')

const REQUIRED = [
  ['internalQuery', 'internalQueryGeneric'],
  ['internalMutation', 'internalMutationGeneric'],
  ['internalAction', 'internalActionGeneric'],
]

const failures = []
let checked = 0

for (const entry of readdirSync(templatesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const serverJs = join(templatesDir, entry.name, 'convex', '_generated', 'server.js')
  if (!existsSync(serverJs)) continue
  checked++
  const src = readFileSync(serverJs, 'utf8')
  for (const [name, generic] of REQUIRED) {
    const re = new RegExp(`export const ${name}\\s*=\\s*(\\w+)`)
    const m = src.match(re)
    if (!m) {
      failures.push(`${entry.name}: server.js does not export ${name}`)
    } else if (m[1] !== generic) {
      failures.push(
        `${entry.name}: ${name} is aliased to '${m[1]}' but MUST be '${generic}' ` +
          `(public alias would expose internal functions on the public API)`,
      )
    }
  }
}

if (checked === 0) {
  console.error('guard-generated-server: no templates/*/convex/_generated/server.js found')
  process.exit(1)
}

if (failures.length > 0) {
  console.error('guard-generated-server: FAIL\n' + failures.map((f) => '  - ' + f).join('\n'))
  process.exit(1)
}

console.log(`guard-generated-server: OK (${checked} template(s) checked)`)
