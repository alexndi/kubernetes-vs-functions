import { AzureFunction, Context } from "@azure/functions";
import BlogService from '../shared/blog-service';

const blogService = new BlogService();

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {
  context.log('Get post by ID function processed a request.');
  
  try {
    const postId = context.bindingData.id as string;
    
    if (!postId) {
      context.res = {
        status: 400,
        body: { error: "Post ID parameter is required" }
      };
      return;
    }
    
    const post = await blogService.getPostById(postId);
    
    if ('error' in post) {
      context.res = {
        status: 404,
        body: post
      };
      return;
    }
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*"
      },
      body: post
    };
  } catch (error) {
    context.log.error('Error fetching post:', error);
    
    context.res = {
      status: 500,
      body: { error: 'An error occurred processing your request' }
    };
  }
};

export default httpTrigger;