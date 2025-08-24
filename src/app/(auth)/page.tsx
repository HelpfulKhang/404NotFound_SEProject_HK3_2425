"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Chrome, Facebook, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function AuthPage() {
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth()

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ email: '', password: '', confirm: '', fullName: '', role: 'reader' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(loginData.email, loginData.password)
    setLoading(false)
    if (error) return toast.error(error.message)
    const redirectTo = searchParams.get('redirectTo')
    router.replace(redirectTo ? decodeURIComponent(redirectTo) : '/')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (registerData.password !== registerData.confirm) return toast.error('Mật khẩu xác nhận không khớp')
    if (registerData.password.length < 8) return toast.error('Mật khẩu phải có ít nhất 8 ký tự')
    setLoading(true)
    const { error } = await signUp(registerData.email, registerData.password, registerData.fullName, registerData.role)
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Đăng ký thành công! Vui lòng đăng nhập')
    setMode('login')
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left - Auth form */}
      <div className="w-[30%] h-full overflow-auto no-scrollbar flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-sm space-y-8">
          {/* Header with Logo */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-9 w-9 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">VN</span>
              </div>
              <span className="font-bold text-xl text-black">VietNews</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
              <button className={mode==='login' ? 'font-semibold text-black' : ''} onClick={()=>setMode('login')}>Đăng nhập</button>
              <span>·</span>
              <button className={mode==='register' ? 'font-semibold text-black' : ''} onClick={()=>setMode('register')}>Đăng ký</button>
            </div>
          </div>

          {mode==='login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-black text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="login-email" type="email" value={loginData.email} onChange={(e)=>setLoginData({...loginData,email:e.target.value})} className="pl-10 h-11 text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-black text-sm">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="login-password" type={showPassword? 'text':'password'} value={loginData.password} onChange={(e)=>setLoginData({...loginData,password:e.target.value})} className="pl-10 pr-10 h-11 text-sm" required />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-sm bg-black hover:bg-gray-800" disabled={loading}>{loading? 'Đang đăng nhập...':'Đăng nhập'}</Button>
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full h-11 text-sm" onClick={()=>signInWithGoogle()}><Chrome className="mr-2 h-4 w-4"/>Đăng nhập với Google</Button>
                <Button type="button" variant="outline" className="w-full h-11 text-sm" onClick={()=>signInWithFacebook()}><Facebook className="mr-2 h-4 w-4"/>Đăng nhập với Facebook</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-black text-sm">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="fullName" value={registerData.fullName} onChange={(e)=>setRegisterData({...registerData,fullName:e.target.value})} className="pl-10 h-11 text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-black text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="reg-email" type="email" value={registerData.email} onChange={(e)=>setRegisterData({...registerData,email:e.target.value})} className="pl-10 h-11 text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-black text-sm">Vai trò</Label>
                <Select value={registerData.role} onValueChange={(v)=>setRegisterData({...registerData,role:v})}>
                  <SelectTrigger className="h-11 text-sm">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reader">Độc giả</SelectItem>
                    <SelectItem value="writer">Tác giả</SelectItem>
                    <SelectItem value="editor">Biên tập viên</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-black text-sm">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="reg-password" type={showPassword? 'text':'password'} value={registerData.password} onChange={(e)=>setRegisterData({...registerData,password:e.target.value})} className="pl-10 pr-10 h-11 text-sm" required />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-black text-sm">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="confirm" type={showConfirmPassword? 'text':'password'} value={registerData.confirm} onChange={(e)=>setRegisterData({...registerData,confirm:e.target.value})} className="pl-10 pr-10 h-11 text-sm" required />
                  <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-sm bg-black hover:bg-gray-800" disabled={loading}>{loading? 'Đang tạo tài khoản...':'Tạo tài khoản'}</Button>
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full h-11 text-sm" onClick={()=>signInWithGoogle()}><Chrome className="mr-2 h-4 w-4"/>Đăng ký với Google</Button>
                <Button type="button" variant="outline" className="w-full h-11 text-sm" onClick={()=>signInWithFacebook()}><Facebook className="mr-2 h-4 w-4"/>Đăng ký với Facebook</Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right - Background */}
      <div className="w-[70%] h-full bg-center bg-no-repeat" style={{ backgroundImage: "url('/auth.jpg')", backgroundSize: 'auto 100%' }} />
    </div>
  )
}


