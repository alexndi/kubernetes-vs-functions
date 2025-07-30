# Azure Functions Backend - Testing Guide

This document provides comprehensive information about testing the Azure Functions backend implementation.

## Test Structure

The test suite is organized to match the Kubernetes backend testing approach:

```
functions/backend-functions-ts/src/__tests__/
├── setup.ts                     # Test configuration and global setup
├── __mocks__/
│   └── @azure/
│       └── functions.ts          # Azure Functions mocking utilities
├── config.test.ts               # Database configuration tests
├── models.test.ts               # Type definition and interface tests
├── blog-service.test.ts         # Business logic layer tests
├── blog-repository.test.ts      # Data access layer tests
├── azure-functions.test.ts      # Azure Function handler tests
├── database.test.ts             # Database connection tests
└── utils.test.ts                # Utility function tests
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- config.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should return categories"
```

### Coverage Reports

The test suite generates coverage reports in multiple formats:
- **Console output**: Summary displayed after test run
- **HTML report**: Detailed coverage report in `coverage/` directory
- **LCOV format**: For CI/CD integration

```bash
# Generate and view HTML coverage report
npm run test:coverage
open coverage/index.html
```

## Test Categories

### 1. Configuration Tests (`config.test.ts`)
Tests database configuration and environment variable handling:
- Default configuration values
- Environment variable parsing
- SSL configuration for different environments
- Port number parsing and validation

### 2. Model Tests (`models.test.ts`)
Validates TypeScript interfaces and type definitions:
- BlogPost interface structure
- PostsByCategory response format
- PostError handling
- PostDetail with timestamp
- ApiResponseMessage structure

### 3. Service Layer Tests (`blog-service.test.ts`)
Tests business logic layer:
- Category retrieval
- Post filtering by category
- Individual post lookup
- Error handling and propagation
- Service-to-repository communication

### 4. Repository Tests (`blog-repository.test.ts`)
Tests data access layer:
- Database query execution
- Result transformation
- Error handling for database failures
- SQL injection prevention
- Connection management

### 5. Azure Function Tests (`azure-functions.test.ts`)
Tests Azure Function handlers:
- HTTP trigger processing
- Request parameter validation
- Response formatting
- Error handling
- CORS header setting
- Database migration endpoint security

### 6. Database Tests (`database.test.ts`)
Tests database connection and configuration:
- Pool creation with various configurations
- SSL settings for different environments
- Connection error handling
- Environment variable processing

### 7. Utility Tests (`utils.test.ts`)
Tests helper functions and utilities:
- Error message formatting
- Date handling
- String normalization
- Array processing
- Environment variable validation

## Mocking Strategy

### Azure Functions Mocking
The test suite includes comprehensive mocking for Azure Functions:

```typescript
// Mock context for testing function handlers
const context = createMockContext({
  bindingData: { category: 'programming' },
  res: {}
});

// Mock HTTP request
const request = createMockHttpRequest({
  method: 'GET',
  headers: { 'authorization': 'Bearer token' },
  body: { operation: 'migrate' }
});
```

### Database Mocking
Database operations are mocked to avoid requiring a real database:

```typescript
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn()
};
```

### Service Layer Mocking
Service dependencies are mocked for isolated testing:

```typescript
jest.mock('../shared/blog-service');
const mockBlogService = new BlogService() as jest.Mocked<BlogService>;
```

## Test Data

### Sample Test Data
```typescript
const mockPost = {
  id: 'test-post-1',
  title: 'Test Post',
  author: 'Test Author',
  date: '2025-01-01T00:00:00Z',
  excerpt: 'Test excerpt',
  tags: ['typescript', 'testing'],
  content: 'Full test content'
};

const mockCategories = ['programming', 'devops', 'cloud', 'security'];
```

## CI/CD Integration

### GitHub Actions Integration
The tests are designed to run in GitHub Actions:

```yaml
# In .github/workflows/test.yml
- name: Run Tests
  run: |
    cd functions/backend-functions-ts
    npm install
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./functions/backend-functions-ts/coverage/lcov.info
```

### Test Environment Variables
Required environment variables for testing:

```bash
NODE_ENV=test
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=test_db
POSTGRES_USER=test_user
POSTGRES_PASSWORD=test_password
FRONTEND_URL=http://localhost:3000
DB_MIGRATION_KEY=test-migration-key
```

## Performance Testing

### Test Performance Optimization
- Tests use mocking to avoid slow database operations
- Setup and teardown are optimized for speed
- Parallel test execution is enabled where safe

### Memory Management
- Mocks are cleared after each test
- Database connections are properly closed
- Memory leaks are prevented through proper cleanup

## Debugging Tests

### Debug Configuration
```bash
# Run tests with debugging
npm test -- --verbose

# Run specific test with debugging
npm test -- --testNamePattern="should return posts" --verbose

# Run tests without coverage for faster execution
npm test -- --coverage=false
```

### Common Debugging Patterns
```typescript
// Add console.log for debugging (remove before commit)
console.log('Test data:', result);

// Use debugger statement
debugger;

// Check mock call details
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
console.log('Mock calls:', mockFunction.mock.calls);
```

## Best Practices

### Test Organization
1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: Test names describe expected behavior
3. **Single Responsibility**: Each test focuses on one aspect
4. **Isolation**: Tests don't depend on each other

### Mock Management
1. **Reset Mocks**: Clean state between tests
2. **Specific Mocking**: Mock only what's necessary
3. **Realistic Data**: Use realistic test data
4. **Error Scenarios**: Test both success and failure cases

### Coverage Goals
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

### Azure Functions Specific Testing
1. **Context Handling**: Proper context object mocking
2. **Binding Data**: Test parameter extraction
3. **Response Format**: Validate Azure Functions response structure
4. **Error Handling**: Test Azure Functions error scenarios
5. **CORS**: Validate cross-origin headers

## Troubleshooting

### Common Issues

#### Jest Configuration Problems
```bash
# Clear Jest cache
npx jest --clearCache

# Run with detect open handles
npm test -- --detectOpenHandles
```

#### TypeScript Issues
```bash
# Check TypeScript compilation
npm run type-check

# Build before testing
npm run build
npm test
```

#### Mock Issues
```bash
# Reset modules between tests
jest.resetModules();

# Clear all mocks
jest.clearAllMocks();
```

### Test-Specific Issues

#### Database Mock Not Working
- Ensure database module is mocked before import
- Check mock implementation matches actual interface
- Verify mock reset between tests

#### Azure Functions Context Issues
- Use provided mock context factory
- Ensure all required context properties are mocked
- Check binding data structure matches Azure Functions format

## Future Enhancements

### Planned Improvements
1. **Integration Tests**: Add tests with real database
2. **Performance Tests**: Add performance benchmarking
3. **End-to-End Tests**: Add full workflow testing
4. **Visual Regression**: Add snapshot testing for responses
5. **Load Testing**: Add concurrent request testing

### Testing Tools Consideration
- **Supertest**: For HTTP endpoint testing
- **Test Containers**: For integration testing with real databases
- **Azure Functions Testing**: Enhanced Azure-specific testing tools
- **Performance Testing**: Artillery or similar for load testing

This comprehensive test suite ensures the Azure Functions backend is reliable, maintainable, and functions correctly across different scenarios and edge cases.