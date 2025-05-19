import Keycloak from 'keycloak-js';

// Define types
interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

type AuthSuccessCallback = (authenticated: boolean) => void;
type AuthErrorCallback = (error: Error) => void;

// Initialize Keycloak
let keycloakInstance: Keycloak | null = null;

// Get environment variables with fallbacks
const getConfig = (): KeycloakConfig => {
  // Access environment variables or window.ENV (for runtime config)
  const env = (window as any).ENV || {};
  
  return {
    // Priority: 1. window.ENV (runtime) 2. process.env (build time) 3. fallback
    url:  process.env.REACT_APP_KEYCLOAK_URL || 
         'http://localhost:8080',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 
         'it-blog-realm',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 
         'it-blog-client'
  };
};

// Create a Keycloak instance
const initKeycloak = (
  onAuthSuccess?: AuthSuccessCallback,
  onAuthError?: AuthErrorCallback
): Promise<boolean> => {
  if (keycloakInstance) {
    return Promise.resolve(keycloakInstance.authenticated || false);
  }

  console.log(process.env)
  
  // Get configuration from environment variables
  const keycloakConfig = getConfig();
  console.log("Initializing Keycloak with config:", keycloakConfig);
  
  keycloakInstance = new Keycloak(keycloakConfig);
  
  // Add event listeners for login/logout
  keycloakInstance.onAuthSuccess = () => {
    console.log('Auth success');
    if (onAuthSuccess) onAuthSuccess(true);
  };
  
  keycloakInstance.onAuthLogout = () => {
    console.log('Auth logout');
    if (onAuthSuccess) onAuthSuccess(false);
  };
  
  keycloakInstance.onAuthError = (error) => {
    console.error('Auth error:', error);
    if (onAuthError) onAuthError(new Error('Authentication error'));
  };
  
  return keycloakInstance.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256'
  })
  .then(authenticated => {
    console.log('Keycloak initialized, authenticated:', authenticated);
    if (onAuthSuccess) onAuthSuccess(authenticated);
    return authenticated;
  })
  .catch(error => {
    console.error('Failed to initialize Keycloak:', error);
    if (onAuthError) onAuthError(error instanceof Error ? error : new Error(String(error)));
    throw error;
  });
};

const getKeycloak = (): Keycloak | null => {
  return keycloakInstance;
};

// Explicitly handle login/logout
const login = (): void => {
  if (keycloakInstance) {
    console.log("Attempting login");
    keycloakInstance.login();
  } else {
    console.error("Keycloak not initialized");
  }
};

const logout = (): void => {
  if (keycloakInstance) {
    console.log("Attempting logout");
    keycloakInstance.logout();
  } else {
    console.error("Keycloak not initialized");
  }
};

export { initKeycloak, getKeycloak, login, logout };