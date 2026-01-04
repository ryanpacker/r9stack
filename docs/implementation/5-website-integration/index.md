# Area 5: Website Integration

## Overview

This area covers the integration between the r9stack CLI repository and the r9stack.dev website where starters are hosted.

## Goals

1. Define the publishing workflow for starters
2. Ensure CLI can reliably fetch hosted starters
3. Document the website repository structure

## Key URLs

| Resource | URL |
|----------|-----|
| Standard starter | `https://r9stack.dev/starters/standard.json` |
| Website repository | (private, separate repo) |

## Task Groups

- `5.1-publishing-workflow.md` - How to publish starters to the website
- `5.2-website-structure.md` - Website repository organization

## Publishing Workflow

```
1. Make changes to /starters/standard/
    │
2. Compile: npx @tanstack/create-start@latest starter compile
    │
3. Test locally (optional)
    │
4. Copy starter.json to website repo
    │   
    └─► website/public/starters/standard.json
    │
5. Deploy website
    │
6. CLI fetches updated starter
```

## Website Structure (Separate Repo)

```
r9stack-website/
├── public/
│   └── starters/
│       ├── standard.json      # Compiled starter
│       └── (future starters)
├── src/
│   └── ...                    # Website source
└── ...
```

## Considerations

### Versioning
- Starters are published by copying the compiled JSON
- Consider version numbers in starter metadata
- No automatic versioning or rollback (manual process)

### Caching
- Website may have CDN caching
- Consider cache headers for starter files
- Users always get latest on `r9stack init`

### Fallback
- If fetch fails, CLI should provide clear error message
- Consider embedding a fallback starter in CLI (future enhancement)

