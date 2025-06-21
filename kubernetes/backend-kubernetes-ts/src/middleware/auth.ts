// src/middleware/auth.ts - Fixed for Docker localhost issues
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';

// Define Keycloak token payload interface
interface KeycloakTokenPayload extends JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  preferred_username?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      isAuthenticated?: boolean;
      user?: KeycloakTokenPayload;
    }
  }
}

// Configuration for KeyCloak JWKS
export interface JwksConfig {
  jwksUri: string;
}

export class AuthMiddleware {
  private jwks: JwksClient;
  private jwksUri: string;

  constructor(jwksUri: string) {
    this.jwksUri = jwksUri;
    console.log('Initializing AuthMiddleware with JWKS URI:', jwksUri);
    
    this.jwks = jwksClient({
      jwksUri,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10 // Increased from 5
    });
  }

  // Function to get the signing key
  private getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void => {
    console.log('Getting signing key for kid:', header.kid);
    
    this.jwks.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error('Error getting signing key:', err);
        return callback(err);
      }
      
      if (!key) {
        const error = new Error('Signing key not found');
        console.error('Signing key not found for kid:', header.kid);
        return callback(error);
      }
      
      console.log('Successfully retrieved signing key');
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  };

  // Helper function to normalize issuer URLs for comparison
  private normalizeIssuer(issuer: string): string {
    // Convert docker internal URLs to localhost for comparison
    return issuer
      .replace('http://keycloak:8080', 'http://localhost:8080')
      .replace('http://host.docker.internal:8080', 'http://localhost:8080');
  }

  // Authentication middleware with enhanced debugging and proper types
  public authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log(`\n=== Authentication Debug for ${req.method} ${req.path} ===`);
    console.log('Auth header present:', !!authHeader);
    console.log('Token present:', !!token);
    
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
    }
    
    // Set default values
    req.isAuthenticated = false;
    req.user = undefined;
    
    if (!token) {
      console.log('No token provided, proceeding as anonymous user');
      return next();
    }
    
    try {
      // First, decode the token without verification to check its structure
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded || typeof decoded === 'string') {
        console.error('Invalid token structure');
        return next();
      }

      // Type assertion for payload
      const payload = decoded.payload as KeycloakTokenPayload;
      
      console.log('Token header:', decoded.header);
      console.log('Token issuer:', payload.iss);
      console.log('Token subject:', payload.sub);
      console.log('Token audience:', payload.aud);
      
      if (payload.exp) {
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date());
        
        // Check if token is expired
        if (payload.exp < Date.now() / 1000) {
          console.error('Token is expired');
          req.isAuthenticated = false;
          req.user = undefined;
          return next();
        }
      }
      
      // FIXED: Build expected issuer and normalize both for comparison
      const expectedIssuer = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;
      const normalizedExpected = this.normalizeIssuer(expectedIssuer);
      const normalizedActual = this.normalizeIssuer(payload.iss || '');
      
      console.log('Expected issuer:', expectedIssuer);
      console.log('Normalized expected:', normalizedExpected);
      console.log('Normalized actual:', normalizedActual);
      
      // Verify the token with the public key
      jwt.verify(token, this.getKey, { 
        algorithms: ['RS256'],
        // FIXED: Accept both container and localhost issuers
        issuer: [
          expectedIssuer, 
          normalizedExpected, 
          'http://localhost:8080/realms/it-blog-realm',
          'http://keycloak:8080/realms/it-blog-realm'
        ],
      }, (err, decodedToken) => {
        if (err) {
          console.error('Token verification error:', err.message);
          console.error('Error details:', err);
          // Don't throw error, just proceed as unauthenticated
          req.isAuthenticated = false;
          req.user = undefined;
        } else {
          console.log('✅ Token verified successfully');
          
          // Type assertion for verified token
          const verifiedPayload = decodedToken as KeycloakTokenPayload;
          
          console.log('User info:', {
            sub: verifiedPayload.sub,
            preferred_username: verifiedPayload.preferred_username,
            email: verifiedPayload.email,
            roles: verifiedPayload.realm_access?.roles
          });
          
          req.user = verifiedPayload;
          req.isAuthenticated = true;
        }
        
        console.log('Final auth state:', {
          isAuthenticated: req.isAuthenticated,
          hasUser: !!req.user,
          username: req.user?.preferred_username
        });
        console.log('=== End Authentication Debug ===\n');
        
        next();
      });
    } catch (error) {
      console.error('Authentication error:', error);
      req.isAuthenticated = false;
      req.user = undefined;
      next();
    }
  };

  // Middleware to require authentication
  public requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    console.log(`RequireAuth check - isAuthenticated: ${req.isAuthenticated}`);
    
    if (!req.isAuthenticated) {
      console.log('❌ Authentication required but user not authenticated');
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
        debug: {
          hasAuthHeader: !!req.headers['authorization'],
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    console.log('✅ Authentication check passed');
    next();
  };

  // Middleware to check for specific roles
  public requireRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.isAuthenticated || !req.user) {
        res.status(401).json({ 
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
        return;
      }

      const userRoles = req.user.realm_access?.roles || [];
      if (!userRoles.includes(requiredRole)) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `You need the '${requiredRole}' role to access this resource`,
          yourRoles: userRoles,
          requiredRole: requiredRole
        });
        return;
      }

      next();
    };
  };
}