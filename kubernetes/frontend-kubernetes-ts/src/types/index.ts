// Frontend type definitions
export interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
  userCanComment?: boolean;
}

export interface UserProfile {
  user: {
    sub: string;
    preferred_username?: string;
    name?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: {
      roles: string[];
    };
  };
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PostsResponse {
  posts: Post[];
  category: string;
  userInfo?: {
    isAuthenticated: boolean;
    displayName: string;
  };
}
