// src/app.js for Kubernetes version with Keycloak auth support
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwksClient = require('jwks-rsa');
const BlogService = require('./blog-service');

const app = express();
const blogService = new BlogService();

// Environment variables (in a real app these would be properly managed)
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://192.168.49.2:30387/';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'it-blog-realm';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'it-blog-client';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set up the JWKS client
const jwks = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`
});

// Function to get the signing key - THIS WAS MISSING
function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.isAuthenticated = false;
    return next();
  }
  
  try {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        req.isAuthenticated = false;
      } else {
        req.user = decoded;
        req.isAuthenticated = true;
      }
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    req.isAuthenticated = false;
    next();
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth config endpoint - provides info needed for frontend to connect to Keycloak
app.get('/api/auth/config', (req, res) => {
  res.json({
    realm: KEYCLOAK_REALM,
    url: KEYCLOAK_URL,
    clientId: KEYCLOAK_CLIENT_ID
  });
});

// Get posts by category endpoint
app.get('/api/posts/:category', authenticateToken, async (req, res) => {
  try {
    const category = req.params.category;
    const posts = await blogService.getPostsByCategory(category);
    
    // If user is authenticated, we could add personalized data here
    if (req.isAuthenticated) {
      posts.userInfo = {
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
app.get('/api/post/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await blogService.getPostById(postId);
    
    if (post.error) {
      res.status(404).json(post);
    } else {
      // Add user comment access for authenticated users
      if (req.isAuthenticated) {
        post.userCanComment = true;
      }
      
      res.json(post);
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
});

// Get all categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await blogService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
});

// Protected endpoint - only accessible for authenticated users
app.get('/api/user/profile', authenticateToken, (req, res) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    user: req.user,
    message: 'This is protected data visible only to authenticated users'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IT Blog API - Kubernetes Version', 
    endpoints: {
      getAllCategories: '/api/categories',
      getPostsByCategory: '/api/posts/{category}',
      getPostById: '/api/post/{id}',
      userProfile: '/api/user/profile (protected)',
      authConfig: '/api/auth/config'
    }
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;