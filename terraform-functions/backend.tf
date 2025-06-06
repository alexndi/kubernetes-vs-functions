terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state-fc"
    storage_account_name = "stterraformdevinsights"
    container_name       = "tfstate"
    key                  = "blog-aks.tfstate"
  }
}
