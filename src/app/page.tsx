"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, MessageCircle, TrendingUp, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getArticles, getFeaturedArticle, getTrendingArticles } from "@/lib/articles"
import { getFilteredArticles } from "@/lib/articles-filter"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import FilterSidebar, { FilterOptions } from "@/components/filter-sidebar"

export default function HomePage() {
  const [articles, setArticles] = useState<any[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<any>(null)
  const [trendingArticles, setTrendingArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    authors: [],
    dateFrom: undefined,
    dateTo: undefined,
    keyword: ''
  })
  const [filteredArticles, setFilteredArticles] = useState<any[]>([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const [articlesResp, featuredResp, trendingResp, categoriesResp] = await Promise.all([
          getArticles(10),
          getFeaturedArticle(),
          getTrendingArticles(5),
          supabase.from('categories').select('name').eq('is_active', true).order('name')
        ])

        setArticles(articlesResp.data || [])
        setFeaturedArticle(featuredResp.data)
        setTrendingArticles(trendingResp.data || [])
        setCategories(categoriesResp.data || [])
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Apply filters
  const handleApplyFilters = async () => {
    const hasFilters = filters.categories.length > 0 ||
                      filters.tags.length > 0 ||
                      filters.authors.length > 0 ||
                      filters.dateFrom ||
                      filters.dateTo ||
                      filters.keyword.trim() !== ''

    if (hasFilters) {
      setLoading(true)
      try {
        const { data } = await getFilteredArticles(filters, 20, 0)
        setFilteredArticles(data || [])
        setIsFiltered(true)
      } catch (error) {
        console.error('Error applying filters:', error)
      } finally {
        setLoading(false)
      }
    } else {
      setFilteredArticles([])
      setIsFiltered(false)
    }
  }

  // Get current articles to display
  const currentArticles = isFiltered ? filteredArticles : articles
  const gridArticles = currentArticles.filter((a) => !featuredArticle || a.id !== featuredArticle.id)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={filterSidebarOpen}
          onClose={() => setFilterSidebarOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
        />

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header with Filter Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tin tức mới nhất</h1>
              {isFiltered && (
                <div className="mt-1">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {filteredArticles.length} kết quả được lọc
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.categories.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        Danh mục: {cat}
                      </Badge>
                    ))}
                    {filters.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        Thẻ: {tag}
                      </Badge>
                    ))}
                    {filters.authors.map(author => (
                      <Badge key={author} variant="secondary" className="text-xs">
                        Tác giả: {author}
                      </Badge>
                    ))}
                    {filters.keyword && (
                      <Badge variant="secondary" className="text-xs">
                        Từ khóa: {filters.keyword}
                      </Badge>
                    )}
                    {(filters.dateFrom || filters.dateTo) && (
                      <Badge variant="secondary" className="text-xs">
                        Thời gian: {filters.dateFrom ? filters.dateFrom.toLocaleDateString('vi-VN') : ''} - {filters.dateTo ? filters.dateTo.toLocaleDateString('vi-VN') : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      categories: [],
                      tags: [],
                      authors: [],
                      dateFrom: undefined,
                      dateTo: undefined,
                      keyword: ''
                    })
                    setIsFiltered(false)
                  }}
                  className="text-xs"
                >
                  Xóa tất cả bộ lọc
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
                className="hidden lg:flex"
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterSidebarOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilterSidebarOpen(true)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Article */}
              {featuredArticle && !isFiltered && (
                <Card className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={featuredArticle.image_url || (featuredArticle as any).featured_image_url || "/placeholder.svg"}
                      alt={featuredArticle.title}
                      width={800}
                      height={400}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">{featuredArticle.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                      <Link href={`/article/${featuredArticle.id}`} className="hover:text-primary transition-colors">
                        {featuredArticle.title}
                      </Link>
                    </h1>
                    <p className="text-muted-foreground mb-4 text-lg leading-relaxed">{featuredArticle.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(featuredArticle.published_at), { locale: vi, addSuffix: true })}</span>
                          <span>•</span>
                          <span>{featuredArticle.read_time} phút đọc</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{featuredArticle.views}</span>
                          </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{(featuredArticle as any).comments_count ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Article Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={article.image_url || (article as any).featured_image_url || "/placeholder.svg"}
                        alt={article.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/article/${article.id}`}>{article.title}</Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-end text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{(article as any).comments_count ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {isFiltered && filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-muted-foreground mb-4">
                    Không có bài viết nào phù hợp với bộ lọc đã chọn
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        categories: [],
                        tags: [],
                        authors: [],
                        dateFrom: undefined,
                        dateTo: undefined,
                        keyword: ''
                      })
                      setIsFiltered(false)
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}

              {/* Category filters */}
              {!isFiltered && (
                <div className="flex flex-wrap gap-2">
                  {(categories || []).map((c) => (
                    <Link key={c.name} href={`/category/${encodeURIComponent(c.name.toLowerCase())}`} className="text-sm px-3 py-1 border rounded-full hover:bg-muted">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending (most viewed) */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Đọc nhiều</h3>
                  </div>
                  <div className="space-y-3">
                    {(trendingArticles || []).map((a, index) => (
                      <div key={a.id} className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">{index + 1}</span>
                        <Link href={`/article/${a.id}`} className="text-sm hover:text-primary transition-colors">
                          {a.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Read */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Đọc nhiều nhất</h3>
                  <div className="space-y-4">
                    {(trendingArticles || []).map((article, index) => (
                      <div key={article.id} className="flex space-x-3">
                        <span className="text-lg font-bold text-primary w-6">{index + 1}</span>
                        <div className="flex-1">
                          <Link
                            href={`/article/${article.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {article.title}
                          </Link>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
