import { useState, useCallback } from 'react';
import entraExternalId from '../services/entra-external-id';
import { BACKEND_URL } from '../utils/constants';
import { createAuthHeaders, handleApiError } from '../utils/helpers';

export interface UseApiOptions {
  isAuthenticated?: boolean;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (url: string, options?: RequestInit) => Promise<T | null>;
}

export const useApi = <T>({ isAuthenticated = false }: UseApiOptions = {}): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (url: string, options: RequestInit = {}): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      let headers = createAuthHeaders();
      
      if (isAuthenticated) {
        const token = await entraExternalId.getToken();
        if (token) {
          headers = createAuthHeaders(token);
        }
      }

      const response = await fetch(`${BACKEND_URL}${url}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return { data, loading, error, fetchData };
};
