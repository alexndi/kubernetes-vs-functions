// functions/backend-functions-ts/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/simple.test.ts'  // Only run the single simple test file
  ],
  transform: {
    '^.+\\.ts': 'ts-jest'  // Removed isolatedModules option to fix deprecation warning
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};