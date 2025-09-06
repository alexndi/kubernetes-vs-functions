// Application constants and configuration
export const BACKEND_URL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:7071/api';

export const CATEGORIES = {
  PROGRAMMING: 'programming',
  DEVOPS: 'devops',
  CLOUD: 'cloud',
  SECURITY: 'security'
} as const;

export const CATEGORY_LABELS = {
  [CATEGORIES.PROGRAMMING]: 'Programming',
  [CATEGORIES.DEVOPS]: 'DevOps',
  [CATEGORIES.CLOUD]: 'Cloud',
  [CATEGORIES.SECURITY]: 'Security'
} as const;

export const CATEGORY_DESCRIPTIONS = {
  [CATEGORIES.PROGRAMMING]: 'Articles about languages, frameworks, and software development best practices',
  [CATEGORIES.DEVOPS]: 'Continuous integration, deployment, and modern operational practices',
  [CATEGORIES.CLOUD]: 'Cloud platforms, services, architectures, and deployment strategies',
  [CATEGORIES.SECURITY]: 'Application security, secure coding practices, and threat mitigation'
} as const;

export const ROUTES = {
  HOME: '/',
  CATEGORY: '/category/:categoryName',
  POST: '/post/:postId',
  PROFILE: '/profile'
} as const;

export const AUTH_SCOPES = ['openid', 'profile', 'email'] as const;

export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];
