# state-bootstrap/main.tf
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
  features {}
  subscription_id = "36ed6908-c1e2-4a94-ae5f-331c1e90ed9e"
  skip_provider_registration = true
}

# Local values for consistent naming
locals {
  project_prefix = "nbu"
  workload       = "blog"
  base_name      = "${local.project_prefix}-${local.workload}"
  
  common_tags = {
    Project    = "NBU DevInsights Blog"
    ManagedBy  = "Terraform"
    Purpose    = "Terraform State Storage"
    University = "New Bulgarian University"
  }
}

# Resource Group for Terraform State
resource "azurerm_resource_group" "terraform_state" {
  name     = "rg-${local.base_name}-tfstate"
  location = "West Europe"

  tags = local.common_tags
}

# Storage Account for Terraform State
resource "azurerm_storage_account" "terraform_state" {
  name                     = "stnbutfstate36ed"  # Unique suffix from subscription ID
  resource_group_name      = azurerm_resource_group.terraform_state.name
  location                 = azurerm_resource_group.terraform_state.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }

  tags = local.common_tags
}

# Storage Container for Functions State
resource "azurerm_storage_container" "functions_state" {
  name                  = "functions-tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}

# Storage Container for Kubernetes State
resource "azurerm_storage_container" "kubernetes_state" {
  name                  = "kubernetes-tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}
