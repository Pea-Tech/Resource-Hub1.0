export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type ResourceCategory = 
  | 'ai_tools'
  | 'video'
  | 'audio'
  | 'article'
  | 'web_link'
  | 'other';

export interface Review {
  id: string;
  resource_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}