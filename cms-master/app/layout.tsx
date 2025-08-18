import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeProvider as CmsThemeProvider } from '@/lib/theme-context'

export const metadata: Metadata = {
  title: 'StreamLine - Page Builder CMS',
  description: 'Streamline your workflow like never before',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CmsThemeProvider>
              {children}
          </CmsThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
