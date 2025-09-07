// Custom hook for posts-related API calls
import { useCallback } from 'react';
import { Post, PostsResponse } from '../types';
import { API_ENDPOINTS } from '../utils/constants';
import { useApi } from './useApi';

export function usePosts() {
  const { makeRequest, loading, error, isAuthenticated } = useApi<PostsResponse>();

  const fetchPostsByCategory = useCallback(
    async (category: string): Promise<PostsResponse | null> => {
      return await makeRequest(API_ENDPOINTS.POSTS(category));
    },
    [makeRequest],
  );

  return {
    fetchPostsByCategory,
    loading,
    error,
    isAuthenticated,
  };
}

export function usePostDetail() {
  const { makeRequest, loading, error, isAuthenticated } = useApi<Post>();

  const fetchPostDetail = useCallback(
    async (postId: string): Promise<Post | null> => {
      return await makeRequest(API_ENDPOINTS.POST_DETAIL(postId));
    },
    [makeRequest],
  );

  return {
    fetchPostDetail,
    loading,
    error,
    isAuthenticated,
  };
}
