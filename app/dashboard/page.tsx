"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle,
  Eye,
  MessageCircle,
  ThumbsUp,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
} from "lucide-react"
import Link from "next/link"

const userRole = "editor" // This would come from auth context

const stats = {
  totalArticles: 156,
  totalViews: 2500000,
  totalComments: 1250,
  pendingApproval: 8,
}

const myArticles = [
  {
    id: 1,
    title: "Công nghệ AI đang thay đổi cách chúng ta làm việc trong năm 2024",
    status: "published",
    category: "Công nghệ",
    publishedAt: "2024-01-15",
    views: 1250,
    comments: 23,
    likes: 89,
  },
  {
    id: 2,
    title: "Blockchain và tương lai của tài chính số tại Việt Nam",
    status: "draft",
    category: "Fintech",
    publishedAt: null,
    views: 0,
    comments: 0,
    likes: 0,
  },
  {
    id: 3,
    title: "Startup công nghệ Việt Nam: Thành công và thách thức",
    status: "pending",
    category: "Startup",
    publishedAt: null,
    views: 0,
    comments: 0,
    likes: 0,
  },
]

const pendingArticles = [
  {
    id: 4,
    title: "Machine Learning trong y tế: Cơ hội và thách thức",
    author: "Trần Thị B",
    category: "Sức khỏe",
    submittedAt: "2024-01-14",
    excerpt: "Ứng dụng AI trong chẩn đoán và điều trị bệnh đang mở ra nhiều cơ hội mới...",
  },
  {
    id: 5,
    title: "Cryptocurrency và quy định pháp lý tại Việt Nam",
    author: "Lê Văn C",
    category: "Fintech",
    submittedAt: "2024-01-13",
    excerpt: "Phân tích về khung pháp lý hiện tại và tương lai của tiền điện tử...",
  },
]

export default function DashboardPage() {
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
    excerpt: "",
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="bg-green-500">
            Đã xuất bản
          </Badge>
        )
      case "draft":
        return <Badge variant="secondary">Bản nháp</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            Chờ duyệt
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating article:", newArticle)
    // Handle article creation
  }

  const handleApproveArticle = (id: number) => {
    console.log("Approving article:", id)
    // Handle article approval
  }

  const handleRejectArticle = (id: number) => {
    console.log("Rejecting article:", id)
    // Handle article rejection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Quản lý bài viết và hoạt động của bạn</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Viết bài mới
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
              <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalViews / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">+25% so với tháng trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bình luận</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">+8% so với tháng trước</p>
            </CardContent>
          </Card>

          {userRole === "editor" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                <p className="text-xs text-muted-foreground">Cần xem xét</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="articles">Bài viết của tôi</TabsTrigger>
            <TabsTrigger value="create">Tạo bài viết</TabsTrigger>
            {userRole === "editor" && <TabsTrigger value="pending">Chờ duyệt ({stats.pendingApproval})</TabsTrigger>}
            <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bài viết của tôi</CardTitle>
                <CardDescription>Quản lý tất cả bài viết bạn đã tạo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{article.title}</h3>
                          {getStatusBadge(article.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Danh mục: {article.category}</span>
                          {article.publishedAt && (
                            <span>Xuất bản: {new Date(article.publishedAt).toLocaleDateString("vi-VN")}</span>
                          )}
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{article.comments}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tạo bài viết mới</CardTitle>
                <CardDescription>Viết và xuất bản bài viết của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateArticle} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tiêu đề</label>
                    <Input
                      placeholder="Nhập tiêu đề bài viết..."
                      value={newArticle.title}
                      onChange={(e) => setNewArticle((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Danh mục</label>
                    <Select onValueChange={(value) => setNewArticle((prev) => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Công nghệ</SelectItem>
                        <SelectItem value="business">Kinh doanh</SelectItem>
                        <SelectItem value="health">Sức khỏe</SelectItem>
                        <SelectItem value="sports">Thể thao</SelectItem>
                        <SelectItem value="entertainment">Giải trí</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tóm tắt</label>
                    <Textarea
                      placeholder="Viết tóm tắt ngắn gọn về bài viết..."
                      rows={3}
                      value={newArticle.excerpt}
                      onChange={(e) => setNewArticle((prev) => ({ ...prev, excerpt: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nội dung</label>
                    <Textarea
                      placeholder="Viết nội dung bài viết..."
                      rows={12}
                      value={newArticle.content}
                      onChange={(e) => setNewArticle((prev) => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit">Xuất bản</Button>
                    <Button type="button" variant="outline">
                      Lưu nháp
                    </Button>
                    <Button type="button" variant="ghost">
                      Xem trước
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === "editor" && (
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bài viết chờ duyệt</CardTitle>
                  <CardDescription>Xem xét và phê duyệt bài viết từ tác giả</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingArticles.map((article) => (
                      <div key={article.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{article.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>Tác giả: {article.author}</span>
                              <span>Danh mục: {article.category}</span>
                              <span>Gửi: {new Date(article.submittedAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={() => handleApproveArticle(article.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Phê duyệt
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectArticle(article.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Từ chối
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lượt xem theo thời gian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mr-2" />
                    Biểu đồ thống kê sẽ được hiển thị ở đây
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bài viết phổ biến nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myArticles.slice(0, 3).map((article, index) => (
                      <div key={article.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{article.views} lượt xem</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
