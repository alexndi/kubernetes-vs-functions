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

output "frontend_app_name" {
  description = "Name of the Frontend App Service"
  value       = azurerm_linux_web_app.frontend.name
}

output "frontend_app_url" {
  description = "URL of the Frontend App Service"
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

output "container_registry_name" {
  description = "Name of the Azure Container Registry for frontend"
  value       = azurerm_container_registry.frontend.name
}

output "container_registry_login_server" {
  description = "Login server URL for the Azure Container Registry"
  value       = azurerm_container_registry.frontend.login_server
}

output "container_registry_admin_username" {
  description = "Admin username for the Azure Container Registry"
  value       = azurerm_container_registry.frontend.admin_username
  sensitive   = true
}

output "container_registry_admin_password" {
  description = "Admin password for the Azure Container Registry"
  value       = azurerm_container_registry.frontend.admin_password
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
    frontend_app_name         = azurerm_linux_web_app.frontend.name
    frontend_app_url          = "https://${azurerm_linux_web_app.frontend.default_hostname}"
    frontend_app_custom_url   = "https://${var.custom_domain}"
    container_registry_name   = azurerm_container_registry.frontend.name
    container_registry_url    = azurerm_container_registry.frontend.login_server
    custom_domain             = var.custom_domain
    resource_group            = azurerm_resource_group.main.name
    postgres_server           = azurerm_postgresql_flexible_server.main.fqdn
    backend_sku               = "Consumption Plan (Y1)"
    frontend_sku              = "Basic (B1) with Docker"
    database_type             = "Public with Azure Firewall Rules"
    secret_management         = "GitHub Secrets"
    deployment_method         = "Docker containers"
    monthly_cost_estimate     = "~$50"
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
      AZURE_FUNCTIONAPP_PUBLISH_PROFILE = "Get from: az functionapp deployment list-publishing-profiles --name func-devinsights --resource-group rg-devinsights-blog"
      AZURE_CREDENTIALS = "Get from: az ad sp create-for-rbac --sdk-auth"
    }
    optional_acr_secrets = {
      note = "ACR credentials are automatically managed via Azure login in GitHub Actions"
      ACR_LOGIN_SERVER = azurerm_container_registry.frontend.login_server
      ACR_USERNAME = azurerm_container_registry.frontend.admin_username
      ACR_PASSWORD = "Available via terraform output container_registry_admin_password"
    }
  }
}

# Service Principal Commands
output "service_principal_commands" {
  description = "Commands to set up service principal for GitHub Actions"
  value = {
    create_sp = "az ad sp create-for-rbac --name github-actions-devinsights --role contributor --scopes /subscriptions/${var.subscription_id}/resourceGroups/rg-devinsights-blog --sdk-auth"
    
    grant_acr_access = "az role assignment create --assignee <service-principal-client-id> --role AcrPush --scope ${azurerm_container_registry.frontend.id}"
    
    get_function_profile = "az functionapp deployment list-publishing-profiles --name func-devinsights --resource-group rg-devinsights-blog --xml"
    
    test_acr_access = "az acr login --name ${azurerm_container_registry.frontend.name}"
    
    note = "1. Create service principal with contributor role, 2. Grant ACR push access using the client ID from step 1, 3. Add AZURE_CREDENTIALS to GitHub Secrets"
  }
}

# Manual DNS Configuration Guide
output "manual_dns_setup" {
  description = "DNS records to create manually at your domain provider"
  value = {
    instructions = "Create these DNS records at your domain provider"
    frontend_cname = {
      name  = var.custom_domain
      type  = "CNAME"
      value = azurerm_linux_web_app.frontend.default_hostname
      note  = "Points your domain to the frontend App Service"
    }
    api_cname = {
      name  = "api.${var.custom_domain}"
      type  = "CNAME" 
      value = azurerm_linux_function_app.main.default_hostname
      note  = "Points api subdomain to the Functions App"
    }
  }
}

# Manual Custom Domain Setup Commands
output "manual_domain_setup_commands" {
  description = "Commands to add custom domains manually (run after DNS is configured)"
  value = {
    add_frontend_domain = "az webapp config hostname add --webapp-name app-devinsights-frontend --resource-group rg-devinsights-blog --hostname ${var.custom_domain}"
    add_api_domain = "az functionapp config hostname add --webapp-name func-devinsights --resource-group rg-devinsights-blog --hostname api.${var.custom_domain}"
    enable_frontend_ssl = "az webapp config ssl bind --name app-devinsights-frontend --resource-group rg-devinsights-blog --certificate-thumbprint <thumbprint> --ssl-type SNI"
    enable_api_ssl = "az functionapp config ssl bind --name func-devinsights --resource-group rg-devinsights-blog --certificate-thumbprint <thumbprint> --ssl-type SNI"
    note = "1. First create DNS records, 2. Then add domains, 3. Finally enable SSL"
  }
}