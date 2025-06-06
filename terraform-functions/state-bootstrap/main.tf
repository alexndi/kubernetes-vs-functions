# terraform/state-bootstrap/main.tf
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
  subscription_id = "74be1b16-c7f6-4ebd-88d0-c1754bef3200"
  skip_provider_registration = true
}

# Resource Group for Terraform State
resource "azurerm_resource_group" "terraform_state" {
  name     = "rg-terraform-state-fc"
  location = "North Europe"

  tags = {
    Purpose   = "Terraform State Storage"
    ManagedBy = "Terraform"
  }
}

# Storage Account for Terraform State
resource "azurerm_storage_account" "terraform_state" {
  name                     = "stterraformdevinsights"
  resource_group_name      = azurerm_resource_group.terraform_state.name
  location                 = azurerm_resource_group.terraform_state.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }

  tags = {
    Purpose   = "Terraform State Storage"
    ManagedBy = "Terraform"
  }
}

# Storage Container for Terraform State
resource "azurerm_storage_container" "terraform_state" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}

# Outputs
output "backend_config" {
  description = "Backend configuration for main Terraform deployment"
  value = {
    resource_group_name  = azurerm_resource_group.terraform_state.name
    storage_account_name = azurerm_storage_account.terraform_state.name
    container_name       = azurerm_storage_container.terraform_state.name
    key                  = "devinsights.tfstate"
  }
}