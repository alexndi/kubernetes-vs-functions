module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/db/migrations/**',
    '!src/db/seed.ts',
    '!src/db/reset-db.ts',
    '!src/app.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};