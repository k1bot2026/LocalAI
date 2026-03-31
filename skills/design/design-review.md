# Design Review

Perform structured design reviews by summarizing design intent, evaluating against key criteria, reporting findings with severity levels, and identifying risks.

## Prompt Chain

### Step 1: Summarize Design Intent
Understand what the design is trying to achieve:
- Primary goals (what problem does it solve)
- Target users or use cases
- Key constraints (performance, cost, complexity, timeline)
- Design decisions or trade-offs made
- Assumptions about the environment or users
- Success criteria for this design

Write a 3-5 sentence summary capturing the essence.

### Step 2: Evaluate Single Responsibility Principle
Check if design divides responsibilities well:
- Does each component have one clear purpose
- Are concerns properly separated (UI, business logic, data access)
- Do modules have cohesive functionality
- Are unrelated responsibilities bundled together (smell)
- Would splitting reduce complexity or improve reusability
- Rate: OK / Minor Issue / Significant Problem

### Step 3: Evaluate Interfaces and Contracts
Assess component interactions:
- Are interfaces clear and well-defined
- Do components depend on abstractions rather than implementations
- Is the interaction protocol documented
- Are there hidden dependencies or side effects
- Could interfaces be simplified
- Is contract validation present
- Rate: OK / Minor Issue / Significant Problem

### Step 4: Evaluate Error Handling
Check robustness:
- Are failure modes identified
- Are errors propagated clearly (exceptions, error codes, results)
- Are there retry/recovery strategies for transient failures
- Are error messages useful for debugging
- Are edge cases handled
- Is error handling tested
- Rate: OK / Minor Issue / Significant Problem

### Step 5: Evaluate Scalability
Assess growth readiness:
- Can this scale horizontally (add more instances)
- Are there bottlenecks that prevent scaling (centralized state, shared resources)
- Is performance characterized (O(n) complexity analysis)
- Are resources used efficiently (memory, CPU, connections)
- Can load be distributed
- Rate: OK / Minor Issue / Significant Problem

### Step 6: Evaluate Security
Assess security posture:
- Are inputs validated
- Are secrets handled properly (no hardcoding)
- Is access controlled (authentication, authorization)
- Are sensitive data protected in transit and at rest
- Are injection vulnerabilities prevented
- Rate: OK / Minor Issue / Significant Problem

### Step 7: Report Findings
Create structured report:
- **Summary**: Overall assessment in 2-3 sentences
- **Strengths**: 2-3 things the design does well
- **Findings by Severity**:
  - **Critical**: Must fix before proceeding (security, data loss risk, complete failure)
  - **High**: Should fix (significant pain, poor user experience, severe limitation)
  - **Medium**: Consider fixing (code quality, maintainability, minor limitation)
  - **Low**: Optional (style, minor clarity, nice-to-have)
- **Recommendations**: Prioritized fixes
- **Escalation**: Flag if design is too complex to review thoroughly

## Output Format

Present review report with summary section first, then findings organized by severity. For each finding, describe the issue, its impact, and suggested resolution. End with priority action items and confidence assessment.
