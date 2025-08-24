import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'vietnews-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types for TypeScript
export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  author_id: string
  author_name: string
  published_at: string
  read_time: number
  views: number
  comments_count: number
  image_url?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'archived'
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  featured_image_url?: string
  image_caption?: string
  tags?: string[]
  seo_title?: string
  seo_description?: string
  word_count: number
  created_at: string
  updated_at: string
}

export interface ArticleImage {
  id: string
  article_id: string
  image_url: string
  image_caption?: string
  alt_text?: string
  display_order: number
  is_featured: boolean
  created_at: string
}

export interface ArticleApprovalHistory {
  id: string
  article_id: string
  reviewer_id: string
  reviewer_name: string
  action: 'submitted' | 'approved' | 'rejected' | 'requested_changes'
  status_from: string
  status_to: string
  comments?: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'reader' | 'writer' | 'editor' | 'admin'
  bio?: string
  website?: string
  location?: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'reader' | 'writer' | 'editor' | 'admin'
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  article_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}
