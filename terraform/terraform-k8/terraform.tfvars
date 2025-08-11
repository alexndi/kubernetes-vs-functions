# terraform-k8/terraform.tfvars

# Azure Configuration
subscription_id = "982a79f8-b97c-45c0-adcf-7c9e98a71d0b"
location        = "North Europe"

# Custom Domain Configuration
custom_domain = "kubernetes.devinsights.site"

# AKS Configuration
node_count = 2
vm_size    = "Standard_B2s"

# PostgreSQL Configuration
postgres_admin_username = "nbuadmin"
postgres_admin_password = "NbuSecurePassword123!"
postgres_database_name  = "nbu_devinsights_blog"

# Additional Tags
additional_tags = {
  Purpose     = "DevInsights Blog Platform"
  University  = "New Bulgarian University"
}