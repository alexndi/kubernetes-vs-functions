# AKS Terraform Deployment

This repository contains Terraform configurations to deploy an Azure Kubernetes Service (AKS) cluster.

## Deployment Steps

### Step 1: Create Terraform State Storage

First, create the storage account for the Terraform state:

# Navigate to the state-bootstrap directory
cd state-bootstrap

# Initialize Terraform
terraform init

# Apply the configuration to create storage account
terraform apply


### Step 2: Deploy the AKS Cluster
After creating the storage account, deploy the AKS cluster:
bash# Navigate back to the main directory
cd ..

# Initialize Terraform with the remote backend
terraform init

# Validate the configuration
terraform validate

# See the execution plan
terraform plan

# Apply the configuration to create the AKS cluster
terraform apply
### Step 3: Configure kubectl
After successful deployment, configure kubectl to manage your AKS cluster:
bash# Set KUBECONFIG environment variable to use the generated kubeconfig file
export KUBECONFIG=$(pwd)/kubeconfig

# Verify the connection to your AKS cluster
kubectl get nodes
EOL
echo "Terraform files created successfully in the blog-aks-terraform directory."

To use this script:

1. Save it to a file (e.g., `create_terraform_files.sh`)
2. Make it executable: `chmod +x create_terraform_files.sh`
3. Run it: `./create_terraform_files.sh`

The script will create all the necessary files in a directory structure as outlined in my previous response, including a README with instructions on how to deploy the infrastructure.