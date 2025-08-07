// functions/backend-functions-ts/getUserProfile/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import jwt from 'jsonwebtoken';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Get user profile function processed a request.');
  
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      context.res = {
        status: 401,
        body: { error: 'Authentication required' }
      };
      return;
    }
    
    // Decode token without verification (for simplicity - in production, verify with Azure B2C JWKS)
    const decoded = jwt.decode(token) as any;
    
    if (!decoded) {
      context.res = {
        status: 401,
        body: { error: 'Invalid token' }
      };
      return;
    }
    
    // Return user profile information
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*"
      },
      body: {
        user: {
          sub: decoded.sub || decoded.oid,
          name: decoded.name,
          email: decoded.emails ? decoded.emails[0] : decoded.preferred_username,
          given_name: decoded.given_name,
          family_name: decoded.family_name
        },
        message: 'This is protected data visible only to authenticated users',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    context.log.error('Error getting user profile:', error);
    
    context.res = {
      status: 500,
      body: { error: 'An error occurred processing your request' }
    };
  }
};

export default httpTrigger;