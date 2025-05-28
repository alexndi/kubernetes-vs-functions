// src/services/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'https://devinsights.site/auth',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'it-blog-realm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'it-blog-client'
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;