import { supabase } from './supabase'
import { Article, ArticleImage } from './supabase'

// =====================================================
// ARTICLE CREATION AND MANAGEMENT
// =====================================================

export interface CreateArticleData {
  title: string
  content: string
  excerpt: string
  category: string
  featured_image_url?: string
  image_caption?: string
  tags?: string[]
  seo_title?: string
  seo_description?: string
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string
}

export interface ArticleWithImages extends Article {
  images?: ArticleImage[]
}

// Create a new article
function getWordCountFromHtml(html: string): number {
  try {
    const tmp = typeof window !== 'undefined' ? document.createElement('div') : null
    if (!tmp) {
      // Fallback on server environments
      const stripped = html.replace(/<[^>]*>/g, ' ')
      return stripped.split(/\s+/).filter(Boolean).length
    }
    tmp.innerHTML = html
    const text = tmp.textContent || tmp.innerText || ''
    return text.split(/\s+/).filter(Boolean).length
  } catch {
    return html.split(/\s+/).filter(Boolean).length
  }
}

export async function createArticle(data: CreateArticleData): Promise<{ data: Article | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const articleData = {
      ...data,
      author_id: user.id,
      author_name: profile?.full_name || user.email?.split('@')[0] || 'Unknown Author',
      status: 'draft',
      word_count: getWordCountFromHtml(data.content)
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return { data: null, error }
    }

    return { data: article, error: null }
  } catch (error) {
    console.error('Error creating article:', error)
    return { data: null, error }
  }
}

// Update an article
export async function updateArticle(data: UpdateArticleData): Promise<{ data: Article | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const updateData = {
      ...data,
      word_count: data.content ? getWordCountFromHtml(data.content) : undefined
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
      return { data: null, error }
    }

    return { data: article, error: null }
  } catch (error) {
    console.error('Error updating article:', error)
    return { data: null, error }
  }
}

// Get article by ID with images
export async function getArticleById(id: string): Promise<{ data: ArticleWithImages | null; error: any }> {
  try {
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (articleError) {
      return { data: null, error: articleError }
    }

    // Get article images
    const { data: images, error: imagesError } = await supabase
      .from('article_images')
      .select('*')
      .eq('article_id', id)
      .order('display_order')

    if (imagesError) {
      console.error('Error fetching article images:', imagesError)
    }

    return {
      data: {
        ...article,
        images: images || []
      },
      error: null
    }
  } catch (error) {
    console.error('Error getting article:', error)
    return { data: null, error }
  }
}

// Get user's articles
export async function getUserArticles(status?: string): Promise<{ data: Article[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    let query = supabase
      .from('articles')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching user articles:', error)
      return { data: null, error }
    }

    return { data: articles, error: null }
  } catch (error) {
    console.error('Error fetching user articles:', error)
    return { data: null, error }
  }
}

// =====================================================
// ARTICLE APPROVAL WORKFLOW
// =====================================================

// Submit article for review
export async function submitArticleForReview(articleId: string): Promise<{ data: any; error: any }> {
  try {
    // Try RPC first
    const { data, error } = await supabase
      .rpc('submit_article_for_review', { article_uuid: articleId })

    if (!error && data) {
      return { data, error: null }
    }

    // Fallback: direct update with RLS (requires writer to be the author)
    console.warn('RPC submit_article_for_review failed or returned falsy. Falling back to direct update.', error)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ status: 'pending', submitted_at: new Date().toISOString() })
      .eq('id', articleId)
      .eq('author_id', user.id)

    if (updateError) {
      console.error('Fallback update error submitting article for review:', updateError)
      // Double-check status in case DB updated despite error shape
      const { data: checkArticle } = await supabase
        .from('articles')
        .select('id,status,submitted_at')
        .eq('id', articleId)
        .single()

      if (checkArticle && (checkArticle as any).status === 'pending') {
        return { data: checkArticle, error: null }
      }

      return { data: null, error: updateError }
    }

    return { data: { id: articleId, status: 'pending' }, error: null }
  } catch (error) {
    console.error('Error submitting article for review:', error)
    return { data: null, error }
  }
}

// Get pending articles (for editors)
export async function getPendingArticles(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('pending_articles')
      .select('*')
      .order('submitted_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending articles:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching pending articles:', error)
    return { data: null, error }
  }
}

// Approve article (for editors)
export async function approveArticle(articleId: string): Promise<{ data: any; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .rpc('approve_article', { 
        article_uuid: articleId, 
        reviewer_uuid: user.id 
      })

    if (error) {
      console.error('Error approving article:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error approving article:', error)
    return { data: null, error }
  }
}

// Reject article (for editors)
export async function rejectArticle(articleId: string, reason: string): Promise<{ data: any; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .rpc('reject_article', { 
        article_uuid: articleId, 
        reviewer_uuid: user.id, 
        reason: reason 
      })

    if (error) {
      console.error('Error rejecting article:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error rejecting article:', error)
    return { data: null, error }
  }
}

// Publish article (for editors)
export async function publishArticle(articleId: string): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase
      .rpc('publish_article', { article_uuid: articleId })

    if (error) {
      console.error('Error publishing article:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error publishing article:', error)
    return { data: null, error }
  }
}

// =====================================================
// IMAGE UPLOAD AND MANAGEMENT
// =====================================================

// Upload article image
export async function uploadArticleImage(
  articleId: string, 
  file: File, 
  caption?: string, 
  altText?: string
): Promise<{ data: any; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${articleId}/${Date.now()}.${fileExt}`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { data: null, error: uploadError }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName)

    // Save image record to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('article_images')
      .insert({
        article_id: articleId,
        image_url: publicUrl,
        image_caption: caption,
        alt_text: altText,
        display_order: 0
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving image record:', dbError)
      return { data: null, error: dbError }
    }

    return { data: imageRecord, error: null }
  } catch (error) {
    console.error('Error uploading article image:', error)
    return { data: null, error }
  }
}

// Upload a featured image before the article exists. Returns a public URL only.
export async function uploadFeaturedImage(
  file: File
): Promise<{ publicUrl: string | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { publicUrl: null, error: { message: 'User not authenticated' } }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/featured-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Error uploading featured image:', uploadError)
      return { publicUrl: null, error: uploadError }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName)

    return { publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading featured image:', error)
    return { publicUrl: null, error }
  }
}

// Get article images
export async function getArticleImages(articleId: string): Promise<{ data: ArticleImage[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('article_images')
      .select('*')
      .eq('article_id', articleId)
      .order('display_order')

    if (error) {
      console.error('Error fetching article images:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching article images:', error)
    return { data: null, error }
  }
}

// Delete article image
export async function deleteArticleImage(imageId: string): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('article_images')
      .delete()
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      console.error('Error deleting article image:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error deleting article image:', error)
    return { data: null, error }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Get article statistics
export async function getArticleStats(): Promise<{ data: any; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .from('article_approval_stats')
      .select('*')
      .eq('author_name', user.email?.split('@')[0] || 'Unknown')

    if (error) {
      console.error('Error fetching article stats:', error)
      return { data: null, error }
    }

    return { data: data[0] || null, error: null }
  } catch (error) {
    console.error('Error fetching article stats:', error)
    return { data: null, error }
  }
}

// Get categories
export async function getCategories(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error }
  }
}

// =====================================================
// COMMENTS & LIKES
// =====================================================

export async function getComments(articleId: string): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function addComment(articleId: string, content: string): Promise<{ data: any | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: { message: 'User not authenticated' } }

    const userName = user.email?.split('@')[0] || 'Người dùng'
    const { data, error } = await supabase
      .from('comments')
      .insert({ article_id: articleId, user_id: user.id, user_name: userName, content })
      .select('*')
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getArticleLikesCount(articleId: string): Promise<{ count: number; error: any }> {
  try {
    const { count, error } = await supabase
      .from('article_likes')
      .select('id', { count: 'exact', head: true })
      .eq('article_id', articleId)
    return { count: count ?? 0, error }
  } catch (error) {
    return { count: 0, error }
  }
}

export async function hasUserLikedArticle(articleId: string): Promise<{ liked: boolean; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { liked: false, error: null }
    const { data, error } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .limit(1)
    return { liked: !!(data && data.length > 0), error }
  } catch (error) {
    return { liked: false, error }
  }
}

export async function likeArticle(articleId: string): Promise<{ error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: { message: 'User not authenticated' } }
    const { error } = await supabase
      .from('article_likes')
      .insert({ article_id: articleId, user_id: user.id })
    return { error }
  } catch (error) {
    return { error }
  }
}

export async function unlikeArticle(articleId: string): Promise<{ error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: { message: 'User not authenticated' } }
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', user.id)
    return { error }
  } catch (error) {
    return { error }
  }
}