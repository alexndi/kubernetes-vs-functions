// Blog-related routes
import { Router, Request, Response } from 'express';
import BlogService from '../blog-service';
import { AuthMiddleware } from '../middleware/auth';
import { getKeycloakJwksUri } from '../config/keycloak';

const router = Router();
const blogService = new BlogService();
const authMiddleware = new AuthMiddleware(getKeycloakJwksUri());

// Get posts by category endpoint (public, but enhanced for authenticated users)
router.get(
  '/posts/:category',
  authMiddleware.authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      console.log(
        `Fetching posts for category: ${category}, authenticated: ${req.isAuthenticated}`,
      );

      const posts = await blogService.getPostsByCategory(category);

      // Check if posts is an error response
      if ('error' in posts) {
        return res.status(404).json(posts);
      }

      // Add user info if authenticated
      const response = {
        ...posts,
        userInfo: req.isAuthenticated
          ? {
              isAuthenticated: true,
              displayName: req.user?.preferred_username || req.user?.name || 'User',
            }
          : {
              isAuthenticated: false,
              displayName: 'Anonymous',
            },
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        error: 'An error occurred processing your request',
        timestamp: new Date().toISOString(),
      });
    }
  },
);

// Get post by ID endpoint (public, but enhanced for authenticated users)
router.get('/post/:id', authMiddleware.authenticateToken, async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    console.log(`Fetching post: ${postId}, authenticated: ${req.isAuthenticated}`);

    const post = await blogService.getPostById(postId);

    if ('error' in post) {
      return res.status(404).json(post);
    }

    // Add user permissions for authenticated users
    const response = {
      ...post,
      userCanComment: req.isAuthenticated,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      error: 'An error occurred processing your request',
      timestamp: new Date().toISOString(),
    });
  }
});

// Get all categories endpoint (public)
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await blogService.getAllCategories();
    res.json({
      categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'An error occurred processing your request',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
