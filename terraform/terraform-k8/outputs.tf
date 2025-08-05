# terraform-k8/outputs.tf

# Deployment summary
output "deployment_info" {
  description = "Key deployment information"
  value = {
    aks_cluster_name          = azurerm_kubernetes_cluster.main.name
    aks_cluster_fqdn          = azurerm_kubernetes_cluster.main.fqdn
    aks_cluster_id            = azurerm_kubernetes_cluster.main.id
    container_registry_name   = azurerm_container_registry.main.name
    container_registry_url    = azurerm_container_registry.main.login_server
    postgres_server_name      = azurerm_postgresql_flexible_server.main.name
    postgres_server_fqdn      = azurerm_postgresql_flexible_server.main.fqdn
    resource_group_name       = azurerm_resource_group.main.name
    virtual_network_name      = azurerm_virtual_network.main.name
    custom_domain             = var.custom_domain
    application_url           = "https://${var.custom_domain}"
    api_url                   = "https://api.${var.custom_domain}"
    keycloak_url             = "https://${var.custom_domain}/auth"
    backend_type              = "Azure Kubernetes Service"
    database_type             = "Private PostgreSQL Flexible Server"
    networking                = "Azure CNI with VNet integration"
    monitoring                = "Azure Monitor Container Insights"
    secret_management         = "Kubernetes Secrets"
    deployment_method         = "Kubernetes manifests"
    monthly_cost_estimate     = "~$100-150"
  }
}

# Kubeconfig for kubectl access
output "kube_config" {
  description = "Kubeconfig for accessing the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}

# Connection information
output "connection_info" {
  description = "Connection information for cluster access"
  value = {
    get_credentials_command = "az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.main.name}"
    kubectl_config_file     = "${path.module}/kubeconfig"
    cluster_endpoint        = azurerm_kubernetes_cluster.main.kube_config[0].host
  }
}

# Container Registry information
output "container_registry_info" {
  description = "Container registry connection information"
  value = {
    registry_url      = azurerm_container_registry.main.login_server
    admin_username    = azurerm_container_registry.main.admin_username
    docker_login_cmd  = "az acr login --name ${azurerm_container_registry.main.name}"
    image_push_example = "docker tag myapp:latest ${azurerm_container_registry.main.login_server}/myapp:latest"
  }
  sensitive = false
}

# Database connection information
output "database_info" {
  description = "Database connection information"
  value = {
    postgres_host     = azurerm_postgresql_flexible_server.main.fqdn
    postgres_port     = "5432"
    blog_database     = azurerm_postgresql_flexible_server_database.blog.name
    keycloak_database = azurerm_postgresql_flexible_server_database.keycloak.name
    connection_type   = "Private (VNet integrated)"
  }
  sensitive = false
}

# Manual DNS Configuration Guide
output "manual_dns_setup" {
  description = "DNS records to create manually at your domain provider"
  value = {
    instructions = "Create these DNS records at your domain provider after configuring ingress"
    main_domain = {
      name  = var.custom_domain
      type  = "A"
      value = "INGRESS_EXTERNAL_IP"
      note  = "Points your domain to the AKS ingress controller (get IP after ingress setup)"
    }
    api_subdomain = {
      name  = "api.${var.custom_domain}"
      type  = "A"
      value = "INGRESS_EXTERNAL_IP"
      note  = "Points api subdomain to the same ingress controller"
    }
    wildcard_option = {
      name  = "*.${var.custom_domain}"
      type  = "A"
      value = "INGRESS_EXTERNAL_IP"
      note  = "Alternative: Single wildcard record for all subdomains"
    }
  }
}

# Next steps guide
output "next_steps" {
  description = "Commands to run after Terraform deployment"
  value = {
    step_1_get_credentials = "az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.main.name}"
    step_2_verify_cluster  = "kubectl get nodes"
    step_3_install_ingress = "kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml"
    step_4_wait_for_ip     = "kubectl get svc -n ingress-nginx --watch"
    step_5_deploy_apps     = "kubectl apply -f kubernetes/backend-kubernetes-ts/aks-k8/"
    step_6_check_status    = "kubectl get pods,svc,ingress"
  }
}