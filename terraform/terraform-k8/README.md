# NBU DevInsights Blog - Kubernetes Infrastructure

This Terraform configuration provisions a complete Azure Kubernetes Service (AKS) infrastructure for the NBU DevInsights Blog platform using consistent naming conventions and NBU branding.

## 🏗️ Architecture Overview

The infrastructure includes:
- **Azure Kubernetes Service (AKS)** - Managed Kubernetes cluster with Azure CNI
- **Private PostgreSQL** - Flexible server with VNet integration
- **Container Registry** - Azure Container Registry for Docker images
- **Virtual Network** - Custom VNet with multiple subnets
- **Monitoring** - Azure Monitor Container Insights and alerts
- **Security** - Private networking, Azure AD integration, RBAC

## 📁 Project Structure

```
terraform/terraform-k8/
├── main.tf              # Main infrastructure resources
├── variables.tf         # Variable definitions
├── terraform.tfvars     # Variable values (NBU configuration)
├── outputs.tf           # Output values and connection info
├── backend.tf           # Remote state configuration
├── versions.tf          # Provider version constraints
├── .gitignore          # Git ignore patterns
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- **Azure CLI** installed and configured
- **Terraform** >= 1.0 installed
- **kubectl** installed for cluster management
- **Azure subscription** with appropriate permissions

### Step 1: Initialize Terraform State Storage

First, ensure the state storage is created:

```bash
# Navigate to the state bootstrap directory
cd ../state-bootstrap

# Initialize and apply state storage
terraform init
terraform apply

# Confirm the storage account and container are created
```

### Step 2: Deploy Infrastructure

```bash
# Navigate to the k8s terraform directory
cd ../terraform-k8

# Initialize Terraform with remote backend
terraform init

# Validate configuration
terraform validate

# Review the deployment plan
terraform plan

# Apply the configuration
terraform apply
```

### Step 3: Configure kubectl

```bash
# Get AKS credentials
az aks get-credentials --resource-group rg-nbu-blog-k8s --name aks-nbu-blog

# Verify cluster access
kubectl get nodes

# Check cluster info
kubectl cluster-info
```

### Step 4: Deploy Applications

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to get external IP
kubectl get svc -n ingress-nginx --watch

# Deploy your applications
kubectl apply -f ../../kubernetes/backend-kubernetes-ts/aks-k8/

# Check deployment status
kubectl get pods,svc,ingress
```

## 🏷️ Resource Naming Convention

All resources follow the consistent NBU naming pattern:

### Pattern: `{resource-type}-{project}-{workload}-{component}`

| Resource Type | Example Name | Purpose |
|---------------|--------------|---------|
| Resource Group | `rg-nbu-blog-k8s` | Main resource group |
| AKS Cluster | `aks-nbu-blog` | Kubernetes cluster |
| Container Registry | `acrnbuk8s` | Docker image registry |
| Virtual Network | `vnet-nbu-blog-k8s` | Network infrastructure |
| PostgreSQL Server | `psql-nbu-blog-k8s` | Database server |
| Log Analytics | `law-nbu-blog-k8s` | Monitoring workspace |

### Benefits of This Naming
- ✅ **Consistent** - All resources follow the same pattern
- ✅ **Predictable** - Easy to find resources
- ✅ **No Random Strings** - Stable names across deployments
- ✅ **NBU Branded** - Clear ownership and purpose
- ✅ **Environment Aware** - Clear separation of environments

## 🔧 Configuration

### Variables (terraform.tfvars)

```hcl
# Azure Configuration
subscription_id = "74be1b16-c7f6-4ebd-88d0-c1754bef3200"
location        = "North Europe"

# Custom Domain Configuration
custom_domain = "devinsights.site"

# AKS Configuration
node_count = 2
vm_size    = "Standard_B2s"

# PostgreSQL Configuration
postgres_admin_username = "nbuadmin"
postgres_admin_password = "NbuSecurePassword123!"
postgres_database_name  = "nbu_devinsights_blog"

# Monitoring Configuration
alert_email_address = "admin@nbu-devinsights.site"

# Additional Tags
additional_tags = {
  Owner       = "NBU Team"
  Purpose     = "DevInsights Blog Platform"
  Contact     = "admin@nbu-devinsights.site"
  University  = "New Bulgarian University"
  Department  = "Computer Science"
}
```

### Key Features

#### Networking
- **Custom VNet** with dedicated subnets for AKS nodes, pods, and PostgreSQL
- **Azure CNI** for advanced networking capabilities
- **Private PostgreSQL** with VNet integration and private DNS
- **Network Security** with subnet delegation and security groups

#### Security
- **Azure AD Integration** for cluster authentication
- **RBAC Enabled** for fine-grained access control
- **Private Database** accessible only from within VNet
- **Managed Identity** for secure service-to-service communication

#### Monitoring
- **Container Insights** for comprehensive cluster monitoring
- **Log Analytics** for centralized log collection
- **Alerts** for cluster health and node status
- **Application Insights** for application performance monitoring

#### Scalability
- **Auto-scaling Ready** - Configuration supports cluster autoscaler
- **Node Pool Architecture** - Ready for additional node pools
- **Load Balancer** - Standard load balancer for production workloads

## 📊 Resource Details

### AKS Cluster Configuration
```hcl
resource "azurerm_kubernetes_cluster" "main" {
  name                = "aks-nbu-blog"
  dns_prefix          = "nbu-blog-k8s"
  node_resource_group = "rg-nbu-blog-k8s-nodes"
  
  default_node_pool {
    name           = "default"
    node_count     = 2
    vm_size        = "Standard_B2s"
    vnet_subnet_id = azurerm_subnet.aks_nodes.id
    pod_subnet_id  = azurerm_subnet.pods.id
  }
  
  network_profile {
    network_plugin = "azure"
    service_cidr   = "10.0.100.0/24"
    dns_service_ip = "10.0.100.10"
  }
}
```

### PostgreSQL Configuration
```hcl
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-nbu-blog-k8s"
  version                = "15"
  delegated_subnet_id    = azurerm_subnet.postgres.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres.id
  storage_mb             = 32768  # 32GB
  sku_name               = "B_Standard_B1ms"
  public_network_access_enabled = false  # Private only
}
```

## 🌐 DNS Configuration

After deployment, configure these DNS records at your domain provider:

### Option 1: Individual A Records
```
devinsights.site        A    <INGRESS_EXTERNAL_IP>
api.devinsights.site    A    <INGRESS_EXTERNAL_IP>
```

### Option 2: Wildcard Record (Recommended)
```
*.devinsights.site      A    <INGRESS_EXTERNAL_IP>
devinsights.site        A    <INGRESS_EXTERNAL_IP>
```

### Get Ingress External IP
```bash
# Wait for external IP assignment
kubectl get svc -n ingress-nginx ingress-nginx-controller --watch

# Get the external IP
kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## 💰 Cost Analysis

### Monthly Cost Estimate: ~$100-150

| Resource | SKU | Estimated Cost |
|----------|-----|----------------|
| AKS Cluster | Standard | Free (only pay for nodes) |
| VM Nodes (2x B2s) | Standard_B2s | ~$30-40/month |
| PostgreSQL | B_Standard_B1ms | ~$20-25/month |
| Container Registry | Basic | ~$5/month |
| Load Balancer | Standard | ~$20-25/month |
| Virtual Network | Standard | ~$5-10/month |
| Log Analytics | Pay-as-you-go | ~$10-20/month |
| Storage | Standard LRS | ~$5-10/month |

### Cost Optimization Tips
- Use **Spot VMs** for development workloads
- Enable **cluster autoscaler** to scale down during low usage
- Use **Azure Reserved Instances** for production workloads
- Monitor usage with **Azure Cost Management**

## 🔍 Monitoring & Observability

### Built-in Monitoring
- **Container Insights** - Cluster and pod metrics
- **Log Analytics** - Centralized logging
- **Application Insights** - Application performance
- **Azure Monitor** - Infrastructure metrics

### Access Monitoring
```bash
# View cluster metrics in Azure portal
az aks browse --resource-group rg-nbu-blog-k8s --name aks-nbu-blog

# Check cluster health
kubectl get nodes
kubectl top nodes
kubectl top pods --all-namespaces

# View logs
kubectl logs -f deployment/blog-api
kubectl logs -f deployment/frontend
```

### Alerts Configured
- **Node Health** - Alerts when nodes are not ready
- **Resource Usage** - Alerts for high CPU/memory usage
- **Pod Failures** - Alerts for failing pods

## 🔐 Security Features

### Network Security
- **Private PostgreSQL** - No public access
- **VNet Integration** - All traffic within Azure backbone
- **Network Policies** - Pod-to-pod traffic control
- **Private DNS** - Internal name resolution

### Identity & Access
- **Azure AD Integration** - Centralized authentication
- **RBAC** - Role-based access control
- **Managed Identity** - Service-to-service authentication
- **ACR Integration** - Secure image pulling

### Best Practices Applied
- **Least Privilege** - Minimal required permissions
- **Defense in Depth** - Multiple security layers
- **Encryption** - Data encrypted in transit and at rest
- **Regular Updates** - Automatic security patches

## 🚀 Deployment Commands

### Initial Deployment
```bash
# 1. Initialize state storage (one time)
cd terraform/state-bootstrap
terraform init && terraform apply

# 2. Deploy infrastructure
cd ../terraform-k8
terraform init
terraform plan
terraform apply

# 3. Configure kubectl
az aks get-credentials --resource-group rg-nbu-blog-k8s --name aks-nbu-blog

# 4. Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 5. Wait for external IP
kubectl get svc -n ingress-nginx --watch

# 6. Deploy applications
kubectl apply -f ../../kubernetes/backend-kubernetes-ts/aks-k8/
```

### Ongoing Management
```bash
# Check cluster status
kubectl get nodes
kubectl get pods --all-namespaces

# Scale cluster
az aks scale --resource-group rg-nbu-blog-k8s --name aks-nbu-blog --node-count 3

# Update cluster
az aks upgrade --resource-group rg-nbu-blog-k8s --name aks-nbu-blog --kubernetes-version 1.28.0

# View cluster dashboard
az aks browse --resource-group rg-nbu-blog-k8s --name aks-nbu-blog
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Terraform Backend Issues
```bash
# Reinitialize backend
terraform init -reconfigure

# Check state
terraform state list
```

#### 2. AKS Connection Issues
```bash
# Get fresh credentials
az aks get-credentials --resource-group rg-nbu-blog-k8s --name aks-nbu-blog --overwrite-existing

# Check Azure CLI login
az account show
```

#### 3. Database Connection Issues
```bash
# Check PostgreSQL server
az postgres flexible-server show --resource-group rg-nbu-blog-k8s --name psql-nbu-blog-k8s

# Test connectivity from AKS
kubectl run test-pod --image=postgres:15 --rm -it -- psql -h psql-nbu-blog-k8s.postgres.database.azure.com -U nbuadmin
```

#### 4. Ingress Issues
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resources
kubectl get ingress
kubectl describe ingress devinsights-frontend-ingress

# Check service endpoints
kubectl get endpoints
```

### Debug Commands
```bash
# Cluster diagnostics
kubectl cluster-info dump

# Node diagnostics
kubectl describe nodes

# Pod diagnostics
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl logs -f <pod-name>

# Network diagnostics
kubectl get svc,endpoints,ingress
```

## 🔄 CI/CD Integration

This infrastructure integrates with GitHub Actions for automated deployments:

### GitHub Secrets Required
- `AZURE_CREDENTIALS` - Service principal for Azure authentication
- `ACR_USERNAME` - Container registry username
- `ACR_PASSWORD` - Container registry password

### Automated Workflow
1. **Code Push** triggers GitHub Actions
2. **Docker Build** creates container images
3. **Image Push** to Azure Container Registry
4. **Kubernetes Deploy** updates cluster deployments
5. **Health Checks** verify deployment success

## 📈 Scaling Strategies

### Horizontal Scaling
```bash
# Enable cluster autoscaler
az aks update --resource-group rg-nbu-blog-k8s --name aks-nbu-blog --enable-cluster-autoscaler --min-count 1 --max-count 10

# Scale specific deployments
kubectl scale deployment blog-api --replicas=5
kubectl scale deployment frontend --replicas=3
```

### Vertical Scaling
```bash
# Add new node pool with larger VMs
az aks nodepool add --resource-group rg-nbu-blog-k8s --cluster-name aks-nbu-blog --name highmem --node-count 2 --node-vm-size Standard_D4s_v3
```

### Database Scaling
```bash
# Scale PostgreSQL
az postgres flexible-server update --resource-group rg-nbu-blog-k8s --name psql-nbu-blog-k8s --sku-name GP_Standard_D2s_v3
```

## 🧹 Cleanup

### Destroy Infrastructure
```bash
# Destroy Kubernetes infrastructure
terraform destroy

# Confirm destruction
terraform show
```

### Cleanup Commands
```bash
# Remove kubeconfig
rm kubeconfig

# Clean Terraform
rm -rf .terraform
rm .terraform.lock.hcl
```

## 📚 Additional Resources

### Documentation Links
- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Terraform AzureRM Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)

### NBU DevInsights Links
- [Project Repository](https://github.com/nbu-devinsights/blog-platform)
- [Architecture Documentation](../docs/architecture.md)
- [Deployment Guide](../docs/deployment.md)

## 📞 Support

For questions or issues:
- **Email**: admin@nbu-devinsights.site
- **University**: New Bulgarian University
- **Department**: Computer Science
- **Project**: NBU DevInsights Blog Platform

---

## 🎯 Quick Reference

### Key Resource Names
- **Cluster**: `aks-nbu-blog`
- **Registry**: `acrnbuk8s`
- **Database**: `psql-nbu-blog-k8s`
- **Resource Group**: `rg-nbu-blog-k8s`

### Important Commands
```bash
# Get cluster credentials
az aks get-credentials --resource-group rg-nbu-blog-k8s --name aks-nbu-blog

# Check cluster status
kubectl get nodes

# View applications
kubectl get pods,svc,ingress

# Scale applications
kubectl scale deployment <app-name> --replicas=<count>
```

### URLs (after DNS configuration)
- **Frontend**: https://devinsights.site
- **API**: https://api.devinsights.site
- **Keycloak**: https://devinsights.site/auth




deploy with tf:
tf apply
register Microsoft.Network , Microsoft.ContainerService , Microsoft.OperationsManagement