"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { X, Filter, Calendar as CalendarIcon, Search, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export interface FilterOptions {
  categories: string[]
  tags: string[]
  authors: string[]
  dateFrom?: Date
  dateTo?: Date
  keyword: string
}

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onApplyFilters: () => void
}

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters
}: FilterSidebarProps) {
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load available filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true)
      try {
        // Load categories
        const { data: categoriesData } = await supabase
          .from('articles')
          .select('category')
          .eq('status', 'published')
          .not('category', 'is', null)

        const categories = [...new Set(categoriesData?.map(item => item.category).filter(Boolean) || [])]
        setAvailableCategories(categories)

        // Load tags
        const { data: articlesData } = await supabase
          .from('articles')
          .select('tags')
          .eq('status', 'published')
          .not('tags', 'is', null)

        const allTags = articlesData
          ?.flatMap(article => article.tags || [])
          .filter(Boolean) || []
        const uniqueTags = [...new Set(allTags)]
        setAvailableTags(uniqueTags)

        // Load authors
        const { data: authorsData } = await supabase
          .from('articles')
          .select('author_name')
          .eq('status', 'published')
          .not('author_name', 'is', null)

        const authors = [...new Set(authorsData?.map(item => item.author_name).filter(Boolean) || [])]
        setAvailableAuthors(authors)
      } catch (error) {
        console.error('Error loading filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [])

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleAuthorToggle = (author: string) => {
    const newAuthors = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author]
    
    onFiltersChange({ ...filters, authors: newAuthors })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateFrom: date })
  }

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateTo: date })
  }

  const handleKeywordChange = (keyword: string) => {
    onFiltersChange({ ...filters, keyword })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      categories: [],
      tags: [],
      authors: [],
      dateFrom: undefined,
      dateTo: undefined,
      keyword: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.tags.length > 0 ||
           filters.authors.length > 0 ||
           filters.dateFrom ||
           filters.dateTo ||
           filters.keyword.trim() !== ''
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-background border-r z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h2 className="font-semibold">Bộ lọc</h2>
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Xóa
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Keyword Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Từ khóa</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Tìm kiếm trong tiêu đề, nội dung..."
                  value={filters.keyword}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                  className="text-sm"
                />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Danh mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Đang tải...</div>
                ) : (
                  availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {category}
                      </Label>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {availableTags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Thẻ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Authors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tác giả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Đang tải...</div>
                ) : (
                  availableAuthors.slice(0, 10).map((author) => (
                    <div key={author} className="flex items-center space-x-2">
                      <Checkbox
                        id={`author-${author}`}
                        checked={filters.authors.includes(author)}
                        onCheckedChange={() => handleAuthorToggle(author)}
                      />
                      <Label
                        htmlFor={`author-${author}`}
                        className="text-sm cursor-pointer flex-1 truncate"
                      >
                        {author}
                      </Label>
                    </div>
                  ))
                )}
                {availableAuthors.length > 10 && (
                  <div className="text-xs text-muted-foreground pt-2">
                    +{availableAuthors.length - 10} tác giả khác
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thời gian xuất bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Từ ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "PPP", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={handleDateFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Đến ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          format(filters.dateTo, "PPP", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={handleDateToChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button 
              onClick={onApplyFilters}
              className="w-full"
              disabled={!hasActiveFilters()}
            >
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
