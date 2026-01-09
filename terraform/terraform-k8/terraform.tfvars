# terraform-k8/terraform.tfvars

# Azure Configuration
subscription_id = "36ed6908-c1e2-4a94-ae5f-331c1e90ed9e"
location        = "West Europe"

# Custom Domain Configuration
custom_domain = "kubernetes.devinsights.site"

# AKS Configuration
node_count = 2
vm_size    = "Standard_D2s_v3"

# PostgreSQL Configuration
postgres_admin_username = "nbuadmin"
postgres_admin_password = "NbuSecurePassword123!"
postgres_database_name  = "nbu_devinsights_blog"

# Additional Tags
additional_tags = {
  Purpose     = "DevInsights Blog Platform"
  University  = "New Bulgarian University"
}