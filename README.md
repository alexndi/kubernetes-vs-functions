# Implementation Plan

## Kubernetes Version

1. **Setup**
   - Create project structure
   - Initialize npm package
   - Install dependencies (Express)

2. **Implementation**
   - Create shared weather service
   - Create Express app with API endpoints
   - Create Dockerfile
   - Create Kubernetes manifests

3. **Local Development**
   - Test Express app locally
   - Build Docker container
   - Test container locally
   - Deploy to minikube

## Azure Functions Version

1. **Setup**
   - Install Azure Functions Core Tools
   - Create a new function app
   - Set up project structure

2. **Implementation**
   - Share the same weather service module
   - Implement HTTP trigger function
   - Configure function bindings

3. **Local Development**
   - Run function app locally
   - Test HTTP endpoints

## Testing Both Versions

1. Create simple test script to compare:
   - Response times
   - Resource usage
   - Scalability
   - Cold start performance

2. Document findings and analysis





Setup with new account:
have a profile with a valid debit card
az login
copy/paste the new subscrption in tf conf
Microsoft.Storage, Microsoft.Web, Microsoft.ContainerRegistry, Microsoft.OperationalInsights, Microsoft.DBforPostgreSQL, microsoft.insights - register as resource provider
tf apply tfstate boostrap
tf apply in functions tf dir
get publish profile for func-api - update github secret
Create Azure Service Principal:
   # First, get your subscription ID
   az account show --query id --output tsv

   # Then create the service principal (replace YOUR_SUBSCRIPTION_ID with the actual value)
   az ad sp create-for-rbac \
   --name "github-actions-devinsights" \
   --role contributor \
   --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
   --sdk-auth  