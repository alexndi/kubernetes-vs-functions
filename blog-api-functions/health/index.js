const { AzureFunction, Context, HttpRequest } = require("@azure/functions");

const httpTrigger = async function (context, req) {
  context.log('Health check function processed a request.');
  
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: { status: 'ok' }
  };
};

module.exports = httpTrigger;
