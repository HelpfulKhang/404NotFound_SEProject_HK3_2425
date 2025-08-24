"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getLayoutConfig } from "@/lib/layout-config"

interface DynamicLayoutProps {
  children: React.ReactNode
}

export function DynamicLayout({ children }: DynamicLayoutProps) {
  const pathname = usePathname()
  const config = getLayoutConfig(pathname)
  
  return (
    <div className={config.className || "min-h-screen flex flex-col"}>
      {config.showNavigation && <Navigation />}
      <main className={config.fullHeight ? "flex-1" : "flex-1"}>{children}</main>
      {config.showFooter && <Footer />}
    </div>
  )
}
