# GitHub Secrets & Environment Variables Setup Guide

This guide covers all the secrets and environment variables needed for your GitHub Actions pipeline to deploy to Azure Kubernetes Service (AKS).

## 🔐 Required GitHub Secrets

You need to create **ONE** GitHub secret that contains all Azure authentication information.

### 1. AZURE_CREDENTIALS (Required)

This is the **ONLY** secret you need to add to GitHub. It contains all Azure authentication information in JSON format.

## 🛠️ Step-by-Step Setup

### Step 1: Create Azure Service Principal

Run this command in Azure CLI to create a service principal with the necessary permissions:

```bash
# Create service principal with contributor access to your subscription
az ad sp create-for-rbac \
  --name "github-actions-devinsights" \
  --role contributor \
  --scopes /subscriptions/74be1b16-c7f6-4ebd-88d0-c1754bef3200 \
  --sdk-auth
```

**Expected Output:**
```json
{
  "clientId": "12345678-1234-1234-1234-123456789012",
  "clientSecret": "your-client-secret-here",
  "subscriptionId": "74be1b16-c7f6-4ebd-88d0-c1754bef3200",
  "tenantId": "87654321-4321-4321-4321-210987654321",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

⚠️ **IMPORTANT**: Copy this **ENTIRE JSON OUTPUT** - you'll need it for GitHub secrets!

### Step 2: Grant ACR Permissions

The service principal needs permission to push/pull images from Azure Container Registry:

```bash
# Get your service principal client ID from the JSON above
CLIENT_ID="12345678-1234-1234-1234-123456789012"

# Grant AcrPush role (allows push and pull)
az role assignment create \
  --assignee $CLIENT_ID \
  --role AcrPush \
  --scope /subscriptions/74be1b16-c7f6-4ebd-88d0-c1754bef3200/resourceGroups/rg-blog-aks/providers/Microsoft.ContainerRegistry/registries/blogacrcw3c
```

### Step 3: Grant AKS Permissions

The service principal also needs permissions to manage your AKS cluster:

```bash
# Grant Azure Kubernetes Service Cluster Admin Role
az role assignment create \
  --assignee $CLIENT_ID \
  --role "Azure Kubernetes Service Cluster Admin Role" \
  --scope /subscriptions/74be1b16-c7f6-4ebd-88d0-c1754bef3200/resourceGroups/rg-blog-aks/providers/Microsoft.ContainerService/managedClusters/blog-aks-cluster
```

### Step 4: Add Secret to GitHub

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Click**: "New repository secret"
4. **Add the secret**:
   - **Name**: `AZURE_CREDENTIALS`
   - **Value**: The **COMPLETE JSON** from Step 1 (including all the URLs)

## ✅ Verification Commands

Test your service principal has the correct permissions:

### Test Azure Login
```bash
# Test login with service principal
az login --service-principal \
  --username "your-client-id" \
  --password "your-client-secret" \
  --tenant "your-tenant-id"
```

### Test ACR Access
```bash
# Test ACR login
az acr login --name blogacrcw3c

# Test ACR permissions
az acr repository list --name blogacrcw3c
```

### Test AKS Access
```bash
# Test AKS access
az aks get-credentials --resource-group rg-blog-aks --name blog-aks-cluster

# Test kubectl access
kubectl get nodes
```

## 🔧 Environment Variables in Workflow

The workflow file already contains these environment variables - **NO CHANGES NEEDED**:

```yaml
env:
  ACR_NAME: blogacrcw3c
  RESOURCE_GROUP: rg-blog-aks
  CLUSTER_NAME: blog-aks-cluster
  
  # Application URLs
  BACKEND_URL: https://devinsights.site/api
  KEYCLOAK_URL: https://devinsights.site/auth
  KEYCLOAK_REALM: it-blog-realm
  KEYCLOAK_CLIENT_ID: it-blog-client
```

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication failed" 
**Solution**: Verify the JSON in `AZURE_CREDENTIALS` is complete and properly formatted.

### Issue 2: "Access denied to ACR"
**Solution**: Run the ACR permissions command from Step 2.

### Issue 3: "Cannot access AKS cluster" 
**Solution**: Run the AKS permissions command from Step 3.

### Issue 4: "Service principal not found"
**Solution**: Make sure you copied the `clientId` correctly when assigning roles.

## 🔍 Debug Commands

If the pipeline fails, use these commands locally to test:

```bash
# Check service principal exists
az ad sp show --id "your-client-id"

# Check role assignments
az role assignment list --assignee "your-client-id" --output table

# Check ACR permissions specifically
az role assignment list \
  --scope /subscriptions/74be1b16-c7f6-4ebd-88d0-c1754bef3200/resourceGroups/rg-blog-aks/providers/Microsoft.ContainerRegistry/registries/blogacrcw3c \
  --output table

# Check AKS permissions specifically  
az role assignment list \
  --scope /subscriptions/74be1b16-c7f6-4ebd-88d0-c1754bef3200/resourceGroups/rg-blog-aks/providers/Microsoft.ContainerService/managedClusters/blog-aks-cluster \
  --output table
```
