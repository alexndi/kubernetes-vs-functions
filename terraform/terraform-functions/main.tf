# terraform-functions/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  subscription_id = var.subscription_id
  skip_provider_registration = true
}

# Data source for current Azure client
data "azurerm_client_config" "current" {}

# Local values for consistent naming and tagging
locals {
  # Naming components
  project_prefix = "nbu"
  environment    = "prod"
  workload       = "blog"
  
  # Common naming pattern: {project}-{workload}-{component}
  base_name = "${local.project_prefix}-${local.workload}"
  
  # Common tags applied to all resources
  common_tags = merge({
    Project      = "NBU DevInsights Blog"
    Environment  = title(local.environment)
    Workload     = title(local.workload)
    ManagedBy    = "Terraform"
    Architecture = "Serverless"
    CreatedBy    = "nbu-terraform"
    DeployedWith = "Azure Functions"
    CostCenter   = "NBU-IT"
  }, var.additional_tags)
}

# Main Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.base_name}"
  location = var.location

  tags = local.common_tags
}

# Storage Account for Azure Functions
resource "azurerm_storage_account" "functions" {
  name                     = "st${local.project_prefix}func"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  tags = local.common_tags
}

# Azure Container Registry for Frontend Docker Images
resource "azurerm_container_registry" "frontend" {
  name                = "acr${local.project_prefix}frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = local.common_tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-${local.base_name}"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb                   = 32768
  sku_name                     = B_Standard_B1ms
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
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "appi-${local.base_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  retention_in_days   = 30
  workspace_id        = azurerm_log_analytics_workspace.main.id

  tags = local.common_tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${local.base_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.common_tags
}

# Service Plan for Azure Functions (Consumption)
resource "azurerm_service_plan" "functions" {
  name                = "asp-${local.base_name}-func"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "Y1"  # Consumption plan
  
  tags = local.common_tags
}

# Service Plan for App Service (Frontend)
resource "azurerm_service_plan" "frontend" {
  name                = "asp-${local.base_name}-fe"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"  # Basic plan
  
  tags = local.common_tags
}

# Linux Function App
resource "azurerm_linux_function_app" "main" {
  name                = "func-${local.base_name}-api"
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

  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"                = "node"
    "WEBSITE_NODE_DEFAULT_VERSION"            = "~18"
    "FUNCTIONS_EXTENSION_VERSION"             = "~4"
    "WEBSITE_RUN_FROM_PACKAGE"                = "1"
    
    "APPINSIGHTS_INSTRUMENTATIONKEY"          = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"   = azurerm_application_insights.main.connection_string
    
    # Database settings
    "POSTGRES_HOST"     = azurerm_postgresql_flexible_server.main.fqdn
    "POSTGRES_PORT"     = "5432"
    "POSTGRES_DB"       = azurerm_postgresql_flexible_server_database.main.name
    "POSTGRES_USER"     = var.postgres_admin_username
    "POSTGRES_PASSWORD" = var.postgres_admin_password
    
    # Application settings
    "FRONTEND_URL"      = "https://app-${local.base_name}-fe.azurewebsites.net"
    "NODE_ENV"          = "production"
    "DB_MIGRATION_KEY"  = var.db_migration_key
  }

  tags = local.common_tags
}

# Linux Web App for Frontend (Docker-enabled)
resource "azurerm_linux_web_app" "frontend" {
  name                = "app-${local.base_name}-fe"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.frontend.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on           = false
    ftps_state          = "Disabled"
    http2_enabled       = true
    minimum_tls_version = "1.2"

    application_stack {
      docker_image_name   = "${azurerm_container_registry.frontend.login_server}/nbu-blog-frontend:latest"
      docker_registry_url = "https://${azurerm_container_registry.frontend.login_server}"
    }
  }

  app_settings = {
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.frontend.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.frontend.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.frontend.admin_password
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "WEBSITES_PORT" = "80"
    "NODE_ENV" = "production"
  }

  tags = local.common_tags
}

# Action Group for Alerts
resource "azurerm_monitor_action_group" "main" {
  name                = "ag-${local.base_name}"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "nbu-blog"

  email_receiver {
    name          = "admin"
    email_address = var.alert_email_address
  }

  tags = local.common_tags
}

# Function App Availability Alert
resource "azurerm_monitor_metric_alert" "function_app_availability" {
  name                = "alert-${local.base_name}-func-avail"
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