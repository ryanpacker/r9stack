# PRD Prompts

Prompts and commands to help create Product Requirements Documents.

## Recommended: Use Commands

The preferred way to create and refine PRDs is through the commands in `.flight-rules/commands/`:

| Command | Description |
|---------|-------------|
| `/prd.create` | Create a new PRD (supports conversational interview or one-shot from description) |
| `/prd.clarify` | Refine specific sections of an existing PRD |

These commands integrate better with the Flight Rules workflow and automatically save output to `docs/prd.md`.

## Available Prompts

These standalone prompts can be copied into any AI assistant:

| Prompt | Description |
|--------|-------------|
| `creation-conversational.md` | Interactive interview that walks through each PRD section |

**Note:** The `creation-conversational.md` prompt is the foundation for the `/prd.create` command's conversational mode. Use the command for better workflow integration, or use the prompt directly if you prefer a standalone conversation.

## Usage

**With commands (recommended):**
- Invoke `/prd.create` to start creating a PRD
- Invoke `/prd.clarify` to refine specific sections

**With prompts:**
- Copy the prompt into your AI assistant and follow the conversation
- The template for the PRD is at `.flight-rules/doc-templates/prd.md`
- After completing the conversation, save the output to `docs/prd.md`

## Output

Both commands and prompts produce a completed PRD that follows the standard template structure:

- Overview
- Goals
- Non-Goals
- User Stories
- Constraints
- Success Criteria
