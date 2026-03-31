# Dockerfile

Generate Dockerfile and docker-compose configurations by analyzing runtime requirements, creating optimized layers, and generating complete container setup.

## Prompt Chain

### Step 1: Analyze Runtime Requirements
Understand containerization needs:
- Base runtime needed (node:18-alpine, python:3.11-slim, rust:latest, etc.)
- Build tools required for compilation (if needed)
- System dependencies (curl, git, build-essential, etc.)
- Application ports exposed
- Environment variables needed (config, secrets)
- Working directory location
- User permissions (should app run as root or specific user)
- Health check requirements

Document all requirements.

### Step 2: Plan Layer Caching
Optimize Docker layers for build speed:
- Order layers from least to most frequently changing
- Dependency installation before code (changes less often)
- Code copying before running (changes most often)
- Identify multi-stage build opportunities (build stage vs. runtime stage)
- Plan what to exclude with .dockerignore

Document layer strategy.

### Step 3: Generate Dockerfile
Create the container definition:
- Select appropriate base image (minimal size, security)
- Install system dependencies
- Set working directory
- Copy dependency files and install dependencies
- Copy application code
- Expose ports
- Set environment variables or defaults
- Define health check if applicable
- Document entrypoint and default command
- Use multi-stage build if relevant (compile in one stage, run in another)
- Include comments explaining each layer

### Step 4: Generate docker-compose (if multi-service)
If application needs multiple services:
- Define all services needed (app, database, cache, etc.)
- Specify images or build contexts
- Define environment variables and secrets
- Configure networking between services
- Set up volumes for persistence
- Define dependencies and startup order
- Include health checks
- Include port mappings

### Step 5: Generate .dockerignore
Create exclusion file:
- Exclude node_modules, __pycache__, target/, etc.
- Exclude Git files (.git, .gitignore)
- Exclude build artifacts
- Exclude tests and development files
- Exclude documentation and examples
- Keep minimal to reduce build context size

### Step 6: Document Build and Run Instructions
Provide operational guidance:
- Build command (docker build -t name:tag .)
- Run command with port mapping and environment
- Push to registry if applicable
- docker-compose up for multi-service setup
- Volume mounting for development
- Debugging tips

## Output Format

Present Dockerfile with comments for clarity, followed by docker-compose.yml if needed, and .dockerignore. Include build/run instructions and any special considerations (secrets, environment setup).
