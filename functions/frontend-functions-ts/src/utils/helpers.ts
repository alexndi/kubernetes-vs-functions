import { CATEGORIES } from './constants';

// Helper functions for common operations
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const getCategoryFromTags = (tags: string[]): string => {
  const categories = Object.values(CATEGORIES);
  const foundCategory = categories.find(cat => tags.includes(cat));
  return foundCategory || CATEGORIES.PROGRAMMING;
};

export const createAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
