# terraform/variables.tf
variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
  default     = "North Europe"
}

variable "custom_domain" {
  description = "Custom domain for the application (e.g., devinsights.yourdomain.com)"
  type        = string
  
  validation {
    condition     = can(regex("^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$", var.custom_domain))
    error_message = "Custom domain must be a valid domain name."
  }
}

# PostgreSQL Variables
variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "pgadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.postgres_admin_password) >= 8
    error_message = "PostgreSQL admin password must be at least 8 characters long."
  }
}

variable "postgres_sku_name" {
  description = "PostgreSQL SKU name"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768
}

# Contact Information
variable "alert_email_address" {
  description = "Email address for monitoring alerts"
  type        = string
  
  validation {
    condition     = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.alert_email_address))
    error_message = "Must be a valid email address."
  }
}

# Additional Tags
variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}