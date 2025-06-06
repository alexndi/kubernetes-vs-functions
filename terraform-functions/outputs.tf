# terraform/outputs.tf

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "function_app_name" {
  description = "Name of the Function App"
  value       = azurerm_linux_function_app.main.name
}

output "function_app_url" {
  description = "URL of the Function App"
  value       = "https://${azurerm_linux_function_app.main.default_hostname}"
}

output "function_app_custom_url" {
  description = "Custom URL of the Function App"
  value       = "https://api.${var.custom_domain}"
}

output "static_web_app_name" {
  description = "Name of the Static Web App"
  value       = azurerm_static_web_app.main.name
}

output "static_web_app_url" {
  description = "URL of the Static Web App"
  value       = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "static_web_app_custom_url" {
  description = "Custom URL of the Static Web App"
  value       = "https://${var.custom_domain}"
}

output "static_web_app_api_key" {
  description = "API key for Static Web App deployment"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "postgres_server_name" {
  description = "Name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.name
}

output "postgres_server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "postgres_database_name" {
  description = "Name of the PostgreSQL database"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string for GitHub Secrets"
  value       = "postgresql://${var.postgres_admin_username}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
  sensitive   = true
}

output "application_insights_name" {
  description = "Name of Application Insights"
  value       = azurerm_application_insights.main.name
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

output "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.main.name
}

# Deployment summary
output "deployment_info" {
  description = "Key deployment information"
  value = {
    function_app_name         = azurerm_linux_function_app.main.name
    function_app_url          = "https://${azurerm_linux_function_app.main.default_hostname}"
    function_app_custom_url   = "https://api.${var.custom_domain}"
    static_web_app_name       = azurerm_static_web_app.main.name
    static_web_app_url        = "https://${azurerm_static_web_app.main.default_host_name}"
    static_web_app_custom_url = "https://${var.custom_domain}"
    custom_domain             = var.custom_domain
    resource_group            = azurerm_resource_group.main.name
    postgres_server           = azurerm_postgresql_flexible_server.main.fqdn
    sku_type                  = "Consumption Plan (Y1)"
    database_type             = "Public with Azure Firewall Rules"
    secret_management         = "GitHub Secrets"
    monthly_cost_estimate     = "~$32"
  }
}

# GitHub Secrets values (for easy copying)
output "github_secrets_guide" {
  description = "Values needed for GitHub Secrets setup"
  value = {
    instructions = "Add these values as GitHub Secrets in your repository"
    secrets_needed = {
      POSTGRES_PASSWORD = "Use the password from terraform.tfvars"
      DATABASE_URL = "Use the postgres_connection_string output below"
      AZURE_FUNCTIONAPP_PUBLISH_PROFILE = "Get from: az functionapp deployment list-publishing-profiles"
      AZURE_STATIC_WEB_APPS_API_TOKEN = "Use the static_web_app_api_key output"
      AZURE_CREDENTIALS = "Get from: az ad sp create-for-rbac --sdk-auth"
    }
  }
}

# DNS Configuration Guide
output "dns_configuration" {
  description = "DNS records to create at your domain provider"
  value = {
    frontend_cname = {
      name  = var.custom_domain
      type  = "CNAME"
      value = azurerm_static_web_app.main.default_host_name
    }
    api_cname = {
      name  = "api.${var.custom_domain}"
      type  = "CNAME" 
      value = azurerm_linux_function_app.main.default_hostname
    }
  }
}