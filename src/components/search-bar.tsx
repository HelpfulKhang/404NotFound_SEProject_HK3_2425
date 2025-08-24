"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  excerpt: string
  category: string
  image_url?: string
  featured_image_url?: string
  published_at: string
  author_name: string
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, excerpt, category, image_url, featured_image_url, published_at, author_name')
        .eq('status', 'published')
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Search error:', error)
        setResults([])
      } else {
        setResults(data || [])
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchPerformed(true)
      setShowDropdown(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    setQuery("")
    setShowDropdown(false)
    router.push(`/article/${result.id}`)
  }

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true)
            }}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setQuery("")
                setResults([])
                setShowDropdown(false)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button type="submit" className="sr-only">
          Tìm kiếm
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Đang tìm kiếm...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex space-x-3">
                      <Image
                        src={result.image_url || result.featured_image_url || "/placeholder.svg"}
                        alt={result.title}
                        width={60}
                        height={40}
                        className="rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 mb-1">
                          {result.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {result.excerpt}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.published_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {query.trim() && (
                  <div className="px-4 py-2 border-t">
                    <Link
                      href={`/search?q=${encodeURIComponent(query.trim())}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Xem tất cả kết quả cho "{query}"
                    </Link>
                  </div>
                )}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Không tìm thấy kết quả</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
