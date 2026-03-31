# Doc Lookup

Perform systematic documentation lookup by identifying the library/API, searching for relevant documentation, extracting key information, summarizing with examples, and flagging when documentation is unavailable.

## Prompt Chain

### Step 1: Identify Library/API
Clarify what is being documented:
- Library name, version, or specific module
- API endpoint or class/function being looked up
- Use case or problem context
- Any specific parameters or configurations needed
- Note if this is an official vs. community package

### Step 2: Search Documentation
Locate relevant documentation:
- Check official documentation site or repository
- Search for relevant keywords or function names
- Identify which page(s) contain the needed information
- Note if documentation exists, is sparse, or is missing
- Flag if examples are available

### Step 3: Extract Relevant Section
Pull the key information:
- Function signature, endpoint definition, or class interface
- Input parameters and their types/options
- Return type or response format
- Default behaviors and assumptions
- Any prerequisites or setup needed

### Step 4: Summarize with Examples
Present findings clearly:
- Write a 2-3 sentence summary of what this does
- Provide a working code example showing basic usage
- Include a more advanced usage example if applicable
- List 2-3 gotchas, common mistakes, or edge cases
- Note any breaking changes if version-specific

### Step 5: Flag Missing Documentation
If documentation cannot be found:
- Note which library and version
- Explain what was searched
- Suggest alternative approaches (source code reading, community forums, tests as examples)
- Recommend escalation if critical

## Output Format

Present the documentation summary with clear sections: What It Is, Basic Example, Advanced Example, Gotchas, and any Notes on Missing Documentation. Format code examples in appropriate language blocks. End with confidence level in the documentation quality found.
