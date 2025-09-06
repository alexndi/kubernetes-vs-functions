// Footer component
import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

function AppFooter() {
  const { keycloak } = useKeycloak();

  return (
    <footer>
      <p>DevInsights Blog - Kubernetes Edition</p>
      <p className="server-info">
        Server: Kubernetes Cluster | Auth:{' '}
        {keycloak.authenticated
          ? keycloak.tokenParsed?.preferred_username || 'Authenticated'
          : 'Anonymous'}
      </p>
    </footer>
  );
}

export default AppFooter;
