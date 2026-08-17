import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SidebarWrapper } from "@/components/layout/SidebarWrapper"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeContext"
import { LanguageProvider } from "@/components/providers/LanguageContext"
import { NavigationLoadingProvider } from "@/components/providers/NavigationLoadingProvider"
import { DialogProvider } from "@/hooks/useDialog"
import { A11yToolbar } from "@/components/fu/A11yToolbar"
import { PwaRegister } from "@/components/providers/PwaRegister"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fundación Exalumnos U",
  description: "Plataforma de mentoría, donaciones y empleo para la comunidad de egresados de la Universidad.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png?v=2",
    apple: "/UCR_EXALUMNOS-1024x1024.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Exalumnos U",
  },
}

export const viewport: Viewport = {
  themeColor: "#004C63",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var path = window.location.pathname;
                var isAuth = path.indexOf('/login') === 0 || path.indexOf('/registro') === 0 || path.indexOf('/verificar-correo') === 0 || path.indexOf('/forgot-password') === 0;
                if (!isAuth && !sessionStorage.getItem('hasPlayedIntro')) {
                  document.documentElement.classList.add('intro-playing');
                }
              } catch (e) {}
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.intro-playing body,
              html.intro-playing main,
              html.intro-playing .min-h-screen {
                background-color: #030712 !important;
              }
              html.intro-playing aside,
              html.intro-playing #dashboard-main-content {
                opacity: 0 !important;
                pointer-events: none !important;
              }
              aside,
              #dashboard-main-content {
                transition: opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1);
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <div id="a11y-app-root">
              <AuthProvider>
                <DialogProvider>
                  <Suspense fallback={null}>
                    <NavigationLoadingProvider>
                      <SidebarWrapper>
                        {children}
                      </SidebarWrapper>
                    </NavigationLoadingProvider>
                  </Suspense>
                </DialogProvider>
              </AuthProvider>
              <Toaster />
            </div>
            <A11yToolbar />
          </LanguageProvider>
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  )
}
