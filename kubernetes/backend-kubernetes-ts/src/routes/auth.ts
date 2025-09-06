// Authentication-related routes
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';
import { getKeycloakConfig, getKeycloakJwksUri } from '../config/keycloak';
import { AuthConfig } from '../models/blog';

const router = Router();
const authMiddleware = new AuthMiddleware(getKeycloakJwksUri());

// Auth config endpoint - provides info needed for frontend to connect to Keycloak
router.get('/config', (_req: Request, res: Response) => {
  const KEYCLOAK_CONFIG = getKeycloakConfig();
  const config: AuthConfig = {
    realm: KEYCLOAK_CONFIG.realm,
    url: KEYCLOAK_CONFIG.url,
    clientId: KEYCLOAK_CONFIG.clientId,
  };

  res.json(config);
});

// Protected endpoint - only accessible for authenticated users
router.get(
  '/user/profile',
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
