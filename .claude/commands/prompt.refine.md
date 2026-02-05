# Refine Prompt

When the user invokes this command, help them improve a rough draft prompt using meta-prompting best practices. Always restate your understanding of their intent before refining.

## 1. Receive the Prompt

Check if the user provided a prompt as an argument:
- `/prompt.refine "my rough prompt here"` → Proceed to step 2
- `/prompt.refine` → Ask for the prompt

If no argument provided:

> "Please paste or type the prompt you'd like me to help refine."

Wait for the user to provide their prompt.

## 2. Restate Intent

Before making any changes, analyze the prompt and articulate your understanding:

> **Here's what I understand you're trying to accomplish:**
>
> - **Intent**: [What the prompt is trying to achieve]
> - **Audience**: [Who will use this prompt — what LLM, what context]
> - **Expected Output**: [What kind of response the prompt should produce]
> - **Tone/Style**: [Any voice or style considerations]
>
> Is this accurate? Let me know if I've misunderstood anything before I refine it.

**Do not proceed to refinement until the user confirms your understanding is correct.** If they correct you, update your understanding and confirm again.

## 3. Refine the Prompt

Once intent is confirmed, apply these meta-prompting best practices while preserving the user's core voice:

### Structure & Organization
- Add clear sections if the prompt covers multiple aspects
- Use XML tags to organize content (e.g., `<context>`, `<task>`, `<constraints>`)
- Front-load the most important instructions

### Clarity & Specificity
- Replace vague language with concrete instructions
- Add specific constraints and boundaries
- Define any ambiguous terms

### Reasoning Guidance
- Add chain-of-thought instructions where complex reasoning helps
- Include "think step by step" or similar prompts when appropriate
- Specify when to show vs. hide reasoning

### Output Expectations
- Specify the desired format (prose, list, code, etc.)
- Include length guidance if relevant
- Describe what a good response looks like

### Context Framing
- Add role or persona framing if it improves responses
- Include relevant background the LLM needs
- Specify what the LLM should assume vs. ask about

## 4. Present the Refined Prompt

Show the improved prompt in a code block:

> **Refined Prompt:**
>
> ```
> [The improved prompt goes here]
> ```
>
> **Key Improvements:**
> - [Improvement 1]: [Brief explanation of why this helps]
> - [Improvement 2]: [Brief explanation of why this helps]
> - [Improvement 3]: [Brief explanation of why this helps]

## 5. Offer Iteration

After presenting the refined prompt:

> "Would you like to:
> 1. **Use this version** — Copy and use the refined prompt as-is
> 2. **Adjust specific aspects** — Tell me what to change (tone, length, focus, etc.)
> 3. **Start over** — Clarify your intent and I'll try a different approach"

If the user wants adjustments, apply them and return to step 4. Continue iterating until they're satisfied.

## Key Behaviors

Throughout this command, maintain these behaviors:

- **Intent-first** — Always confirm understanding before refining; assumptions lead to wrong refinements
- **Preserve voice** — Enhance structure and clarity without completely rewriting; the user's style matters
- **Educate** — Explain what was improved and why; help the user learn prompting techniques
- **Iterate** — Refinement is rarely one-and-done; expect multiple rounds
- **Stay universal** — Produce prompts that work well across different LLMs, not just Claude
- **Respect scope** — Only add structure that serves the prompt's purpose; don't over-engineer simple requests
