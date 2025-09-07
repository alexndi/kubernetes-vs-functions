import React from 'react';
import { UserProfile } from '../../types';

export interface AppFooterProps {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export const AppFooter: React.FC<AppFooterProps> = ({ isAuthenticated, user }) => {
  return (
    <footer>
      <p>DevInsights Blog - Azure Functions Edition</p>
      <p className="server-info">
        Server: Azure Functions | Auth: {isAuthenticated ? user?.name || 'Authenticated via Entra External ID' : 'Anonymous'}
      </p>
    </footer>
  );
};

export default AppFooter;
