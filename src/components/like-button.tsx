"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { hasUserLikedArticle, likeArticle, unlikeArticle } from "@/lib/articles-management"
import { useRouter } from "next/navigation"

type LikeButtonProps = {
  articleId: string
  initialCount?: number
}

export default function LikeButton({ articleId, initialCount = 0 }: LikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { liked } = await hasUserLikedArticle(articleId)
      setLiked(liked)
    }
    void load()
  }, [articleId])

  const toggle = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const url = new URL(window.location.href)
        router.push(`/auth?redirectTo=${encodeURIComponent(url.pathname + url.search)}`)
        return
      }
      if (liked) {
        const { error } = await unlikeArticle(articleId)
        if (!error) {
          setLiked(false)
          setCount((c) => Math.max(0, c - 1))
        }
      } else {
        const { error } = await likeArticle(articleId)
        if (!error) {
          setLiked(true)
          setCount((c) => c + 1)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={liked ? "default" : "outline"} size="sm" onClick={toggle} disabled={loading}>
      <ThumbsUp className="h-4 w-4 mr-2" />
      {count}
    </Button>
  )
}


