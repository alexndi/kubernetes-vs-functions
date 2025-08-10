# terraform-k8/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
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
    Architecture = "Kubernetes"
    CreatedBy    = "nbu-terraform"
    DeployedWith = "Azure Kubernetes Service"
    CostCenter   = "NBU-IT"
  }, var.additional_tags)
}

# Main Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.base_name}-k8s"
  location = var.location

  tags = local.common_tags
}

# Virtual Network for AKS
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${local.base_name}-k8s"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.0.0.0/16"]

  tags = local.common_tags
}

# Subnet for AKS nodes
resource "azurerm_subnet" "aks_nodes" {
  name                 = "snet-${local.base_name}-nodes"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Subnet for PostgreSQL
resource "azurerm_subnet" "postgres" {
  name                 = "snet-${local.base_name}-postgres"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  
  delegation {
    name = "fs"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# Subnet for pods (Azure CNI)
resource "azurerm_subnet" "pods" {
  name                 = "snet-${local.base_name}-pods"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.3.0/24"]

  # This delegation is REQUIRED for AKS pod subnet
  delegation {
    name = "aks-delegation"
    service_delegation {
      name = "Microsoft.ContainerService/managedClusters"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# Private DNS zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "${local.base_name}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name

  tags = local.common_tags
}

# Link DNS zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "pdnslink-${local.base_name}-postgres"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-${local.base_name}-k8s"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  delegated_subnet_id    = azurerm_subnet.postgres.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres.id
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb                   = 32768  # 32GB storage
  sku_name                     = "B_Standard_B1ms"
  backup_retention_days        = 7
  public_network_access_enabled = false

  tags = local.common_tags

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]
}

# PostgreSQL databases
resource "azurerm_postgresql_flexible_server_database" "keycloak" {
  name      = "keycloak"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_postgresql_flexible_server_database" "blog" {
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "acr${local.project_prefix}k8s"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = local.common_tags
}

# Log Analytics Workspace for AKS monitoring
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${local.base_name}-k8s"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.common_tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "appi-${local.base_name}-k8s"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  retention_in_days   = 30
  workspace_id        = azurerm_log_analytics_workspace.main.id

  tags = local.common_tags
}

# AKS cluster with VNet integration
resource "azurerm_kubernetes_cluster" "main" {
  name                = "aks-${local.base_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${local.base_name}-k8s"
  node_resource_group = "rg-${local.base_name}-k8s-nodes"

  default_node_pool {
    name           = "default"
    node_count     = var.node_count
    vm_size        = var.vm_size
    os_disk_size_gb = 64
    # IMPORTANT: Specify the subnet for AKS nodes
    vnet_subnet_id = azurerm_subnet.aks_nodes.id
    # Optional: Specify pod subnet for Azure CNI
    pod_subnet_id  = azurerm_subnet.pods.id
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"       # Azure CNI for VNet integration
    load_balancer_sku = "standard"
    # Specify service and DNS CIDRs that don't overlap with VNet
    service_cidr       = "10.0.100.0/24"
    dns_service_ip     = "10.0.100.10"
  }

  # Enable Azure Monitor Container Insights
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  tags = local.common_tags
}

# Assign AcrPull role to AKS
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id         = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.main.id
}

# Output the kubeconfig
resource "local_file" "kubeconfig" {
  content  = azurerm_kubernetes_cluster.main.kube_config_raw
  filename = "${path.module}/kubeconfig"
}