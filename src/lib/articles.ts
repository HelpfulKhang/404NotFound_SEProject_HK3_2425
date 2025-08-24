import { supabase } from './supabase'
import { Article } from './supabase'

export async function getArticles(limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return { data, error }
}

export async function getArticleById(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function getArticlesByCategory(category: string, limit = 10) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function searchArticles(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views' | 'comments_count'>) {
  const { data, error } = await supabase
    .from('articles')
    .insert([article])
    .select()
    .single()
  
  return { data, error }
}

export async function updateArticle(id: string, updates: Partial<Article>) {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteArticle(id: string) {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
  
  return { error }
}

export async function incrementViews(id: string) {
  // Prefer secure RPC (defined in SQL) to increment views atomically
  const { error } = await supabase.rpc('increment_views', { article_uuid: id })
  return { error }
}

export async function getTrendingArticles(limit = 5) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function getFeaturedArticle() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}
