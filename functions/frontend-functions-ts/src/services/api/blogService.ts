import { Post } from '../../types';
import { BACKEND_URL } from '../../utils/constants';
import { createAuthHeaders, handleApiError } from '../../utils/helpers';
import entraExternalId from '../entra-external-id';

export interface BlogApiService {
  getPosts: (category: string, isAuthenticated?: boolean) => Promise<Post[]>;
  getPost: (postId: string, isAuthenticated?: boolean) => Promise<Post>;
}

class BlogApiServiceImpl implements BlogApiService {
  async getPosts(category: string, isAuthenticated = false): Promise<Post[]> {
    try {
      let headers = createAuthHeaders();
      
      if (isAuthenticated) {
        const token = await entraExternalId.getToken();
        if (token) {
          headers = createAuthHeaders(token);
        }
      }

      const response = await fetch(`${BACKEND_URL}/posts/${category}`, { headers });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getPost(postId: string, isAuthenticated = false): Promise<Post> {
    try {
      let headers = createAuthHeaders();
      
      if (isAuthenticated) {
        const token = await entraExternalId.getToken();
        if (token) {
          headers = createAuthHeaders(token);
        }
      }

      const response = await fetch(`${BACKEND_URL}/post/${postId}`, { headers });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const blogApiService = new BlogApiServiceImpl();
export default blogApiService;
