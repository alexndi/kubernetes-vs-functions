# Weather API - Kubernetes vs Azure Functions

This project demonstrates implementing the same API functionality in both Kubernetes and Azure Functions for comparison.

## Common Core Features
- Simple Weather API service
- Endpoints to retrieve weather data for cities
- Shared business logic

## Kubernetes Version

### Prerequisites
- Docker
- Kubernetes cluster (or Minikube for local development)
- kubectl CLI

### Local Development

1. Navigate to the Kubernetes version directory:
   ```
   cd weather-api-kubernetes
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run locally (without Docker):
   ```
   npm run dev
   ```
   This will start the Express server at http://localhost:3000

4. Build Docker image:
   ```
   docker build -t weather-api:latest .
   ```

5. Run container locally:
   ```
   docker run -p 3000:3000 weather-api:latest
   ```

6. Deploy to Kubernetes (Minikube):
   ```
   minikube start
   kubectl apply -f k8s/deployment.yaml
   minikube service weather-api-service
   ```



minikube service weather-api-service --url
http://192.168.49.2:32751
