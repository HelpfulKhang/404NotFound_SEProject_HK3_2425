import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Eye, MessageCircle, Bookmark, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const featuredArticle = {
  id: 1,
  title: "Công nghệ AI đang thay đổi cách chúng ta làm việc trong năm 2024",
  excerpt:
    "Trí tuệ nhân tạo không chỉ là xu hướng mà đã trở thành một phần không thể thiếu trong cuộc sống và công việc hàng ngày của chúng ta.",
  category: "Công nghệ",
  author: "Nguyễn Văn A",
  publishedAt: "2 giờ trước",
  readTime: "5 phút đọc",
  views: 1250,
  comments: 23,
  image: "/placeholder.svg?height=400&width=800",
}

const articles = [
  {
    id: 2,
    title: "Thị trường chứng khoán Việt Nam tăng trưởng mạnh trong quý 4",
    excerpt: "VN-Index đã vượt mốc 1,200 điểm sau chuỗi phiên tăng liên tiếp...",
    category: "Kinh doanh",
    author: "Trần Thị B",
    publishedAt: "4 giờ trước",
    readTime: "3 phút đọc",
    views: 890,
    comments: 15,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Đội tuyển Việt Nam chuẩn bị cho vòng loại World Cup 2026",
    excerpt: "HLV Philippe Troussier đã công bố danh sách 25 cầu thủ...",
    category: "Thể thao",
    author: "Lê Văn C",
    publishedAt: "6 giờ trước",
    readTime: "4 phút đọc",
    views: 2100,
    comments: 45,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Du lịch Việt Nam hồi phục mạnh mẽ sau đại dịch",
    excerpt: "Số lượng khách quốc tế đến Việt Nam đã tăng 150% so với cùng kỳ năm trước...",
    category: "Du lịch",
    author: "Phạm Thị D",
    publishedAt: "8 giờ trước",
    readTime: "6 phút đọc",
    views: 756,
    comments: 12,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Phát hiện mới về vaccine COVID-19 thế hệ mới",
    excerpt: "Các nhà khoa học đã phát triển thành công vaccine có hiệu quả cao hơn...",
    category: "Sức khỏe",
    author: "Hoàng Văn E",
    publishedAt: "10 giờ trước",
    readTime: "7 phút đọc",
    views: 1890,
    comments: 67,
    image: "/placeholder.svg?height=200&width=300",
  },
]

const trendingTopics = [
  "AI và Machine Learning",
  "Chứng khoán Việt Nam",
  "World Cup 2026",
  "Du lịch hậu COVID",
  "Vaccine mới",
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breaking News Banner */}
      <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-r-lg">
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="animate-pulse">
            NÓNG
          </Badge>
          <p className="text-sm font-medium">Chính phủ công bố gói hỗ trợ kinh tế mới trị giá 50 tỷ USD</p>
          <Button variant="link" size="sm" asChild>
            <Link href="/article/breaking-news">Xem chi tiết →</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Featured Article */}
          <Card className="overflow-hidden">
            <div className="relative">
              <Image
                src={featuredArticle.image || "/placeholder.svg"}
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
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{featuredArticle.author}</p>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{featuredArticle.publishedAt}</span>
                      <span>•</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{featuredArticle.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{featuredArticle.comments}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={article.image || "/placeholder.svg"}
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
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {article.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{article.comments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Xem thêm bài viết
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Xu hướng</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">{index + 1}</span>
                    <Link href="#" className="text-sm hover:text-primary transition-colors">
                      {topic}
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Đăng ký nhận tin</h3>
              <p className="text-sm text-muted-foreground mb-4">Nhận những tin tức mới nhất qua email</p>
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

          {/* Most Read */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Đọc nhiều nhất</h3>
              <div className="space-y-4">
                {articles.slice(0, 3).map((article, index) => (
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
  )
}
