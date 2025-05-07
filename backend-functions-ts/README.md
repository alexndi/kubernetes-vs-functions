# Blog API - Azure Functions TypeScript Version with PostgreSQL

This project implements a simple blog API using Azure Functions with TypeScript and PostgreSQL storage. It's designed to complement the frontend React application.

## Features

- Get posts by category
- Get individual post details
- Get all available categories
- Health check endpoint
- PostgreSQL data storage
- TypeScript for type safety

## Prerequisites

- Node.js 16+
- Azure Functions Core Tools
- Azure CLI (for deployment)
- PostgreSQL database (local or hosted)

## Local Development

1. Install dependencies:
npm install

2. Set up your local PostgreSQL database:
docker run -d --name postgres -e POSTGRES_USER=bloguser -e POSTGRES_PASSWORD=password -e POSTGRES_DB=itblog -p 5432:5432 postgres:15-alpine

3. Run database migrations:
npm run migrate

4. Seed the database with sample data:
npm run seed

5. Start the local development server:
npm start
This will start the Azure Functions runtime at http://localhost:7071

6. Test the API endpoints:
- Get all categories: GET http://localhost:7071/api/categories
- Get posts by category: GET http://localhost:7071/api/posts/{category}
- Get post by ID: GET http://localhost:7071/api/post/{id}
- Health check: GET http://localhost:7071/api/health

## Project Structure

- `/config/database.ts` - PostgreSQL connection configuration
- `/db/migrations` - Database migrations
- `/db/seed.ts` - Sample data seeding
- `/models/blog.ts` - TypeScript interfaces
- `/shared/blog-repository.ts` - Data access layer
- `/shared/blog-service.ts` - Business logic layer
- `/health` - Health check endpoint
- `/getPosts` - Function for retrieving posts by category
- `/getPost` - Function for retrieving a single post by ID
- `/getCategories` - Function for retrieving all categories
- `/default` - Default route with API information

## Deployment to Azure

1. Create required Azure resources:
   - Azure Function App
   - Azure Database for PostgreSQL

2. Configure the connection string:
az functionapp config appsettings set --name <function-app-name> --resource-group <resource-group> --settings "POSTGRES_HOST=<postgres-hostname>" "POSTGRES_PORT=5432" "POSTGRES_DB=itblog" "POSTGRES_USER=<username>" "POSTGRES_PASSWORD=<password>" "FRONTEND_URL=<frontend-url>"

3. Deploy the function app:
func azure functionapp publish <function-app-name>

4. After deployment, run migrations on the production database:
az functionapp run --name <function-app-name> --resource-group <resource-group> --command "npm run migrate && npm run seed"

## Future Authentication with Azure AD

This API is designed to be extended with Azure AD authentication:

1. Add Azure AD configuration to the Function App
2. Create authentication middleware
3. Update functions to handle tokens and permissions
4. Configure CORS settings for the React frontend

## License

This project is licensed under the MIT License - see the LICENSE file for details.