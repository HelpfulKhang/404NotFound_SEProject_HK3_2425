import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  Eye,
  MessageCircle,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Facebook,
  Twitter,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const article = {
  id: 1,
  title: "Công nghệ AI đang thay đổi cách chúng ta làm việc trong năm 2024",
  content: `
    <p>Trí tuệ nhân tạo (AI) đã không còn là một khái niệm xa vời mà đã trở thành một phần không thể thiếu trong cuộc sống và công việc hàng ngày của chúng ta. Năm 2024 đánh dấu một bước ngoặt quan trọng trong việc ứng dụng AI vào các lĩnh vực khác nhau.</p>
    
    <h2>Tác động của AI đến thị trường lao động</h2>
    <p>Theo nghiên cứu mới nhất từ McKinsey Global Institute, AI có thể tự động hóa khoảng 30% các công việc hiện tại vào năm 2030. Tuy nhiên, điều này không có nghĩa là sẽ có 30% lao động bị thất nghiệp, mà thay vào đó, bản chất công việc sẽ thay đổi.</p>
    
    <p>Các công việc đòi hỏi tư duy sáng tạo, giải quyết vấn đề phức tạp và tương tác con người sẽ trở nên quan trọng hơn bao giờ hết. Trong khi đó, các tác vụ lặp đi lặp lại, có thể dự đoán được sẽ được AI đảm nhận.</p>
    
    <h2>Những ứng dụng AI nổi bật trong năm 2024</h2>
    <p>Một số ứng dụng AI đáng chú ý trong năm nay bao gồm:</p>
    <ul>
      <li><strong>Chatbot và trợ lý ảo:</strong> Ngày càng thông minh và có thể xử lý các yêu cầu phức tạp</li>
      <li><strong>Phân tích dữ liệu:</strong> Giúp doanh nghiệp đưa ra quyết định chính xác hơn</li>
      <li><strong>Tự động hóa quy trình:</strong> Tối ưu hóa hiệu quả làm việc</li>
      <li><strong>Cá nhân hóa trải nghiệm:</strong> Từ mua sắm đến giáo dục</li>
    </ul>
    
    <h2>Thách thức và cơ hội</h2>
    <p>Mặc dù AI mang lại nhiều lợi ích, nhưng cũng đặt ra những thách thức về đạo đức, quyền riêng tư và an ninh dữ liệu. Các doanh nghiệp và cá nhân cần chuẩn bị kỹ năng mới để thích ứng với thời đại AI.</p>
    
    <p>Việt Nam đang có những bước tiến đáng kể trong việc phát triển và ứng dụng AI, với nhiều startup công nghệ và các dự án nghiên cứu được đầu tư mạnh mẽ.</p>
  `,
  category: "Công nghệ",
  author: {
    name: "Nguyễn Văn A",
    bio: "Nhà báo công nghệ với hơn 10 năm kinh nghiệm",
    avatar: "/placeholder.svg",
    articles: 156,
  },
  publishedAt: "2024-01-15T10:30:00Z",
  readTime: "5 phút đọc",
  views: 1250,
  comments: 23,
  likes: 89,
  dislikes: 3,
  image: "/placeholder.svg?height=400&width=800",
  tags: ["AI", "Công nghệ", "Tương lai", "Việc làm"],
}

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

export default function ArticlePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Article */}
        <article className="lg:col-span-3">
          <div className="space-y-6">
            {/* Article Header */}
            <div className="space-y-4">
              <Badge variant="secondary">{article.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>

              {/* Author and Meta */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href="/author/nguyen-van-a" className="font-medium hover:text-primary">
                      {article.author.name}
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>15 tháng 1, 2024</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{article.comments}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative">
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Article Actions */}
            <div className="flex items-center justify-between py-6 border-y">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {article.likes}
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {article.dislikes}
                </Button>
              </div>

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
                    <AvatarImage src={article.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{article.author.name}</h3>
                    <p className="text-muted-foreground mb-2">{article.author.bio}</p>
                    <p className="text-sm text-muted-foreground">{article.author.articles} bài viết đã xuất bản</p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href="/author/nguyen-van-a">Xem trang tác giả</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Bình luận ({article.comments})</h3>

              {/* Comment Form */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Textarea placeholder="Viết bình luận của bạn..." rows={4} />
                    <div className="flex justify-end">
                      <Button>Gửi bình luận</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {comment.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-sm text-muted-foreground">{comment.publishedAt}</span>
                          </div>
                          <p className="text-sm mb-3">{comment.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              Trả lời
                            </Button>
                          </div>
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
          {/* Related Articles */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Bài viết liên quan</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="flex space-x-3">
                    <Image
                      src={relatedArticle.image || "/placeholder.svg"}
                      alt={relatedArticle.title}
                      width={80}
                      height={60}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <Link
                        href={`/article/${relatedArticle.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {relatedArticle.title}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {relatedArticle.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{relatedArticle.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Đăng ký nhận tin</h3>
              <p className="text-sm text-muted-foreground mb-4">Nhận những tin tức công nghệ mới nhất</p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <Button className="w-full" size="sm">
                  Đăng ký
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
