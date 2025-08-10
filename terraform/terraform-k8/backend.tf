terraform {
  backend "azurerm" {
    resource_group_name  = "rg-nbu-blog-tfstate"
    storage_account_name = "stnbuterraformstate"
    container_name       = "kubernetes-tfstate"
    key                  = "blog-aks.tfstate"
  }
}