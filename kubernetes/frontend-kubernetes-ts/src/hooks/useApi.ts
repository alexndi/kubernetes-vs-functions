// Custom hook for API calls with authentication
import { useState, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { BACKEND_URL } from '../utils/constants';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { keycloak, initialized } = useKeycloak();

  const makeRequest = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<T | null> => {
      if (!initialized) {
        setState(prev => ({ ...prev, error: 'Authentication not initialized' }));
        return null;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth token if available
      if (keycloak.authenticated && keycloak.token) {
        headers.Authorization = `Bearer ${keycloak.token}`;
      }

      try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [keycloak.authenticated, keycloak.token, initialized],
  );

  return {
    ...state,
    makeRequest,
    isAuthenticated: keycloak.authenticated,
    isInitialized: initialized,
  };
}

export default useApi;
