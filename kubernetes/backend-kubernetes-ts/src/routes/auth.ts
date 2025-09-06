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

// This endpoint moved to user routes - keeping for backward compatibility
router.get(
  '/user/profile', 
  authMiddleware.authenticateToken,
  authMiddleware.requireAuth,
  (req: Request, res: Response) => {
    res.redirect(301, '/api/user/profile');
  }
);

export default router;
