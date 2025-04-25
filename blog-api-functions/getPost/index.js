const { AzureFunction, Context, HttpRequest } = require("@azure/functions");
const BlogService = require('../shared/blog-service');

const blogService = new BlogService();

const httpTrigger = async function (context, req) {
  context.log('Get post by ID function processed a request.');
  
  try {
    const postId = context.bindingData.id;
    
    if (!postId) {
      context.res = {
        status: 400,
        body: { error: "Post ID parameter is required" }
      };
      return;
    }
    
    const post = await blogService.getPostById(postId);
    
    if (post.error) {
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

module.exports = httpTrigger;
