import { useState, useEffect } from 'react';
import { Post } from '../types';
import { useApi } from './useApi';

export interface UsePostResult {
  post: Post | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePost = (postId: string, isAuthenticated: boolean): UsePostResult => {
  const [post, setPost] = useState<Post | null>(null);
  const { loading, error, fetchData } = useApi<Post>({ isAuthenticated });

  const fetchPost = async (): Promise<void> => {
    if (!postId) return;

    const result = await fetchData(`/post/${postId}`);
    if (result) {
      setPost(result);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId, isAuthenticated]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
};
