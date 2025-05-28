# DevInsights Blog API - Kubernetes TypeScript Edition

A modern TypeScript-based blog API designed for containerized deployment on Kubernetes with Keycloak authentication, PostgreSQL storage, and comprehensive CI/CD integration.

## 🏗️ Architecture

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js REST API
- **Database**: PostgreSQL with automatic migrations
- **Authentication**: Keycloak integration with JWT validation
- **Deployment**: Kubernetes with Docker containers
- **Registry**: Azure Container Registry (ACR)
- **CI/CD**: GitHub Actions with smart change detection

## 📁 Project Structure

```
kubernetes/backend-kubernetes-ts/
├── src/
│   ├── app.ts                       # Main application entry point
│   ├── blog-service.ts              # Business logic layer
│   ├── repositories/
│   │   └── blog-repository.ts       # PostgreSQL data access layer
│   ├── models/
│   │   └── blog.ts                  # Type definitions and interfaces
│   ├── middleware/
│   │   └── auth.ts                  # Keycloak authentication middleware
│   ├── config/
│   │   ├── database.ts              # PostgreSQL connection config
│   │   └── keycloak.ts              # Keycloak configuration
│   └── db/
│       ├── migrations/              # Database schema migrations
│       │   ├── 001-initial-schema.ts
│       │   └── run.ts               # Migration runner
│       ├── seed.ts                  # Sample data seeding
│       └── reset-db.ts              # Database reset utility
├── aks-k8/                          # AKS deployment manifests
│   ├── blog-api-deployment.yaml     # Main API deployment
│   ├── frontend-deployment.yaml     # Frontend deployment
│   ├── keycloak-deployment.yaml     # Keycloak deployment
│   ├── devinsights-ingresses.yaml   # Ingress configurations
│   ├── migration-job.yaml           # Database migration job
│   └── letsencrypt-issuer.yaml      # SSL certificate issuer
├── k8s/                             # Local Kubernetes manifests
│   ├── deployment.yaml              # Local deployment config
│   ├── service.yaml                 # Service definitions
│   ├── postgres-deployment.yaml     # PostgreSQL deployment
│   └── keycloak-deployment.yml      # Local Keycloak config
├── Dockerfile                       # Container build instructions
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## 🚀 Local Development

### Prerequisites
- **Node.js 18+**
- **Docker & Docker Compose**
- **PostgreSQL client** (optional, for direct DB access)
- **kubectl** (for Kubernetes testing)

### Quick Start

1. **Install Dependencies**
   ```bash
   cd kubernetes/backend-kubernetes-ts
   npm install
   ```

2. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run -d --name postgres \
     -e POSTGRES_USER=bloguser \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=itblog \
     -p 5432:5432 \
     postgres:15-alpine
   
   # Or using the full stack
   docker-compose up postgres -d
   ```

3. **Configure Environment**
   ```bash
   # Create .env file
   cat > .env << EOF
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=itblog
   POSTGRES_USER=bloguser
   POSTGRES_PASSWORD=password
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=it-blog-realm
   KEYCLOAK_CLIENT_ID=it-blog-client
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   EOF
   ```

4. **Initialize Database**
   ```bash
   # Run migrations and seed data
   npm run migrate
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   # With auto-reload
   npm run dev
   
   # Or build and run
   npm run build
   npm start
   ```

6. **Verify Setup**
   ```bash
   # Test API endpoints
   curl http://localhost:3001/health
   curl http://localhost:3001/api/categories
   curl http://localhost:3001/api/posts/programming
   ```

### Database Management

```bash
# Reset database (drops all data)
npm run reset-db

# Run only migrations
npm run migrate

# Seed sample data
npm run seed

# Build TypeScript
npm run build
```

## 🐳 Docker Development

### Build and Run Container
```bash
# Build image
docker build -t devinsights-api:latest .

# Run with environment variables
docker run -p 3001:3001 \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_DB=itblog \
  -e POSTGRES_USER=bloguser \
  -e POSTGRES_PASSWORD=password \
  devinsights-api:latest
```

### Full Stack with Docker Compose
```bash
# Start everything (API + PostgreSQL)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down
```

## ☸️ Kubernetes Deployment

### Local Kubernetes (Minikube)

1. **Start Minikube**
   ```bash
   minikube start
   eval $(minikube docker-env)
   ```

2. **Build and Deploy**
   ```bash
   # Build image locally
   docker build -t devinsights-api:latest .
   
   # Deploy PostgreSQL
   kubectl apply -f k8s/postgres-deployment.yaml
   
   # Deploy API
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   
   # Get service URL
   minikube service it-blog-api-service --url
   ```

3. **Run Database Setup**
   ```bash
   # Find API pod
   kubectl get pods -l app=it-blog-api
   
   # Run migrations
   kubectl exec -it <pod-name> -- npm run migrate
   kubectl exec -it <pod-name> -- npm run seed
   ```

### Azure Kubernetes Service (AKS)

The application is deployed to AKS using GitHub Actions with the following production setup:

#### Infrastructure
- **AKS Cluster**: `blog-aks-cluster` in `rg-blog-aks`
- **Container Registry**: `blogacrcw3c.azurecr.io`
- **Database**: Azure Database for PostgreSQL Flexible Server
- **Domain**: `devinsights.site` with SSL certificates
- **Authentication**: Keycloak with PostgreSQL backend

#### Deployment Process
1. **Automatic CI/CD**: GitHub Actions detects changes and builds/deploys
2. **Smart Deployment**: Only rebuilds changed components (frontend/backend)
3. **Container Registry**: Images pushed to Azure Container Registry
4. **Zero-Downtime**: Rolling updates with Kubernetes deployments

#### Production URLs
- **Frontend**: https://devinsights.site
- **API**: https://devinsights.site/api
- **Keycloak**: https://devinsights.site/auth
- **Health Check**: https://devinsights.site/api/health

#### Manual Deployment
```bash
# Get AKS credentials
az aks get-credentials --resource-group rg-blog-aks --name blog-aks-cluster

# Deploy or update
kubectl apply -f aks-k8/blog-api-deployment.yaml
kubectl apply -f aks-k8/frontend-deployment.yaml
kubectl apply -f aks-k8/keycloak-deployment.yaml
kubectl apply -f aks-k8/devinsights-ingresses.yaml

# Run migrations
kubectl apply -f aks-k8/migration-job.yaml
kubectl wait --for=condition=complete job/blog-api-migrate --timeout=300s
kubectl delete job blog-api-migrate

# Monitor deployment
kubectl get pods -l app=blog-api
kubectl rollout status deployment/blog-api
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /health` - Health check with database connectivity
- `GET /api/categories` - List all blog categories
- `GET /api/posts/{category}` - Get posts by category
- `GET /api/post/{id}` - Get individual post details
- `GET /api/auth/config` - Keycloak configuration for frontend

### Protected Endpoints (Require Authentication)
- `GET /api/user/profile` - User profile information
- `GET /api/admin/users` - Admin-only user management

### Authentication
The API supports optional authentication via Keycloak JWT tokens:
- **Anonymous Access**: Basic read access to blog content
- **Authenticated Access**: Enhanced features and user-specific content
- **Admin Access**: Full administrative capabilities

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start with auto-reload
npm run build           # Build TypeScript
npm start              # Run production build

# Database
npm run migrate        # Run database migrations
npm run seed          # Seed sample data
npm run reset-db      # Reset entire database

# Docker
npm run docker-build  # Build Docker image
docker-compose up     # Start full stack

# Kubernetes
kubectl apply -f k8s/ # Deploy to local cluster
```

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Basic health
curl https://devinsights.site/api/health

# Database connectivity
curl https://devinsights.site/api/categories

# Authentication test (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://devinsights.site/api/user/profile
```

### Kubernetes Debugging
```bash
# Check pod status
kubectl get pods -l app=blog-api

# View logs
kubectl logs -l app=blog-api -f

# Exec into pod
kubectl exec -it <pod-name> -- /bin/sh

# Check service endpoints
kubectl get endpoints

# Test internal connectivity
kubectl run debug --image=curlimages/curl:latest --rm -i --restart=Never -- \
  curl -f http://blog-api-internal:3001/health
```

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running and accessible
   - Verify connection string and credentials
   - Ensure database exists and migrations have run

2. **Keycloak Authentication Issues**
   - Verify Keycloak is accessible at configured URL
   - Check realm and client configuration
   - Validate JWT token format and expiration

3. **Kubernetes Deployment Issues** 
   - Check image pull secrets for ACR
   - Verify resource quotas and limits
   - Ensure persistent volumes are available for PostgreSQL

## 🚀 GitHub Actions CI/CD

The repository includes automated deployment via GitHub Actions:

### Workflow Features
- **Smart Change Detection**: Only builds/deploys changed components
- **Multi-environment Support**: Production and staging configurations
- **Container Registry Integration**: Automatic image building and pushing
- **Zero-downtime Deployment**: Rolling updates with health checks
- **Manual Triggers**: On-demand deployments via GitHub interface

### Triggering Deployments
1. Navigate to repository **Actions** tab
2. Select **"Build and Deploy to AKS"** workflow
3. Click **"Run workflow"**
4. Monitor progress and logs

## 📊 Performance & Scaling

### Resource Requirements
- **CPU**: 250m request, 500m limit
- **Memory**: 256Mi request, 512Mi limit
- **Storage**: Persistent volumes for PostgreSQL

### Scaling
```bash
# Scale API pods
kubectl scale deployment blog-api --replicas=3

# Auto-scaling (HPA)
kubectl autoscale deployment blog-api --cpu-percent=70 --min=1 --max=5
```

## 🔐 Security

- **JWT Authentication**: Keycloak integration with RS256 signing
- **HTTPS Only**: TLS/SSL termination at ingress level
- **Network Policies**: Pod-to-pod communication restrictions
- **Resource Limits**: Container resource constraints
- **Secret Management**: Kubernetes secrets for sensitive data

## 📝 Contributing

1. **Development Setup**: Follow local development instructions
2. **Code Changes**: Make changes in appropriate directories
3. **Testing**: Verify locally before pushing
4. **Deployment**: GitHub Actions will handle deployment automatically

## 📄 License

MIT License - see LICENSE file for details.