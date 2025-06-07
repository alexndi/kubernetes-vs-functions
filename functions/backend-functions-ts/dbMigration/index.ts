// functions/backend-functions-ts/dbMigration/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import runMigrations from '../db/migrations/run';
import seed from '../db/seed';
import resetDatabase from '../db/reset-db';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Database migration function processed a request.');
  
  try {
    // Check for authorization key
    const authKey = req.headers['x-api-key'] || req.query.key;
    const expectedKey = process.env.DB_MIGRATION_KEY;
    
    if (!expectedKey) {
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { 
          error: 'DB_MIGRATION_KEY not configured',
          message: 'Database migration key is not set in environment variables'
        }
      };
      return;
    }
    
    if (!authKey || authKey !== expectedKey) {
      context.log.warn('Unauthorized migration attempt');
      context.res = {
        status: 401,
        headers: { "Content-Type": "application/json" },
        body: { 
          error: 'Unauthorized',
          message: 'Valid API key required. Provide key via x-api-key header or ?key= query parameter'
        }
      };
      return;
    }
    
    // Get operation from request
    const operation = req.body?.operation || req.query.operation || 'migrate';
    const force = req.body?.force || req.query.force === 'true';
    
    context.log(`Starting database operation: ${operation}, force: ${force}`);
    
    let result: any = {};
    const startTime = Date.now();
    
    switch (operation.toLowerCase()) {
      case 'migrate':
        context.log('Running database migrations...');
        await runMigrations(false);
        result = {
          operation: 'migrate',
          success: true,
          message: 'Database migrations completed successfully',
          duration: Date.now() - startTime
        };
        break;
        
      case 'seed':
        context.log('Seeding database...');
        await seed(false);
        result = {
          operation: 'seed',
          success: true,
          message: 'Database seeding completed successfully',
          duration: Date.now() - startTime
        };
        break;
        
      case 'migrate-and-seed':
        context.log('Running migrations and seeding...');
        await runMigrations(false);
        await seed(false);
        result = {
          operation: 'migrate-and-seed',
          success: true,
          message: 'Database migrations and seeding completed successfully',
          duration: Date.now() - startTime
        };
        break;
        
      case 'reset':
        if (!force) {
          context.res = {
            status: 400,
            headers: { "Content-Type": "application/json" },
            body: {
              error: 'Reset requires force flag',
              message: 'Database reset is destructive. Add force=true to confirm.',
              usage: 'POST with {"operation": "reset", "force": true} or ?operation=reset&force=true'
            }
          };
          return;
        }
        
        context.log('Resetting database (destructive operation)...');
        await resetDatabase(false);
        result = {
          operation: 'reset',
          success: true,
          message: 'Database reset completed successfully (all data destroyed and recreated)',
          duration: Date.now() - startTime,
          warning: 'This was a destructive operation - all previous data was deleted'
        };
        break;
        
      default:
        context.res = {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: 'Invalid operation',
            message: `Unknown operation: ${operation}`,
            validOperations: ['migrate', 'seed', 'migrate-and-seed', 'reset'],
            usage: {
              migrate: 'Run database migrations only',
              seed: 'Seed database with sample data only',
              'migrate-and-seed': 'Run migrations then seed data',
              reset: 'DESTRUCTIVE: Drop all tables, run migrations, and seed (requires force=true)'
            }
          }
        };
        return;
    }
    
    context.log(`Database operation ${operation} completed in ${result.duration}ms`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        ...result,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    };
    
  } catch (error) {
    context.log.error('Database operation failed:', error);
    
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        operation: req.body?.operation || req.query.operation || 'unknown',
        success: false,
        error: 'Database operation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }
    };
  }
};

export default httpTrigger;