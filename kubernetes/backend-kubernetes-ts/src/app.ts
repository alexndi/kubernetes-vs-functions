// src/app.ts for Kubernetes version with improved Keycloak auth support and PostgreSQL
import express, { Request, Response } from 'express';
import cors from 'cors';
import { getKeycloakConfig } from './config/keycloak';
import { ApiResponseMessage } from './models/blog';
import pool from './config/database';
import runMigrations from './db/migrations/run';
import seed from './db/seed';
import benchmarkRouter from './routes/benchmark';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blog';
import adminRoutes from './routes/admin';


// Create Express app
const app = express();

// Environment variables
const KEYCLOAK_CONFIG = getKeycloakConfig();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';


console.log('Starting application with configuration:');
console.log('- Keycloak URL:', KEYCLOAK_CONFIG.url);
console.log('- Keycloak Realm:', KEYCLOAK_CONFIG.realm);
console.log('- Frontend URL:', FRONTEND_URL);
console.log('- Node Environment:', NODE_ENV);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow the configured frontend URL
    if (origin === FRONTEND_URL) {
      return callback(null, true);
    }

    // In development, allow localhost origins
    if (
      NODE_ENV === 'development' &&
      (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.'))
    ) {
      return callback(null, true);
    }

    // Allow the production domain
    if (origin.includes('devinsights.site')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));


// Database initialization function
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Checking database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful.');

    console.log('Running migrations...');
    await runMigrations();

    console.log('Seeding database with sample data...');
    await seed();

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Test database connection as part of health check
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      keycloak: {
        url: KEYCLOAK_CONFIG.url,
        realm: KEYCLOAK_CONFIG.realm,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});







// Register route modules
app.use('/api/auth', authRoutes);
app.use('/api', blogRoutes);
app.use('/api/admin', adminRoutes);

// Register benchmark routes BEFORE error handling
app.use('/api/benchmark', benchmarkRouter);

// Add pod information to all responses
app.use((req: Request, res: Response, next) => {
  res.set({
    'X-Pod-Name': process.env.HOSTNAME || 'unknown',
    'X-Pod-IP': process.env.POD_IP || 'unknown',
    'X-Node-Name': process.env.NODE_NAME || 'unknown'
  });
  next();
});

// Default route
app.get('/', (_req: Request, res: Response) => {
  const responseData: ApiResponseMessage = {
    message: 'IT Blog API - Kubernetes Version with PostgreSQL and Enhanced Authentication',
    endpoints: {
      getAllCategories: '/api/categories',
      getPostsByCategory: '/api/posts/{category}',
      getPostById: '/api/post/{id}',
      userProfile: '/api/user/profile (protected)',
      authConfig: '/api/auth/config',
      benchmarks: '/api/benchmark/{cpu|memory|latency}',
    },
  };

  res.json(responseData);
});

// Error handling middleware - MUST have 4 parameters
app.use((error: Error, req: Request, res: Response, next: any) => {

  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT || 3001;

  // Initialize database before starting the server
  initializeDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Health check available at: http://localhost:${port}/health`);
        console.log(`API documentation at: http://localhost:${port}/`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

export default app;
