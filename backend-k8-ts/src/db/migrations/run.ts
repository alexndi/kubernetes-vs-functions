// src/db/migrations/run.ts
import { Pool } from 'pg';
import pool from '../../config/database';
import { up as initialSchemaUp, down as initialSchemaDown } from './001-initial-schema';

// Array of migrations in order
const migrations = [
  { 
    name: '001-initial-schema',
    up: initialSchemaUp,
    down: initialSchemaDown
  }
  // Add future migrations here in order
];

// Create migrations table if it doesn't exist
async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Run migrations
async function runMigrations(endPoolWhenDone: boolean = false): Promise<void> {
  try {
    await ensureMigrationsTable(pool);
    
    // Get applied migrations
    const { rows } = await pool.query('SELECT name FROM migrations');
    const appliedMigrations = new Set(rows.map(row => row.name));
    
    // Filter out migrations that have already been applied
    const migrationsToApply = migrations.filter(migration => !appliedMigrations.has(migration.name));
    
    if (migrationsToApply.length === 0) {
      console.log('No new migrations to apply');
      return;
    }
    
    console.log(`Applying ${migrationsToApply.length} migrations`);
    
    // Apply each migration in a transaction
    for (const migration of migrationsToApply) {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        console.log(`Applying migration: ${migration.name}`);
        
        await migration.up(pool);
        
        // Record that the migration has been applied
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
        
        await client.query('COMMIT');
        console.log(`Successfully applied migration: ${migration.name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${migration.name}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    // Only end the pool if specifically requested
    if (endPoolWhenDone) {
      await pool.end();
    }
  }
}

// Run migrations when this file is executed directly
if (require.main === module) {
  runMigrations(true)
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export default runMigrations;