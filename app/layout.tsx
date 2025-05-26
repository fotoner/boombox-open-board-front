import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from "@/components/google-analytics"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "오타쿠붐박스 오픈 테마 보드",
  description: "참가자들이 행사 주제를 제안하고 트위터(X)를 통해 확산시키는 커뮤니티 보드",
  keywords: ["오타쿠", "애니메이션", "음악", "테마", "커뮤니티"],
  authors: [{ name: "오타쿠붐박스" }],
  openGraph: {
    title: "오타쿠붐박스 오픈 테마 보드",
    description: "참가자들이 행사 주제를 제안하고 트위터(X)를 통해 확산시키는 커뮤니티 보드",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "오타쿠붐박스 오픈 테마 보드",
    description: "참가자들이 행사 주제를 제안하고 트위터(X)를 통해 확산시키는 커뮤니티 보드",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Suspense>{children}</Suspense>
      </body>
    </html>
  )
}
