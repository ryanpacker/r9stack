# Clarify PRD

When the user invokes this command, help them refine specific sections of an existing Product Requirements Document (PRD).

## 1. Read Existing PRD

Read `docs/prd.md`. If it doesn't exist or is empty:

> "I couldn't find an existing PRD at `docs/prd.md`. Would you like me to create one first with `/prd.create`?"

Stop and wait for the user's response.

## 2. Identify Sections to Clarify

If the user specified a section with the command (e.g., "clarify the Goals section"), proceed to clarify that section.

Otherwise, present the current PRD structure and ask:

> **Current PRD Structure:**
>
> 1. **Overview** — [brief summary or "minimal content"]
> 2. **Goals** — [count of goals or "minimal content"]
> 3. **Non-Goals** — [count of non-goals or "minimal content"]
> 4. **User Stories** — [count of stories or "minimal content"]
> 5. **Constraints** — [count of constraints or "minimal content"]
> 6. **Success Criteria** — [count of criteria or "minimal content"]
>
> Which section(s) would you like to clarify?

Wait for the user to specify which section(s) to work on.

## 3. Clarify Each Section

For each section the user wants to clarify, follow this process:

### 3.1 Summarize Current Content

> **Current [Section Name]:**
>
> [Quote or summarize the current content]

### 3.2 Ask Targeted Questions

Ask 1-2 specific questions to draw out more detail. Tailor questions to the section:

**Overview:**
- "What specific problem does this solve for users?"
- "Why is this the right time to build this?"

**Goals:**
- "How will you measure [specific goal]?"
- "What does success look like for [goal] — can you put a number on it?"
- "Is [goal] achievable in your timeline, or should it be scoped differently?"

**Non-Goals:**
- "I noticed [feature/scope] wasn't mentioned in goals. Is that intentionally out of scope?"
- "Are there adjacent problems you're explicitly not solving in v1?"
- "What requests might stakeholders make that you'll need to say no to?"

**User Stories:**
- "Are there other user types who would benefit from this?"
- "What's the most important thing [user type] needs to accomplish?"
- "What would make [user type] frustrated with this solution?"

**Constraints:**
- "Are there technology choices that are fixed vs. flexible?"
- "What's the timeline, and is it firm or negotiable?"
- "Are there dependencies on other teams or systems?"

**Success Criteria:**
- "How will you actually measure [criterion]? What data do you have access to?"
- "What's the threshold for success vs. failure?"
- "When will you evaluate this — at launch, 30 days, 90 days?"

### 3.3 Push Back on Vagueness

If the user's answers are vague or unmeasurable, push back:

- ❌ "Improve user experience" → ✅ "Reduce task completion time by 20%"
- ❌ "Make it faster" → ✅ "Page load under 2 seconds on 3G connections"
- ❌ "Users will like it" → ✅ "NPS score of 40+ within 90 days"

> "That's a good direction, but it's hard to measure. How would you know if you've achieved [vague goal]? What would you observe or measure?"

### 3.4 Check for Conflicts

As you clarify, watch for conflicts with other sections:

- Goals that contradict non-goals
- Success criteria that don't align with goals
- Constraints that make goals unachievable
- User stories that suggest goals not listed

If you spot a conflict:

> "I noticed a potential conflict: [describe conflict]. Should we adjust one of these?"

### 3.5 Propose Updated Content

After gathering more detail, propose the updated section:

> **Proposed [Section Name]:**
>
> [Show the proposed updated content]
>
> Does this capture what we discussed, or would you like to adjust it?

Wait for user approval before proceeding.

## 4. Update the PRD

After the user approves the clarified sections:

1. Update `docs/prd.md` with the new content
2. Preserve sections that weren't modified

## 5. Report Changes

Summarize what was changed:

> **PRD Updated:** `docs/prd.md`
>
> **Sections clarified:**
> - [Section 1]: [brief description of changes]
> - [Section 2]: [brief description of changes]
>
> Would you like to clarify any other sections?

## Key Behaviors

Throughout this command, maintain these behaviors:

- **Be specific in questions** — Ask about concrete details, not abstract concepts
- **Push back on vagueness** — Measurable > aspirational
- **Watch for conflicts** — Sections should be internally consistent
- **Propose, don't impose** — Show proposed changes and wait for approval
- **One section at a time** — Don't overwhelm with too many changes at once

