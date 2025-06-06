import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Clock, Twitter } from "lucide-react";
import SharePageClient from "./SharePageClient";
import type { Metadata } from "next";
import type { Theme } from "@/types/theme";
import { redirect } from "next/navigation";

// API 호출 함수
async function getThemeById(themeId: string): Promise<Theme | undefined> {
  try {
    // 환경에 따른 API URL 설정 (환경변수 무시)
    const getApiBaseUrl = () => {
      // 프로덕션이면 실제 도메인 사용
      if (process.env.NODE_ENV === "production") {
        return "https://boombox.fotone.moe";
      }

      // 개발환경에서는 localhost:8080
      return "http://localhost:8080";
    };

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/themes/${themeId}`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return undefined;
    }

    const apiData = result.data;

    // API 응답을 Theme 타입으로 변환
    const theme: Theme = {
      id: apiData.id.toString(),
      content: apiData.content,
      author: apiData.author?.username || "unknown",
      authorNickname:
        apiData.author?.name || apiData.author?.username || "unknown",
      createdAt: new Date(apiData.createdAt),
      createdByMe: false, // share 페이지에서는 항상 false
    };

    return theme;
  } catch (error) {
    console.error("테마 조회 실패:", error);
    return undefined;
  }
}

interface SharePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const theme = await getThemeById(params.id);

  // 절대 URL 생성
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://boombox.fotone.moe"
      : "http://localhost:3000";
  const imageUrl = `${baseUrl}/image.png`;

  if (!theme) {
    return {
      title: "테마를 찾을 수 없습니다 - 오타쿠 붐박스",
      description: "요청하신 테마를 찾을 수 없습니다.",
      openGraph: {
        title: "테마를 찾을 수 없습니다 - 오타쿠 붐박스",
        description: "요청하신 테마를 찾을 수 없습니다.",
        type: "website",
        images: [imageUrl],
      },
      twitter: {
        card: "summary",
        title: "테마를 찾을 수 없습니다 - 오타쿠 붐박스",
        description: "요청하신 테마를 찾을 수 없습니다.",
        images: [imageUrl],
      },
    };
  }

  const title = `"${theme.content}" - 오타쿠 붐박스 오픈 테마 보드 `;
  const description = `${
    theme.authorNickname || theme.author
  }님이 신청한 오타쿠 붐박스 테마: ${theme.content}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: "website",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  // 바로 메인 페이지로 리다이렉트
  redirect("/");
}
