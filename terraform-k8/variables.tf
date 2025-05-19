# variables.tf
variable "resource_group_name" {
  type        = string
  description = "The name of the resource group"
}

variable "location" {
  type        = string
  description = "The Azure Region where resources should be created"
}

variable "cluster_name" {
  type        = string
  description = "The name of the AKS cluster"
}

variable "dns_prefix" {
  type        = string
  description = "DNS prefix for the cluster"
}

variable "node_count" {
  type        = number
  description = "The number of nodes in the AKS cluster"
  default     = 1
}

variable "vm_size" {
  type        = string
  description = "The size of the Virtual Machine"
  default     = "Standard_B2s"
}

variable "environment" {
  type        = string
  description = "Environment tag for resources"
  default     = "development"
}

# PostgreSQL variables
variable "postgres_admin_username" {
  type        = string
  description = "PostgreSQL admin username"
  default     = "pgadmin"
}

variable "postgres_admin_password" {
  type        = string
  description = "PostgreSQL admin password"
  sensitive   = true
}