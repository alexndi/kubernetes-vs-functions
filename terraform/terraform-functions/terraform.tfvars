# terraform-functions/terraform.tfvars

# Azure Configuration
subscription_id = "36ed6908-c1e2-4a94-ae5f-331c1e90ed9e"
location        = "West Europe"

# Custom Domain Configuration
custom_domain = "functions.devinsights.site"

# PostgreSQL Configuration
postgres_admin_username = "nbuadmin"
postgres_admin_password = "NbuSecurePassword123!"
postgres_database_name  = "nbu_devinsights_blog"

# Security Configuration
db_migration_key = "nbu-secure-migration-key-2025"

# Additional Tags
additional_tags = {
  Purpose     = "DevInsights Blog Platform"
  University  = "New Bulgarian University"
}