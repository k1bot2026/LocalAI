# Test Scaffold

Generate test scaffolding by detecting test framework, creating directory structure, setting up configuration, and creating test file templates for each source file.

## Prompt Chain

### Step 1: Detect Test Framework
Identify testing approach:
- Unit test framework (Jest, pytest, Go test, unittest, etc.)
- Integration test approach (same framework or separate)
- E2E test framework if needed (Cypress, Selenium, Playwright, etc.)
- Mocking/assertion libraries (sinon, unittest.mock, mockito, etc.)
- Coverage tools (nyc, coverage.py, tarpaulin, etc.)
- Test runner and parallel execution capabilities

Document framework stack and version requirements.

### Step 2: Generate Directory Structure
Create test organization:
- Test directory location (tests/, __tests__/, test/, .test files, etc.)
- Mirror source structure (tests/unit/, tests/integration/, tests/e2e/)
- Test file naming convention (.test.js, .spec.ts, test_*.py, *_test.go)
- Fixtures and mock data directory (tests/fixtures/, tests/mocks/)
- Configuration files location (jest.config.js, pytest.ini, etc.)
- Coverage reporting directory

Show full directory tree with paths.

### Step 3: Create Test Setup and Configuration
Generate framework configuration:
- Main test configuration file (jest.config.js, pytest.ini, setup.cfg, etc.)
- Test environment setup (setupTests.js, conftest.py, etc.)
- Configure paths, module resolution, globals
- Configure test runners and reporters
- Configure coverage thresholds and reporting
- Set timeouts and retry logic appropriately
- Include any test-specific environment variables

### Step 4: Create Test File Skeletons
Generate templates for each source file:
- Create test file for each source file (1:1 or 1:many)
- Include describe/suite blocks matching module structure
- Create test stubs for each exported function/class
- Use consistent naming (describe("module"), test("should..."))
- Include placeholder assertions
- Add comments guiding what to test

Show 2-3 full example test files.

### Step 5: Add Testing Best Practices
Include guidance files:
- TESTING.md with guidelines and patterns
- Example of unit test structure
- Example of mocking dependencies
- Example of testing async code
- Example of testing error cases
- Example of integration test approach

### Step 6: Generate Test Commands
Document how to run tests:
- Run all tests (npm test, pytest, etc.)
- Run specific test file
- Run with coverage
- Run in watch mode
- Run specific test by name
- CI test command

## Output Format

Present complete directory structure with paths. Show 2-3 full test file examples with proper structure. Include test configuration file contents. End with testing.md guidance and list of all available test commands.
