// Main application types
export interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
}

export interface UserProfile {
  sub: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

export interface ApiResponse<T> {
  data?: T;
  posts?: T[];
  error?: string;
}
