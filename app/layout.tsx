import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "@/components/google-analytics";
import { Suspense } from "react";
import ClientLayout from "@/app/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "오타쿠 붐박스 - 오픈 테마 보드",
  description: "붐박스의 테마를 직접 정해보세요!!",
  keywords: ["오타쿠", "애니메이션", "음악", "테마", "디제이", "커뮤니티"],
  authors: [{ name: "오타쿠 붐박스" }],
  openGraph: {
    title: "오타쿠 붐박스 - 오픈 테마 보드",
    description: "붐박스의 테마를 직접 정해보세요!!",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "오타쿠 붐박스 - 오픈 테마 보드",
    description: "붐박스의 테마를 직접 정해보세요!!",
  },
  generator: "otaku-bombox",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ClientLayout>
          <GoogleAnalytics />
          <Suspense>{children}</Suspense>
        </ClientLayout>
      </body>
    </html>
  );
}
