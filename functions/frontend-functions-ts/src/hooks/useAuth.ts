import { useState, useEffect } from 'react';
import entraExternalId from '../services/entra-external-id';
import { UserProfile } from '../types';

export interface UseAuthResult {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthResult => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await entraExternalId.initialize();
        const authenticated = entraExternalId.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const account = entraExternalId.getAccount();
          if (account) {
            setUser({
              sub: account.localAccountId || account.homeAccountId,
              name: account.name,
              email: account.username,
              given_name: account.name?.split(' ')[0],
              family_name: account.name?.split(' ')[1]
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      await entraExternalId.login();
      setIsAuthenticated(true);
      const account = entraExternalId.getAccount();
      if (account) {
        setUser({
          sub: account.localAccountId || account.homeAccountId,
          name: account.name,
          email: account.username,
          given_name: account.name?.split(' ')[0],
          family_name: account.name?.split(' ')[1]
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await entraExternalId.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};
