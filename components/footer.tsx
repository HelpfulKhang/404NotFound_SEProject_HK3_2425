import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">VN</span>
              </div>
              <span className="font-bold text-xl">VietNews</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Trang tin tức hàng đầu Việt Nam, cung cấp thông tin chính xác, kịp thời về các lĩnh vực kinh tế, xã hội,
              công nghệ và đời sống.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Danh mục</h3>
            <div className="space-y-2 text-sm">
              <Link href="/category/thoi-su" className="block text-muted-foreground hover:text-primary">
                Thời sự
              </Link>
              <Link href="/category/the-gioi" className="block text-muted-foreground hover:text-primary">
                Thế giới
              </Link>
              <Link href="/category/kinh-doanh" className="block text-muted-foreground hover:text-primary">
                Kinh doanh
              </Link>
              <Link href="/category/cong-nghe" className="block text-muted-foreground hover:text-primary">
                Công nghệ
              </Link>
              <Link href="/category/the-thao" className="block text-muted-foreground hover:text-primary">
                Thể thao
              </Link>
              <Link href="/category/giai-tri" className="block text-muted-foreground hover:text-primary">
                Giải trí
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dịch vụ</h3>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block text-muted-foreground hover:text-primary">
                Về chúng tôi
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-primary">
                Liên hệ
              </Link>
              <Link href="/advertise" className="block text-muted-foreground hover:text-primary">
                Quảng cáo
              </Link>
              <Link href="/careers" className="block text-muted-foreground hover:text-primary">
                Tuyển dụng
              </Link>
              <Link href="/rss" className="block text-muted-foreground hover:text-primary">
                RSS Feed
              </Link>
              <Link href="/sitemap" className="block text-muted-foreground hover:text-primary">
                Sitemap
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liên hệ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Tầng 10, Tòa nhà ABC
                  <br />
                  123 Đường XYZ, Quận 1<br />
                  TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">+84 28 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contact@vietnews.com</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VietNews. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary">
              Điều khoản sử dụng
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-primary">
              Chính sách Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
