import type { Metadata } from "next"
import { Geist_Mono, Manrope, Space_Grotesk } from "next/font/google"

import { AuthProvider } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "BSC — Bank Statement Convertor | PDF to Excel & CSV",
    template: "%s | BSC",
  },
  description:
    "Convert bank statement PDFs into clean Excel and CSV exports instantly. BSC (Bank Statement Convertor) supports all major banks — fast, accurate, and fully private.",
  metadataBase: new URL("https://bankstatementconvertor.io"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        manrope.variable,
        spaceGrotesk.variable,
        geistMono.variable,
        "font-sans"
      )}
      >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
