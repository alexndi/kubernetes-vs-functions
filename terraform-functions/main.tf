# terraform/main.tf
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

# Main Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-devinsights-blog"
  location = var.location

  tags = local.common_tags
}

# Local values
locals {
  common_tags = merge({
    Project     = "DevInsights"
    ManagedBy   = "Terraform"
    Environment = "Production"
  }, var.tags)
}