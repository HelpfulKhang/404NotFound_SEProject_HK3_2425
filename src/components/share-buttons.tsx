"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Link as LinkIcon } from "lucide-react"

export default function ShareButtons() {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const title = typeof document !== 'undefined' ? document.title : 'VietNews'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {}
  }

  return (
    <div className="flex items-center space-x-2">
      <Button asChild variant="ghost" size="sm">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="ghost" size="sm" onClick={copy}>
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}


