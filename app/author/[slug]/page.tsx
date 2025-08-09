import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Eye, MessageCircle, MapPin, Calendar, Globe, Twitter, Facebook, Linkedin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const author = {
  name: "Nguyễn Văn A",
  bio: "Nhà báo công nghệ với hơn 10 năm kinh nghiệm trong lĩnh vực AI, Machine Learning và các xu hướng công nghệ mới. Tốt nghiệp Thạc sĩ Khoa học Máy tính tại Đại học Bách Khoa Hà Nội.",
  avatar: "/placeholder.svg",
  location: "Hà Nội, Việt Nam",
  joinDate: "Tháng 3, 2020",
  website: "https://nguyenvana.tech",
  social: {
    twitter: "@nguyenvana",
    facebook: "nguyenvana.tech",
    linkedin: "nguyenvana",
  },
  stats: {
    articles: 156,
    views: 2500000,
    followers: 15600,
  },
  specialties: ["AI & Machine Learning", "Blockchain", "Startup", "Fintech"],
}

const articles = [
  {
    id: 1,
    title: "Công nghệ AI đang thay đổi cách chúng ta làm việc trong năm 2024",
    excerpt: "Trí tuệ nhân tạo không chỉ là xu hướng mà đã trở thành một phần không thể thiếu...",
    category: "Công nghệ",
    publishedAt: "2 ngày trước",
    readTime: "5 phút đọc",
    views: 1250,
    comments: 23,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Blockchain và tương lai của tài chính số tại Việt Nam",
    excerpt: "Công nghệ blockchain đang mở ra những cơ hội mới cho hệ thống tài chính...",
    category: "Fintech",
    publishedAt: "1 tuần trước",
    readTime: "7 phút đọc",
    views: 890,
    comments: 15,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Startup công nghệ Việt Nam: Thành công và thách thức",
    excerpt: "Phân tích về hệ sinh thái startup công nghệ Việt Nam trong bối cảnh mới...",
    category: "Startup",
    publishedAt: "2 tuần trước",
    readTime: "6 phút đọc",
    views: 1560,
    comments: 34,
    image: "/placeholder.svg?height=200&width=300",
  },
]

const achievements = [
  {
    title: "Giải thưởng Nhà báo Công nghệ xuất sắc 2023",
    organization: "Hiệp hội Báo chí Việt Nam",
    year: "2023",
  },
  {
    title: "Top 10 Influencer Công nghệ Việt Nam",
    organization: "Tech Awards Vietnam",
    year: "2022",
  },
  {
    title: "Chứng chỉ AI Specialist",
    organization: "Google Cloud",
    year: "2021",
  },
]

export default function AuthorPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Author Profile */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={author.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">NA</AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-xl font-bold">{author.name}</h1>
                  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{author.location}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{author.bio}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y">
                  <div className="text-center">
                    <div className="font-bold text-lg">{author.stats.articles}</div>
                    <div className="text-xs text-muted-foreground">Bài viết</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{(author.stats.views / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-muted-foreground">Lượt xem</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{(author.stats.followers / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-muted-foreground">Theo dõi</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Tham gia {author.joinDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <a href={author.website} className="hover:text-primary transition-colors">
                      {author.website}
                    </a>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-3">
                  <Button variant="ghost" size="sm">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>

                <Button className="w-full">Theo dõi</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="articles">Bài viết</TabsTrigger>
              <TabsTrigger value="about">Giới thiệu</TabsTrigger>
              <TabsTrigger value="achievements">Thành tích</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Bài viết của {author.name}</h2>
                <div className="text-sm text-muted-foreground">{author.stats.articles} bài viết</div>
              </div>

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
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{article.publishedAt}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
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

              <div className="text-center">
                <Button variant="outline" size="lg">
                  Xem thêm bài viết
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Về {author.name}</h3>
                  <div className="space-y-4">
                    <p className="leading-relaxed">
                      {author.name} là một nhà báo công nghệ kỳ cựu với hơn 10 năm kinh nghiệm trong việc đưa tin và
                      phân tích các xu hướng công nghệ mới nhất. Anh đã tốt nghiệp Thạc sĩ Khoa học Máy tính tại Đại học
                      Bách Khoa Hà Nội và có chuyên môn sâu về AI, Machine Learning, và Blockchain.
                    </p>
                    <p className="leading-relaxed">
                      Trong suốt sự nghiệp của mình, {author.name} đã viết hơn 150 bài báo về công nghệ, được đăng tải
                      trên các trang tin tức hàng đầu Việt Nam. Anh cũng thường xuyên tham gia các hội thảo và sự kiện
                      công nghệ với tư cách là diễn giả.
                    </p>
                    <p className="leading-relaxed">
                      Ngoài việc viết báo, {author.name} còn tư vấn cho các startup công nghệ và tham gia vào nhiều dự
                      án nghiên cứu về AI tại Việt Nam.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Chuyên môn</h3>
                  <div className="flex flex-wrap gap-2">
                    {author.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Thành tích & Giải thưởng</h3>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">{achievement.year}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.organization}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
