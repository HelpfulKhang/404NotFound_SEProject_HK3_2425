"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Mail,
  Key,
  Lock,
  Timer,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type MFAStep = "code" | "invalid" | "fallback" | "success" | "locked" | "enroll"
type FallbackMethod = "backup" | "email" | "hardware"

export default function VerifyMFAPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const returnTo = searchParams.get("returnTo") || "/dashboard"
  const [currentStep, setCurrentStep] = useState<MFAStep>("code")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [backupCode, setBackupCode] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds for code expiry
  const [lockTimeLeft, setLockTimeLeft] = useState(300) // 5 minutes lock
  const [selectedFallback, setSelectedFallback] = useState<FallbackMethod>("backup")
  const [emailSent, setEmailSent] = useState(false)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loadingInit, setLoadingInit] = useState(true)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize: send a 6-digit code to user's email for verification
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true)
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.replace("/login")
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      const email = userData.user?.email
      if (email) {
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } as any })
        setEmailSent(true)
      }
      setCurrentStep("code")
      setLoadingInit(false)
    }
    void init()
  }, [router])

  // Countdown timer for code expiry
  useEffect(() => {
    if (timeLeft > 0 && currentStep === "code") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && currentStep === "code") {
      // Code expired, need to refresh
      setTimeLeft(30)
    }
  }, [timeLeft, currentStep])

  // Countdown timer for account lock
  useEffect(() => {
    if (lockTimeLeft > 0 && currentStep === "locked") {
      const timer = setTimeout(() => setLockTimeLeft(lockTimeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (lockTimeLeft === 0 && currentStep === "locked") {
      setCurrentStep("code")
      setAttemptsLeft(3)
      setLockTimeLeft(300)
    }
  }, [lockTimeLeft, currentStep])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== "") && !isVerifying) {
      handleVerifyCode(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async (verificationCode: string) => {
    setIsVerifying(true)
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email || ""
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: verificationCode,
      type: 'email' as any,
    })
    if (!error) {
      try {
        // Mark step-up verified for a short window to prevent immediate re-prompt
        const ttlMs = 30 * 60 * 1000 // 30 minutes
        localStorage.setItem('mfa_verified_until', String(Date.now() + ttlMs))
      } catch {}
      setCurrentStep("success")
      setTimeout(() => router.replace(returnTo), 800)
    } else {
      const newAttemptsLeft = attemptsLeft - 1
      setAttemptsLeft(newAttemptsLeft)
      if (newAttemptsLeft <= 0) setCurrentStep("locked")
      else setCurrentStep("invalid")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
    setIsVerifying(false)
  }

  const handleFallbackVerification = async (method: FallbackMethod, value: string) => {
    setIsVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock verification logic for different methods
    let isValid = false
    switch (method) {
      case "backup":
        isValid = value === "BACKUP123"
        break
      case "email":
        isValid = value === "789012"
        break
      case "hardware":
        isValid = true // Hardware key always succeeds in demo
        break
    }

    if (isValid) {
      setCurrentStep("success")
    } else {
      // Handle failure for fallback methods
      setAttemptsLeft((prev) => prev - 1)
      if (attemptsLeft <= 1) {
        setCurrentStep("locked")
      }
    }

    setIsVerifying(false)
  }

  const handleSendEmailCode = async () => {
    setIsVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setEmailSent(true)
    setIsVerifying(false)
  }

  const resetToCodeEntry = () => {
    setCurrentStep("code")
    setCode(["", "", "", "", "", ""])
    setTimeLeft(30)
  }

  // Loading init
  if (loadingInit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="text-sm text-muted-foreground flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Đang chuẩn bị xác thực...
        </div>
      </div>
    )
  }

  // Success State
  if (currentStep === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="h-10 w-10 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold">VN</span>
              </div>
              <span className="font-bold text-2xl">VietNews</span>
            </Link>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-green-600 dark:text-green-400">Xác thực thành công!</h2>
                  <p className="text-sm text-muted-foreground">Tài khoản của bạn đã được xác thực an toàn</p>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/dashboard">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Tiếp tục vào Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Account Locked State
  if (currentStep === "locked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="h-10 w-10 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold">VN</span>
              </div>
              <span className="font-bold text-2xl">VietNews</span>
            </Link>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Tài khoản tạm khóa</h2>
                  <p className="text-sm text-muted-foreground">
                    Bạn đã nhập sai mã xác thực quá nhiều lần. Vui lòng thử lại sau:
                  </p>
                  <div className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                    {formatTime(lockTimeLeft)}
                  </div>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Để bảo mật tài khoản, chúng tôi đã tạm khóa xác thực. Bạn có thể liên hệ hỗ trợ nếu cần thiết.
                  </AlertDescription>
                </Alert>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/support">Liên hệ hỗ trợ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold">VN</span>
            </div>
            <span className="font-bold text-2xl">VietNews</span>
          </Link>
          <p className="text-muted-foreground">Xác thực bảo mật hai lớp</p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {currentStep === "code" && "Nhập mã xác thực"}
              {currentStep === "invalid" && "Mã không chính xác"}
            </CardTitle>
            <CardDescription className="text-center">
              Nhập mã 6 số được gửi tới email của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 & 2: Code Entry and Invalid Code */}
            {(currentStep === "code" || currentStep === "invalid") && (
              <>
                {/* Timer */}
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Timer className={`h-4 w-4 ${timeLeft <= 10 ? "text-red-500" : "text-muted-foreground"}`} />
                  <span className={timeLeft <= 10 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                    Mã hết hạn sau: {timeLeft}s
                  </span>
                </div>

                {/* Error for invalid attempts */}
                {currentStep === "invalid" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Mã xác thực không đúng. Còn lại {attemptsLeft} lần thử.</AlertDescription>
                  </Alert>
                )}

                {/* Code Input */}
                <div className="space-y-4">
                  <Label className="text-center block">Mã xác thực 6 số</Label>
                  <div className="flex justify-center space-x-2">
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-mono"
                        disabled={isVerifying}
                      />
                    ))}
                  </div>
                </div>

                {/* Attempts Counter */}
                {attemptsLeft < 3 && (
                  <div className="text-center">
                    <Badge variant="destructive">Còn lại {attemptsLeft} lần thử</Badge>
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  className="w-full"
                  onClick={() => handleVerifyCode(code.join(""))}
                  disabled={code.some((digit) => digit === "") || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    "Xác thực"
                  )}
                </Button>

                {/* Resend */}
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">Không nhận được mã?</p>
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const { data: userData } = await supabase.auth.getUser()
                        const email = userData.user?.email
                        if (email) {
                          setIsVerifying(true)
                          await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } as any })
                          setEmailSent(true)
                          setIsVerifying(false)
                        }
                      }}
                    >
                      Gửi lại mã
                    </Button>
                  </div>
                </div>
              </>
            )}

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Để bảo mật tài khoản, vui lòng không chia sẻ mã xác thực với bất kỳ ai.
        </div>
      </div>
    </div>
  )
}
