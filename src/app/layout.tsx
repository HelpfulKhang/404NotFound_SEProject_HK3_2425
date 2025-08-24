import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { DynamicLayout } from "@/components/dynamic-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'VietNews - Tin tức nhanh, chính xác',
    template: '%s | VietNews',
  },
  description: 'Trang tin tức hàng đầu Việt Nam: Kinh doanh, Công nghệ, Thời sự, Thể thao...',
  keywords: ['tin tức', 'báo chí', 'Việt Nam', 'kinh doanh', 'công nghệ', 'thời sự'],
  authors: [{ name: 'VietNews' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'VietNews',
    title: 'VietNews - Tin tức nhanh, chính xác',
    description: 'Trang tin tức hàng đầu Việt Nam: Kinh doanh, Công nghệ, Thời sự, Thể thao...',
    images: [{ url: '/placeholder-logo.png', width: 1200, height: 630, alt: 'VietNews' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VietNews - Tin tức nhanh, chính xác',
    description: 'Trang tin tức hàng đầu Việt Nam: Kinh doanh, Công nghệ, Thời sự, Thể thao...',
    images: ['/placeholder-logo.png'],
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <DynamicLayout>
              {children}
            </DynamicLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
