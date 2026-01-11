import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NavigationProvider } from "@/components/providers/navigation-provider"
import { PageTransition } from "@/components/layout/page-transition"

export const metadata: Metadata = {
  title: "NotLinear - Task Management",
  description: "A Linear + GitHub hybrid task management application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <div className="noise-overlay" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <Suspense fallback={null}>
              <NavigationProvider>
                <PageTransition>{children}</PageTransition>
              </NavigationProvider>
            </Suspense>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
