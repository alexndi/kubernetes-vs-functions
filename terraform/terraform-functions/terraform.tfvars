# terraform-functions/terraform.tfvars

# Azure Configuration
subscription_id = "74be1b16-c7f6-4ebd-88d0-c1754bef3200"
location        = "North Europe"

# Custom Domain Configuration
custom_domain = "devinsights.site"

# PostgreSQL Configuration
postgres_admin_username = "nbuadmin"
postgres_admin_password = "NbuSecurePassword123!"
postgres_database_name  = "nbu_devinsights_blog"

# Monitoring Configuration
alert_email_address = "admin@nbu-devinsights.site"

# Security Configuration
db_migration_key = "nbu-secure-migration-key-2025"

# Additional Tags
additional_tags = {
  Owner       = "NBU Team"
  Purpose     = "DevInsights Blog Platform"
  Contact     = "admin@nbu-devinsights.site"
  University  = "New Bulgarian University"
  Department  = "Computer Science"
}