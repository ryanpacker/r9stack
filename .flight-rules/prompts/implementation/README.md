# Implementation Prompts

Prompts to help create and review implementation plans.

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `plan-review.md` | Critical review of an implementation plan by a second agent |

## Usage

Copy the prompt into your AI assistant, specifying which part of the implementation plan to review. The AI will read the relevant docs from `.flight-rules/docs/implementation/` and provide structured feedback.

## Workflow

A typical workflow for using these prompts:

1. **Agent 1** creates an implementation plan (Area, Task Group, or Task specs)
2. **You** open a new session with **Agent 2** and paste the review prompt
3. **You** specify what to review (e.g., "Area 2", "Task Group 2.3", "Task 2.3.4")
4. **Agent 2** reads the implementation docs and provides critical feedback
5. **You** incorporate feedback and finalize the plan

This "two-agent review" pattern helps catch gaps, assumptions, and issues before implementation begins.

