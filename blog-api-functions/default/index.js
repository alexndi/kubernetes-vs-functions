// default/index.js
const { AzureFunction, Context, HttpRequest } = require("@azure/functions");

const httpTrigger = async function (context, req) {
  context.log('Default route function processed a request.');
  
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: { 
      message: 'IT Blog API - Azure Functions Version', 
      endpoints: {
        getAllCategories: '/api/categories',
        getPostsByCategory: '/api/posts/{category}',
        getPostById: '/api/post/{id}',
        health: '/api/health'
      }
    }
  };
};

module.exports = httpTrigger;