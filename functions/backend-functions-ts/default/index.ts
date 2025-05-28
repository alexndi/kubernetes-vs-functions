import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ApiResponseMessage } from '../models/blog';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Default route function processed a request.');
  
  const responseData: ApiResponseMessage = { 
    message: 'IT Blog API - Azure Functions TypeScript Version with PostgreSQL', 
    endpoints: {
      getAllCategories: '/api/categories',
      getPostsByCategory: '/api/posts/{category}',
      getPostById: '/api/post/{id}',
      health: '/api/health'
    }
  };
  
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: responseData
  };
};

export default httpTrigger;