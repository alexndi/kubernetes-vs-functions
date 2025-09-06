// Custom hook for user profile management
import { useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { UserProfile } from '../types';
import { API_ENDPOINTS } from '../utils/constants';
import { useApi } from './useApi';

export function useUserProfile() {
  const { keycloak } = useKeycloak();
  const { makeRequest, loading, error, data } = useApi<UserProfile>();

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!keycloak.authenticated || !keycloak.token) {
      return null;
    }

    // Check if token is expired and refresh if needed
    try {
      if (keycloak.isTokenExpired()) {
        await keycloak.updateToken(30);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }

    return await makeRequest(API_ENDPOINTS.USER_PROFILE);
  }, [makeRequest, keycloak]);

  return {
    userProfile: data,
    fetchUserProfile,
    loading,
    error,
    isAuthenticated: keycloak.authenticated,
  };
}

export default useUserProfile;
