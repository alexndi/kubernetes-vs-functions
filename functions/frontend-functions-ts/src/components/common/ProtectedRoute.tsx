import React from 'react';
import { Navigate } from 'react-router-dom';

export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
  redirectTo = '/'
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
