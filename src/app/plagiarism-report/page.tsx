"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Edit,
  UserCheck,
  ExternalLink,
  Loader2,
  Clock,
  BarChart3,
  Eye,
  Send,
} from "lucide-react"

type PlagiarismStep = "input" | "scanning" | "results" | "decision"
type SimilarityLevel = "critical" | "warning" | "clean"

interface PlagiarismMatch {
  text: string
  source: string
  url: string
  confidence: number
  type: "exact" | "paraphrase" | "similar"
  level: SimilarityLevel
}

const savedDrafts = [
  {
    id: 1,
    title: "Công nghệ AI đang thay đổi cách chúng ta làm việc trong năm 2024",
    content: `Trí tuệ nhân tạo (AI) đã không còn là một khái niệm xa vời mà đã trở thành một phần không thể thiếu trong cuộc sống và công việc hàng ngày của chúng ta. Năm 2024 đánh dấu một bước ngoặt quan trọng trong việc ứng dụng AI vào các lĩnh vực khác nhau.

Theo nghiên cứu mới nhất từ McKinsey Global Institute, AI có thể tự động hóa khoảng 30% các công việc hiện tại vào năm 2030. Tuy nhiên, điều này không có nghĩa là sẽ có 30% lao động bị thất nghiệp, mà thay vào đó, bản chất công việc sẽ thay đổi.

Các công việc đòi hỏi tư duy sáng tạo, giải quyết vấn đề phức tạp và tương tác con người sẽ trở nên quan trọng hơn bao giờ hết. Trong khi đó, các tác vụ lặp đi lặp lại, có thể dự đoán được sẽ được AI đảm nhận.`,
    wordCount: 156,
    lastModified: "2024-01-15",
  },
  {
    id: 2,
    title: "Blockchain và tương lai của tài chính số",
    content: `Công nghệ blockchain đang mở ra những cơ hội mới cho hệ thống tài chính toàn cầu. Với khả năng tạo ra các giao dịch minh bạch, an toàn và không thể thay đổi, blockchain hứa hẹn sẽ cách mạng hóa cách chúng ta quản lý tiền bạc.`,
    wordCount: 45,
    lastModified: "2024-01-14",
  },
]

const mockMatches: PlagiarismMatch[] = [
  {
    text: "AI có thể tự động hóa khoảng 30% các công việc hiện tại vào năm 2030",
    source: "McKinsey Global Institute Report 2024",
    url: "https://mckinsey.com/ai-report-2024",
    confidence: 95,
    type: "exact",
    level: "critical",
  },
  {
    text: "Trí tuệ nhân tạo đã trở thành một phần không thể thiếu",
    source: "TechCrunch - AI in Daily Life",
    url: "https://techcrunch.com/ai-daily-life",
    confidence: 78,
    type: "paraphrase",
    level: "warning",
  },
  {
    text: "các tác vụ lặp đi lặp lại, có thể dự đoán được sẽ được AI đảm nhận",
    source: "Harvard Business Review",
    url: "https://hbr.org/future-of-work",
    confidence: 65,
    type: "similar",
    level: "clean",
  },
]

export default function PlagiarismReportPage() {
  const [currentStep, setCurrentStep] = useState<PlagiarismStep>("input")
  const [selectedDraft, setSelectedDraft] = useState("")
  const [customContent, setCustomContent] = useState("")
  const [scanProgress, setScanProgress] = useState(0)
  const [overallSimilarity, setOverallSimilarity] = useState(0)
  const [matches, setMatches] = useState<PlagiarismMatch[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [validationError, setValidationError] = useState("")

  const getCurrentContent = () => {
    if (selectedDraft) {
      const draft = savedDrafts.find((d) => d.id.toString() === selectedDraft)
      return draft?.content || ""
    }
    return customContent
  }

  const getCurrentWordCount = () => {
    const content = getCurrentContent()
    return content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  useEffect(() => {
    setWordCount(getCurrentWordCount())
  }, [selectedDraft, customContent])

  const validateContent = () => {
    const content = getCurrentContent()
    const words = getCurrentWordCount()

    if (!content.trim()) {
      setValidationError("Vui lòng nhập nội dung bài viết")
      return false
    }

    if (words < 50) {
      setValidationError("Nội dung quá ngắn. Cần ít nhất 50 từ để kiểm tra đạo văn hiệu quả.")
      return false
    }

    if (words > 20000) {
      setValidationError("Nội dung quá dài. Tối đa 20,000 từ cho mỗi lần kiểm tra.")
      return false
    }

    setValidationError("")
    return true
  }

  const handleRunCheck = async () => {
    if (!validateContent()) return

    setCurrentStep("scanning")
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Set mock results
    setOverallSimilarity(32)
    setMatches(mockMatches)
    setCurrentStep("results")
    setIsScanning(false)
  }

  const getHighlightedContent = (content: string) => {
    let highlightedContent = content
    matches.forEach((match, index) => {
      const regex = new RegExp(match.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
      const colorClass =
        match.level === "critical"
          ? "bg-red-200 dark:bg-red-900/40 border-red-500"
          : match.level === "warning"
            ? "bg-yellow-200 dark:bg-yellow-900/40 border-yellow-500"
            : "bg-blue-200 dark:bg-blue-900/40 border-blue-500"

      highlightedContent = highlightedContent.replace(
        regex,
        (matched) => `<mark class="${colorClass} px-1 rounded border-l-2" data-match="${index}">${matched}</mark>`,
      )
    })
    return highlightedContent
  }

  const getSimilarityLevel = (score: number): SimilarityLevel => {
    if (score >= 25) return "critical"
    if (score >= 15) return "warning"
    return "clean"
  }

  const getSimilarityColor = (level: SimilarityLevel) => {
    switch (level) {
      case "critical":
        return "text-red-600 dark:text-red-400"
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "clean":
        return "text-green-600 dark:text-green-400"
    }
  }

  const getSimilarityBadge = (level: SimilarityLevel) => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive">Nguy hiểm</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20">
            Cảnh báo
          </Badge>
        )
      case "clean":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20">
            An toàn
          </Badge>
        )
    }
  }

  const currentLevel = getSimilarityLevel(overallSimilarity)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Kiểm tra đạo văn</h1>
          </div>
          <p className="text-muted-foreground">
            Phân tích nội dung bài viết để phát hiện các đoạn văn bản có thể trùng lặp với nguồn khác
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "input" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className={currentStep === "input" ? "font-medium" : "text-muted-foreground"}>Nhập nội dung</span>
            </div>
            <div className="flex-1 h-px bg-muted"></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "scanning" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className={currentStep === "scanning" ? "font-medium" : "text-muted-foreground"}>
                Quét nội dung
              </span>
            </div>
            <div className="flex-1 h-px bg-muted"></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === "results" || currentStep === "decision"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span
                className={
                  currentStep === "results" || currentStep === "decision" ? "font-medium" : "text-muted-foreground"
                }
              >
                Kết quả
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Input */}
        {currentStep === "input" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Chọn nội dung kiểm tra</span>
                </CardTitle>
                <CardDescription>Chọn bài viết đã lưu hoặc dán nội dung mới để kiểm tra đạo văn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Draft Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chọn bài viết đã lưu</label>
                  <Select value={selectedDraft} onValueChange={setSelectedDraft}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bài viết từ danh sách đã lưu" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedDrafts.map((draft) => (
                        <SelectItem key={draft.id} value={draft.id.toString()}>
                          <div className="flex flex-col">
                            <span>{draft.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {draft.wordCount} từ • {draft.lastModified}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-muted"></div>
                  <span className="text-sm text-muted-foreground">HOẶC</span>
                  <div className="flex-1 h-px bg-muted"></div>
                </div>

                {/* Custom Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dán nội dung mới</label>
                  <Textarea
                    placeholder="Dán nội dung bài viết cần kiểm tra đạo văn..."
                    rows={12}
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    disabled={!!selectedDraft}
                  />
                </div>

                {/* Word Count and Validation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>{wordCount} từ</span>
                    {wordCount > 0 && (
                      <span>• {wordCount < 50 ? "Quá ngắn" : wordCount > 20000 ? "Quá dài" : "Độ dài phù hợp"}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Tối thiểu: 50 từ • Tối đa: 20,000 từ</div>
                </div>

                {/* Validation Error */}
                {validationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {/* Run Check Button */}
                <Button
                  className="w-full"
                  onClick={handleRunCheck}
                  disabled={!getCurrentContent().trim() || wordCount < 50 || wordCount > 20000}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Bắt đầu kiểm tra đạo văn
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Scanning */}
        {currentStep === "scanning" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Đang quét nội dung...</h2>
                    <p className="text-muted-foreground">Đang so sánh với hàng triệu nguồn trên internet</p>
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <Progress value={scanProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground">{Math.round(scanProgress)}% hoàn thành</p>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Thời gian ước tính: 30-60 giây</span>
                    </div>
                    <p>Đang kiểm tra {wordCount} từ trong cơ sở dữ liệu toàn cầu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Results */}
        {(currentStep === "results" || currentStep === "decision") && (
          <div className="space-y-6">
            {/* Overall Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tỷ lệ tương đồng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getSimilarityColor(currentLevel)}`}>
                        {overallSimilarity}%
                      </span>
                      {currentLevel === "critical" ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : currentLevel === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <Progress value={overallSimilarity} className="h-2" />
                    {getSimilarityBadge(currentLevel)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Nguồn phát hiện</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{matches.length}</span>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Nguồn có nội dung tương đồng</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentLevel === "critical" ? (
                      <>
                        <Badge variant="destructive">Không được phép</Badge>
                        <p className="text-xs text-muted-foreground">Cần chỉnh sửa trước khi gửi</p>
                      </>
                    ) : currentLevel === "warning" ? (
                      <>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20">
                          Cần xem xét
                        </Badge>
                        <p className="text-xs text-muted-foreground">Nên kiểm tra và chỉnh sửa</p>
                      </>
                    ) : (
                      <>
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20">
                          Có thể gửi
                        </Badge>
                        <p className="text-xs text-muted-foreground">An toàn để xuất bản</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content with Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Nội dung được phân tích</CardTitle>
                <CardDescription>
                  Các đoạn văn bản được tô sáng cho thấy mức độ tương đồng với các nguồn khác
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-200 dark:bg-red-900/40 rounded border-l-2 border-red-500"></div>
                      <span>Nguy hiểm (≥25%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/40 rounded border-l-2 border-yellow-500"></div>
                      <span>Cảnh báo (15-24%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/40 rounded border-l-2 border-blue-500"></div>
                      <span>An toàn (&lt;15%)</span>
                    </div>
                  </div>

                  <div
                    className="prose prose-lg max-w-none dark:prose-invert leading-relaxed p-4 border rounded-lg bg-muted/30"
                    dangerouslySetInnerHTML={{ __html: getHighlightedContent(getCurrentContent()) }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết nguồn tương đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matches.map((match, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{match.source}</h4>
                            {getSimilarityBadge(match.level)}
                          </div>
                          <blockquote className="border-l-4 border-primary pl-4 italic bg-muted/50 p-3 rounded-r mb-3">
                            "{match.text}"
                          </blockquote>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Độ tin cậy:</span>
                              <span className={`font-medium ${getSimilarityColor(match.level)}`}>
                                {match.confidence}%
                              </span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={match.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Xem nguồn
                              </a>
                            </Button>
                          </div>
                          <Progress value={match.confidence} className="mt-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Decision Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {currentLevel === "critical" ? (
                    <>
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Không thể gửi bài viết!</strong> Tỷ lệ tương đồng quá cao. Vui lòng chỉnh sửa nội dung
                          trước khi gửi duyệt.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-wrap gap-3">
                        <Button className="flex-1 sm:flex-none">
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa bài viết
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Yêu cầu xem xét
                        </Button>
                        <Button variant="ghost" onClick={() => setCurrentStep("input")}>
                          Kiểm tra bài khác
                        </Button>
                      </div>
                    </>
                  ) : currentLevel === "warning" ? (
                    <>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Cần xem xét!</strong> Có một số đoạn văn tương đồng. Bạn nên chỉnh sửa hoặc yêu cầu
                          biên tập viên xem xét.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-wrap gap-3">
                        <Button className="flex-1 sm:flex-none">
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa bài viết
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Đánh dấu đã kiểm tra
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Yêu cầu xem xét
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          <strong>Kiểm tra thành công!</strong> Nội dung có tỷ lệ tương đồng thấp. Bạn có thể gửi bài
                          viết đến biên tập viên.
                        </AlertDescription>
                      </Alert>
                      <div className="flex flex-wrap gap-3">
                        <Button className="flex-1 sm:flex-none">
                          <Send className="mr-2 h-4 w-4" />
                          Gửi đến biên tập viên
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
                          <Eye className="mr-2 h-4 w-4" />
                          Xem trước bài viết
                        </Button>
                        <Button variant="ghost" onClick={() => setCurrentStep("input")}>
                          Kiểm tra bài khác
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
