// Admin-related routes
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { getKeycloakJwksUri } from '../config/keycloak';

const router = Router();
const authMiddleware = new AuthMiddleware(getKeycloakJwksUri());

// Admin endpoint - requires specific role
router.get(
  '/users',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole('admin'),
  (req: Request, res: Response) => {
    res.json({
      message: 'Admin-only data',
      users: [], // In a real app, this would fetch actual user data
      requestor: req.user?.preferred_username,
      timestamp: new Date().toISOString(),
    });
  },
);

export default router;
