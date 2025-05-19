# IT Blog API - Kubernetes TypeScript Version with PostgreSQL

This project is a TypeScript implementation of the IT Blog API designed to be deployed on Kubernetes with Keycloak authentication and PostgreSQL for persistent storage.

## Features

- TypeScript implementation with full type safety
- Express.js REST API
- PostgreSQL database for persistent storage
- Automatic database migrations and seeding
- Keycloak integration for authentication
- Kubernetes deployment support

## Project Structure

```
blog-api-kubernetes-ts/
├── src/
│   ├── app.ts                       # Main application entry point
│   ├── blog-service.ts              # Service layer
│   ├── repositories/
│   │   └── blog-repository.ts       # Data access layer for PostgreSQL
│   ├── models/
│   │   └── blog.ts                  # Type definitions for blog data
│   ├── middleware/
│   │   └── auth.ts                  # Authentication middleware
│   ├── config/
│   │   ├── database.ts              # PostgreSQL configuration
│   │   └── keycloak.ts              # Keycloak configuration
│   └── db/
│       ├── migrations/              # Database migrations
│       │   ├── 001-initial-schema.ts
│       │   └── run.ts               # Migration runner
│       └── seed.ts                  # Database seeding script
├── k8s/
│   ├── deployment.yaml              # API deployment config
│   ├── service.yaml                 # API service config
│   ├── postgres-deployment.yaml     # PostgreSQL deployment
│   └── keycloak-deployment.yml      # Keycloak deployment config
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Project dependencies
└── Dockerfile                       # Docker build configuration
```

## Prerequisites

- Node.js 18+
- Docker
- Kubernetes cluster (or Minikube for local development)
- kubectl CLI
- PostgreSQL client (optional, for direct database access)

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables (create a .env file):
   ```
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=itblog
   POSTGRES_USER=bloguser
   POSTGRES_PASSWORD=password
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=it-blog-realm
   KEYCLOAK_CLIENT_ID=it-blog-client
   FRONTEND_URL=http://localhost:3000
   ```

3. Start PostgreSQL using Docker (if not already running):
   ```
   docker run -d --name postgres -e POSTGRES_USER=bloguser -e POSTGRES_PASSWORD=password -e POSTGRES_DB=itblog -p 5432:5432 postgres:15-alpine
   ```

4. Run database migrations:
   ```
   npm run migrate
   ```

5. Seed the database with sample data:
   ```
   npm run seed
   ```

6. Run in development mode (with auto-reload):
   ```
   npm run dev
   ```

## Docker Build

```
docker build -t it-blog-api-ts:latest .
```

Run the container:
```
docker run -p 3001:3001 --env-file .env it-blog-api-ts:latest
```

## Kubernetes Deployment

1. First, deploy PostgreSQL:
   ```
   kubectl apply -f k8s/postgres-deployment.yaml
   ```

2. Deploy Keycloak (if not already running):
   ```
   kubectl apply -f k8s/keycloak-deployment.yml
   ```

3. Apply the API deployment:
   ```
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

4. Get the service URL:
   ```
   minikube service it-blog-api-service --url
   ```

## API Endpoints

- `GET /health` - Health check endpoint (includes database connection check)
- `GET /api/categories` - Get all blog categories
- `GET /api/posts/{category}` - Get posts by category
- `GET /api/post/{id}` - Get a single post by ID
- `GET /api/user/profile` - Protected endpoint for user profile (requires authentication)
- `GET /api/auth/config` - Get Keycloak configuration for frontend

## Database Schema

The application uses the following PostgreSQL schema:

- **categories**: Blog post categories
- **tags**: Tags for categorizing blog posts
- **posts**: Blog post content
- **post_tags**: Many-to-many relationship between posts and tags
- **comments**: User comments on blog posts (for authenticated users)

The schema is created automatically through migrations when the application starts.

## Authentication

The API uses Keycloak for authentication. The frontend can obtain the Keycloak configuration from the `/api/auth/config` endpoint.

## Example Requests

Get all categories:
```
curl http://localhost:3001/api/categories
```

Get posts in the "programming" category:
```
curl http://localhost:3001/api/posts/programming
```

Get a specific post:
```
curl http://localhost:3001/api/post/understanding-typescript-generics
```






AKS:
cd aks-k8/
kubectl apply -f blog-api-deployment.yaml 
kubectl get se