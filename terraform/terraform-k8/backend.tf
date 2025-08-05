# terraform-k8/backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-nbu-blog-tfstate"
    storage_account_name = "stnbuterraformstate"
    container_name       = "kubernetes-tfstate"
    key                  = "nbu-blog-k8s.tfstate"
  }
}