# terraform/terraform.tfvars.example
# Copy this file to terraform.tfvars and update with your values

# Azure Configuration
subscription_id = "74be1b16-c7f6-4ebd-88d0-c1754bef3200"  # Update with your subscription ID
location        = "North Europe"

# Custom Domain Configuration
custom_domain = "devinsights.site"  # Update with your actual domain

# PostgreSQL Configuration
postgres_admin_username = "pgadmin"
postgres_admin_password = "YourSecurePassword123!"  # Use a strong password - will be used in GitHub Secrets
postgres_sku_name       = "B_Standard_B1ms"        
postgres_storage_mb     = 32768                    # 32GB

# Contact Information
alert_email_address = "alerts@yourdomain.com"

# Additional Tags
tags = {
  Owner      = "DevInsights Team"
  Purpose    = "Blog Application"
  Contact    = "admin@yourdomain.com"
  SecretMgmt = "GitHub Secrets"
}