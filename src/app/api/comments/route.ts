import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Support both JSON and form submissions
    const contentType = req.headers.get('content-type') || ''
    let articleId: string | null = null
    let content: string | null = null

    if (contentType.includes('application/json')) {
      const body = await req.json()
      articleId = body.articleId
      content = body.content
    } else {
      const form = await req.formData()
      articleId = (form.get('articleId') as string) || null
      content = (form.get('content') as string) || null
    }

    if (!articleId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let userName = user.email?.split('@')[0] || 'Người dùng'
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.full_name) userName = profile.full_name

    const { error } = await supabase
      .from('comments')
      .insert({ article_id: articleId, user_id: user.id, user_name: userName, content: content.trim() })
    if (error) throw error

    // If form submit, redirect back to the article page
    if (!contentType.includes('application/json')) {
      const url = new URL(req.url)
      url.pathname = `/article/${articleId}`
      return NextResponse.redirect(url, { status: 303 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


