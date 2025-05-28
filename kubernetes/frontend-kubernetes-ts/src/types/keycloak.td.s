// This file adds typings for Keycloak to supplement the keycloak-js types
import Keycloak from 'keycloak-js';

declare module 'keycloak-js' {
  interface KeycloakInstance {
    // Add any missing properties that might be used in your code but are not in the type definitions
    onAuthSuccess?: () => void;
    onAuthError?: (error: any) => void;
    onAuthLogout?: () => void;
  }
}