"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Save, 
  Send, 
  Upload,
  Image, 
  FileText, 
  Eye, 
  EyeOff, 
  Plus, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { 
  createArticle, 
  getCategories, 
    getArticleById,
    updateArticle,
    uploadArticleImage,
    uploadFeaturedImage,
  getArticleImages,
  deleteArticleImage,
  submitArticleForReview,
  CreateArticleData 
} from "@/lib/articles-management"
import { toast } from "sonner"

export default function CreateArticlePage() {
  return (
    <Suspense fallback={null}>
      <CreateArticlePageContent />
    </Suspense>
  )
}

function CreateArticlePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [articleImages, setArticleImages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("content")

  const [formData, setFormData] = useState<CreateArticleData>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    featured_image_url: "",
    image_caption: "",
    tags: [],
    seo_title: "",
    seo_description: ""
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  const [tagInput, setTagInput] = useState("")

  // Check if user is authorized
  useEffect(() => {
    if (user && profile) {
      if (!['writer', 'editor', 'admin'].includes(profile.role)) {
        toast.error("Bạn không có quyền tạo bài viết")
        router.push("/")
      }
    }
  }, [user, profile, router])

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // If editing, load article data
  useEffect(() => {
    const id = searchParams.get('articleId')
    if (!id) return
    setEditingId(id)
    ;(async () => {
      const { data, error } = await getArticleById(id)
      if (!error && data) {
        setFormData({
          title: data.title || "",
          content: data.content || "",
          excerpt: data.excerpt || "",
          category: data.category || "",
          featured_image_url: data.featured_image_url || "",
          image_caption: data.image_caption || "",
          tags: (data.tags as string[] | null) || [],
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
        })
      }
    })()
  }, [searchParams])

  const loadCategories = async () => {
    const { data, error } = await getCategories()
    if (error) {
      toast.error("Không thể tải danh mục")
    } else {
      setCategories(data || [])
    }
  }

  const handleInputChange = (field: keyof CreateArticleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setUploadingImage(true)
    try {
      // Upload featured image before article is created – only get public URL
      const { publicUrl, error } = await uploadFeaturedImage(file)

      if (error || !publicUrl) {
        toast.error("Không thể tải lên hình ảnh")
      } else {
        setFormData(prev => ({
          ...prev,
          featured_image_url: publicUrl
        }))
        toast.success("Tải lên hình ảnh thành công")
      }
    } catch (error) {
      toast.error("Lỗi khi tải lên hình ảnh")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setSaving(true)
    try {
      let savedId: string | null = null
      if (editingId) {
        const { data, error } = await updateArticle({ id: editingId, ...formData })
        if (error) {
          toast.error("Không thể lưu thay đổi")
        } else {
          toast.success("Đã lưu thay đổi")
          savedId = data?.id || editingId
        }
      } else {
        const { data, error } = await createArticle(formData)
        if (error) {
          toast.error("Không thể lưu bài viết")
        } else {
          toast.success("Lưu bản nháp thành công")
          savedId = data?.id || null
        }
      }
      
      if (savedId) router.push(`/dashboard?tab=articles`)
    } catch (error) {
      toast.error("Lỗi khi lưu bài viết")
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setSubmitting(true)
    try {
      let targetId = editingId
      if (!targetId) {
        // Save then submit if creating new
        const { data: article, error: createError } = await createArticle(formData)
        if (createError || !article) {
          toast.error("Không thể tạo bài viết")
          return
        }
        targetId = article.id
      } else {
        // Ensure latest edits are saved before submit
        const { error: updateError } = await updateArticle({ id: targetId, ...formData })
        if (updateError) {
          toast.error("Không thể lưu thay đổi trước khi gửi duyệt")
          return
        }
      }

      const { error: submitError } = await submitArticleForReview(targetId!)
      
      if (submitError) {
        toast.error("Không thể gửi bài viết để duyệt")
      } else {
        toast.success("Gửi bài viết để duyệt thành công")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Lỗi khi gửi bài viết")
    } finally {
      setSubmitting(false)
    }
  }

  const wordCount = formData.content.split(' ').length
  const estimatedReadTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để tạo bài viết</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
            <p className="text-muted-foreground">{editingId ? 'Cập nhật bản nháp của bạn' : 'Viết và chia sẻ tin tức với cộng đồng'}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={saving || submitting}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu bản nháp
                </>
              )}
            </Button>
            <Button 
              onClick={handleSubmitForReview}
              disabled={saving || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi để duyệt
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Nội dung</TabsTrigger>
                <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Basic Information */}
            <Card>
              <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>Điền thông tin chính của bài viết</CardDescription>
              </CardHeader>
                  <CardContent className="space-y-4">
                <div className="space-y-2">
                      <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Nhập tiêu đề bài viết..."
                        className="text-lg"
                      />
                </div>

                <div className="space-y-2">
                      <Label htmlFor="category">Danh mục *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                      <Label htmlFor="excerpt">Tóm tắt *</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => handleInputChange("excerpt", e.target.value)}
                        placeholder="Viết tóm tắt ngắn gọn về bài viết..."
                        rows={3}
                      />
                  </div>
                  </CardContent>
                </Card>

                {/* Article Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nội dung bài viết</CardTitle>
                    <CardDescription>Viết nội dung chính của bài viết</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content">Nội dung *</Label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(val) => handleInputChange("content", val)}
                        placeholder="Viết nội dung bài viết..."
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Số từ: {wordCount}</span>
                      <span>Thời gian đọc ước tính: {estimatedReadTime} phút</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thẻ (Tags)</CardTitle>
                    <CardDescription>Thêm thẻ để phân loại bài viết</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Nhập thẻ..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                      <Button onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                    
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hình ảnh bài viết</CardTitle>
                    <CardDescription>Tải lên hình ảnh cho bài viết</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                <div className="space-y-2">
                      <Label htmlFor="featured-image">Hình ảnh chính</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                          id="featured-image"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                        <label htmlFor="featured-image" className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            {uploadingImage ? "Đang tải lên..." : "Nhấp để tải lên hình ảnh"}
                          </p>
                        </label>
                      </div>
                  </div>

                    {formData.featured_image_url && (
                      <div className="space-y-2">
                        <Label>Hình ảnh đã tải lên</Label>
                        <div className="relative">
                          <img
                            src={formData.featured_image_url}
                            alt="Featured"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                    </div>
                  )}

                <div className="space-y-2">
                      <Label htmlFor="image-caption">Chú thích hình ảnh</Label>
                    <Input
                        id="image-caption"
                        value={formData.image_caption || ""}
                        onChange={(e) => handleInputChange("image_caption", e.target.value)}
                        placeholder="Chú thích cho hình ảnh..."
                      />
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                    <CardTitle>SEO và Meta</CardTitle>
                    <CardDescription>Tối ưu hóa cho công cụ tìm kiếm</CardDescription>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-title">SEO Title</Label>
                      <Input
                        id="seo-title"
                        value={formData.seo_title || ""}
                        onChange={(e) => handleInputChange("seo_title", e.target.value)}
                        placeholder="Tiêu đề SEO (để trống để sử dụng tiêu đề chính)"
                      />
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-description">SEO Description</Label>
                      <Textarea
                        id="seo-description"
                        value={formData.seo_description || ""}
                        onChange={(e) => handleInputChange("seo_description", e.target.value)}
                        placeholder="Mô tả SEO (để trống để sử dụng tóm tắt)"
                        rows={3}
                      />
                    </div>
              </CardContent>
            </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Article Status */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái bài viết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Bản nháp</Badge>
                  <span className="text-sm text-muted-foreground">Chưa gửi để duyệt</span>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                    Bài viết sẽ được gửi cho biên tập viên duyệt trước khi xuất bản
                    </AlertDescription>
                  </Alert>
              </CardContent>
            </Card>

            {/* Article Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Số từ:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Thời gian đọc:</span>
                  <span className="font-medium">{estimatedReadTime} phút</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Thẻ:</span>
                  <span className="font-medium">{formData.tags?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
