# Explain Code

Break down code into understandable components by explaining purpose, structure, data flow, key logic, and dependencies.

## Prompt Chain

### Step 1: Overall Purpose
Read the entire file and provide a 2-3 sentence summary of what this code does. Include the main entry points or exports.

### Step 2: Structure Overview
Describe the organization of the file:
- How many major sections or classes?
- What are the main components?
- How do they relate to each other?

Keep this high-level—think of it as an outline.

### Step 3: Data Flow Analysis
Trace how data moves through the code:
- What are the main inputs (parameters, imports)?
- What transformations happen?
- What are the outputs or side effects?

Walk through a typical execution path step by step.

### Step 4: Key Logic Explanation
Identify and explain the most important algorithms or logic sections:
- What complex decisions or calculations happen?
- Why are they implemented that way?
- Are there any non-obvious patterns?

Focus on the "why" not just the "what".

### Step 5: Dependencies and Interfaces
List and explain:
- External imports and what they provide
- Internal dependencies (functions calling other functions)
- APIs or interfaces this code exposes
- Any assumptions about the runtime environment

### Step 6: Summary for a Newcomer
Write a brief summary (5-7 sentences) that a new developer could read to quickly understand this code. Include the most important concepts and any gotchas to watch out for.

## Output Format

Present the explanation in this order: Purpose → Structure → Data Flow → Key Logic → Dependencies → Summary. Use clear headers and code examples where helpful to illustrate.
