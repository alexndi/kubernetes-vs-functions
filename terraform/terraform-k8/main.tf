# main.tf - Complete configuration

# Configure the Azure provider
provider "azurerm" {
  features {}
  subscription_id = "74be1b16-c7f6-4ebd-88d0-c1754bef3200"
  skip_provider_registration = true # This is only required when the User, Service Principal, or Identity running Terraform lacks the permissions to register Azure Resource Providers.
}

# Create resource group
resource "azurerm_resource_group" "aks" {
  name     = var.resource_group_name
  location = var.location
}

# Create Virtual Network
resource "azurerm_virtual_network" "aks_vnet" {
  name                = "aks-vnet"
  location            = azurerm_resource_group.aks.location
  resource_group_name = azurerm_resource_group.aks.name
  address_space       = ["10.0.0.0/16"]

  tags = {
    Environment = var.environment
  }
}

# Create subnet for AKS nodes
resource "azurerm_subnet" "aks_subnet" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.aks.name
  virtual_network_name = azurerm_virtual_network.aks_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Create subnet for PostgreSQL
resource "azurerm_subnet" "postgres_subnet" {
  name                 = "postgres-subnet"
  resource_group_name  = azurerm_resource_group.aks.name
  virtual_network_name = azurerm_virtual_network.aks_vnet.name
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

# Create subnet for pods (Azure CNI)
resource "azurerm_subnet" "pods_subnet" {
  name                 = "pods-subnet"
  resource_group_name  = azurerm_resource_group.aks.name
  virtual_network_name = azurerm_virtual_network.aks_vnet.name
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

# Random suffix for unique names
resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

# Create private DNS zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres_dns" {
  name                = "blog.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.aks.name

  tags = {
    Environment = var.environment
  }
}

# Link DNS zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "postgres_dns_link" {
  name                  = "postgres-dns-link"
  resource_group_name   = azurerm_resource_group.aks.name
  private_dns_zone_name = azurerm_private_dns_zone.postgres_dns.name
  virtual_network_id    = azurerm_virtual_network.aks_vnet.id
}

# Create PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "blog-postgres-${random_string.suffix.result}"
  resource_group_name    = azurerm_resource_group.aks.name
  location               = azurerm_resource_group.aks.location
  version                = "15"
  delegated_subnet_id    = azurerm_subnet.postgres_subnet.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres_dns.id
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password
  zone                   = "1"

  storage_mb = 32768  # 32GB storage
  sku_name   = "B_Standard_B1ms"  # Cheapest option
  backup_retention_days = 7
  public_network_access_enabled = false


  tags = {
    Environment = var.environment
  }

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres_dns_link]
}

# Create PostgreSQL database
resource "azurerm_postgresql_flexible_server_database" "keycloak_db" {
  name      = "keycloak"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Create ACR
resource "azurerm_container_registry" "acr" {
  name                = "blogacr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.aks.name
  location            = azurerm_resource_group.aks.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = {
    Environment = var.environment
  }
}

# Create AKS cluster with VNet integration
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.aks.location
  resource_group_name = azurerm_resource_group.aks.name
  dns_prefix          = var.dns_prefix

  default_node_pool {
    name           = "default"
    node_count     = var.node_count
    vm_size        = var.vm_size
    os_disk_size_gb = 64
    # IMPORTANT: Specify the subnet for AKS nodes
    vnet_subnet_id = azurerm_subnet.aks_subnet.id
    # Optional: Specify pod subnet for Azure CNI
    pod_subnet_id  = azurerm_subnet.pods_subnet.id
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

  tags = {
    Environment = var.environment
  }
}

# Assign AcrPull role to AKS
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.acr.id
}

# Output the kubeconfig
resource "local_file" "kubeconfig" {
  content  = azurerm_kubernetes_cluster.aks.kube_config_raw
  filename = "${path.module}/kubeconfig"
}