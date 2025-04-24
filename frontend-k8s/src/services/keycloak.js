import Keycloak from 'keycloak-js';

// Initialize Keycloak
let keycloakInstance = null;

// Create a Keycloak instance
const initKeycloak = (onAuthSuccess, onAuthError) => {
  if (keycloakInstance) {
    return Promise.resolve(keycloakInstance.authenticated);
  }

  // Make sure this URL matches your Keycloak server
  const keycloakConfig = {
    url: 'http://192.168.49.2:30387',  // Your Keycloak URL from minikube service keycloak-service --url
    realm: 'it-blog-realm',
    clientId: 'it-blog-client'
  };

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
    if (onAuthError) onAuthError(error);
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
    if (onAuthError) onAuthError(error);
    throw error;
  });
};

const getKeycloak = () => {
  return keycloakInstance;
};

// Explicitly handle login/logout
const login = () => {
  if (keycloakInstance) {
    console.log("Attempting login");
    keycloakInstance.login();
  } else {
    console.error("Keycloak not initialized");
  }
};

const logout = () => {
  if (keycloakInstance) {
    console.log("Attempting logout");
    keycloakInstance.logout();
  } else {
    console.error("Keycloak not initialized");
  }
};

export { initKeycloak, getKeycloak, login, logout };