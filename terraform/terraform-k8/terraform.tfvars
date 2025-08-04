resource_group_name = "rg-blog-aks"
location            = "northeurope"
cluster_name        = "blog-aks-cluster"
dns_prefix          = "blogaks"
node_count          = 2
vm_size             = "Standard_B2s"
environment         = "development"
postgres_admin_password = "blogpassword"
