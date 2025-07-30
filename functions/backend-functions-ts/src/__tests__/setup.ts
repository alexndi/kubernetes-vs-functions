// functions/backend-functions-ts/__tests__/setup.ts
// Simple test setup

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_DB = 'test_db';
process.env.POSTGRES_USER = 'test_user';
process.env.POSTGRES_PASSWORD = 'test_password';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Global setup
beforeEach(() => {
  jest.clearAllMocks();
});