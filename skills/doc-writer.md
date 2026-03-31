# Doc Writer

Generate comprehensive documentation for code by inventorying exports, analyzing each one, generating JSDoc/TSDoc comments, and outputting the file with documentation added (no code changes).

## Prompt Chain

### Step 1: Inventory Exports
List all exported functions, classes, interfaces, types, and constants in the file:
- Name of the export
- What it is (function, class, type, constant, etc.)
- Current documentation status (undocumented, partially documented, documented)

Do not modify anything yet—just inventory.

### Step 2: Analyze Each Export
For each export, determine:
- What is its purpose?
- What parameters does it take (if a function)?
- What does it return or do?
- Are there important side effects?
- What are common use cases?
- Any warnings or important notes?

Be thorough—pretend you're explaining this to a developer who has never seen it.

### Step 3: Generate Documentation
For each export, write appropriate documentation:
- **Functions**: JSDoc with @param, @returns, @throws, @example, @deprecated (if applicable)
- **Classes**: JSDoc describing the class purpose, constructor params, and any important notes
- **Interfaces/Types**: JSDoc describing purpose and structure
- **Constants**: JSDoc describing purpose and typical values

Include:
- Clear description of what it does
- Parameter types and descriptions
- Return type and description
- Usage examples where appropriate

### Step 4: Format JSDoc/TSDoc
Ensure documentation follows proper format:
```
/**
 * [Description]
 *
 * @param [name] - [Description]
 * @returns [Description]
 * @example
 * [Example code]
 */
```

Keep descriptions concise but complete.

### Step 5: Output Complete File
Output the entire original file with documentation added:
- Insert JSDoc comments immediately above each export
- Preserve all original code exactly (no refactoring or changes)
- Maintain original formatting and indentation
- Place inline comments strategically for complex sections if helpful

Do not modify any code logic or structure.

## Output Format

Provide the complete file with all documentation added. Include all original code unchanged, with JSDoc comments properly formatted above each export.
