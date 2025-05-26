import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Clock, Twitter } from "lucide-react";
import SharePageClient from "./SharePageClient";
import type { Metadata } from "next";
import type { Theme } from "@/types/theme";

// 서버에서만 필요한 데이터
const mockThemes: Theme[] = [
  {
    id: "1",
    content: "90년대 애니메이션 OST 특집",
    author: "@anime_lover_90",
    authorNickname: "90년대키드",
    createdAt: new Date("2024-01-15T10:30:00"),
    createdByMe: false,
  },
  {
    id: "2",
    content: "스튜디오 지브리 명곡 모음",
    author: "@ghibli_fan",
    authorNickname: "지브리매니아",
    createdAt: new Date("2024-01-14T15:20:00"),
    createdByMe: false,
  },
  {
    id: "3",
    content: "건담 시리즈 테마곡 메들리",
    author: "@gundam_pilot",
    authorNickname: "건담파일럿",
    createdAt: new Date("2024-01-13T09:45:00"),
    createdByMe: false,
  },
];

interface SharePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const theme = mockThemes.find((t) => t.id === params.id);

  if (!theme) {
    return {
      title: "테마를 찾을 수 없습니다 - 오타쿠 붐박스",
      description: "요청하신 테마를 찾을 수 없습니다.",
    };
  }

  const title = `"${theme.content}" - 오타쿠 붐박스 테마 제안`;
  const description = `${
    theme.authorNickname || theme.author
  }님이 제안한 오타쿠 붐박스 테마: ${theme.content}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/placeholder.svg?height=630&width=1200"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/placeholder.svg?height=630&width=1200"],
    },
  };
}

export default function SharePage({ params }: SharePageProps) {
  const theme = mockThemes.find((t) => t.id === params.id);
  return <SharePageClient theme={theme} />;
}
