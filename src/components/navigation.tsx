"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, User, Settings, LogOut, PenTool, Plus } from "lucide-react"
import SearchBar from "@/components/search-bar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
 
import { toast } from "sonner"

import { supabase } from "@/lib/supabase"

export function Navigation() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  const [navCategories, setNavCategories] = useState<{ name: string; slug: string }[]>([])
  const router = useRouter()


  // Ensure profile is loaded when user exists
  useEffect(() => {
    if (user && !profile) {
      void refreshProfile()
    }
  }, [user, profile, refreshProfile])

  useEffect(() => {
    const loadCats = async () => {
      const { data } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('is_active', true)
        .order('name')
      setNavCategories((data as any) || [])
    }
    void loadCats()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error)
        toast.error("Có lỗi xảy ra khi đăng xuất")
      } else {
        console.log('Sign out successful')
        toast.success("Đã đăng xuất thành công")
      }
    } catch (error) {
      console.error('Sign out exception:', error)
      toast.error("Có lỗi xảy ra khi đăng xuất")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">VN</span>
              </div>
              <span className="font-bold text-xl">VietNews</span>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Article Button - Only show for writers */}
            {!loading && profile?.role === 'writer' && (
              <Button asChild className="hidden md:flex">
                <Link href="/create-article">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài viết
                </Link>
              </Button>
            )}

            <ModeToggle />

            {loading ? (
              // While auth is loading, don't flash wrong UI
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || "User"} />
                      <AvatarFallback>
                        {profile?.full_name 
                          ? profile.full_name.split(" ").map(n => n[0]).join("")
                          : user?.email?.charAt(0).toUpperCase() || "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'writer' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/create-article">
                          <Plus className="mr-2 h-4 w-4" />
                          Tạo bài viết
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <PenTool className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {(profile?.role === 'editor' || profile?.role === 'admin') && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=manage">
                        <PenTool className="mr-2 h-4 w-4" />
                        Quản lý bài viết
                      </Link>
                    </DropdownMenuItem>
                  )}

                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">Đăng ký</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="relative">
                    <SearchBar />
                  </div>

                  {/* Create Article Button for Mobile (writer only) */}
                  {profile?.role === 'writer' && (
                    <Button asChild className="w-full">
                      <Link href="/create-article">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo bài viết
                      </Link>
                    </Button>
                  )}

                  {(profile?.role === 'editor' || profile?.role === 'admin') && (
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard?tab=manage">
                        <PenTool className="mr-2 h-4 w-4" />
                        Quản lý bài viết
                      </Link>
                    </Button>
                  )}
                  {profile?.role === 'reader' && (
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/profile?tab=saved">
                        <PenTool className="mr-2 h-4 w-4" />
                        Đã thích
                      </Link>
                    </Button>
                  )}

                  <div className="space-y-2">
                    {navCategories.map((category) => (
                      <Button key={category.slug} variant="ghost" className="w-full justify-start" asChild>
                        <Link href={`/category/${category.slug}`}>{category.name}</Link>
                      </Button>
                    ))}
                  </div>

                  {!user && (
                    <div className="space-y-2 pt-4 border-t">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/auth">Đăng nhập</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/auth">Đăng ký</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Categories */}
        <div className="hidden md:flex h-12 items-center space-x-6 border-t overflow-x-auto no-scrollbar">
          {navCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
