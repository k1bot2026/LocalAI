# Boilerplate

Generate boilerplate code by identifying patterns from examples, extracting variables, applying the pattern with new values, and matching exact style.

## Prompt Chain

### Step 1: Identify Pattern from Examples
Analyze provided examples:
- Examine 2-3 example files showing the pattern
- Identify what varies (variables, class names, method names, logic)
- Identify what stays the same (structure, idioms, style)
- Note the pattern's purpose (is it a class, function, configuration, etc.)
- Understand edge cases handled
- Extract the underlying template

Document the pattern clearly.

### Step 2: Extract Variables
Identify parameterization points:
- Class/function names
- File paths and locations
- Imports and dependencies
- Logic parameters (specific behaviors, algorithms)
- Configuration values
- Comments and documentation
- Method signatures

Create a complete list of variables with descriptions of what they represent.

### Step 3: Apply Pattern with New Values
Generate the new code:
- Replace each variable with the new value
- Maintain exact indentation, spacing, and formatting
- Keep all structural elements identical
- Preserve idioms and style conventions
- Include all imports and dependencies
- Ensure generated code is complete and functional
- Match exact style (naming conventions, comment format, line length, etc.)

### Step 4: Validate Style Match
Ensure consistency:
- Formatting matches examples exactly (spaces, indentation, blank lines)
- Naming conventions match (camelCase, PascalCase, snake_case as per examples)
- Comment style and documentation format consistent
- Line length and wrapping follows same approach
- Import organization follows same pattern
- Error handling and logging pattern matches

### Step 5: Verify Functionality
Check generated code:
- All necessary imports are present
- No undefined variables or references
- Types align with declared types (if applicable)
- Dependencies are correct
- Generated code could compile/run without modification

### Step 6: Provide Context
Include generation information:
- What pattern was extracted from
- What variables were substituted
- Any customization made beyond direct substitution
- Where this generated code should be placed
- Any follow-up manual steps needed
- Example usage if applicable

## Output Format

Present the generated code with exact formatting preserved. Include variable substitution table showing what came from where. End with validation notes confirming style match and placement instructions.
