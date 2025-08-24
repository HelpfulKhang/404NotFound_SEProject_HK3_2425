import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const { data: cat } = await supabase
    .from('categories')
    .select('name, slug, description')
    .eq('slug', decodedSlug)
    .maybeSingle()

  if (!cat) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Danh mục không tồn tại</h1>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', cat.name)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Lỗi khi tải danh mục</h1>
      </div>
    )
  }

  const articles = data || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{cat.name}</h1>
        {cat.description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{cat.description}</p>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
          <Image src="/placeholder.svg" alt="empty" width={96} height={96} className="opacity-60 mb-4" />
          <h2 className="text-xl font-semibold">Chưa có bài viết nào trong danh mục này</h2>
          <p className="text-sm text-muted-foreground mt-1">Quay lại trang chủ để xem các bài viết mới nhất.</p>
          <Button asChild className="mt-5">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Featured hero */}
          <Link href={`/article/${articles[0].id}`} className="block">
            <div className="relative mb-8 overflow-hidden rounded-xl group">
              <Image
                src={articles[0].image_url || (articles[0] as any).featured_image_url || "/placeholder.svg"}
                alt={articles[0].title}
                width={1200}
                height={500}
                className="w-full h-[320px] md:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <Badge variant="secondary" className="mb-3">{articles[0].category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight line-clamp-2">
                  {articles[0].title}
                </h2>
                {articles[0].excerpt && (
                  <p className="mt-2 text-sm md:text-base text-white/90 line-clamp-2 max-w-3xl">
                    {articles[0].excerpt}
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* Rest of articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(1).map((article) => (
              <Card key={article.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={article.image_url || (article as any).featured_image_url || "/placeholder.svg"}
                    alt={article.title}
                    width={400}
                    height={240}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/article/${article.id}`}>{article.title}</Link>
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


