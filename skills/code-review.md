# Code Review

Perform a structured single-file code review by analyzing functions, identifying issues, categorizing severity, and generating a comprehensive report with confidence assessment.

## Prompt Chain

### Step 1: Inventory Functions
Examine the file and list all exported functions and classes. For each, note:
- Name
- Purpose (one line)
- Parameters and return type
- Approximate lines of code

Do not analyze logic yet—just create an inventory.

### Step 2: Analyze for Issues
Go through the code systematically and identify potential issues such as:
- Logic errors or edge cases not handled
- Performance problems (inefficient loops, unnecessary operations)
- Security concerns (input validation, injection risks)
- Maintainability issues (unclear variable names, long functions, duplicated code)
- Type safety problems
- Error handling gaps

List each issue with the function it belongs to and a brief description.

### Step 3: Categorize by Severity
Classify each issue into one of these categories:
- **Critical**: Causes crashes, security vulnerabilities, or data loss
- **High**: Incorrect behavior or significant performance impact
- **Medium**: Code quality concern or minor correctness issue
- **Low**: Style, minor clarity, or optional improvement

Maintain the list of issues with their new severity labels.

### Step 4: Format Report
Write a professional code review report with these sections:
- **Summary**: Overall assessment in 2-3 sentences
- **Issues by Severity**: Organized sections for Critical, High, Medium, Low with details and line references
- **Positive Findings**: 2-3 things the code does well
- **Recommendations**: Priority order for fixes

### Step 5: Confidence Assessment
Rate your confidence in this review:
- **Code Coverage**: What percentage of code did you analyze?
- **Issue Certainty**: High/Medium/Low - How confident are you that the issues identified are real?
- **Limitations**: Note any edge cases or scenarios you could not evaluate

End with overall confidence: High / Medium / Low

## Output Format

Present the final review report with all sections. Include confidence assessment at the end.
