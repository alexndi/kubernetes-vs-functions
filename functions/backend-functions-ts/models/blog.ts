// models/blog.ts

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
    userCanComment?: boolean;
  }
  
  export interface PostsByCategory {
    category: string;
    posts: BlogPost[];
    timestamp: string;
    userInfo?: {
      isAuthenticated: boolean;
      displayName: string;
    };
  }
  
  export interface PostError {
    error: string;
    availableCategories?: string[];
    timestamp?: string;
  }
  
  export interface PostDetail extends BlogPost {
    timestamp: string;
  }
  
  export interface ApiEndpoints {
    getAllCategories: string;
    getPostsByCategory: string;
    getPostById: string;
    health: string;
  }
  
  export interface ApiResponseMessage {
    message: string;
    endpoints: ApiEndpoints;
  }