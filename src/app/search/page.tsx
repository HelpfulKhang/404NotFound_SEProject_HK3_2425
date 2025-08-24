import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import SearchBar from "@/components/search-bar"

interface SearchPageProps {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  
  let results: any[] = []
  let totalResults = 0

  if (query.trim()) {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, category, image_url, featured_image_url, published_at, author_name, views, comments_count')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })

    if (!error && data) {
      results = data
      totalResults = data.length
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Tìm kiếm</h1>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-md">
            <SearchBar />
          </div>

          {/* Search Results Info */}
          {query && (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                {totalResults > 0 
                  ? `Tìm thấy ${totalResults} kết quả cho "${query}"`
                  : `Không tìm thấy kết quả nào cho "${query}"`
                }
              </p>
              {totalResults === 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        {query && (
          <div className="space-y-6">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <Card key={article.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={article.image_url || article.featured_image_url || "/placeholder.svg"}
                        alt={article.title}
                        width={400}
                        height={240}
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
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(article.published_at), { 
                              locale: vi, 
                              addSuffix: true 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{article.comments_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted-foreground mb-4">
                  Không có bài viết nào phù hợp với từ khóa "{query}"
                </p>
                <Button asChild>
                  <Link href="/">Về trang chủ</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Search Query */}
        {!query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nhập từ khóa để tìm kiếm</h3>
            <p className="text-muted-foreground">
              Tìm kiếm trong hàng nghìn bài viết của chúng tôi
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
