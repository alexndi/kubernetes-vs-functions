// src/config/keycloak.ts

export interface KeycloakConfig {
    url: string;
    realm: string;
    clientId: string;
    clientSecret?: string;
  }
  
  export function getKeycloakConfig(): KeycloakConfig {
    return {
      url: process.env.KEYCLOAK_URL || 'http://192.168.49.2:30387',
      realm: process.env.KEYCLOAK_REALM || 'it-blog-realm',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'it-blog-client',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || ''
    };
  }
  
  export function getKeycloakJwksUri(): string {
    const config = getKeycloakConfig();
    return `${config.url}/realms/${config.realm}/protocol/openid-connect/certs`;
  }
