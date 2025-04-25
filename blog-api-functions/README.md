# Blog API - Azure Functions Version

This project implements a simple blog API using Azure Functions. It's designed to complement the frontend React application.

## Features

- Get posts by category
- Get individual post details
- Get all available categories
- Health check endpoint

## Prerequisites

- Node.js 14+
- Azure Functions Core Tools
- Azure CLI (for deployment)
- Local emulator for Azure Storage (Azurite)

## Local Development

1. Install dependencies:
npm install

2. Start the local development server:
npm start
This will start the Azure Functions runtime at http://localhost:7071

3. Test the API endpoints:
- Get all categories: GET http://localhost:7071/api/categories
- Get posts by category: GET http://localhost:7071/api/posts/{category}
- Get post by ID: GET http://localhost:7071/api/post/{id}
- Health check: GET http://localhost:7071/api/health

## Project Structure

- `/shared/blog-service.js` - Shared service for blog data
- `/getPosts` - Function for retrieving posts by category
- `/getPost` - Function for retrieving a single post by ID
- `/getCategories` - Function for retrieving all categories
- `/health` - Health check endpoint
- `/default` - Default route with API information

## Deployment
func azure functionapp publish <your-function-app-name>

## Future Authentication with Azure AD

This API is designed to be extended with Azure AD authentication:

1. Update the Azure Functions app with Azure AD authentication settings
2. Add authentication verification to protected endpoints
3. Configure CORS settings for the React frontend
4. Set up appropriate app roles and permissions

The current implementation includes comments where authentication logic would be added in the future.