# CI Pipeline

Generate CI pipeline configurations by identifying the platform, defining standard steps, and creating configuration with triggers and caching optimizations.

## Prompt Chain

### Step 1: Identify CI Platform
Determine the target platform:
- GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI, etc.
- Available runners/agents
- Available storage and timeout limits
- Matrix/parallel execution capabilities
- Environment variables and secrets management
- Cost considerations

Document platform choice and constraints.

### Step 2: Define Standard Steps
Plan the pipeline workflow:
- **Install**: Set up runtime (Node version, Python version, etc.), install dependencies
- **Lint**: Run linters (ESLint, flake8, clippy, etc.)
- **Test**: Run test suite, collect coverage
- **Build**: Compile or bundle the project
- **Deploy** (if applicable): Push to staging/production
- Optional specialized steps: security scanning, documentation generation, etc.

List steps in execution order with failure handling.

### Step 3: Specify Triggers and Conditions
Define when pipeline runs:
- Push to branches (main, develop, feature/*)
- Pull requests (all PRs or specific branches)
- Manual triggers (workflow_dispatch)
- Schedule (cron for periodic jobs)
- Tag-based triggers for releases
- Skip conditions (if commit message contains [skip ci])

Document each trigger with conditions.

### Step 4: Configure Caching
Optimize build speed:
- Cache dependency install (node_modules, .cargo, pip packages, etc.)
- Cache build artifacts if applicable
- Key strategy (based on lock file hash)
- Cache paths to include
- When to restore vs. rebuild cache

### Step 5: Generate Configuration File
Create the pipeline definition:
- Use appropriate format (YAML for most platforms)
- Define jobs and steps clearly
- Set environment variables
- Configure secrets/credentials handling
- Include retry logic for flaky steps
- Set timeouts appropriately
- Define artifact collection if needed
- Include status notifications

### Step 6: Document and Validate
Provide operational documentation:
- How to run locally (act, docker, etc.)
- How to debug failing builds
- How to add secrets to the CI platform
- How to modify the pipeline
- Example output expectations
- Troubleshooting common failures

## Output Format

Present configuration file with clear comments. Follow with documentation on triggers, caching strategy, and how to maintain the pipeline. Include example success and failure outputs.
