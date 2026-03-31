# Changelog Digest

Summarize package changelogs by identifying the package and version range, finding release notes, categorizing changes, and producing a digest with breaking changes prominent.

## Prompt Chain

### Step 1: Identify Package and Version Range
Clarify the scope:
- Package name and which version range (e.g., "React 18.0 to 18.2")
- Current version in use (if upgrading)
- Target version (if planning upgrade)
- Note if this is a major, minor, or patch version change
- Determine relevance (does this package matter to our project?)

### Step 2: Find Changelog or Release Notes
Locate official release documentation:
- Check package repository (GitHub, GitLab, etc.)
- Look for CHANGELOG.md, RELEASES.md, or similar
- Check official package repository page (npm, crates.io, PyPI, etc.)
- Search package documentation site
- Note if changelog is complete, partial, or missing

### Step 3: Categorize Changes
Organize release notes by type:
- **Breaking Changes**: API changes, removed features, behavior changes requiring migration
- **New Features**: Added functionality and improvements
- **Bug Fixes**: Corrections and patches
- **Deprecations**: Features flagged for future removal
- **Performance**: Speed, memory, or efficiency improvements
- **Security**: Vulnerability fixes
- **Dependency Changes**: Updates to dependencies

Extract relevant entries for each version in the range.

### Step 4: Highlight Migration Needs
For breaking changes specifically:
- List each breaking change with clear description
- Explain what code changes are needed
- Provide migration example if applicable
- Note if breaking changes are numerous or complex
- Assess effort level (Low/Medium/High) for migration

### Step 5: Synthesize Digest
Create a summary:
- **Overview**: X.Y.Z release date and primary theme
- **Breaking Changes**: Prominent section (or "None" if applicable)
- **Major Additions**: Key new features (bulleted)
- **Notable Fixes**: Important bug fixes (bulleted)
- **Deprecations**: Features to stop using soon (bulleted)
- **Migration Effort**: Overall assessment of upgrade complexity

## Output Format

Present the digest as a structured document with Breaking Changes in a prominent section at the top. Use bullet points for clarity. Include actual quotes from changelog for breaking changes. End with a recommendation on whether to upgrade and any timing considerations.
