import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import BlogService from '../shared/blog-service';

const blogService = new BlogService();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('Get all categories function processed a request.');
  
  try {
    const categories = await blogService.getAllCategories();
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*"
      },
      body: { categories }
    };
  } catch (error) {
    context.log.error('Error fetching categories:', error);
    
    context.res = {
      status: 500,
      body: { error: 'An error occurred processing your request' }
    };
  }
};

export default httpTrigger;