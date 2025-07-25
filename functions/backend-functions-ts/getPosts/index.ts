import { AzureFunction, Context } from "@azure/functions";
import BlogService from '../shared/blog-service';

const blogService = new BlogService();

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {
  context.log('Get posts by category function processed a request.');
  
  try {
    const category = context.bindingData.category as string;
    
    if (!category) {
      context.res = {
        status: 400,
        body: { error: "Category parameter is required" }
      };
      return;
    }
    
    const posts = await blogService.getPostsByCategory(category);
    
    // For future AAD integration - we'd check authentication here
    // and add personalized data if the user is authenticated
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*"
      },
      body: posts
    };
  } catch (error) {
    context.log.error('Error fetching posts:', error);
    
    context.res = {
      status: 500,
      body: { error: 'An error occurred processing your request' }
    };
  }
};

export default httpTrigger;