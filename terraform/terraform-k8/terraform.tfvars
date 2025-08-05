# terraform-k8/terraform.tfvars

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
  Purpose     = "DevInsights Blog Platform"
  University  = "New Bulgarian University"
}