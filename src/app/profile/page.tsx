"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  User, 
  Mail, 
  Globe, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Shield, 
  Calendar, 
  Loader2, 
  Camera,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Bell,
  Settings,
  PenTool,
  FileText,
  BarChart3,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { updateCurrentUserProfile, getUserStats } from "@/lib/profiles"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { AvatarCropModal } from "@/components/avatar-crop-modal"
import LikedArticles from "@/components/liked-articles"

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cropImageUrl, setCropImageUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeTab, setActiveTab] = useState("profile")
    const [userStats, setUserStats] = useState<any | null>(null)
    const [aalLevel, setAalLevel] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    website: "",
    location: "",
  })
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false)

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        website: profile.website || "",
        location: profile.location || "",
      })
      setMfaEnabled((profile as any).mfa_enabled ?? false)
    }
  }, [profile])

  useEffect(() => {
    // Check URL params for tab
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && tab !== activeTab) setActiveTab(tab)
    
    const loadStatsAndSecurity = async () => {
      try {
        if (user) {
          const { data } = await getUserStats(user.id)
          setUserStats(data)
        }
        const { data: aal } = await (supabase.auth as any).mfa.getAuthenticatorAssuranceLevel()
        setAalLevel(aal?.currentLevel || null)
      } catch {}
    }
    void loadStatsAndSecurity()
  }, [user])

  const handleFileSelect = (file: File) => {
    if (!file || !user) {
      toast.error("Vui lòng chọn file hoặc đăng nhập")
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ hỗ trợ file ảnh (JPEG, PNG, WebP, GIF)")
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("File quá lớn. Kích thước tối đa là 5MB")
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setCropImageUrl(e.target?.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!user) {
      toast.error("Người dùng không được xác thực")
      return
    }

    setUploadingAvatar(true)
    setShowCropModal(false)

    try {
      console.log('=== AVATAR UPLOAD DEBUG ===')
      console.log('User ID:', user.id)
      console.log('File size:', blob.size)
      
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const fileName = `${user.id}/avatar-${timestamp}.jpg`
      
      console.log('Generated filename:', fileName)

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true // Overwrite if exists
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error(`Không thể tải lên ảnh đại diện: ${uploadError.message}`)
        return
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName)

      console.log('Public URL:', publicUrl)

      // Update profile with new avatar URL
      const { data: updateData, error: updateError } = await updateCurrentUserProfile({
        avatar_url: publicUrl
      })

      if (updateError) {
        console.error('Profile update error:', updateError)
        toast.error(`Không thể cập nhật ảnh đại diện: ${updateError.message}`)
      } else {
        console.log('Profile updated successfully:', updateData)
        toast.success("Cập nhật ảnh đại diện thành công!")
        await refreshProfile()
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error("Lỗi khi tải lên ảnh đại diện")
    } finally {
      setUploadingAvatar(false)
      setSelectedFile(null)
      setCropImageUrl("")
    }
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setSelectedFile(null)
    setCropImageUrl("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await updateCurrentUserProfile({ ...formData, mfa_enabled: mfaEnabled } as any)
      if (error) {
        toast.error("Có lỗi xảy ra khi cập nhật hồ sơ")
      } else {
        toast.success("Cập nhật hồ sơ thành công!")
        await refreshProfile()
        setIsEditing(false)
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật hồ sơ")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error("Mật khẩu mới không khớp")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })

      if (error) {
        toast.error("Có lỗi xảy ra khi đổi mật khẩu")
      } else {
        toast.success("Đổi mật khẩu thành công!")
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      location: profile?.location || "",
    })
    setIsEditing(false)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tải hồ sơ...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show not authenticated state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để xem hồ sơ cá nhân</p>
          <Button asChild>
            <a href="/auth">Đăng nhập</a>
          </Button>
        </div>
      </div>
    )
  }

  // Show profile not found state
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hồ sơ không tìm thấy</h1>
          <p className="text-muted-foreground mb-4">
            Hồ sơ của bạn chưa được tạo. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
          </p>
          <Button onClick={refreshProfile} variant="outline">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'editor':
        return 'default'
      case 'writer':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'editor':
        return 'Biên tập viên'
      case 'writer':
        return 'Tác giả'
      default:
        return 'Độc giả'
    }
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {activeTab === 'saved' ? (
            <>
              <h1 className="text-3xl font-bold">Đã lưu & đã thích</h1>
              <p className="text-muted-foreground">Các bài viết bạn đã đánh dấu hoặc bày tỏ cảm xúc</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
              <p className="text-muted-foreground">Quản lý thông tin cá nhân và tài khoản</p>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${profile.role === 'reader' ? 'grid-cols-3' : 'grid-cols-3'}`}>
            {profile.role !== 'reader' ? (
              <>
                <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
                <TabsTrigger value="activity">Hoạt động</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
                <TabsTrigger value="saved">Đã thích</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="h-32 w-32 mx-auto mb-4">
                        <AvatarImage 
                          src={profile.avatar_url || "/placeholder.svg"} 
                          alt={`Avatar của ${profile.full_name || user.email}`}
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                        <AvatarFallback className="text-3xl">
                          {profile.full_name 
                            ? profile.full_name.split(" ").map((n: string) => n[0]).join("")
                            : user.email?.charAt(0).toUpperCase() || "U"
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Avatar Upload Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-white hover:bg-gray-50 border-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        title="Tải lên ảnh đại diện"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileSelect(file)
                          }
                          // Reset input value to allow selecting the same file again
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                    </div>
                    
                    <CardTitle className="text-xl">{profile.full_name || "Chưa có tên"}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <div className="flex justify-center mt-2">
                      <Badge variant={getRoleBadgeColor(profile.role)}>
                        {getRoleLabel(profile.role)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Tham gia từ {new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {profile.is_verified && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Shield className="h-4 w-4" />
                        <span>Tài khoản đã xác minh</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>Cập nhật lần cuối: {new Date(profile.updated_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                          </Button>
                          <Button onClick={handleSubmit} size="sm" disabled={saving}>
                            {saving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Lưu
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Họ và tên *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="full_name"
                              value={formData.full_name}
                              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                              className="pl-10"
                              disabled={!isEditing}
                              placeholder="Nhập họ và tên"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="email"
                              value={user.email || ""}
                              disabled
                              className="pl-10 bg-muted"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Giới thiệu</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Viết một vài dòng giới thiệu về bản thân..."
                          disabled={!isEditing}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="website"
                              type="url"
                              value={formData.website}
                              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://example.com"
                              className="pl-10"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Địa chỉ</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Thành phố, Quốc gia"
                              className="pl-10"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Settings (real-only) */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Cài đặt tài khoản</CardTitle>
                    <CardDescription>Quản lý cài đặt bảo mật</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Vai trò hiện tại</p>
                        <p className="text-sm text-muted-foreground">{getRoleLabel(profile.role)}</p>
                      </div>
                      <Badge variant={getRoleBadgeColor(profile.role)}>{getRoleLabel(profile.role)}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Trạng thái tài khoản</p>
                        <p className="text-sm text-muted-foreground">{profile.is_active ? "Hoạt động" : "Đã bị khóa"}</p>
                      </div>
                      <Badge variant={profile.is_active ? "default" : "destructive"}>{profile.is_active ? "Hoạt động" : "Đã khóa"}</Badge>
                    </div>

                    <div className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Xác minh hai yếu tố (MFA)</p>
                          <p className="text-sm text-muted-foreground">Bật để yêu cầu mã khi truy cập khu vực nhạy cảm</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Trạng thái yêu cầu MFA</span>
                        <input
                          type="checkbox"
                          checked={mfaEnabled}
                          onChange={(e)=>setMfaEnabled(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Hiện tại: {mfaEnabled ? 'Yêu cầu MFA' : 'Không yêu cầu'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab - For All Roles */}
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Đổi mật khẩu</span>
                  </CardTitle>
                  <CardDescription>Bảo mật tài khoản bằng mật khẩu mạnh</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="current_password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">Mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="new_password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="confirm_password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đổi mật khẩu...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Đổi mật khẩu
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* MFA settings moved to Profile tab → Account Settings */}
            </div>
          </TabsContent>

          {profile.role !== 'reader' && (
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Stats (real from user_stats view) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Thống kê hoạt động</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PenTool className="h-4 w-4 text-muted-foreground" />
                      <span>Bài viết đã xuất bản</span>
                    </div>
                    <Badge variant="secondary">{userStats?.articles_count ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Bình luận đã viết</span>
                    </div>
                    <Badge variant="secondary">{userStats?.comments_count ?? 0}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Ngày tham gia</span>
                    </div>
                    <Badge variant="outline">
                      {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>Lịch sử hoạt động của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Cập nhật hồ sơ</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile.updated_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Tham gia hệ thống</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          )}



          {/* Readers: Saved & Liked */}
          {profile.role === 'reader' && (
            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Đã thích</CardTitle>
                  <CardDescription>Bài viết bạn đã bày tỏ cảm xúc</CardDescription>
                </CardHeader>
                <CardContent>
                  <LikedArticles />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Avatar Crop Modal */}
        <AvatarCropModal
          isOpen={showCropModal}
          onClose={handleCropCancel}
          imageUrl={cropImageUrl}
          onCropConfirm={handleCropConfirm}
          uploading={uploadingAvatar}
        />
      </div>
    </div>
  )
}
