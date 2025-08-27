"use client"

import type React from "react"

import { useEffect, useMemo, useState, Suspense } from "react"
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
  FileText,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getAllProfiles, searchProfiles, updateUserRole, deactivateProfile, activateProfile } from "@/lib/profiles"
import LikedArticles from "@/components/liked-articles"
import { getUserArticles, getPendingArticles, submitArticleForReview, approveArticle, rejectArticle, publishArticle } from "@/lib/articles-management"
import { supabase } from "@/lib/supabase"
import { useSearchParams, useRouter } from "next/navigation"
import type { Article } from "@/lib/supabase"

type PendingArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  submitted_at: string
  author_name: string
  author_email: string
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageContent />
    </Suspense>
  )
}

function DashboardPageContent() {
  const { user, profile } = useAuth()
  const userRole = profile?.role
  const searchParams = useSearchParams()
  const router = useRouter()

  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState<boolean>(false)
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([])
  const [loadingPending, setLoadingPending] = useState<boolean>(false)
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loadingAll, setLoadingAll] = useState<boolean>(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false)
  const [userSearch, setUserSearch] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all")
  const [siteStats, setSiteStats] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string>('articles')
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
    excerpt: "",
  })

  useEffect(() => {
    // Enforce MFA for editor/admin: require AAL2; redirect to verify if not satisfied
    const enforceMfa = async () => {
      if (userRole === 'editor' || userRole === 'admin') {
        // Only require if user enabled MFA in profile settings
        if (profile && (profile as any).mfa_enabled === false) return
        // Short-circuit if recently verified via email OTP
        const until = Number(localStorage.getItem('mfa_verified_until') || 0)
        if (until && Date.now() < until) return

        const { data } = await (supabase.auth as any).mfa.getAuthenticatorAssuranceLevel()
        if (data?.currentLevel !== 'aal2') {
          const url = new URL(window.location.href)
          url.searchParams.set('returnTo', '/dashboard')
          window.location.href = `/verify-mfa?${url.searchParams.toString()}`
          return
        }
      }
    }
    void enforceMfa()
  }, [userRole])

  useEffect(() => {
    const loadMyArticles = async () => {
      setLoadingArticles(true)
      try {
        const { data } = await getUserArticles()
        if (data) setArticles(data)
      } finally {
        setLoadingArticles(false)
      }
    }
    if (user) void loadMyArticles()
  }, [user])

  useEffect(() => {
    const loadPending = async () => {
      setLoadingPending(true)
      try {
        const { data } = await getPendingArticles()
        if (data) setPendingArticles(data as PendingArticle[])
      } finally {
        setLoadingPending(false)
      }
    }
    if (userRole === "editor" || userRole === "admin") void loadPending()
  }, [userRole])

  useEffect(() => {
    const loadAllArticles = async () => {
      setLoadingAll(true)
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) setAllArticles(data as Article[])
      } finally {
        setLoadingAll(false)
      }
    }
    if (userRole === "editor" || userRole === "admin") void loadAllArticles()
  }, [userRole])

  // Load users for admin
  useEffect(() => {
    const loadUsers = async () => {
      if (userRole !== 'admin') return
      setLoadingUsers(true)
      try {
        if (userSearch.trim()) {
          const { data } = await searchProfiles(userSearch.trim())
          setUsers(data || [])
        } else {
          const { data } = await getAllProfiles(200, 0)
          setUsers(data || [])
        }
      } finally {
        setLoadingUsers(false)
      }
    }
    void loadUsers()
  }, [userRole, userSearch])

  // Load site-wide stats for admin
  useEffect(() => {
    const loadSiteStats = async () => {
      if (userRole !== 'admin') return
      const [profilesResp, articlesResp, commentsResp] = await Promise.all([
        supabase.from('profiles').select('id, role, is_active'),
        supabase.from('articles').select('id, status, views'),
        supabase.from('comments').select('id', { count: 'exact', head: true }) as any,
      ])
      const profiles = (profilesResp.data as any[]) || []
      const articlesAll = (articlesResp.data as any[]) || []
      const usersTotal = profiles.length
      const rolesCount = profiles.reduce((acc: any, p: any) => { acc[p.role] = (acc[p.role]||0)+1; return acc }, {})
      const activeUsers = profiles.filter(p=>p.is_active).length
      const byStatus = articlesAll.reduce((acc: any, a: any) => { acc[a.status] = (acc[a.status]||0)+1; return acc }, {})
      const totalViews = articlesAll.reduce((s: number, a: any)=> s + (a.views||0), 0)
      const commentsCount = (commentsResp as any).count || 0
      setSiteStats({ usersTotal, activeUsers, rolesCount, byStatus, totalViews, commentsCount })
    }
    void loadSiteStats()
  }, [userRole])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    // If no explicit tab in URL, choose a sensible default by role
    const tab = searchParams.get('tab')
    if (!tab) {
      if (userRole === 'editor' || userRole === 'admin') {
        setActiveTab('pending')
      } else if (userRole === 'writer') {
        setActiveTab('articles')
      } else if (userRole === 'reader') {
        setActiveTab('saved')
      }
    }
  }, [userRole, searchParams])

  const stats = useMemo(() => {
    const totalArticles = articles.length
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)
    const totalComments = articles.reduce((sum, a) => sum + (a.comments_count || 0), 0)
    const pendingApproval = pendingArticles.length
    return { totalArticles, totalViews, totalComments, pendingApproval }
  }, [articles, pendingArticles])

  const monthlyData = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string; year: number; monthIndex: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const monthIndex = d.getMonth()
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('vi-VN', { month: 'short' })
      months.push({ key, label, year, monthIndex })
    }
    return months.map((m) => {
      const monthArticles = articles.filter((a) => {
        if (!a.published_at || a.status !== 'published') return false
        const d = new Date(a.published_at)
        return d.getFullYear() === m.year && d.getMonth() === m.monthIndex
      })
      const views = monthArticles.reduce((sum, a) => sum + (a.views || 0), 0)
      return { month: m.label, views, articles: monthArticles.length }
    })
  }, [articles])

  const chartConfig = {
    views: { label: 'Lượt xem', color: 'hsl(var(--primary))' },
    articles: { label: 'Bài viết', color: 'hsl(var(--muted-foreground))' },
  } as const

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="bg-green-500">
            Đã xuất bản
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Đã duyệt
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

  const handleApproveArticle = async (id: string) => {
    const { error } = await approveArticle(id)
    if (!error) {
      // refresh lists
      const [pendResp, allResp] = await Promise.all([
        getPendingArticles(),
        supabase.from('articles').select('*').order('created_at', { ascending: false })
      ])
      if (pendResp.data) setPendingArticles(pendResp.data as PendingArticle[])
      if ((allResp as any).data) setAllArticles((allResp as any).data as Article[])
    }
  }

  const handleRejectArticle = async (id: string) => {
    const reason = window.prompt('Lý do từ chối (sẽ gửi đến tác giả):') || 'Không đạt yêu cầu'
    const { error } = await rejectArticle(id, reason)
    if (!error) {
      const [pendResp, allResp] = await Promise.all([
        getPendingArticles(),
        supabase.from('articles').select('*').order('created_at', { ascending: false })
      ])
      if (pendResp.data) setPendingArticles(pendResp.data as PendingArticle[])
      if ((allResp as any).data) setAllArticles((allResp as any).data as Article[])
      // Optional: notify writer via a simple toast; email/notification can be added later
    }
  }

  const handlePublishArticle = async (id: string) => {
    const { error } = await publishArticle(id)
    if (!error) {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setAllArticles(data as Article[])
    }
  }

  const handleSubmitDraft = async (id: string) => {
    const { error } = await submitArticleForReview(id)
    if (!error) {
      // Refresh list
      const { data } = await getUserArticles()
      if (data) setArticles(data)
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    if (!error) {
      // Refresh lists based on role
      const tasks: Array<Promise<void>> = []
      tasks.push((async () => { const r = await getUserArticles(); if (r.data) setArticles(r.data) })())
      if (userRole === 'editor' || userRole === 'admin') {
        tasks.push((async () => {
          const r: any = await supabase.from('articles').select('*').order('created_at', { ascending: false })
          if (r.data) setAllArticles(r.data as any)
        })())
      }
      await Promise.all(tasks)
    }
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
          {userRole === 'writer' && (
            <Button asChild>
              <Link href="/create-article">
                <PlusCircle className="mr-2 h-4 w-4" />
                Viết bài mới
              </Link>
            </Button>
          )}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString('vi-VN')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bình luận</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </CardContent>
          </Card>

          {(userRole === "editor" || userRole === "admin") && (
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
        <Tabs value={activeTab} onValueChange={(v)=>{
          setActiveTab(v)
          const url = new URL(window.location.href)
          url.searchParams.set('tab', v)
          router.replace(url.toString())
        }} className="space-y-6">
          <TabsList>
            {userRole === 'writer' && (
              <TabsTrigger value="articles">Bài viết của tôi</TabsTrigger>
            )}
            {userRole === 'reader' && (
              <TabsTrigger value="saved">Đã thích</TabsTrigger>
            )}
            {(userRole === "editor" || userRole === "admin") && (
              <TabsTrigger value="pending">Chờ duyệt ({stats.pendingApproval})</TabsTrigger>
            )}
            {(userRole === "editor" || userRole === "admin") && (
              <TabsTrigger value="manage">Quản lý bài viết</TabsTrigger>
            )}
            {userRole === 'admin' && (
              <TabsTrigger value="users">Người dùng</TabsTrigger>
            )}
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
                  {loadingArticles && (
                    <div className="text-sm text-muted-foreground">Đang tải bài viết...</div>
                  )}
                  {!loadingArticles && articles.length === 0 && (
                    <div className="text-sm text-muted-foreground">Chưa có bài viết nào</div>
                  )}
                  {articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{article.title}</h3>
                          {getStatusBadge(article.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Danh mục: {article.category}</span>
                          {article.published_at && (
                            <span>Xuất bản: {new Date(article.published_at).toLocaleDateString("vi-VN")}</span>
                          )}
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{article.comments_count}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/create-article?articleId=${article.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(article.status === "draft" || article.status === "rejected") && (
                          <Button size="sm" onClick={() => handleSubmitDraft(article.id)}>
                            Gửi để duyệt
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={article.status === 'published' ? `/article/${article.id}` : `/create-article?articleId=${article.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(article.status === 'draft' || userRole === 'editor' || userRole === 'admin') && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteArticle(article.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === 'reader' && (
            <TabsContent value="saved" className="space-y-6">
                              <Card>
                  <CardHeader>
                    <CardTitle>Bài viết đã thích</CardTitle>
                    <CardDescription>Các bài viết bạn đã thích</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LikedArticles />
                  </CardContent>
                </Card>
            </TabsContent>
          )}

          {(userRole === "editor" || userRole === "admin") && (
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bài viết chờ duyệt</CardTitle>
                  <CardDescription>Xem xét và phê duyệt bài viết từ tác giả</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingPending && (
                      <div className="text-sm text-muted-foreground">Đang tải danh sách chờ duyệt...</div>
                    )}
                    {!loadingPending && pendingArticles.length === 0 && (
                      <div className="text-sm text-muted-foreground">Không có bài viết nào chờ duyệt</div>
                    )}
                    {pendingArticles.map((article) => (
                      <div key={article.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{article.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>Tác giả: {article.author_name}</span>
                              <span>Danh mục: {article.category}</span>
                              <span>Gửi: {new Date(article.submitted_at).toLocaleDateString("vi-VN")}</span>
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
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/create-article?articleId=${article.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteArticle(article.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(userRole === "editor" || userRole === "admin") && (
            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý bài viết</CardTitle>
                  <CardDescription>Xem và quản lý tất cả bài viết</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingAll && (
                      <div className="text-sm text-muted-foreground">Đang tải bài viết...</div>
                    )}
                    {!loadingAll && allArticles.length === 0 && (
                      <div className="text-sm text-muted-foreground">Chưa có bài viết nào</div>
                    )}
                    {allArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{article.title}</h3>
                            {getStatusBadge(article.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Tác giả: {article.author_name}</span>
                            <span>Danh mục: {article.category}</span>
                            {article.published_at && (
                              <span>Xuất bản: {new Date(article.published_at).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {article.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleApproveArticle(article.id)}>Phê duyệt</Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectArticle(article.id)}>Từ chối</Button>
                            </>
                          )}
                          {article.status === 'approved' && (
                            <Button size="sm" onClick={() => handlePublishArticle(article.id)}>Xuất bản</Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={article.status === 'published' ? `/article/${article.id}` : `/create-article?articleId=${article.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteArticle(article.id)}>
                            <Trash2 className="h-4 w-4" />
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
              {userRole === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tổng quan hệ thống</CardTitle>
                    <CardDescription>Người dùng, bài viết, bình luận, lượt xem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Tổng người dùng</div>
                        <div className="text-xl font-bold">{siteStats?.usersTotal ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Đang hoạt động</div>
                        <div className="text-xl font-bold">{siteStats?.activeUsers ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lượt xem</div>
                        <div className="text-xl font-bold">{(siteStats?.totalViews ?? 0).toLocaleString('vi-VN')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Bình luận</div>
                        <div className="text-xl font-bold">{siteStats?.commentsCount ?? 0}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground mb-1">Người dùng theo vai trò</div>
                        <div className="flex flex-wrap gap-2">
                          {['reader','writer','editor','admin'].map(r => (
                            <span key={r} className="px-2 py-1 border rounded text-xs">
                              {r}: {siteStats?.rolesCount?.[r] ?? 0}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground mb-1">Bài viết theo trạng thái</div>
                        <div className="flex flex-wrap gap-2">
                          {['draft','pending','approved','rejected','published','archived'].map(s => (
                            <span key={s} className="px-2 py-1 border rounded text-xs">
                              {s}: {siteStats?.byStatus?.[s] ?? 0}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Lượt xem theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig as any} className="h-64">
                    <BarChart data={monthlyData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="views" fill="var(--color-views)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bài viết phổ biến nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                      {articles
                        .slice()
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 3)
                        .map((article, index) => (
                      <div key={article.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{(article.views || 0).toLocaleString('vi-VN')} lượt xem</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {userRole === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý người dùng</CardTitle>
                  <CardDescription>Xem, lọc vai trò, thay đổi quyền, khóa/mở khóa tài khoản</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Input placeholder="Tìm theo tên hoặc email" value={userSearch} onChange={(e)=>setUserSearch(e.target.value)} className="w-64" />
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className="w-48"><SelectValue placeholder="Lọc vai trò" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value="reader">Độc giả</SelectItem>
                        <SelectItem value="writer">Tác giả</SelectItem>
                        <SelectItem value="editor">Biên tập viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2">Tên</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Vai trò</th>
                          <th className="text-left p-2">Trạng thái</th>
                          <th className="text-right p-2">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!loadingUsers ? users : []).filter((u: any)=> userRoleFilter==='all' ? true : u.role===userRoleFilter).map((u: any) => (
                          <tr key={u.id} className="border-t">
                            <td className="p-2">{u.full_name || '(Chưa đặt tên)'}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">
                              <Select value={u.role} onValueChange={async (val)=>{ const { error } = await updateUserRole(u.id, val as any); if (!error) { setUsers(prev=> prev.map(p=> p.id===u.id ? { ...p, role: val } : p)) } }}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="reader">Độc giả</SelectItem>
                                  <SelectItem value="writer">Tác giả</SelectItem>
                                  <SelectItem value="editor">Biên tập viên</SelectItem>
                                  <SelectItem value="admin">Quản trị viên</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">{u.is_active ? 'Hoạt động' : 'Đã khóa'}</td>
                            <td className="p-2 text-right space-x-2">
                              {u.is_active ? (
                                <Button size="sm" variant="outline" onClick={async ()=>{ const { error } = await deactivateProfile(u.id); if (!error) setUsers(prev=> prev.map(p=> p.id===u.id ? { ...p, is_active: false } : p)) }}>Khóa</Button>
                              ) : (
                                <Button size="sm" onClick={async ()=>{ const { error } = await activateProfile(u.id); if (!error) setUsers(prev=> prev.map(p=> p.id===u.id ? { ...p, is_active: true } : p)) }}>Mở khóa</Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {loadingUsers && (
                      <div className="p-4 text-sm text-muted-foreground">Đang tải người dùng...</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
