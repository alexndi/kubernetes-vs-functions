// Global constants for the application
export const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  POSTS: (category: string) => `/api/posts/${category}`,
  POST_DETAIL: (id: string) => `/api/post/${id}`,
  CATEGORIES: '/api/categories',
  USER_PROFILE: '/api/user/profile',
  AUTH_CONFIG: '/api/auth/config',
} as const;

export const CATEGORIES = [
  { id: 'programming', name: 'Programming', description: 'Articles about languages, frameworks, and software development best practices' },
  { id: 'devops', name: 'DevOps', description: 'Continuous integration, deployment, and modern operational practices' },
  { id: 'cloud', name: 'Cloud', description: 'Cloud platforms, services, architectures, and deployment strategies' },
  { id: 'security', name: 'Security', description: 'Application security, secure coding practices, and threat mitigation' },
] as const;

export const ROUTES = {
  HOME: '/',
  CATEGORY: '/category/:categoryName',
  POST: '/post/:postId',
  PROFILE: '/profile',
} as const;
