// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      isAuthenticated?: boolean;
      user?: any;
    }
  }
}

// Configuration for KeyCloak JWKS
export interface JwksConfig {
  jwksUri: string;
}

export class AuthMiddleware {
  private jwks: JwksClient;

  constructor(jwksUri: string) {
    this.jwks = jwksClient({
      jwksUri
    });
  }

  // Function to get the signing key
  private getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void => {
    this.jwks.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      
      if (!key) {
        return callback(new Error('Signing key not found'));
      }
      
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  };

  // Authentication middleware
  public authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.isAuthenticated = false;
      return next();
    }
    
    try {
      jwt.verify(token, this.getKey, { algorithms: ['RS256'] }, (err, decoded) => {
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
}