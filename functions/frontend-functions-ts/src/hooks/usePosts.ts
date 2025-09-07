import { useState, useEffect } from 'react';
import { Post } from '../types';
import { useApi } from './useApi';

export interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePosts = (category: string, isAuthenticated: boolean): UsePostsResult => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { loading, error, fetchData } = useApi<{ posts: Post[] }>({ isAuthenticated });

  const fetchPosts = async (): Promise<void> => {
    if (!category) return;

    const result = await fetchData(`/posts/${category}`);
    if (result) {
      setPosts(result.posts || []);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, isAuthenticated]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
};
