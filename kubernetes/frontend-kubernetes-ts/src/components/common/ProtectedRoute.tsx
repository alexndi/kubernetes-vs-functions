// Protected Route component
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div className="loading">Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
