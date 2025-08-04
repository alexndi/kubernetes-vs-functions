# This file is used to create the Azure Storage Account for storing Terraform state
# It should be applied separately before running the main configuration

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "74be1b16-c7f6-4ebd-88d0-c1754bef3200"
  skip_provider_registration = true # This is only required when the User, Service Principal, or Identity running Terraform lacks the permissions to register Azure Resource Providers.
}

resource "azurerm_resource_group" "terraform_state" {
  name     = "rg-terraform-state"
  location = "northeurope"
}

resource "azurerm_storage_account" "terraform_state" {
  name                     = "blogaksterraformstate"
  resource_group_name      = azurerm_resource_group.terraform_state.name
  location                 = azurerm_resource_group.terraform_state.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = "infrastructure"
  }
}

resource "azurerm_storage_container" "terraform_state" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}
