import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import CommentForm from "@/components/comment-form"
import {
  Clock,
  Eye,
  MessageCircle,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Facebook,
  Twitter,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ViewCounter from "@/components/view-counter"

import { getArticleById, getComments, addComment, hasUserLikedArticle, likeArticle, unlikeArticle, getArticleLikesCount } from "@/lib/articles-management"
import { supabase } from "@/lib/supabase"
import ShareButtons from "@/components/share-buttons"
import LikeButton from "@/components/like-button"

const comments = [
  {
    id: 1,
    author: "Trần Thị B",
    content: "Bài viết rất hay và có tính thời sự cao. AI thực sự đang thay đổi mọi thứ xung quanh chúng ta.",
    publishedAt: "1 giờ trước",
    likes: 5,
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    author: "Lê Văn C",
    content: "Tôi nghĩ chúng ta cần chuẩn bị kỹ năng mới để không bị tụt hậu trong thời đại AI này.",
    publishedAt: "2 giờ trước",
    likes: 3,
    avatar: "/placeholder.svg",
  },
]

const relatedArticles = [
  {
    id: 2,
    title: "Machine Learning và tương lai của giáo dục",
    category: "Công nghệ",
    readTime: "4 phút đọc",
    image: "/placeholder.svg?height=100&width=150",
  },
  {
    id: 3,
    title: "Startup AI Việt Nam thu hút đầu tư triệu USD",
    category: "Kinh doanh",
    readTime: "3 phút đọc",
    image: "/placeholder.svg?height=100&width=150",
  },
]

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: articleId } = await params
  const [{ data, error }, commentsResp, likesResp, related] = await Promise.all([
    getArticleById(articleId),
    getComments(articleId),
    getArticleLikesCount(articleId),
    supabase.from('articles').select('*').eq('status','published').order('published_at', { ascending: false })
  ])
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-bold">Bài viết không tồn tại</h1>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <ViewCounter articleId={articleId} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Article */}
        <article className="lg:col-span-3">
          <div className="space-y-6">
            {/* Article Header */}
            <div className="space-y-4">
              <Badge variant="secondary">{data.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{data.title}</h1>

              {/* Author and Meta */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                     <AvatarImage src={"/placeholder.svg"} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{data.author_name}</span>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(data.published_at || data.created_at).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span>{data.read_time || Math.max(1, Math.ceil((data.word_count || 200)/200))} phút đọc</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{data.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{(commentsResp.data || []).length}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ShareButtons />
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative">
              <Image
                src={data.image_url || data.featured_image_url || "/placeholder.svg"}
                alt={data.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>

            {/* Article Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {(data.tags || []).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Article Actions */}
            <div className="flex items-center justify-between py-6 border-y">
              <LikeButton articleId={articleId} initialCount={likesResp.count} />

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Chia sẻ:</span>
                <Button variant="ghost" size="sm">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Author Bio */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={"/placeholder.svg"} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{data.author_name}</h3>
                    <p className="text-muted-foreground mb-2">Tác giả</p>
                    <p className="text-sm text-muted-foreground">{new Date(data.created_at).toLocaleDateString('vi-VN')}</p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href={`/author/${encodeURIComponent((data.author_name || '').toLowerCase().replace(/\s+/g,'-'))}`}>Xem trang tác giả</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Bình luận ({(commentsResp.data || []).length})</h3>

              {/* Comment Form */}
              <Card>
                <CardContent className="p-6">
                  <CommentForm articleId={articleId} />
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-4">
                {(commentsResp.data || []).map((comment: any) => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={"/placeholder.svg"} />
                          <AvatarFallback>
                            {(comment.user_name || 'U')
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{comment.user_name}</span>
                            <span className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                          <p className="text-sm mb-3">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
            {/* Related Articles by same category */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Bài viết liên quan</h3>
                <div className="space-y-4">
                  {(related.data || [])
                    .filter((a: any) => a.category === data.category && a.id !== data.id)
                    .slice(0, 5)
                    .map((a: any) => (
                    <div key={a.id} className="flex space-x-3">
                      <Image
                        src={a.image_url || a.featured_image_url || "/placeholder.svg"}
                        alt={a.title}
                        width={80}
                        height={60}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <Link
                          href={`/article/${a.id}`}
                          className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                        >
                          {a.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {a.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          {/* Newsletter removed */}
        </aside>
      </div>
    </div>
  )
}
