# Area 3: Post-Creation Workflow

## Overview

This area covers the steps that happen after TanStack Start creates the base project. These include guiding users through third-party service setup and optional integrations.

## Goals

1. Provide clear, actionable guidance for Convex setup
2. Provide clear, actionable guidance for WorkOS setup
3. Offer optional GitHub repository creation
4. Offer optional Vercel deployment

## Task Groups

- `3.1-convex-setup.md` - Guiding users through Convex configuration
- `3.2-workos-setup.md` - Guiding users through WorkOS configuration
- `3.3-github-integration.md` - Optional GitHub repository creation
- `3.4-vercel-integration.md` - Optional Vercel deployment

## Workflow

```
After project creation:
    │
    ├─► Display Convex setup instructions
    │   - Run `npx convex dev`
    │   - Link to dashboard
    │   - Explain environment variables
    │
    ├─► Display WorkOS setup instructions
    │   - Link to dashboard
    │   - Configure redirect URIs
    │   - Explain environment variables
    │
    ├─► Prompt: Create GitHub repository?
    │   └─► If yes: Create repo, push initial commit
    │
    └─► Prompt: Deploy to Vercel?
        └─► If yes: Link project, configure env vars
```

## Dependencies

- GitHub CLI (`gh`) for repository creation
- Vercel CLI for deployment
- User must have accounts on these services

## Constraints

- Cannot create accounts on behalf of users
- Convex setup is interactive (requires browser auth)
- GitHub/Vercel require authentication

