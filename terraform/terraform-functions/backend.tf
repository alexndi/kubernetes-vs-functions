# Remote backend - Azure Storage Account
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-nbu-blog-tfstate"
    storage_account_name = "stnbutfstate36ed"
    container_name       = "functions-tfstate"
    key                  = "blog-functions.tfstate"
  }
}
