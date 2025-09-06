// Main App component - Restructured and cleaned up
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './services/keycloak';
import { LoadingComponent, Layout } from './components';
import './App.css';

// Main App component
function App() {
  // Keycloak initialization options
  const initOptions = {
    onLoad: 'check-sso' as const,
    pkceMethod: 'S256' as const,
    checkLoginIframe: false,
    flow: 'standard' as const,
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={initOptions}
      LoadingComponent={LoadingComponent}
    >
      <Router>
        <div className="App kubernetes-theme">
          <Layout />
        </div>
      </Router>
    </ReactKeycloakProvider>
  );
}

export default App;