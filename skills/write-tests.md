# Write Tests

Generate comprehensive tests for code by analyzing the file, identifying test cases (happy path, edge cases, error scenarios), and outputting a complete test file with AAA pattern.

## Prompt Chain

### Step 1: Analyze File
Examine the code and understand:
- What functions or classes need tests?
- What are the inputs and outputs for each?
- What are the dependencies?
- What external services or APIs are called?

Create a list of testable units.

### Step 2: Identify Test Cases
For each testable unit, identify required test cases:
- **Happy Path**: Normal, expected usage with valid inputs
- **Edge Cases**: Boundary conditions (empty input, max values, null/undefined)
- **Error Cases**: Invalid inputs, exceptions, error states
- **State Changes**: How does state change through operations?

Aim for 3-5 test cases per function (happy path + 2-4 edge/error cases).

### Step 3: Plan Mocking Strategy
Determine what needs to be mocked:
- External API calls
- File system operations
- Database calls
- Current time/date functions
- Any other dependencies

List what will be mocked and how.

### Step 4: Generate Tests with AAA Pattern
Write tests using the Arrange-Act-Assert pattern:
```
describe('functionName', () => {
  it('should do X when given Y', () => {
    // Arrange: Set up test data and mocks
    const input = ...;

    // Act: Call the function
    const result = functionName(input);

    // Assert: Verify the result
    expect(result).toBe(...);
  });
});
```

Each test:
- Has a clear, descriptive name
- Tests one behavior
- Is independent of other tests
- Includes setup (arrange), execution (act), and verification (assert)

### Step 5: Output Complete Test File
Create a complete, runnable test file with:
- Proper test framework imports (use common framework for the language)
- All mocks and setup
- All test cases organized in describe blocks
- Clear test descriptions
- Ready to run without modifications

## Output Format

Provide the complete test file with:
- Proper imports and setup
- Describe blocks for each tested function
- All test cases in AAA pattern
- Mocks configured
- File is ready to execute

Example structure:
```javascript
import { functionName } from './source-file';

describe('functionName', () => {
  it('should handle happy path', () => {
    // AAA pattern test
  });

  it('should handle edge case', () => {
    // AAA pattern test
  });
});
```
