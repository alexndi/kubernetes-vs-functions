import { AzureFunction, Context } from "@azure/functions";
import pool from '../config/database';

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {
  context.log('Health check function processed a request.');
  
  try {
    // Test database connection as part of health check
    await pool.query('SELECT 1');
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: { status: 'ok', database: 'connected' }
    };
  } catch (error) {
    context.log.error('Health check failed:', error);
    
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: { status: 'error', message: 'Database connection failed' }
    };
  }
};

export default httpTrigger;