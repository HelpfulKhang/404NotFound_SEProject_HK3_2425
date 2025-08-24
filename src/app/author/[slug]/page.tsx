import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Eye, MessageCircle, MapPin, Calendar, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { supabase } from "@/lib/supabase"
import { headers } from "next/headers"

// No achievements: only real profile data

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)

  let profile: any = null
  if (isUuid) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', slug)
      .maybeSingle()
    profile = data
  } else {
    const name = slug.replace(/-/g, ' ')
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', name)
      .maybeSingle()
    profile = data
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Không tìm thấy tác giả</h1>
      </div>
    )
  }

  const { data: authored } = await supabase
    .from('articles')
    .select('*')
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={((await headers()).get('referer')) || '/'} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Author Profile */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">NA</AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-xl font-bold">{profile?.full_name}</h1>
                  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{profile?.location || ""}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{profile?.bio || ''}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y">
                   <div className="text-center">
                     <div className="font-bold text-lg">{authored?.length || 0}</div>
                     <div className="text-xs text-muted-foreground">Bài viết</div>
                   </div>
                  <div className="text-center">
                     <div className="font-bold text-lg">{(authored?.reduce((s,a)=>s+(a.views||0),0)/1000000).toFixed(1)}M</div>
                    <div className="text-xs text-muted-foreground">Lượt xem</div>
                  </div>
                  <div className="text-center">
                     <div className="font-bold text-lg">0</div>
                    <div className="text-xs text-muted-foreground">Theo dõi</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Tham gia {new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {profile.website && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <a href={profile.website} className="hover:text-primary transition-colors">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="articles">Bài viết</TabsTrigger>
              <TabsTrigger value="about">Giới thiệu</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Bài viết của {profile.full_name}</h2>
                <div className="text-sm text-muted-foreground">{authored?.length || 0} bài viết</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(authored || []).map((article) => (
                  <Card key={article.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative">
                        <Image
                          src={article.image_url || (article as any).featured_image_url || "/placeholder.svg"}
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
                            <span>{new Date(article.published_at || article.created_at).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span>{article.read_time || 0} phút đọc</span>
                          </div>
                          <div className="flex items-center space-x-3 text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{article.comments_count}</span>
                            </div>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

                <div className="text-center text-sm text-muted-foreground">Hết bài viết</div>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Về {profile.full_name}</h3>
                  <div className="space-y-4">
                    {profile.bio ? (
                      <p className="leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="leading-relaxed text-muted-foreground">Tác giả chưa cập nhật giới thiệu.</p>
                    )}
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
