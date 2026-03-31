# Codebase Explore

Map unfamiliar codebases systematically by identifying entry points, listing directory structure, finding key files, building dependency relationships, and producing a comprehensive codebase map.

## Prompt Chain

### Step 1: Identify Entry Points
Examine the project root and determine where execution begins:
- Look for `main.rs`, `main.py`, `index.js`, `App.tsx`, or similar entry files
- Check `package.json` main field, Cargo.toml, setup.py, or build config
- Identify entry points for different contexts (CLI, web server, library)
- List each entry point with its purpose

### Step 2: List Directory Structure
Map the top-level and important subdirectories:
- Use tree view (limit to 2-3 levels deep for clarity)
- Note directory purposes based on naming patterns (`src/`, `lib/`, `tests/`, `config/`, etc.)
- Identify which directories are source vs. generated vs. external
- Flag interesting or unusual directory structures

### Step 3: Find Key Files
Identify critical files that define the codebase:
- Configuration files (tsconfig.json, .env, setup.cfg, etc.)
- Package/dependency files (package.json, Cargo.toml, requirements.txt, etc.)
- Type definitions or schemas if present
- Documentation files (README, docs/, comments)
- Test entry points
- Build or CI configuration

List each file with 1-2 line description of its role.

### Step 4: Build Dependency Graph
Trace imports/requires from entry points:
- Start from identified entry points
- Follow first and second-level imports
- Map which modules/packages depend on which others
- Identify core modules vs. peripheral code
- Note any circular dependencies observed

### Step 5: Synthesize Codebase Map
Create a visual/text summary including:
- **Architecture**: High-level component structure (e.g., MVC, microservices, layered)
- **Technology Stack**: Languages, frameworks, key libraries
- **Key Modules**: 5-10 most important modules with their role
- **Data Flow**: How data typically moves through the system
- **Entry Points**: How execution starts
- **Areas of Concern**: Circular deps, unclear organization, or missing structure

## Output Format

Present the codebase map as a structured summary with sections for each element identified. Include the directory tree, key files list, and dependency highlights. End with a brief assessment of codebase clarity and complexity.
