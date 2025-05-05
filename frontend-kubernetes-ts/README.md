# DevInsights Blog Frontend - TypeScript Kubernetes Version

This project is a React-based TypeScript frontend for the DevInsights blog application that connects to a Kubernetes-deployed backend API.

## Features

- Browse blog posts by category
- Read individual blog posts
- Responsive design for desktop and mobile
- Keycloak authentication integration
- User profile management
- Fully typed with TypeScript

## Getting Started

### Prerequisites

- Node.js 14+ installed
- The Kubernetes backend running (on port 3001 by default)
- Keycloak server running (for authentication)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

The app will open in your default browser at [http://localhost:3000](http://localhost:3000).

### Configuration

If your Kubernetes backend or Keycloak server run on different ports or URLs, update the following constants:
- `BACKEND_URL` in `src/App.tsx` 
- Keycloak configuration in `src/services/keycloak.ts`

## Project Structure

- `src/App.tsx` - Main application component
- `src/App.css` - Application styles
- `src/index.tsx` - React entry point
- `src/services/` - Service modules for authentication and API calls
- `src/models/` - TypeScript interfaces and types
- `public/` - Static assets

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Authentication

This frontend uses Keycloak for authentication. The integration is handled in `src/services/keycloak.ts`.

Key authentication features:
- Login/logout functionality
- Token management
- User profile access
- Role-based authorization

## Deployment

To deploy this frontend with your Kubernetes cluster:

1. Build the Docker image:
   ```
   docker build -t blog-frontend:latest .
   ```

2. Deploy to Kubernetes:
   ```
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

3. Access the deployed application:
   ```
   minikube service blog-frontend-service
   ```