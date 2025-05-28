// config/database.ts
import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export function getDbConfig(): DatabaseConfig {
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'itblog',
    user: process.env.POSTGRES_USER || 'bloguser',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Create a singleton pool to use throughout the application
const pool = new Pool(getDbConfig());

// Event listener for connection errors
pool.on('error', (err) => {
  console.error('PostgreSQL client error:', err);
  // Don't exit on error in Azure Functions
  // process.exit(-1);
});

export default pool;