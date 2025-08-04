terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "blogaksterraformstate"
    container_name       = "tfstate"
    key                  = "blog-aks.tfstate"
  }
}
