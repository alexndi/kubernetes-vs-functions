# terraform-functions/variables.tf

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
  description = "PostgreSQL database name"
  type        = string
  default     = "nbu_devinsights_blog"
}

# Application Configuration
variable "db_migration_key" {
  description = "Secure key for database migration operations"
  type        = string
  sensitive   = true
  default     = ""
}

# Additional Tags
variable "additional_tags" {
  description = "Additional tags to apply to NBU resources"
  type        = map(string)
  default     = {}
}