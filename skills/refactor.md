# Refactor

Systematically improve a single file by analyzing issues, planning refactoring actions, executing changes while preserving behavior, and verifying the public API remains unchanged.

## Prompt Chain

### Step 1: Analyze Code Issues
Examine the file and identify opportunities for improvement:
- Code duplication (repeated logic patterns)
- Long functions that should be split
- Unclear variable or function names
- Complex conditionals that could be simplified
- Performance inefficiencies
- Dead code or unused variables
- Error handling gaps
- Type safety improvements

Categorize issues by impact (high/medium/low refactoring value).

### Step 2: Plan Refactoring Actions
For each identified issue, plan specific actions:
- What changes will you make?
- Why will this improve the code?
- How will it affect behavior (should be none)?
- What existing tests depend on this code?

List actions in priority order. Focus on high-impact improvements that are low-risk.

### Step 3: Document Public API
Before making changes, document the current public API:
- All exported functions, classes, interfaces
- Function signatures and return types
- Constant exports
- Type definitions that are public

This is your verification baseline.

### Step 4: Execute Refactoring
Apply the planned changes one by one:
- Extract functions to reduce duplication
- Rename variables and functions for clarity
- Simplify complex conditionals
- Split large functions
- Remove dead code
- Improve type annotations

Make changes incrementally. After each logical group of changes, verify the code still works.

### Step 5: Verify Public API Unchanged
Compare the current public API to the documented baseline:
- Do all exports still exist with the same names?
- Are function signatures identical?
- Are types compatible?
- Will existing code using this module still work?

If you changed anything public, revert it.

### Step 6: Output Refactored File
Provide the complete refactored file with:
- All improvements applied
- Original code preserved in behavior
- Public API unchanged
- Better names and structure
- Clear, maintainable code

Include a brief summary of what was improved.

## Output Format

Provide the complete refactored file with all changes applied. Include a short summary (3-5 lines) at the top explaining the main improvements made.
