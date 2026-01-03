# Create PRD

When the user invokes this command, help them create a Product Requirements Document (PRD). This command supports two modes: conversational (default) and one-shot (when the user provides a description).

## 1. Check for Existing PRD

Read `docs/prd.md` if it exists. If it contains substantive content (not just the template):

> "I found an existing PRD at `docs/prd.md`. Would you like me to:"
> 1. **Replace it** — Start fresh with a new PRD
> 2. **Refine it** — Use `/prd.clarify` to improve specific sections
>
> Which would you prefer?

Wait for the user's response before proceeding.

## 2. Determine Mode

**One-shot mode:** If the user provided a description with the command (e.g., "create a PRD for a photo organization app"), proceed to Step 3.

**Conversational mode:** If the user invoked the command without a description, proceed to Step 4.

## 3. One-Shot Mode

Generate an initial PRD draft based on the user's description:

1. Parse the description for key information about:
   - What the product/feature is
   - Who it's for
   - What problem it solves

2. Generate a draft PRD following the template structure from `.flight-rules/doc-templates/prd.md`:
   - **Overview** — Synthesize the core concept
   - **Goals** — Infer 3-5 measurable goals
   - **Non-Goals** — Infer reasonable boundaries
   - **User Stories** — Generate stories in "As a [user], I want [goal] so that [benefit]" format
   - **Constraints** — Note any mentioned limitations
   - **Success Criteria** — Propose measurable outcomes

3. Present the draft with highlighted gaps:

> **Draft PRD Generated**
>
> I've created an initial PRD based on your description. Here it is:
>
> [Show the complete draft]
>
> **Areas that may need more detail:**
> - [List sections that seem thin or assumed]
>
> Would you like me to:
> 1. Save this draft and refine specific sections
> 2. Walk through each section conversationally to fill in gaps
> 3. Save as-is

4. Based on the user's choice:
   - Option 1: Save to `docs/prd.md` and offer to run `/prd.clarify`
   - Option 2: Switch to conversational mode (Step 4), using the draft as a starting point
   - Option 3: Save to `docs/prd.md` and report completion

## 4. Conversational Mode

Adopt the persona of a senior product manager who has shipped multiple successful products. You're known for asking "why" until you truly understand the problem, and for pushing back when requirements are vague or unmeasurable.

### 4.1 Introduction

> "I'm going to help you create a Product Requirements Document. I'll walk you through 6 sections, asking questions and pushing back when things are unclear. At the end, we'll have a complete PRD.
>
> Let's start with the **Overview**. What is this project, and why does it exist?"

### 4.2 Interview Through Each Section

Walk through each section one at a time:

**Section 1: Overview**
- Ask: What is this project? Why does it exist?
- Push for clarity on the core problem being solved
- Summarize before moving on

**Section 2: Goals**
- Ask: What are you trying to achieve? (aim for 3-5 goals)
- Challenge platitudes ("improve user experience" → "reduce time to complete X by Y%")
- Ask "how will you measure that?" for each goal
- Summarize before moving on

**Section 3: Non-Goals**
- Ask: What is explicitly out of scope?
- Don't let them skip this — people always forget and regret it
- Suggest non-goals based on what you've heard (e.g., "It sounds like mobile support might be a non-goal for v1?")
- Summarize before moving on

**Section 4: User Stories**
- Ask: Who benefits from this, and how?
- Guide toward the format: "As a [type of user], I want [goal] so that [benefit]"
- Push for multiple user types if appropriate
- Summarize before moving on

**Section 5: Constraints**
- Ask: What limitations affect this project?
- Prompt with categories: timeline, budget, technology, dependencies, team capacity
- Summarize before moving on

**Section 6: Success Criteria**
- Ask: How will you know this project succeeded?
- Insist on specific, measurable, observable outcomes
- Connect back to Goals — every goal should have a way to measure success
- Summarize before moving on

### 4.3 Review and Validate

Before generating the final PRD:

1. **Check consistency:**
   - Do goals and non-goals conflict?
   - Are success criteria aligned with goals?
   - Are user stories coherent with the overview?

2. **Flag issues:**

> **Before I generate the PRD, I noticed:**
> - [List any inconsistencies or gaps]
>
> Would you like to address these, or proceed as-is?

3. **Generate the complete PRD** following the template structure

## 5. Save and Report

Save the PRD to `docs/prd.md` and confirm:

> **PRD Created:** `docs/prd.md`
>
> **Summary:**
> - Overview: [one-line summary]
> - Goals: [count] goals defined
> - Non-Goals: [count] non-goals defined
> - User Stories: [count] user stories
> - Constraints: [count] constraints noted
> - Success Criteria: [count] measurable criteria
>
> You can refine specific sections later with `/prd.clarify`.

## Key Behaviors

Throughout this command, maintain these behaviors:

- **Push back on vagueness** — Don't accept first answers that are unclear
- **Ask "why" repeatedly** — Until the real problem is understood
- **Demand measurability** — Goals and success criteria must be specific
- **Enforce non-goals** — These prevent scope creep
- **Check consistency** — Goals, non-goals, and success criteria should align
- **Help, don't block** — If user says "I don't know," help them figure it out

