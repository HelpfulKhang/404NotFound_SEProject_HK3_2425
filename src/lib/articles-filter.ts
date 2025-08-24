import { supabase } from "@/lib/supabase"
import { FilterOptions } from "@/components/filter-sidebar"

export async function getFilteredArticles(filters: FilterOptions, limit = 20, offset = 0) {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')

  // Apply category filter
  if (filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  // Apply author filter
  if (filters.authors.length > 0) {
    query = query.in('author_name', filters.authors)
  }

  // Apply date range filter
  if (filters.dateFrom) {
    query = query.gte('published_at', filters.dateFrom.toISOString())
  }
  if (filters.dateTo) {
    // Add one day to include the end date
    const endDate = new Date(filters.dateTo)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lt('published_at', endDate.toISOString())
  }

  // Apply keyword search
  if (filters.keyword.trim()) {
    const keyword = filters.keyword.trim()
    query = query.or(`title.ilike.%${keyword}%,excerpt.ilike.%${keyword}%,content.ilike.%${keyword}%`)
  }

  // Apply ordering and pagination
  query = query.order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered articles:', error)
    return { data: [], error }
  }

  // Apply tag filter in memory (since Supabase doesn't support array contains for OR operations)
  let filteredData = data || []
  if (filters.tags.length > 0) {
    filteredData = filteredData.filter(article => {
      const articleTags = article.tags || []
      return filters.tags.some(tag => articleTags.includes(tag))
    })
  }

  return { data: filteredData, error: null }
}

export async function getFilteredArticlesCount(filters: FilterOptions) {
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Apply category filter
  if (filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  // Apply author filter
  if (filters.authors.length > 0) {
    query = query.in('author_name', filters.authors)
  }

  // Apply date range filter
  if (filters.dateFrom) {
    query = query.gte('published_at', filters.dateFrom.toISOString())
  }
  if (filters.dateTo) {
    const endDate = new Date(filters.dateTo)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lt('published_at', endDate.toISOString())
  }

  // Apply keyword search
  if (filters.keyword.trim()) {
    const keyword = filters.keyword.trim()
    query = query.or(`title.ilike.%${keyword}%,excerpt.ilike.%${keyword}%,content.ilike.%${keyword}%`)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error fetching filtered articles count:', error)
    return { count: 0, error }
  }

  // Note: Tag filtering count would need to be done separately since we can't easily count
  // articles that match tag criteria in a single query
  return { count: count || 0, error: null }
}
