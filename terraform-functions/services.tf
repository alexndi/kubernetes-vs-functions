# terraform/services.tf

# Storage Account for Azure Functions
resource "azurerm_storage_account" "functions" {
  name                     = "stfuncdevinsights"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  tags = local.common_tags
}

# PostgreSQL Flexible Server (Public with Azure Services access)
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-devinsights"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb                   = var.postgres_storage_mb
  sku_name                     = var.postgres_sku_name
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  public_network_access_enabled = true

  tags = local.common_tags
}

# PostgreSQL Firewall Rule for Azure Services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "devinsights_blog"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "ai-devinsights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  retention_in_days   = 90

  tags = local.common_tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-devinsights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.common_tags
}

# Service Plan for Azure Functions (Consumption)
resource "azurerm_service_plan" "functions" {
  name                = "asp-devinsights-functions"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "Y1"  # Consumption plan
  
  tags = local.common_tags
}

# Service Plan for App Service (Frontend)
resource "azurerm_service_plan" "frontend" {
  name                = "asp-devinsights-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"  # Basic plan - you can change this to F1 for free tier
  
  tags = local.common_tags
}

# Linux Function App
resource "azurerm_linux_function_app" "main" {
  name                = "func-devinsights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.functions.id

  storage_account_name       = azurerm_storage_account.functions.name
  storage_account_access_key = azurerm_storage_account.functions.primary_access_key

  functions_extension_version = "~4"

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on     = false
    ftps_state    = "Disabled"
    http2_enabled = true

    application_stack {
      node_version = "18"
    }

    cors {
      allowed_origins = [
        "https://*.azurewebsites.net",
        "https://${var.custom_domain}",
        "http://localhost:3000",
        "http://localhost:3001"
      ]
      support_credentials = true
    }
  }

  # Initial app settings (secrets will be injected by GitHub Actions)
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"                = "node"
    "WEBSITE_NODE_DEFAULT_VERSION"            = "~18"
    "FUNCTIONS_EXTENSION_VERSION"             = "~4"
    "WEBSITE_RUN_FROM_PACKAGE"                = "1"
    
    "APPINSIGHTS_INSTRUMENTATIONKEY"          = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"   = azurerm_application_insights.main.connection_string
    
    # Database settings (GitHub Actions will update these with real secrets)
    "POSTGRES_HOST"     = azurerm_postgresql_flexible_server.main.fqdn
    "POSTGRES_PORT"     = "5432"
    "POSTGRES_DB"       = azurerm_postgresql_flexible_server_database.main.name
    "POSTGRES_USER"     = var.postgres_admin_username
    "POSTGRES_PASSWORD" = "will-be-updated-by-github-actions"
    
    # Remove circular dependency - will be updated after frontend is created
    "FRONTEND_URL"      = "https://app-devinsights-frontend.azurewebsites.net"
    "NODE_ENV"          = "production"
  }

  tags = local.common_tags
}

# Linux Web App for Frontend
resource "azurerm_linux_web_app" "frontend" {
  name                = "app-devinsights-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.frontend.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on           = false  # Set to true if using paid plans
    ftps_state          = "Disabled"
    http2_enabled       = true
    minimum_tls_version = "1.2"

    application_stack {
      node_version = "18-lts"
    }

    # Lightest option: Use npx serve (no PM2 overhead)
    app_command_line = "cd /home/site/wwwroot/build && npx serve -s -p 8080"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION"    = "18-lts"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    # Use custom domain for backend API
    "REACT_APP_BACKEND_URL"          = "https://api.${var.custom_domain}"
    "NODE_ENV"                       = "production"
  }

  tags = local.common_tags
}

# Action Group for Alerts
resource "azurerm_monitor_action_group" "main" {
  name                = "ag-devinsights"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "devinsights"

  email_receiver {
    name          = "admin"
    email_address = var.alert_email_address
  }

  tags = local.common_tags
}

# Function App Availability Alert
resource "azurerm_monitor_metric_alert" "function_app_availability" {
  name                = "alert-function-availability"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_linux_function_app.main.id]
  description         = "Function App availability is below threshold"
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http2xx"
    aggregation      = "Total"
    operator         = "LessThan"
    threshold        = 1
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = local.common_tags
}