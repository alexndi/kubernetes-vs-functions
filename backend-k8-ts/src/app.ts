// src/app.ts for Kubernetes version with Keycloak auth support and PostgreSQL
import express, { Request, Response } from 'express';
import cors from 'cors';
import BlogService from './blog-service';
import { AuthMiddleware } from './middleware/auth';
import { getKeycloakConfig, getKeycloakJwksUri } from './config/keycloak';
import { ApiResponseMessage, AuthConfig } from './models/blog';
import pool from './config/database';
import runMigrations from './db/migrations/run';
import seed from './db/seed';

// Create Express app and blog service
const app = express();
const blogService = new BlogService();

// Environment variables
const KEYCLOAK_CONFIG = getKeycloakConfig();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create auth middleware
const authMiddleware = new AuthMiddleware(getKeycloakJwksUri());

// Middleware
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database initialization function
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Checking database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful.');
    
    console.log('Running migrations...');
    await runMigrations();
    
    if (NODE_ENV === 'development') {
      console.log('Seeding database with sample data...');
      await seed();
    }
    
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
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Auth config endpoint - provides info needed for frontend to connect to Keycloak
app.get('/api/auth/config', (_req: Request, res: Response) => {
  const config: AuthConfig = {
    realm: KEYCLOAK_CONFIG.realm,
    url: KEYCLOAK_CONFIG.url,
    clientId: KEYCLOAK_CONFIG.clientId
  };
  
  res.json(config);
});

// Get posts by category endpoint
app.get('/api/posts/:category', authMiddleware.authenticateToken, async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const posts = await blogService.getPostsByCategory(category);
    
    // Check if posts is an error response
    if ('error' in posts) {
      return res.status(404).json(posts);
    }
    
    // If user is authenticated, we could add personalized data here
    if (req.isAuthenticated) {
      (posts as any).userInfo = {
        isAuthenticated: true,
        displayName: req.user.name
      };
    }
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
});

// Get post by ID endpoint
app.get('/api/post/:id', authMiddleware.authenticateToken, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const post = await blogService.getPostById(postId);
    
    if ('error' in post) {
      res.status(404).json(post);
    } else {
      // Add user comment access for authenticated users
      if (req.isAuthenticated) {
        (post as any).userCanComment = true;
      }
      
      res.json(post);
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
});

// Get all categories endpoint
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await blogService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
});

// Protected endpoint - only accessible for authenticated users
app.get('/api/user/profile', authMiddleware.authenticateToken, (req: Request, res: Response) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    user: req.user,
    message: 'This is protected data visible only to authenticated users'
  });
});

// Default route
app.get('/', (_req: Request, res: Response) => {
  const responseData: ApiResponseMessage = { 
    message: 'IT Blog API - Kubernetes Version with PostgreSQL', 
    endpoints: {
      getAllCategories: '/api/categories',
      getPostsByCategory: '/api/posts/{category}',
      getPostById: '/api/post/{id}',
      userProfile: '/api/user/profile (protected)',
      authConfig: '/api/auth/config'
    }
  };
  
  res.json(responseData);
});

// Start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT || 3001;
  
  // Initialize database before starting the server
  initializeDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch(error => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

// Export the app for testing
export default app;