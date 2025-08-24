"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

export default function CommentForm({ articleId }: { articleId: string }) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const ret = encodeURIComponent(`/article/${articleId}`)
        router.push(`/auth?redirectTo=${ret}`)
        return
      }

      let userName = user.email?.split('@')[0] || 'Người dùng'
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
      if ((profile as any)?.full_name) userName = (profile as any).full_name

      const { error } = await supabase
        .from('comments')
        .insert({ article_id: articleId, user_id: user.id, user_name: userName, content: content.trim() })
      if (error) throw error
      setContent("")
      router.refresh()
    } catch (err) {
      // optionally show toast
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea
        name="content"
        placeholder="Viết bình luận của bạn..."
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi bình luận'}</Button>
      </div>
    </form>
  )
}


