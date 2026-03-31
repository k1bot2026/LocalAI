# Dependency Audit

Perform systematic dependency audits by listing all dependencies with versions, categorizing them, checking for outdated or deprecated packages, and producing a categorized audit report.

## Prompt Chain

### Step 1: List All Dependencies
Inventory all project dependencies:
- Read package manifest (package.json, Cargo.toml, requirements.txt, etc.)
- Extract package name and version/version range for each
- Include both direct and transitive dependencies if visible
- Note package sources (npm, crates.io, PyPI, etc.)
- Create a comprehensive list

### Step 2: Categorize Dependencies
Organize by type:
- **Runtime**: Required at application runtime
- **Development**: Used only for building/testing (devDependencies, build-dependencies, test-requirements)
- **Peer**: Required to be installed by consuming packages
- **Optional**: Not strictly required but enable features
- **System**: Non-package system requirements

Assign each dependency to appropriate category.

### Step 3: Check for Issues
Audit each dependency:
- Outdated version (compare to latest available)
- Deprecated packages (check if package is marked unmaintained)
- Duplicates (same package required with conflicting versions)
- Unused packages (imported but not used in code)
- Security vulnerabilities (check advisories if available)
- License concerns (incompatible or restrictive licenses)

### Step 4: Output Categorized Report
Format findings clearly:
- **By Category**: Runtime, Dev, Peer, Optional, System (one section each)
  - List packages with current version
  - Mark any with issues: [OUTDATED], [DEPRECATED], [DUPLICATE], [UNUSED], [SECURITY]
- **Issues Summary**:
  - List outdated packages with suggested new versions
  - List deprecated packages with recommendations
  - List duplicates with version conflicts
  - List security vulnerabilities if found

### Step 5: Recommendations
Provide actionable next steps:
- Priority order for updates (security first, then deprecations)
- Potential breaking changes from major version updates
- Packages that can be removed (unused)
- Dependency conflicts that need resolution

## Output Format

Present the audit as a structured report with sections for each dependency category. Use a summary table showing package name, current version, status, and action needed. End with a prioritized list of recommended changes.
