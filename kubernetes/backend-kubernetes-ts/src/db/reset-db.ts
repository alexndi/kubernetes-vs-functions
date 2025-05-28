// src/db/reset-db.ts
import { Pool } from 'pg';
import pool from '../config/database';
import runMigrations from './migrations/run';
import seed from './seed';

async function resetDatabase(endPoolWhenDone: boolean = false): Promise<void> {
  const client = await pool.connect();
  
  try {
    console.log('Starting database reset...');
    
    await client.query('BEGIN');
    
    // Drop all tables
    console.log('Dropping all tables...');
    await client.query(`
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS post_tags CASCADE;
      DROP TABLE IF EXISTS posts CASCADE;
      DROP TABLE IF EXISTS tags CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
    `);
    
    await client.query('COMMIT');
    console.log('All tables dropped.');
    
    // Run migrations
    console.log('Running migrations...');
    await runMigrations(false);
    
    // Seed database
    console.log('Seeding database...');
    await seed(false);
    
    console.log('Database reset completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database reset failed:', error);
    throw error;
  } finally {
    client.release();
    
    // Only end the pool if specifically requested
    if (endPoolWhenDone) {
      await pool.end();
    }
  }
}

// Run the reset function when this file is executed directly
if (require.main === module) {
  resetDatabase(true).catch(err => {
    console.error('Reset failed:', err);
    process.exit(1);
  });
}

export default resetDatabase;