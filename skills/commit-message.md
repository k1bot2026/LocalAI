# Commit Message

Generate a well-structured commit message from a code diff by analyzing the change type, identifying scope, writing a clear summary, and formatting for best practices.

## Prompt Chain

### Step 1: Categorize Change Type
Examine the diff and determine what type of change it is:
- **feat**: A new feature or capability
- **fix**: A bug fix
- **refactor**: Code restructuring without behavior change
- **perf**: Performance improvement
- **docs**: Documentation changes only
- **test**: Test additions or modifications
- **chore**: Build, dependencies, or tooling changes
- **style**: Code formatting, no logic change

Provide your reasoning.

### Step 2: Identify Scope
Determine the scope—what part of the system is affected:
- Component/module name (e.g., "auth", "api", "ui")
- Feature area (e.g., "login", "search", "cache")
- Keep it concise (1-2 words)

### Step 3: Write Summary Line
Create the first line following this format:
```
<type>(<scope>): <description>
```

Rules:
- Use imperative mood ("add" not "added" or "adds")
- Do not capitalize first word after colon
- No period at the end
- Keep under 50 characters if possible

Example: `feat(auth): add multi-factor authentication support`

### Step 4: Write Optional Body (if needed)
If the change is complex or non-obvious, write a body that explains:
- Why this change was made
- What problem does it solve?
- Any important implementation details
- Linked issues (e.g., "Closes #123")

Separate body from subject line with a blank line. Wrap at 72 characters.

### Step 5: Format Output
Present the final commit message in this format:
```
<Summary line>

<Optional body if needed>
```

If no body is needed (simple fix), just provide the summary line.

## Output Format

Provide the complete commit message ready to use. If you generated a body, include it. Ensure it follows conventional commit format.
