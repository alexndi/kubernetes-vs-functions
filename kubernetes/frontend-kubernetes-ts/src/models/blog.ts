// src/models/blog.ts

export interface Tag {
  readonly [key: string]: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
  timestamp?: string;
  userCanComment?: boolean;
}

export interface PostsResponse {
  category: string;
  posts: BlogPost[];
  timestamp: string;
  userInfo?: {
    isAuthenticated: boolean;
    displayName: string;
  };
  error?: string;
  availableCategories?: string[];
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
