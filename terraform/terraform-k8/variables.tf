# terraform-k8/variables.tf

variable "subscription_id" {
  description = "Azure subscription ID for NBU deployment"
  type        = string
}

variable "location" {
  description = "Azure region for NBU resource deployment"
  type        = string
  default     = "North Europe"
}

variable "custom_domain" {
  description = "Custom domain for the NBU application"
  type        = string
}

# AKS Configuration
variable "node_count" {
  description = "The number of nodes in the default AKS node pool"
  type        = number
  default     = 2
}

variable "vm_size" {
  description = "The size of the Virtual Machine for AKS nodes"
  type        = string
  default     = "Standard_B2s"
}

# PostgreSQL Configuration
variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "nbuadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "postgres_database_name" {
  description = "PostgreSQL database name for the blog application"
  type        = string
  default     = "nbu_devinsights_blog"
}

# Application Configuration
variable "alert_email_address" {
  description = "Email address for monitoring alerts"
  type        = string
}

# Additional Tags
variable "additional_tags" {
  description = "Additional tags to apply to NBU resources"
  type        = map(string)
  default     = {}
}