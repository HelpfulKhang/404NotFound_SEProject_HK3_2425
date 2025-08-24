export interface LayoutConfig {
  showNavigation: boolean
  showFooter: boolean
  fullHeight?: boolean
  className?: string
}

export const LAYOUT_CONFIGS: Record<string, LayoutConfig> = {
  // Auth pages - no nav, no footer, full height
  '/auth': {
    showNavigation: false,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen overflow-hidden'
  },
  '/login': {
    showNavigation: false,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen overflow-hidden'
  },
  '/register': {
    showNavigation: false,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen overflow-hidden'
  },
  '/verify-mfa': {
    showNavigation: false,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen overflow-hidden'
  },
  '/signout': {
    showNavigation: false,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen overflow-hidden'
  },
  '/test-registration': {
    showNavigation: false,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen overflow-hidden'
  },
  
  // Dashboard pages - nav, no footer
  '/dashboard': {
    showNavigation: true,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen'
  },
  '/create-article': {
    showNavigation: true,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen'
  },
  '/profile': {
    showNavigation: true,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen'
  },
  
  // Article pages - nav, no footer for better reading
  '/article': {
    showNavigation: true,
    showFooter: false,
    fullHeight: true,
    className: 'min-h-screen'
  },
  
  // Author pages - nav and footer
  '/author': {
    showNavigation: true,
    showFooter: true,
    fullHeight: false,
    className: 'min-h-screen flex flex-col'
  },
  
  // Default - nav and footer
  'default': {
    showNavigation: true,
    showFooter: true,
    fullHeight: false,
    className: 'min-h-screen flex flex-col'
  }
}

export function getLayoutConfig(pathname: string): LayoutConfig {
  // Check for exact matches first
  if (LAYOUT_CONFIGS[pathname]) {
    return LAYOUT_CONFIGS[pathname]
  }
  
  // Check for path prefixes (e.g., /article/123 should use /article config)
  for (const [path, config] of Object.entries(LAYOUT_CONFIGS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return config
    }
  }
  
  // Return default config
  return LAYOUT_CONFIGS['default']
}
