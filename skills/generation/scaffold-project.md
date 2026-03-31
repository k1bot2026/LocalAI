# Scaffold Project

Generate project scaffolding by parsing the tech stack, creating directory structure, generating essential starter files, and outputting with file paths.

## Prompt Chain

### Step 1: Parse Tech Stack
Understand the technology requirements:
- Language(s) (JavaScript, Python, Rust, Go, etc.)
- Framework(s) if any (React, Django, Express, FastAPI, etc.)
- Primary build tool (npm, cargo, pip, maven, etc.)
- Testing framework needed (Jest, pytest, Go test, etc.)
- Linting/formatting tools (ESLint, Black, rustfmt, etc.)
- Package manager and version constraints
- Target environment (Node.js version, Python version, etc.)

Document all technical decisions.

### Step 2: Generate Directory Tree
Create the folder structure:
- Identify conventional patterns for this tech stack
- Root folders: src/, lib/, src/, tests/, config/, docs/, etc.
- Subdirectories for logical grouping (components/, routes/, models/, etc.)
- Keep structure flat and simple for initial scaffold
- Include folders for assets, styles, tests, examples
- Create placeholder .gitkeep files to preserve structure

Show full tree with paths.

### Step 3: Generate Essential Starter Files
Create minimal functional files:
- **Package/dependency file**: package.json, Cargo.toml, pyproject.toml, go.mod, etc.
  - Include basic metadata
  - Add essential dependencies only
  - Specify scripts/commands for common tasks
- **Entry point**: main.rs, main.py, index.js, src/index.ts, etc.
  - Minimal "hello world" or basic functionality
  - Comments explaining structure
- **Configuration files**: tsconfig.json, .env.example, setup.cfg, Makefile, etc.
- **.gitignore**: Appropriate entries for tech stack
- **README.md**: Brief description, setup instructions, commands to run
- **LICENSE**: Appropriate for project type

### Step 4: Add Development Configuration
Include developer experience files:
- Linter configuration (.eslintrc, .flake8, clippy config, etc.)
- Formatter configuration (.prettierrc, pyproject.toml, etc.)
- Editor config (.editorconfig)
- Test configuration or test entry point
- Development server startup scripts

### Step 5: Create Initial Git Setup
Prepare for version control:
- Ensure .gitignore covers all generated files and dependencies
- Create initial commit structure (what will be included)
- Document branch naming conventions if needed
- Include git hooks placeholder if relevant

### Step 6: Output with File Paths
Present the scaffold:
- Show complete directory tree with paths
- For each generated file, show:
  - Full path
  - File contents (actual code, not placeholders)
  - Brief description of purpose
- Provide commands to complete setup (npm install, cargo build, etc.)

## Output Format

Present complete directory tree first, then generated files with full paths and complete contents. Include setup instructions at the end (e.g., "npm install && npm run dev").
