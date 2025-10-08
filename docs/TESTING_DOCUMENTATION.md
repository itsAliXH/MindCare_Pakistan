# Testing Documentation

This document provides comprehensive information about the testing setup and implementation for the MindCare Pakistan therapist finder application.

## Table of Contents
1. [Testing Overview](#testing-overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Test Configuration](#test-configuration)
6. [Running Tests](#running-tests)
7. [Test Coverage](#test-coverage)
8. [CI/CD Integration](#cicd-integration)

---

## Testing Overview

The MindCare Pakistan application implements a comprehensive testing strategy with multiple layers:

### Testing Pyramid
```
    /\
   /  \     E2E Tests (Cypress)
  /____\    
 /      \   Integration Tests (Jest)
/________\  
/          \ Unit Tests (Jest)
/____________\
```

### Testing Layers
1. **Unit Tests**: Test individual components, services, and functions in isolation
2. **Integration Tests**: Test the interaction between different parts of the system
3. **End-to-End Tests**: Test complete user workflows from the browser perspective

---

## Backend Testing

### Technology Stack
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **TypeScript**: Type-safe testing

### Test Structure
```
backend/
├── tests/
│   ├── setup.ts                 # Test setup and teardown
│   ├── models/
│   │   └── therapist.test.ts    # Model unit tests
│   ├── routes/
│   │   └── therapists.test.ts   # API endpoint tests
│   └── integration/
│       └── therapist-integration.test.ts  # Integration tests
├── jest.config.js               # Jest configuration
└── package.json                 # Test scripts
```

### Test Categories

#### 1. Model Tests (`tests/models/therapist.test.ts`)
- **Schema Validation**: Tests for data validation and required fields
- **Default Values**: Tests for default field values
- **Indexes**: Tests for database indexes and text search
- **Data Types**: Tests for proper data type handling

```typescript
describe('Therapist Model', () => {
  it('should create a therapist with valid data', async () => {
    const therapistData = {
      name: 'Dr. John Doe',
      gender: 'Male',
      city: 'Karachi',
      // ... other fields
    };
    
    const therapist = new Therapist(therapistData);
    const savedTherapist = await therapist.save();
    
    expect(savedTherapist._id).toBeDefined();
    expect(savedTherapist.name).toBe(therapistData.name);
  });
});
```

#### 2. API Endpoint Tests (`tests/routes/therapists.test.ts`)
- **GET /therapists**: Tests for therapist listing with filters and pagination
- **GET /therapists/:id**: Tests for individual therapist retrieval
- **GET /therapists/_filters/options**: Tests for filter options endpoint
- **Error Handling**: Tests for various error scenarios

```typescript
describe('Therapist API Routes', () => {
  it('should get all therapists with default pagination', async () => {
    const response = await request(app)
      .get('/api/therapists')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body.data).toHaveLength(3);
  });
});
```

#### 3. Integration Tests (`tests/integration/therapist-integration.test.ts`)
- **Complete Workflows**: Tests for end-to-end API workflows
- **Filter Combinations**: Tests for complex filter combinations
- **Performance**: Tests for handling large datasets
- **Edge Cases**: Tests for error scenarios and edge cases

### Test Setup
The backend tests use MongoDB Memory Server for isolated testing:

```typescript
// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
```

---

## Frontend Testing

### Technology Stack
- **Jest**: Testing framework (replaced Jasmine/Karma)
- **Angular Testing Utilities**: Component testing utilities
- **HttpClientTestingModule**: HTTP client testing
- **ReactiveFormsModule**: Form testing

### Test Structure
```
frontend/
├── src/
│   ├── setup-jest.ts            # Jest setup for Angular
│   ├── app/
│   │   ├── core/
│   │   │   └── services/
│   │   │       └── therapist.service.spec.ts
│   │   ├── components/
│   │   │   ├── therapist-card/
│   │   │   │   └── therapist-card.spec.ts
│   │   │   └── filter-panel/
│   │   │       └── filter-panel.spec.ts
│   │   └── pages/
│   │       └── home/
│   │           └── home.spec.ts
├── jest.config.js               # Jest configuration
└── package.json                 # Test scripts
```

### Test Categories

#### 1. Service Tests (`therapist.service.spec.ts`)
- **HTTP Requests**: Tests for API communication
- **Error Handling**: Tests for network and API errors
- **Data Transformation**: Tests for request/response handling

```typescript
describe('TherapistService', () => {
  it('should fetch therapists with default parameters', () => {
    const mockResponse = {
      data: [mockTherapist],
      total: 1
    };
    
    service.getTherapists().subscribe(response => {
      expect(response.data).toEqual(mockResponse.data);
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/therapists?page=1&limit=18`);
    req.flush(mockResponse);
  });
});
```

#### 2. Component Tests (`therapist-card.spec.ts`, `filter-panel.spec.ts`)
- **Component Rendering**: Tests for proper component rendering
- **User Interactions**: Tests for click events and form interactions
- **Data Binding**: Tests for input/output data binding
- **Lifecycle Hooks**: Tests for component lifecycle methods

```typescript
describe('TherapistCard', () => {
  it('should display therapist information correctly', () => {
    component.therapist = mockTherapist;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain('Dr. Test Therapist');
  });
});
```

#### 3. Page Component Tests (`home.spec.ts`)
- **State Management**: Tests for component state management
- **Service Integration**: Tests for service method calls
- **Event Handling**: Tests for user interaction events
- **Template Rendering**: Tests for conditional rendering

### Jest Configuration
The frontend uses Jest with Angular preset:

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

---

## End-to-End Testing

### Technology Stack
- **Cypress**: E2E testing framework
- **Custom Commands**: Reusable test commands
- **Fixtures**: Mock data for tests

### Test Structure
```
frontend/
├── cypress/
│   ├── e2e/
│   │   └── therapist-finder.cy.ts    # Main E2E test suite
│   ├── fixtures/
│   │   ├── therapists.json           # Mock therapist data
│   │   └── filter-options.json       # Mock filter options
│   ├── support/
│   │   ├── commands.ts               # Custom Cypress commands
│   │   └── e2e.ts                    # E2E test setup
│   └── config.ts                     # Cypress configuration
```

### Test Categories

#### 1. Application Load Tests
- **Page Loading**: Tests for successful application loading
- **Initial State**: Tests for correct initial application state
- **Loading Indicators**: Tests for loading states

#### 2. User Interface Tests
- **Header Navigation**: Tests for header functionality
- **Filter Panel**: Tests for filter interactions
- **Search Functionality**: Tests for search input and results
- **Responsive Design**: Tests for mobile and desktop layouts

#### 3. User Workflow Tests
- **Therapist Search**: Complete search workflow
- **Filter Application**: Filter selection and results
- **Therapist Details**: Popup modal functionality
- **Pagination**: Page navigation and data loading

#### 4. Error Handling Tests
- **API Errors**: Tests for network and server errors
- **Invalid Data**: Tests for handling invalid responses
- **Retry Functionality**: Tests for error recovery

### Custom Commands
Cypress custom commands for reusable test actions:

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('searchTherapists', (searchTerm: string) => {
  cy.get('input[placeholder*="Search"]').clear().type(searchTerm);
  cy.wait(500); // Wait for debounce
  cy.waitForApi();
});

Cypress.Commands.add('filterByCity', (city: string) => {
  cy.get(`input[type="checkbox"][value="${city}"]`).check();
  cy.waitForApi();
});
```

### Test Examples
```typescript
describe('Therapist Finder Application', () => {
  it('should load the application successfully', () => {
    cy.visit('/');
    cy.waitForApi();
    
    cy.get('app-header').should('be.visible');
    cy.get('app-filter-panel').should('be.visible');
    cy.contains('therapists found').should('be.visible');
  });
  
  it('should allow city filtering', () => {
    cy.filterByCity('Karachi');
    cy.get('.results-count').should('contain', 'therapists found');
  });
});
```

---

## Test Configuration

### Backend Configuration

#### Jest Configuration (`backend/jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ]
};
```

#### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/models",
    "test:api": "jest --testPathPattern=tests/routes",
    "test:integration": "jest --testPathPattern=tests/integration"
  }
}
```

### Frontend Configuration

#### Angular.json Configuration
```json
{
  "test": {
    "builder": "@angular-builders/jest:run",
    "options": {
      "configPath": "./jest.config.js",
      "tsConfig": "tsconfig.spec.json"
    }
  }
}
```

#### Cypress Configuration (`frontend/cypress.config.ts`)
```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000
  }
});
```

---

## Running Tests

### Backend Tests
```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test categories
npm run test:unit      # Model tests only
npm run test:api       # API tests only
npm run test:integration  # Integration tests only
```

### Frontend Tests
```bash
# Run all unit tests
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### End-to-End Tests
```bash
# Open Cypress Test Runner
cd frontend
npm run e2e

# Run E2E tests headlessly
npm run e2e:run

# Run E2E tests for CI
npm run e2e:ci
```

### Full Test Suite
```bash
# Run all tests (backend + frontend + e2e)
cd backend && npm test && cd ../frontend && npm test && npm run e2e:run
```

---

## Test Coverage

### Coverage Thresholds
- **Backend**: 80% minimum coverage
- **Frontend**: 70% minimum coverage
- **Critical Paths**: 90% minimum coverage

### Coverage Reports
- **HTML Reports**: Generated in `coverage/` directories
- **LCOV Reports**: For CI/CD integration
- **Console Output**: Real-time coverage feedback

### Coverage Commands
```bash
# Backend coverage
cd backend
npm run test:coverage

# Frontend coverage
cd frontend
npm run test:coverage
```

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci && npm test
      
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm test
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm run e2e:ci
```

### Test Reports
- **Jest Coverage**: Integrated with GitHub Actions
- **Cypress Reports**: Screenshots and videos on failure
- **Test Results**: Published as GitHub Actions artifacts

---

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Follow the AAA pattern
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include boundary and error conditions

### Test Organization
1. **Group Related Tests**: Use `describe` blocks for organization
2. **Setup and Teardown**: Use `beforeEach` and `afterEach` appropriately
3. **Test Data**: Use consistent mock data across tests
4. **Clean Tests**: Keep tests independent and isolated

### Performance
1. **Parallel Execution**: Run tests in parallel when possible
2. **Fast Feedback**: Keep unit tests fast (< 100ms each)
3. **Selective Testing**: Run only relevant tests during development
4. **Test Caching**: Use Jest's caching for faster subsequent runs

---

## Troubleshooting

### Common Issues

#### Backend Tests
- **MongoDB Connection**: Ensure MongoDB Memory Server is properly configured
- **Port Conflicts**: Use different ports for test and development servers
- **Async Operations**: Properly handle async/await in tests

#### Frontend Tests
- **Angular Dependencies**: Ensure all Angular modules are properly imported
- **Mock Services**: Properly mock HTTP services and external dependencies
- **Component Lifecycle**: Handle component initialization in tests

#### E2E Tests
- **Timing Issues**: Use proper waits and assertions
- **Browser Compatibility**: Test across different browsers
- **Environment Setup**: Ensure consistent test environment

### Debug Commands
```bash
# Debug Jest tests
npm test -- --verbose --no-cache

# Debug Cypress tests
npm run e2e -- --headed --no-exit

# Run specific test files
npm test -- therapist.service.spec.ts
```

---

## Summary

The MindCare Pakistan application implements a comprehensive testing strategy that ensures:

1. **Code Quality**: High test coverage and quality standards
2. **Reliability**: Robust error handling and edge case testing
3. **Maintainability**: Well-organized and documented test suites
4. **Performance**: Fast feedback loops and efficient test execution
5. **User Experience**: End-to-end testing of critical user workflows


