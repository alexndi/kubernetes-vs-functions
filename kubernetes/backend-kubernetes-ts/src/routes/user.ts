// User-related routes  
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { getKeycloakJwksUri } from '../config/keycloak';

const router = Router();
const authMiddleware = new AuthMiddleware(getKeycloakJwksUri());

// User profile endpoint - matches documented API
router.get(
  '/profile',
  authMiddleware.authenticateToken,
  authMiddleware.requireAuth,
  (req: Request, res: Response) => {
    console.log('Profile request from authenticated user:', req.user?.preferred_username);

    res.json({
      user: {
        sub: req.user?.sub,
        preferred_username: req.user?.preferred_username,
        name: req.user?.name,
        email: req.user?.email,
        given_name: req.user?.given_name,
        family_name: req.user?.family_name,
        realm_access: req.user?.realm_access,
      },
      message: 'This is protected data visible only to authenticated users',
      timestamp: new Date().toISOString(),
    });
  },
);

export default router;
