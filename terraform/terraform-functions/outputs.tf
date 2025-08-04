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