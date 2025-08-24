"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function LikedArticles() {
  const [liked, setLiked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      console.log('Loading liked articles for user:', user.id)

      // Fetch liked article ids
      const { data: lk, error: lkError } = await supabase
        .from('article_likes')
        .select('article_id')
        .eq('user_id', user.id)

      if (lkError) console.error('Like fetch error:', lkError)

      const lkIds = (lk || []).map((r: any) => r.article_id)
      console.log('Like IDs:', lkIds)

      // Get liked articles (published only)
      const lkArticlesResp = lkIds.length 
        ? await supabase.from('articles').select('*').in('id', lkIds).eq('status','published')
        : { data: [] as any[] }

      console.log('Like articles response:', lkArticlesResp)

      setLiked((lkArticlesResp as any).data || [])
      setLoading(false)
    }
    void load()
  }, [])

  if (loading) return <div className="text-sm text-muted-foreground">Đang tải...</div>

  console.log('Rendering liked articles:', liked.length)

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold mb-3">Đã thích</h4>
        {liked.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có bài viết nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liked.map((a: any) => (
              <Link key={a.id} href={`/article/${a.id}`} className="flex space-x-3 p-3 border rounded hover:bg-muted/30">
                <Image src={a.image_url || a.featured_image_url || "/placeholder.svg"} alt={a.title} width={96} height={64} className="rounded object-cover" />
                <div>
                  <div className="text-sm font-medium line-clamp-2">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.category}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


