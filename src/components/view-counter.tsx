"use client"

import { useEffect, useRef } from "react"
import { incrementViews } from "@/lib/articles"

type ViewCounterProps = {
  articleId: string
}

export default function ViewCounter({ articleId }: ViewCounterProps) {
  const incrementedRef = useRef(false)

  useEffect(() => {
    if (incrementedRef.current) return
    incrementedRef.current = true

    // Fire and forget; errors are non-blocking
    void incrementViews(articleId)
  }, [articleId])

  return null
}


