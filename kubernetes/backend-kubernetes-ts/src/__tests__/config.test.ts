import { getDbConfig } from '../config/database';
import { getKeycloakConfig, getKeycloakJwksUri } from '../config/keycloak';

// Don't mock the modules in this test - we want to test the actual functions
describe('Database Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default configuration when no environment variables are set', () => {
    // Remove all database-related environment variables
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_DB;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.NODE_ENV;

    const config = getDbConfig();

    expect(config).toEqual({
      host: 'localhost',
      port: 5432,
      database: 'itblog',
      user: 'bloguser',
      password: 'password',
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  });

  it('should use environment variables when provided', () => {
    process.env.POSTGRES_HOST = 'test-host';
    process.env.POSTGRES_PORT = '5433';
    process.env.POSTGRES_DB = 'test-db';
    process.env.POSTGRES_USER = 'test-user';
    process.env.POSTGRES_PASSWORD = 'test-password';
    process.env.NODE_ENV = 'production';

    const config = getDbConfig();

    expect(config).toEqual({
      host: 'test-host',
      port: 5433,
      database: 'test-db',
      user: 'test-user',
      password: 'test-password',
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  });

  it('should enable SSL in production environment', () => {
    process.env.NODE_ENV = 'production';

    const config = getDbConfig();

    expect(config.ssl).toEqual({ rejectUnauthorized: false });
  });

  it('should disable SSL in development environment', () => {
    process.env.NODE_ENV = 'development';

    const config = getDbConfig();

    expect(config.ssl).toBe(false);
  });
});

describe('Keycloak Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default Keycloak configuration', () => {
    delete process.env.KEYCLOAK_URL;
    delete process.env.KEYCLOAK_REALM;
    delete process.env.KEYCLOAK_CLIENT_ID;
    delete process.env.KEYCLOAK_CLIENT_SECRET;

    const config = getKeycloakConfig();

    expect(config).toEqual({
      url: 'http://localhost:8080',
      realm: 'it-blog-realm',
      clientId: 'it-blog-client',
      clientSecret: '',
    });
  });

  it('should use environment variables for Keycloak configuration', () => {
    process.env.KEYCLOAK_URL = 'https://keycloak.example.com';
    process.env.KEYCLOAK_REALM = 'test-realm';
    process.env.KEYCLOAK_CLIENT_ID = 'test-client';
    process.env.KEYCLOAK_CLIENT_SECRET = 'test-secret';

    const config = getKeycloakConfig();

    expect(config).toEqual({
      url: 'https://keycloak.example.com',
      realm: 'test-realm',
      clientId: 'test-client',
      clientSecret: 'test-secret',
    });
  });

  it('should generate correct JWKS URI', () => {
    process.env.KEYCLOAK_URL = 'https://keycloak.example.com';
    process.env.KEYCLOAK_REALM = 'test-realm';

    const jwksUri = getKeycloakJwksUri();

    expect(jwksUri).toBe('https://keycloak.example.com/realms/test-realm/protocol/openid-connect/certs');
  });
});