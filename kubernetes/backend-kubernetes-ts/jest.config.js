// kubernetes/backend-kubernetes-ts/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.ts': ['ts-jest', {
      isolatedModules: true
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/db/migrations/**',
    '!src/db/seed.ts',
    '!src/db/reset-db.ts',
    '!src/app.ts'
  ],
  coverageDirectory: 'coverage',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};